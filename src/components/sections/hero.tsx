import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0d1117]">
      {/* Background subtle pattern - GitHub style grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d9e0_1px,transparent_1px),linear-gradient(to_bottom,#d1d9e0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30 dark:bg-[linear-gradient(to_right,#30363d_1px,transparent_1px),linear-gradient(to_bottom,#30363d_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge - GitHub style label */}
          <div className="mb-8 inline-flex items-center rounded-full border border-[#d1d9e0] bg-[#f6f8fa] px-4 py-1.5 text-sm text-[#656d76] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#848d97]">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#1f883d] dark:bg-[#3fb950]" />
            For CTOs & Senior Developers
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-semibold tracking-tight text-[#1f2328] sm:text-5xl lg:text-6xl dark:text-[#e6edf3]">
            Become a <span className="text-[#0969da] dark:text-[#4493f8]">10x–100x Developer</span> in the Age of AI
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-[#656d76] sm:text-xl dark:text-[#848d97]">Master Domain-Driven Design, CQRS, database optimization, and AI-assisted development. Expert-led courses designed for professionals who ship production systems.</p>

          {/* CTAs - GitHub style buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/courses" className="inline-flex items-center rounded-md bg-[#1f883d] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]">
              Explore Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center rounded-md border border-[#d1d9e0] bg-white px-6 py-3 text-base font-medium text-[#1f2328] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:hover:bg-[#21262d]">
              View Pricing
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-12 text-sm text-[#656d76] dark:text-[#848d97]">Trusted by developers at Fortune 500 companies and innovative startups</p>
        </div>
      </div>
    </section>
  );
}
