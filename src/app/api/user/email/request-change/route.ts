import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmailChangeVerification } from '@/lib/email-service';

const requestEmailChangeSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required to change email'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    if (!user.password || !(await bcrypt.compare(validatedData.password, user.password))) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.newEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email address already in use' }, { status: 409 });
    }

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
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${validatedData.newEmail}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Request email change error:', error);
    return NextResponse.json({ error: 'Failed to request email change' }, { status: 500 });
  }
}
