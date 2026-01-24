import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmailChangeVerification } from '@/lib/email-service';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, ConflictError } from '@/lib/errors';
import { apiLogger, emailLogger } from '@/lib/logger';

const requestEmailChangeSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required to change email'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const validatedData = requestEmailChangeSchema.parse(body);

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !user.email) {
      throw new NotFoundError('User');
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    if (!user.password || !(await bcrypt.compare(validatedData.password, user.password))) {
      throw new AuthenticationError('Invalid password');
    }

    // Check if new email is already in use
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.newEmail },
    });

    if (existingUser) {
      throw new ConflictError('Email address already in use');
    }

    apiLogger.info({ userId: user.id, newEmail: validatedData.newEmail }, 'Email change requested');

    // Invalidate any existing email change tokens for this user
    await prisma.email_change_tokens.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    // Create email change token
    await prisma.email_change_tokens.create({
      data: {
        userId: user.id,
        currentEmail: user.email,
        newEmail: validatedData.newEmail,
        token,
        expires: expiresAt,
      },
    });

    // Send verification email to NEW email address
    try {
      await sendEmailChangeVerification(validatedData.newEmail, user.email, token);
      emailLogger.info({ userId: user.id, newEmail: validatedData.newEmail }, 'Email change verification sent');
    } catch (emailError) {
      emailLogger.error({ err: emailError, userId: user.id, newEmail: validatedData.newEmail }, 'Failed to send email change verification');
      throw emailError;
    }

    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${validatedData.newEmail}`,
    });
  },
  { route: '/api/user/email/request-change' }
);
