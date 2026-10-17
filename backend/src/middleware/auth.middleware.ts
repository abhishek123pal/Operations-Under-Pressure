import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Extend Express Request interface to attach authenticated user context
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    teamId: string;
    role: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const teamId = req.headers['x-team-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header.' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User entity not found.' });
    }

    // If team context is provided, verify active membership and role
    let role = 'MEMBER';
    if (teamId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: 'Forbidden: User is not a member of the specified team.' });
      }
      role = membership.role;
    }

    // Attach user context to request object
    req.user = {
      id: user.id,
      email: user.email,
      teamId: teamId || '',
      role,
    };

    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Internal authentication validation error.' });
  }
}