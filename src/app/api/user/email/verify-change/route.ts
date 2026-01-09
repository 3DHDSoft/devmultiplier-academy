import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check if token is already used
    if (emailChangeToken.used) {
      return NextResponse.json({ error: 'This token has already been used' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > emailChangeToken.expires) {
      return NextResponse.json({ error: 'Token has expired. Please request a new email change' }, { status: 400 });
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

    console.log(
      `Email changed from ${emailChangeToken.currentEmail} to ${emailChangeToken.newEmail} for user ${emailChangeToken.userId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully',
      newEmail: emailChangeToken.newEmail,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Verify email change error:', error);
    return NextResponse.json({ error: 'Failed to verify email change' }, { status: 500 });
  }
}

// GET endpoint to check if a token is valid (without using it)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
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
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 400 });
    }

    if (emailChangeToken.used) {
      return NextResponse.json({ valid: false, error: 'Token already used' }, { status: 400 });
    }

    if (new Date() > emailChangeToken.expires) {
      return NextResponse.json({ valid: false, error: 'Token expired' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      currentEmail: emailChangeToken.currentEmail,
      newEmail: emailChangeToken.newEmail,
    });
  } catch (error) {
    console.error('Check token error:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}
