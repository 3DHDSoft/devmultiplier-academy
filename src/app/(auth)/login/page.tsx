'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && !isRedirecting) {
      setIsRedirecting(true);
      window.location.href = '/dashboard';
    }
  }, [status, isRedirecting]);

  // Show loading while checking session or redirecting
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
        <div className="text-[#1f2328] dark:text-[#e6edf3]">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if the error is due to unverified email
        if (result.error === 'CredentialsSignin') {
          // NextAuth wraps our error - we need to check via a separate call
          // or handle it differently. Let's check by attempting to get more info
          const checkResponse = await fetch('/api/auth/check-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const checkData = await checkResponse.json();

          if (checkData.needsVerification) {
            setEmailNotVerified(true);
          } else {
            setError('Invalid email or password');
          }
        } else {
          setError('Invalid email or password');
        }
      } else if (result?.ok) {
        // Use window.location for full page navigation to ensure session is picked up
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Resend verification error:', err);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      console.error(`${provider} sign-in error:`, err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-4 py-6 dark:bg-[#0d1117]">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#d1d9e0] bg-white p-5 shadow-xl dark:border-[#30363d] dark:bg-[#161b22]">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="mb-0.5 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Dev Academy</h1>
            <p className="text-sm text-[#656d76] dark:text-[#848d97]">Sign in to your account</p>
          </div>

          {/* Email Not Verified Message */}
          {emailNotVerified && (
            <div className="mb-3 rounded-md border border-[#d4a72c66] bg-[#fff8c5] p-3 dark:border-[#d29922] dark:bg-[#674d1a]">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#9a6700] dark:text-[#d29922]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#9a6700] dark:text-[#d29922]">Email verification required</p>
                  <p className="mt-1 text-sm text-[#6e5600] dark:text-[#c69026]">
                    Please check your email and click the verification link before signing in.
                  </p>
                  {resendSuccess ? (
                    <p className="mt-2 text-sm text-[#1a7f37] dark:text-[#3fb950]">
                      ✓ Verification email sent! Check your inbox.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                      className="mt-2 text-sm font-medium text-[#0969da] hover:underline disabled:opacity-50 dark:text-[#4493f8]"
                    >
                      {isResendingEmail ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !emailNotVerified && (
            <div className="mb-3 rounded-md border border-[#ff818266] bg-[#ffebe9] p-2.5 text-[#d1242f] dark:border-[#f8514966] dark:bg-[#490202] dark:text-[#f85149]">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-md border border-[#d1d9e0] bg-white px-2.5 py-1.5 text-sm text-[#1f2328] placeholder-[#656d76] outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#484f58] dark:focus:border-[#4493f8] dark:focus:ring-[#4493f8]"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  className="w-full rounded-md border border-[#d1d9e0] bg-white px-2.5 py-1.5 pr-9 text-sm text-[#1f2328] placeholder-[#656d76] outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#484f58] dark:focus:border-[#4493f8] dark:focus:ring-[#4493f8]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[#656d76] transition-colors hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[#0969da] hover:underline dark:text-[#4493f8]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#1f883d] py-1.5 text-sm font-medium text-white transition hover:bg-[#1a7f37] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#238636] dark:hover:bg-[#2ea043]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-3 flex items-center">
            <div className="flex-1 border-t border-[#d1d9e0] dark:border-[#30363d]"></div>
            <span className="px-3 text-xs text-[#656d76] dark:text-[#848d97]">or continue with</span>
            <div className="flex-1 border-t border-[#d1d9e0] dark:border-[#30363d]"></div>
          </div>

          {/* OAuth Provider Buttons */}
          <div className="space-y-1.5">
            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d1d9e0] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2328] transition hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d1d9e0] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2328] transition hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('microsoft-entra-id')}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d1d9e0] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2328] transition hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#f25022"
                  d="M0 0h11.377v11.372H0z"
                />
                <path
                  fill="#00a4ef"
                  d="M12.623 0H24v11.372H12.623z"
                />
                <path
                  fill="#7fba00"
                  d="M0 12.628h11.377V24H0z"
                />
                <path
                  fill="#ffb900"
                  d="M12.623 12.628H24V24H12.623z"
                />
              </svg>
              Microsoft
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('linkedin')}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#d1d9e0] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2328] transition hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
            >
              <svg
                className="h-4 w-4"
                fill="#0A66C2"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-3 text-center text-sm text-[#656d76] dark:text-[#848d97]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-[#0969da] hover:underline dark:text-[#4493f8]"
            >
              Sign up
            </Link>
          </p>

          {/* Demo Credentials Info */}
          <div className="mt-3 rounded-md border border-[#54aeff66] bg-[#ddf4ff] p-2.5 dark:border-[#4493f866] dark:bg-[#388bfd26]">
            <p className="text-xs text-[#0969da] dark:text-[#4493f8]">
              <strong>Demo:</strong> Use any email with password of at least 8 characters during registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
