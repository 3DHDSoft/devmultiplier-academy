import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError } from '@/lib/errors';

const checkSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json();
    const result = checkSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid email format');
    }

    const { email } = result.data;

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: { status: true },
    });

    // Return whether the user needs verification
    // We don't reveal if the user exists for security reasons
    // but we can safely say needs verification if they're pending
    const needsVerification = user?.status === 'pending';

    return NextResponse.json({
      needsVerification,
    });
  },
  { route: '/api/auth/check-verification' }
);
