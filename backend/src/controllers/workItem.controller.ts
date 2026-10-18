
// import { Response } from 'express';
// import { WorkItemService } from '../services/workItem.service';
// import { AuthenticatedRequest } from '../middleware/auth.middleware';

// export class WorkItemController {
//   // 1. Get paginated work items using keyset cursor
//   static async getItems(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { limit, cursorCreatedAt, cursorId, teamId, status } = req.query;

//       const result = await WorkItemService.getWorkItems({
//         limit: limit ? parseInt(limit as string, 10) : undefined,
//         cursorCreatedAt: cursorCreatedAt as string,
//         cursorId: cursorId ? String(cursorId) : undefined, // ✅ Fixed string constraint type resolution
//         teamId: (teamId as string) || req.user?.teamId,
//         status: status as any,
//       });

//       return res.status(200).json(result);
//     } catch (error: any) {
//       console.error('❌ Controller Error (getItems):', error);
//       return res.status(500).json({ error: error.message || 'Internal server error.' });
//     }
//   }

//   // 2. Atomic Claim Endpoint
//   static async claimItem(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { id } = req.params;
//       const userId = req.user?.id;

//       if (!userId) {
//         return res.status(401).json({ error: 'Unauthorized user context.' });
//       }

//       const claimedItem = await WorkItemService.claimWorkItem(id as string, userId); // ✅ Fixed string signature mismatch
//       return res.status(200).json({
//         message: 'Work item successfully claimed.',
//         data: claimedItem,
//       });
//     } catch (error: any) {
//       if (error.message.startsWith('CONFLICT')) {
//         return res.status(409).json({ error: error.message });
//       }
//       console.error('❌ Controller Error (claimItem):', error);
//       return res.status(500).json({ error: error.message || 'Internal server error.' });
//     }
//   }

//   // 3. Optimistic Concurrency Control (OCC) Update Endpoint
//   static async updateItem(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { id } = req.params;
//       const { version, ...updateData } = req.body;
//       const userId = req.user?.id;

//       if (version === undefined || typeof version !== 'number') {
//         return res.status(400).json({ error: 'Bad Request: Incoming numeric "version" is required for OCC.' });
//       }

//       if (!userId) {
//         return res.status(401).json({ error: 'Unauthorized user context.' });
//       }

//       const updatedItem = await WorkItemService.updateWorkItem(id as string, version, updateData, userId);
//       return res.status(200).json({
//         message: 'Work item updated successfully under OCC guardrail.',
//         data: updatedItem,
//       });
//     } catch (error: any) {
//       if (error.message.startsWith('CONFLICT')) {
//         return res.status(409).json({ error: error.message });
//       }
//       if (error.message.startsWith('NOT_FOUND')) {
//         return res.status(404).json({ error: error.message });
//       }
//       console.error('❌ Controller Error (updateItem):', error);
//       return res.status(500).json({ error: error.message || 'Internal server error.' });
//     }
//   }
// }

import { Request, Response } from 'express'; // Added standard Request for public endpoint support
import { WorkItemService } from '../services/workItem.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export class WorkItemController {
  /**
   * 🔓 PUBLIC BOOTSTRAP ENDPOINT
   * Exposes a singular metadata row block to assist the UI dashboard in discovering active 
   * seeded database UUID parameters without failing cross-tenant security filters.
   */
  static async getBootstrapSample(req: Request, res: Response) {
    try {
      const sampleItem = await prisma.workItem.findFirst({
        include: { team: true, creator: true },
      });

      if (!sampleItem) {
        return res.status(404).json({ error: 'No operational seeded records discovered in storage layer.' });
      }

      return res.status(200).json({ data: sampleItem });
    } catch (error: any) {
      console.error('❌ Controller Error (getBootstrapSample):', error);
      return res.status(500).json({ error: error.message || 'Internal bootstrapping configuration fault.' });
    }
  }

  // 1. Get paginated work items using keyset cursor
  static async getItems(req: AuthenticatedRequest, res: Response) {
    try {
      const { limit, cursorCreatedAt, cursorId, teamId, status } = req.query;

      const result = await WorkItemService.getWorkItems({
        limit: limit ? parseInt(limit as string, 10) : undefined,
        cursorCreatedAt: cursorCreatedAt as string,
        cursorId: cursorId ? String(cursorId) : undefined,
        teamId: (teamId as string) || req.user?.teamId,
        status: status as any,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Controller Error (getItems):', error);
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }

  // 2. Atomic Claim Endpoint
  static async claimItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized user context.' });
      }

      const claimedItem = await WorkItemService.claimWorkItem(id as string, userId);
      return res.status(200).json({
        message: 'Work item successfully claimed.',
        data: claimedItem,
      });
    } catch (error: any) {
      if (error.message.startsWith('CONFLICT')) {
        return res.status(409).json({ error: error.message });
      }
      console.error('❌ Controller Error (claimItem):', error);
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }

  // 3. Optimistic Concurrency Control (OCC) Update Endpoint
  static async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { version, ...updateData } = req.body;
      const userId = req.user?.id;

      if (version === undefined || typeof version !== 'number') {
        return res.status(400).json({ error: 'Bad Request: Incoming numeric "version" is required for OCC.' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized user context.' });
      }

      const updatedItem = await WorkItemService.updateWorkItem(id as string, version, updateData, userId);
      return res.status(200).json({
        message: 'Work item updated successfully under OCC guardrail.',
        data: updatedItem,
      });
    } catch (error: any) {
      if (error.message.startsWith('CONFLICT')) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.startsWith('NOT_FOUND')) {
        return res.status(404).json({ error: error.message });
      }
      console.error('❌ Controller Error (updateItem):', error);
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  }
}
