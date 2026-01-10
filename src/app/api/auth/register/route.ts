import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { ConflictError } from '@/lib/errors';
import { authLogger } from '@/lib/logger';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  locale: z.enum(['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu']).default('en'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    authLogger.info({ email: validatedData.email }, 'Registration attempt');

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        locale: validatedData.locale,
        timezone: 'UTC',
        status: 'active',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
      },
    });

    authLogger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    );
  },
  { route: '/api/auth/register' }
);
