import { PrismaClient, Status } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class WorkItemService {
  /**
   * 1. Keyset Cursor Pagination (O(1) Performance)
   * Employs composite tuple sorting (createdAt, id) aligned with structural indexes.
   */
  static async getWorkItems(options: {
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
    teamId?: string;
    status?: Status;
  }) {
    const limit = Math.min(options.limit || 20, 100);
    const { cursorCreatedAt, cursorId, teamId, status } = options;

    const whereClause: any = {};
    if (teamId) whereClause.teamId = teamId;
    if (status) whereClause.status = status;

    // Keyset cursor condition matching database structural ordering
    if (cursorCreatedAt && cursorId) {
      whereClause.OR = [
        {
          createdAt: {
            lt: new Date(cursorCreatedAt),
          },
        },
        {
          createdAt: new Date(cursorCreatedAt),
          id: {
            lt: cursorId,
          },
        },
      ];
    }

    const items = await prisma.workItem.findMany({
      where: whereClause,
      take: limit + 1, // Fetch one extra to evaluate pagination boundaries
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        team: true,
        assignee: true,
        creator: true,
      },
    });

    let nextCursor: { createdAt: string; id: string } | null = null;
    if (items.length > limit) {
      const nextItem = items.pop()!;
      nextCursor = {
        createdAt: nextItem.createdAt.toISOString(),
        id: nextItem.id,
      };
    }

    return {
      data: items,
      nextCursor,
    };
  }

  /**
   * 2. Atomic Claim Operation
   * Uses atomic updates (WHERE assignee_id IS NULL) to eliminate race conditions under load.
   */
  static async claimWorkItem(id: string, userId: string) {
    const updatedCount = await prisma.workItem.updateMany({
      where: {
        id,
        assigneeId: null, // Concurrency barrier ensuring single ownership allocation
      },
      data: {
        assigneeId: userId,
        status: Status.IN_PROGRESS,
        version: { increment: 1 },
      },
    });

    if (updatedCount.count === 0) {
      throw new Error('CONFLICT: Work item is already claimed or does not exist.');
    }

    // Retrieve successfully updated entity tracking structures
    const item = await prisma.workItem.findUnique({
      where: { id },
      include: { assignee: true, team: true },
    });

    // Maps properties to actorId, type, and metadata cleanly aligned with your schema
    await prisma.activityEvent.create({
      data: {
        workItemId: id,
        actorId: userId,
        type: 'CLAIMED',
        metadata: { claimedAt: new Date().toISOString() },
      },
    });

    return item;
  }

  /**
   * 3. Optimistic Concurrency Control (OCC) Flow
   * Enforces strict version checks inside a single transaction isolation shell.
   */
  static async updateWorkItem(
    id: string,
    incomingVersion: number,
    data: { title?: string; description?: string; status?: Status; priority?: any },
    userId: string
  ) {
    // ✅ FIXED: Clean transaction wrapper string with absolutely zero hidden escape characters.
    return await prisma.$transaction(async (tx) => {
      const current = await tx.workItem.findUnique({
        where: { id },
      });

      if (!current) {
        throw new Error('NOT_FOUND: Work item not found.');
      }

      // Assert database version matches incoming request parameter states
      if (current.version !== incomingVersion) {
        throw new Error(
          `CONFLICT: Optimistic concurrency failure. Expected version ${current.version}, but received ${incomingVersion}.`
        );
      }

      const updated = await tx.workItem.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 }, // Atomically increment resource iteration lifecycle
        },
      });

      // Aligns activity mutations with actorId and type keys
      await tx.activityEvent.create({
        data: {
          workItemId: id,
          actorId: userId,
          type: 'UPDATED',
          metadata: { updatedFields: Object.keys(data), newVersion: updated.version },
        },
      });

      // Satisfies aggregateType and aggregateId database constraints
      await tx.outboxJob.create({
        data: {
          aggregateType: 'WORK_ITEM',
          aggregateId: id,
          eventType: 'WORK_ITEM_UPDATED',
          payload: { workItemId: id, version: updated.version },
        },
      });

      return updated;
    });
  }
}
