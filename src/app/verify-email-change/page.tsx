'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmailChange = async () => {
      try {
        const response = await fetch('/api/user/email/verify-change', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setNewEmail(data.newEmail);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?emailChanged=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email change');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmailChange();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verifying Email Change</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your new email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Email Successfully Updated!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            {newEmail && (
              <div className="mt-4 rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  Your new email address: <strong>{newEmail}</strong>
                </p>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Go to Profile
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
