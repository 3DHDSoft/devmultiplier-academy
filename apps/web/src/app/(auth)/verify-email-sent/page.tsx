'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Suspense, useState } from 'react';

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResendEmail = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus({ type: 'success', message: 'Verification email sent! Check your inbox.' });
      } else {
        setResendStatus({ type: 'error', message: data.error || 'Failed to resend email. Please try again.' });
      }
    } catch {
      setResendStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-4 py-6 dark:bg-[#0d1117]">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#d1d9e0] bg-white p-6 text-center shadow-xl dark:border-[#30363d] dark:bg-[#161b22]">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#dafbe1] dark:bg-[#238636]/20">
            <Mail className="h-8 w-8 text-[#1f883d] dark:text-[#3fb950]" />
          </div>

          {/* Header */}
          <h1 className="mb-2 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Check Your Email</h1>

          <p className="mb-4 text-sm text-[#656d76] dark:text-[#848d97]">We&apos;ve sent a verification link to</p>

          {email && <p className="mb-4 font-medium text-[#1f2328] dark:text-[#e6edf3]">{email}</p>}

          {/* Instructions */}
          <div className="mb-6 rounded-md border border-[#54aeff66] bg-[#ddf4ff] p-4 text-left dark:border-[#4493f866] dark:bg-[#388bfd26]">
            <p className="text-sm text-[#0969da] dark:text-[#4493f8]">Click the link in the email to verify your account and complete your registration. The link will expire in 24 hours.</p>
          </div>

          {/* Didn't receive email */}
          <div className="mb-6 text-sm text-[#656d76] dark:text-[#848d97]">
            <p className="mb-2">Didn&apos;t receive the email?</p>
            <ul className="ml-4 space-y-1 text-left">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          {/* Resend Status Message */}
          {resendStatus && <div className={`mb-4 rounded-md p-3 text-sm ${resendStatus.type === 'success' ? 'border border-[#4ade80] bg-[#dcfce7] text-[#166534] dark:border-[#22c55e]/50 dark:bg-[#22c55e]/10 dark:text-[#4ade80]' : 'border border-[#f87171] bg-[#fee2e2] text-[#991b1b] dark:border-[#ef4444]/50 dark:bg-[#ef4444]/10 dark:text-[#f87171]'}`}>{resendStatus.message}</div>}

          {/* Resend Email Button */}
          {email && (
            <button onClick={handleResendEmail} disabled={isResending} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#d1d9e0] bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#1f2328] transition-colors hover:bg-[#eaeef2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]">
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}

          {/* Back to Login */}
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#0969da] hover:underline dark:text-[#4493f8]">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
          <div className="text-[#656d76] dark:text-[#848d97]">Loading...</div>
        </div>
      }
    >
      <VerifyEmailSentContent />
    </Suspense>
  );
}
