import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { sendContactFormEmail } from '@/lib/email-service';
import { ValidationError } from '@/lib/errors';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
});

export const POST = withErrorHandling(
  async (request: NextRequest) => {
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Invalid form data', result.error.flatten().fieldErrors as Record<string, string[]>);
    }

    await sendContactFormEmail(result.data);

    return NextResponse.json({ success: true, message: 'Message sent successfully' }, { status: 200 });
  },
  { route: '/api/contact' }
);
