import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { authLogger } from '@/lib/logger';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const { token } = verifySchema.parse(body);

    // Find the verification token
    const verificationToken = await prisma.email_verification_tokens.findUnique({
      where: { token },
      include: { users: true },
    });

    if (!verificationToken) {
      throw new NotFoundError('Verification token', token);
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      throw new ValidationError('Verification link has expired. Please register again.');
    }

    // Check if token has already been used
    if (verificationToken.used) {
      throw new ValidationError('This verification link has already been used.');
    }

    // Update user status to active and set emailVerified
    await prisma.users.update({
      where: { id: verificationToken.userId },
      data: {
        status: 'active',
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });

    // Mark token as used
    await prisma.email_verification_tokens.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    authLogger.info({ userId: verificationToken.userId, email: verificationToken.email }, 'Email verified successfully');

    return NextResponse.json({
      success: true,
      message: 'Your email has been verified successfully! You can now sign in.',
    });
  },
  { route: '/api/auth/verify-email' }
);
