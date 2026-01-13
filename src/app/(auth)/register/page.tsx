'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locale, setLocale] = useState('en');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const locales = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'zh', name: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hu', name: 'Magyar' },
  ];

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          locale,
        }),
      });

      const data = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Redirect to verification pending page
      router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4 py-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xl">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="mb-0.5 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Dev Academy</h1>
            <p className="text-sm text-[#656d76] dark:text-[#848d97]">Create your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 rounded-md bg-[#ffebe9] dark:bg-[#490202] border border-[#ff818266] dark:border-[#f8514966] p-2.5 text-[#d1242f] dark:text-[#f85149]">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                disabled={isLoading}
              />
            </div>

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
                className="w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
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
                  className="w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 pr-9 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-[#656d76] dark:text-[#848d97]">At least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  required
                  className="w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 pr-9 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Language Preference */}
            <div>
              <label
                htmlFor="locale"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Preferred Language
              </label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                disabled={isLoading}
              >
                {locales.map((loc) => (
                  <option
                    key={loc.code}
                    value={loc.code}
                  >
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#1f883d] dark:bg-[#238636] py-1.5 text-sm font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-3 flex items-center">
            <div className="flex-1 border-t border-[#d1d9e0] dark:border-[#30363d]"></div>
            <span className="px-3 text-xs text-[#656d76] dark:text-[#848d97]">or</span>
            <div className="flex-1 border-t border-[#d1d9e0] dark:border-[#30363d]"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-[#656d76] dark:text-[#848d97]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#0969da] dark:text-[#4493f8] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
