'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Integrate with email service (ConvertKit, Resend, etc.)
    // For now, simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Multiply Your Impact?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join our newsletter for early access to new courses, exclusive content, and practical tips for modern
            development.
          </p>

          {status === 'success' ? (
            <div className="bg-blue/20 text-cyan mt-8 rounded-lg p-4">
              Thanks for subscribing! Check your email for confirmation.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="focus:ring-cyan min-w-0 flex-1 rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder-blue-200 focus:ring-2 focus:outline-none sm:max-w-xs"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-blue hover:bg-cyan inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    'Subscribing...'
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm text-blue-200">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
