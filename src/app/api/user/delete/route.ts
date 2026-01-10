import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmation: z.literal('DELETE', 'You must type DELETE to confirm'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const validatedData = deleteAccountSchema.parse(body);

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify password
    if (!user.password) {
      throw new ValidationError('Cannot delete account without password set');
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }

    apiLogger.info({ userId: user.id, email: user.email }, 'Deleting user account');

    // Delete user and all related data (cascading deletes handled by foreign keys)
    await prisma.users.delete({
      where: { id: user.id },
    });

    apiLogger.info({ userId: user.id, email: user.email }, 'User account deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  },
  { route: '/api/user/delete' }
);
