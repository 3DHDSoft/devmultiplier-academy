import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = verifyEmailChangeSchema.parse(body);

    // Find the token
    const emailChangeToken = await prisma.email_change_tokens.findUnique({
      where: { token: validatedData.token },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!emailChangeToken) {
      throw new ValidationError('Invalid or expired token');
    }

    // Check if token is already used
    if (emailChangeToken.used) {
      throw new ValidationError('This token has already been used');
    }

    // Check if token is expired
    if (new Date() > emailChangeToken.expires) {
      throw new ValidationError('Token has expired. Please request a new email change');
    }

    // Update user email and mark token as used in a transaction
    await prisma.$transaction([
      prisma.users.update({
        where: { id: emailChangeToken.userId },
        data: {
          email: emailChangeToken.newEmail,
          emailVerified: new Date(), // Mark as verified
          updatedAt: new Date(),
        },
      }),
      prisma.email_change_tokens.update({
        where: { token: validatedData.token },
        data: { used: true },
      }),
    ]);

    apiLogger.info({ userId: emailChangeToken.userId, oldEmail: emailChangeToken.currentEmail, newEmail: emailChangeToken.newEmail }, 'Email changed successfully');

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully',
      newEmail: emailChangeToken.newEmail,
    });
  },
  { route: '/api/user/email/verify-change' }
);

// GET endpoint to check if a token is valid (without using it)
export const GET = withErrorHandling(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      throw new ValidationError('Token is required');
    }

    const emailChangeToken = await prisma.email_change_tokens.findUnique({
      where: { token },
      select: {
        currentEmail: true,
        newEmail: true,
        expires: true,
        used: true,
      },
    });

    if (!emailChangeToken) {
      throw new NotFoundError('Token');
    }

    if (emailChangeToken.used) {
      throw new ValidationError('Token already used');
    }

    if (new Date() > emailChangeToken.expires) {
      throw new ValidationError('Token expired');
    }

    return NextResponse.json({
      valid: true,
      currentEmail: emailChangeToken.currentEmail,
      newEmail: emailChangeToken.newEmail,
    });
  },
  { route: '/api/user/email/verify-change' }
);
