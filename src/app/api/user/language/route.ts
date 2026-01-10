import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const VALID_LOCALES = ['en', 'es', 'pt', 'hi', 'zh', 'de', 'hu'] as const;

const updateLanguageSchema = z.object({
  locale: z.enum(VALID_LOCALES),
});

export const PATCH = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const validatedData = updateLanguageSchema.parse(body);

    apiLogger.debug({ email: session.user.email, locale: validatedData.locale }, 'Updating language preference');

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

    apiLogger.info({ userId: user.id, locale: user.locale }, 'Language preference updated');

    return NextResponse.json({
      success: true,
      locale: user.locale,
      user,
    });
  },
  { route: '/api/user/language' }
);
