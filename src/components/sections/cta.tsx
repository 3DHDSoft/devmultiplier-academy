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
    <section className="border-t border-[#d1d9e0] bg-[#f6f8fa] py-24 sm:py-32 dark:border-[#30363d] dark:bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1f2328] sm:text-4xl dark:text-[#e6edf3]">Ready to Multiply Your Impact?</h2>
          <p className="mt-4 text-lg text-[#656d76] dark:text-[#848d97]">Join our newsletter for early access to new courses, exclusive content, and practical tips for modern development.</p>

          {status === 'success' ? (
            <div className="mt-8 rounded-md border border-[#1f883d]/30 bg-[#1f883d]/10 p-4 text-[#1a7f37] dark:border-[#238636]/40 dark:bg-[#238636]/20 dark:text-[#3fb950]">Thanks for subscribing! Check your email for confirmation.</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="min-w-0 grow rounded-md border border-[#d1d9e0] bg-white px-4 py-3 text-[#1f2328] placeholder-[#656d76] focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da] focus:outline-none sm:max-w-xs dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#484f58] dark:focus:border-[#4493f8] dark:focus:ring-[#4493f8]"
                />
                <button type="submit" disabled={status === 'loading'} className="inline-flex items-center justify-center rounded-md bg-[#1f883d] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1a7f37] disabled:opacity-50 dark:bg-[#238636] dark:hover:bg-[#2ea043]">
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
              <p className="mt-4 text-sm text-[#656d76] dark:text-[#848d97]">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
