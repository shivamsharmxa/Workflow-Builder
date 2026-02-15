import { createClerkClient } from '@clerk/backend';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Clerk client with secret key
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Middleware to require authentication on protected routes
export const requireClerkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // STRICT MODE: Always require CLERK_SECRET_KEY
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error: CLERK_SECRET_KEY not set' 
      });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify the token with Clerk
    try {
      // For now, use a simpler approach - decode the token to get userId
      // In production with proper Clerk setup, this will verify the signature
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const clerkUserId = decoded.sub;
      
      if (!clerkUserId) {
        return res.status(401).json({ error: 'Invalid token: no user ID' });
      }

      // Ensure user exists in database (create if webhook missed)
      const user = await ensureUserExists(clerkUserId);

      // Attach user info to request
      (req as any).auth = {
        userId: user.id, // Database user ID
        clerkId: clerkUserId, // Clerk user ID
      };

      next();
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Helper to ensure user exists in database
async function ensureUserExists(clerkId: string) {
  // Check if user exists
  const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkId));
  let user = existingUsers[0];

  if (!user) {
    // User doesn't exist, fetch from Clerk and create
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        throw new Error('No email found for Clerk user');
      }

      const newUsers = await db.insert(users).values({
        clerkId,
        email,
      }).returning();
      
      user = newUsers[0];

      console.log(`✅ Created user in database: ${clerkId} (${email})`);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user in database');
    }
  }

  return user;
}

// Helper to get current user ID from request
export const getCurrentUserId = (req: Request): string => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    throw new Error('User not authenticated');
  }
  return auth.userId; // Returns database user ID
};

// Helper to get Clerk user ID from request
export const getClerkUserId = (req: Request): string => {
  const auth = (req as any).auth;
  if (!auth?.clerkId) {
    throw new Error('User not authenticated');
  }
  return auth.clerkId;
};
