import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('Operations Under Pressure - Concurrency & Fault-Tolerance Integration Suite', () => {
  let testUser1: any;
  let testUser2: any;
  let testTeam: any;
  let unassignedItem: any;

  beforeAll(async () => {
    // Setup isolated test entities or fetch from seeded database

    await prisma.idempotencyKey.deleteMany().catch(() => {});
    await prisma.activityEvent.deleteMany().catch(() => {});
    await prisma.workItem.deleteMany({ where: { title: { contains: 'Test' } } }).catch(() => {});

    testTeam = await prisma.team.findFirst();
    
    testUser1 = await prisma.user.findFirst({
      where: { memberships: { some: { teamId: testTeam.id } } },
    });

    testUser2 = await prisma.user.findFirst({
      where: { 
        NOT: { id: testUser1.id },
        memberships: { some: { teamId: testTeam.id } }
      },
    });

    // Create a pristine unassigned work item specifically for testing
    unassignedItem = await prisma.workItem.create({
      data: {
        title: 'Concurrency Test Directive #999',
        description: 'Automated test payload for atomic race condition verification',
        type: 'INCIDENT',
        priority: 'URGENT',
        status: 'OPEN',
        version: 1,
        teamId: testTeam.id,
        creatorId: testUser1.id,
        assigneeId: null, // Unassigned for atomic claim tests
      },
    });
  });

  afterAll(async () => {
    // Cleanup test artifact
    if (unassignedItem) {
      await prisma.activityEvent.deleteMany({ where: { workItemId: unassignedItem.id } });
      await prisma.workItem.deleteMany({ where: { id: unassignedItem.id } });
    }
    await prisma.$disconnect();
    await pool.end();
  });

  describe('1. Atomic Claim Concurrency Tests (POST /items/:id/claim)', () => {
    it('should allow exactly one operator to claim an unassigned item and reject concurrent challengers with 409 Conflict', async () => {
      // Simulate parallel race condition using Promise.all
      const claimPromise1 = request(app)
        .post(`/items/${unassignedItem.id}/claim`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', 'test-key-race-1');

      const claimPromise2 = request(app)
        .post(`/items/${unassignedItem.id}/claim`)
        .set('x-user-id', testUser2.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', 'test-key-race-2');

      const results = await Promise.all([claimPromise1, claimPromise2]);

      const successResponses = results.filter((res) => res.status === 200);
      const conflictResponses = results.filter((res) => res.status === 409);

      // Exactly one must win, exactly one must receive 409 Conflict
      expect(successResponses.length).toBe(1);
      expect(conflictResponses.length).toBe(1);
      expect(conflictResponses[0].body.error).toContain('CONFLICT');
    });
  });

  describe('2. Optimistic Concurrency Control (OCC) Tests (PATCH /items/:id)', () => {
    it('should successfully update item when correct version is provided', async () => {
      // Fetch latest version after claim
      const currentItem = await prisma.workItem.findUnique({ where: { id: unassignedItem.id } });

      const res = await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', 'test-key-occ-success')
        .send({
          version: currentItem!.version,
          title: 'Updated Directive Title Under OCC',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.version).toBe(currentItem!.version + 1);
      expect(res.body.data.title).toBe('Updated Directive Title Under OCC');
    });

    it('should reject update with 409 Conflict when stale version number is supplied', async () => {
      // Supply an intentionally stale version (e.g., version 99)
      const res = await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', 'test-key-occ-stale')
        .send({
          version: 999, // Stale version
          title: 'Stale Update Attempt',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Optimistic concurrency failure');
    });
  });

    describe('3. Idempotency Middleware & Payload Fingerprinting Tests', () => {
    it('should return cached response on duplicate request with same idempotency key and payload', async () => {
      const idempotencyKey = 'unique-idempotency-test-key-777';
      
      // 🔄 फ़िक्स: डेटाबेस से आइटम का सबसे नया लाइव वर्जन निकालें ताकि OCC फ़ैल न हो
      const freshItem = await prisma.workItem.findUnique({ where: { id: unassignedItem.id } });
      const payload = { version: freshItem!.version, priority: 'LOW' };

      // 1. पहली रिक्वेस्ट (First request - Real execution)
      const res1 = await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', idempotencyKey)
        .send(payload);

      // 2. दूसरी डुप्लिकेट रिक्वेस्ट (Second duplicate request - Replay from cache)
      const res2 = await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', idempotencyKey)
        .send(payload);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      
      // पक्का करें कि कैश्ड डेटा और पहली बार का डेटा बिल्कुल एक जैसा है
      expect(res2.body.data.version).toBe(res1.body.data.version); 
    });

    it('should reject with 409 Conflict if same idempotency key is reused with an altered payload', async () => {
      const idempotencyKey = 'unique-idempotency-test-key-tamper';
      const freshItem = await prisma.workItem.findUnique({ where: { id: unassignedItem.id } });

      // First request with payload A
      await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', idempotencyKey)
        .send({ version: freshItem!.version, priority: 'MEDIUM' });

      // Second request with SAME key but altered payload B
      const resTampered = await request(app)
        .patch(`/items/${unassignedItem.id}`)
        .set('x-user-id', testUser1.id)
        .set('x-team-id', testTeam.id)
        .set('idempotency-key', idempotencyKey)
        .send({ version: freshItem!.version, priority: 'URGENT' }); // Altered structure

      expect(resTampered.status).toBe(409);
      expect(resTampered.body.error).toContain('Idempotency validation mismatch');
    });
  });

});