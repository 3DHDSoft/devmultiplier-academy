import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        locale: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
        ...(validatedData.locale !== undefined && { locale: validatedData.locale }),
        ...(validatedData.timezone !== undefined && { timezone: validatedData.timezone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        locale: true,
        timezone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
