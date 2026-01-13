'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4 py-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ddf4ff] dark:bg-[#388bfd26]">
                <Loader2 className="h-8 w-8 text-[#0969da] dark:text-[#4493f8] animate-spin" />
              </div>
              <h1 className="mb-2 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                Verifying Your Email
              </h1>
              <p className="text-sm text-[#656d76] dark:text-[#848d97]">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#dafbe1] dark:bg-[#238636]/20">
                <CheckCircle className="h-8 w-8 text-[#1f883d] dark:text-[#3fb950]" />
              </div>
              <h1 className="mb-2 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                Email Verified!
              </h1>
              <p className="mb-4 text-sm text-[#656d76] dark:text-[#848d97]">{message}</p>
              <div className="rounded-md bg-[#dafbe1] dark:bg-[#2ea04326] border border-[#1f883d66] dark:border-[#3fb95066] p-3 mb-4">
                <p className="text-sm text-[#1a7f37] dark:text-[#3fb950]">
                  Redirecting you to sign in...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-[#1f883d] dark:bg-[#238636] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043]"
              >
                Sign In Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffebe9] dark:bg-[#490202]">
                <XCircle className="h-8 w-8 text-[#d1242f] dark:text-[#f85149]" />
              </div>
              <h1 className="mb-2 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
                Verification Failed
              </h1>
              <p className="mb-4 text-sm text-[#656d76] dark:text-[#848d97]">{message}</p>
              <div className="rounded-md bg-[#ffebe9] dark:bg-[#490202] border border-[#ff818266] dark:border-[#f8514966] p-3 mb-4">
                <p className="text-sm text-[#d1242f] dark:text-[#f85149]">
                  The verification link may have expired or already been used.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  href="/register"
                  className="block w-full rounded-md bg-[#1f883d] dark:bg-[#238636] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043]"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-2 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
          <Loader2 className="h-8 w-8 text-[#0969da] dark:text-[#4493f8] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
