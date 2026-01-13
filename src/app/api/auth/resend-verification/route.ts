import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { sendEmailVerification } from '@/lib/email-service';
import { authLogger } from '@/lib/logger';

const resendSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const result = resendSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid email format');
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, status: true },
    });

    if (!user) {
      // Don't reveal if user exists
      throw new NotFoundError('User', email);
    }

    if (user.status !== 'pending') {
      throw new ValidationError('This email has already been verified.');
    }

    // Check for rate limiting - don't send more than 1 email per 2 minutes
    const recentToken = await prisma.email_verification_tokens.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      },
    });

    if (recentToken) {
      throw new ValidationError('Please wait 2 minutes before requesting another verification email.');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the new verification token
    await prisma.email_verification_tokens.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        token: verificationToken,
        expires: tokenExpiry,
      },
    });

    // Send the verification email
    await sendEmailVerification(normalizedEmail, user.name, verificationToken);

    authLogger.info(
      { userId: user.id, email: normalizedEmail },
      'Verification email resent'
    );

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  },
  { route: '/api/auth/resend-verification' }
);
