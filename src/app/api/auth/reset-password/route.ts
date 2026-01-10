import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { authLogger } from '@/lib/logger';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Find the token
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token: validatedData.token },
    });

    // Validate token
    if (!resetToken) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (resetToken.used) {
      throw new ValidationError('This reset link has already been used');
    }

    if (resetToken.expires < new Date()) {
      throw new ValidationError('This reset link has expired. Please request a new one.');
    }

    // Find the user
    const user = await prisma.users.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.users.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.password_reset_tokens.update({
        where: { token: validatedData.token },
        data: { used: true },
      }),
    ]);

    authLogger.info({ email: resetToken.email }, 'Password reset successful');

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  },
  { route: '/api/auth/reset-password' }
);

// GET endpoint to verify if a token is valid
export const GET = withErrorHandling(
  async (req: NextRequest) => {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      throw new ValidationError('Token is required');
    }

    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token },
      select: {
        email: true,
        expires: true,
        used: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: 'Token already used' }, { status: 400 });
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expired' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.email,
    });
  },
  { route: '/api/auth/reset-password' }
);
