// import { Request, Response, NextFunction } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pkg from 'pg';

// const { Pool } = pkg;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
//   // Only intercept mutating requests (POST, PATCH, PUT, DELETE)
//   if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
//     return next();
//   }

//   const idempotencyKey = req.headers['idempotency-key'] as string;

//   // If no idempotency key is supplied, proceed without caching (or mandate it depending on enterprise policy)
//   if (!idempotencyKey) {
//     return next();
//   }

//   const userId = req.headers['x-user-id'] as string || 'system-anonymous';

//   try {
//     // 1. Check if key already exists in database
//     const existingRecord = await prisma.idempotencyKey.findUnique({
//       where: { key: idempotencyKey },
//     });

//     if (existingRecord) {
//       // If request is still processing or processed, return cached response
//       return res.status(existingRecord.responseStatus).json(existingRecord.responseBody);
//     }

//     // 2. Capture and override response methods to record the outcome
//     const originalJson = res.json.bind(res);
    
//     res.json = (body: any) => {
//       // Asynchronously store idempotency result to prevent blocking response stream
//       prisma.idempotencyKey.create({
//         data: {
//           key: idempotencyKey,
//           userId: userId,
//           requestPath: req.originalUrl,
//           responseStatus: res.statusCode,
//           responseBody: body,
//         },
//       }).catch((err) => {
//         console.error('⚠️ Failed to cache idempotency key response:', err);
//       });

//       return originalJson(body);
//     };

//     next();
//   } catch (error) {
//     console.error('❌ Idempotency Middleware Error:', error);
//     return res.status(500).json({ error: 'Internal idempotency validation error.' });
//   }
// }

// import { Request, Response, NextFunction } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pkg from 'pg';

// const { Pool } = pkg;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
//   // Only intercept mutating requests (POST, PATCH, PUT, DELETE)
//   if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
//     return next();
//   }

//   const idempotencyKey = req.headers['idempotency-key'] as string;

//   // If no idempotency key is supplied, proceed without caching
//   if (!idempotencyKey) {
//     return next();
//   }

//   const userId = req.headers['x-user-id'] as string || 'system-anonymous';

//   try {
//     // 1. Check if key already exists in database
//     const existingRecord = await prisma.idempotencyKey.findUnique({
//       where: { key: idempotencyKey },
//     });

//     if (existingRecord) {
//       // Return cached response
//       return res.status(existingRecord.responseStatus).json(existingRecord.responseBody);
//     }

//     // 2. Capture and override response methods to record the outcome
//     const originalJson = res.json.bind(res);
    
//     res.json = (body: any) => {
//       // Asynchronously store idempotency result
//       prisma.idempotencyKey.create({
//         data: {
//           key: idempotencyKey,
//           userId: userId,
//           requestHash: req.originalUrl, // Fixed: mapped to correct schema property name
//           responseStatus: res.statusCode,
//           responseBody: body,
//         },
//       }).catch((err) => {
//         console.error('⚠️ Failed to cache idempotency key response:', err);
//       });

//       return originalJson(body);
//     };

//     next();
//   } catch (error) {
//     console.error('❌ Idempotency Middleware Error:', error);
//     return res.status(500).json({ error: 'Internal idempotency validation error.' });
//   }
// }

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
import crypto from 'crypto'; // 👈 Needed for request mutation isolation matching

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only intercept mutating requests (POST, PATCH, PUT, DELETE)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  // If no idempotency key is supplied, proceed without caching
  if (!idempotencyKey) {
    return next();
  }

  const userId = (req.headers['x-user-id'] as string) || 'system-anonymous';

  // Compute a distinct SHA-256 hash across both the target endpoint path AND body content
  const signature = JSON.stringify({ url: req.originalUrl, body: req.body });
  const calculatedHash = crypto.createHash('sha256').update(signature).digest('hex');

  try {
    // 1. Check if key already exists in database
    const existingRecord = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingRecord) {
      // Security Check: Return 409 Conflict if same key is reused with a different request structure
      if (existingRecord.requestHash !== calculatedHash) {
        return res.status(409).json({ 
          error: 'Idempotency validation mismatch. The execution signature has altered across duplicate retries.' 
        });
      }
      
      // Return cached response instantly
      return res.status(existingRecord.responseStatus).json(existingRecord.responseBody);
    }

    // 2. Capture and override response methods to record the outcome
    const originalJson = res.json.bind(res);
    
    res.json = (body: any) => {
      // Asynchronously store idempotency result with required fields
      prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId: userId,
          requestHash: calculatedHash,
          responseStatus: res.statusCode,
          responseBody: body ?? {},
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // ✅ Fixed: Satisfies missing required column (24h cache window)
        },
      }).catch((err) => {
        console.error('⚠️ Failed to cache idempotency key response:', err);
      });

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('❌ Idempotency Middleware Error:', error);
    return res.status(500).json({ error: 'Internal idempotency validation error.' });
  }
}
