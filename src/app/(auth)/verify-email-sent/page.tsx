'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
