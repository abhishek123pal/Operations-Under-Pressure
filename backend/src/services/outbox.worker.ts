import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class OutboxWorker {
  private isRunning = false;
  private pollIntervalMs: number;
  private maxRetries: number;

  constructor(pollIntervalMs = 5000, maxRetries = 3) {
    this.pollIntervalMs = pollIntervalMs;
    this.maxRetries = maxRetries;
  }

  /**
   * Start the background outbox polling loop
   */
  public start() {
    if (this.isRunning) {
      console.warn('⚠️ Outbox Worker is already running.');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Transactional Outbox Background Worker initialized and polling...');
    this.pollLoop();
  }

  /**
   * Gracefully stop the polling loop
   */
  public stop() {
    this.isRunning = false;
    console.log('⏹️ Transactional Outbox Background Worker stopped.');
  }

  /**
   * Continuous async polling execution loop with interval delay
   */
  private async pollLoop() {
    while (this.isRunning) {
      try {
        await this.processPendingBatch();
      } catch (error) {
        console.error('❌ Critical Outbox Worker Polling Error:', error);
      }

      // Wait before next polling cycle
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }

  /**
   * Fetch and process a batch of pending outbox telemetry records
   */
  private async processPendingBatch() {
    const batchSize = 10;

    // Fetch pending jobs ordered chronologically
    const jobs = await prisma.outboxJob.findMany({
      where: { status: 'PENDING' },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    if (jobs.length === 0) return;

    for (const job of jobs) {
      try {
        // 1. Transition state to PROCESSING to lock against duplicate concurrent runners
        await prisma.outboxJob.update({
          where: { id: job.id },
          data: { status: 'PROCESSING' },
        });

        // 2. Dispatch event to downstream broker / webhooks / log aggregator
        await this.dispatchPayload(job.eventType, job.payload);

        // 3. Mark job as COMPLETED
        await prisma.outboxJob.update({
          where: { id: job.id },
          data: { status: 'COMPLETED' },
        });

        console.log(`✅ Outbox Job Dispatched Successfully: [${job.id}] -> Type: ${job.eventType}`);
      } catch (error: any) {
        console.error(`⚠️ Outbox Dispatch Failure for Job [${job.id}]:`, error.message);

        const newAttempts = job.attempts + 1;
        const hasExceededRetries = newAttempts >= this.maxRetries;

        // Apply exponential backoff or mark FAILED if retry limit reached
        await prisma.outboxJob.update({
          where: { id: job.id },
          data: {
            status: hasExceededRetries ? 'FAILED' : 'PENDING',
            attempts: newAttempts,
          },
        });
      }
    }
  }

  /**
   * Simulated external message dispatcher (Kafka, RabbitMQ, or Webhook target)
   */
  private async dispatchPayload(eventType: string, payload: any) {
    // Simulate network transmission latency
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    // In production, publish payload to message broker or SSE stream
    console.log(`📡 [Outbox Telemetry Broker] Emitting [${eventType}] -> Payload:`, JSON.stringify(payload));
  }
}

// Standalone execution support when invoked directly via tsx
if (require.main === module) {
  const worker = new OutboxWorker();
  worker.start();

  // Handle graceful shutdown signals
  process.on('SIGINT', () => {
    worker.stop();
    pool.end();
    process.exit(0);
  });
}