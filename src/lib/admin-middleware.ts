import { auth } from '@/auth';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';

/**
 * Middleware to check if the current user is an admin
 * Returns null if user is admin, otherwise returns an error response
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from database to check admin status
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return null; // User is admin, allow access
}

/**
 * Check if a user is an admin by email
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true },
  });

  return user?.isAdmin ?? false;
}
