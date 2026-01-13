import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0d1117]">
      {/* Background subtle pattern - GitHub style grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d9e0_1px,transparent_1px),linear-gradient(to_bottom,#d1d9e0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#30363d_1px,transparent_1px),linear-gradient(to_bottom,#30363d_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge - GitHub style label */}
          <div className="border-[#d1d9e0] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] text-[#656d76] dark:text-[#848d97] mb-8 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <span className="bg-[#1f883d] dark:bg-[#3fb950] mr-2 inline-block h-2 w-2 rounded-full" />
            For CTOs & Senior Developers
          </div>

          {/* Headline */}
          <h1 className="text-[#1f2328] dark:text-[#e6edf3] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Become a <span className="text-[#0969da] dark:text-[#4493f8]">10x–100x Developer</span> in the Age of AI
          </h1>

          {/* Subheadline */}
          <p className="text-[#656d76] dark:text-[#848d97] mt-6 text-lg leading-8 sm:text-xl">
            Master Domain-Driven Design, CQRS, database optimization, and AI-assisted development. Expert-led courses
            designed for professionals who ship production systems.
          </p>

          {/* CTAs - GitHub style buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/courses"
              className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] inline-flex items-center rounded-md px-6 py-3 text-base font-medium text-white transition-colors"
            >
              Explore Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-[#d1d9e0] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] inline-flex items-center rounded-md border bg-white dark:bg-[#161b22] px-6 py-3 text-base font-medium transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-[#656d76] dark:text-[#848d97] mt-12 text-sm">
            Trusted by developers at Fortune 500 companies and innovative startups
          </p>
        </div>
      </div>
    </section>
  );
}
