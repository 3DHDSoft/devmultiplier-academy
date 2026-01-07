import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user && user.status === 'active') {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Invalidate any existing tokens for this email
      await prisma.password_reset_tokens.updateMany({
        where: {
          email: validatedData.email,
          used: false,
          expires: { gt: new Date() },
        },
        data: {
          used: true,
        },
      });

      // Create new password reset token
      await prisma.password_reset_tokens.create({
        data: {
          email: validatedData.email,
          token,
          expires,
        },
      });

      // Build reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      // Send email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: validatedData.email,
          subject: 'Reset Your Password',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
                </div>

                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user.name || 'there'},</p>

                  <p style="font-size: 16px; margin-bottom: 20px;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                              padding: 14px 30px;
                              text-decoration: none;
                              border-radius: 5px;
                              font-weight: 600;
                              display: inline-block;
                              font-size: 16px;">
                      Reset Password
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                  </p>

                  <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                  </p>

                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                  <p style="font-size: 12px; color: #999; text-align: center;">
                    Dev X Academy - Learning Platform<br>
                    This is an automated message, please do not reply.
                  </p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Password reset email sent to ${validatedData.email}`);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Don't fail the request if email fails - log it instead
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address', details: error.issues }, { status: 400 });
    }

    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
