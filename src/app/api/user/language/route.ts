import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const VALID_LOCALES = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'] as const;

const updateLanguageSchema = z.object({
  locale: z.enum(VALID_LOCALES),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateLanguageSchema.parse(body);

    const user = await prisma.users.update({
      where: { email: session.user.email },
      data: { locale: validatedData.locale },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      locale: user.locale,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid locale',
          validLocales: VALID_LOCALES,
          details: error.issues,
        },
        { status: 400 }
      );
    }
    console.error('Error updating language preference:', error);
    return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
  }
}
