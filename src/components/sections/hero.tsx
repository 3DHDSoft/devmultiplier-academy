import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="border-light-gray bg-off-white text-slate mb-8 inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <span className="bg-blue mr-2 inline-block h-2 w-2 rounded-full" />
            For CTOs & Senior Developers
          </div>

          {/* Headline */}
          <h1 className="text-navy text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Become a <span className="text-blue">10x–100x Developer</span> in the Age of AI
          </h1>

          {/* Subheadline */}
          <p className="text-slate mt-6 text-lg leading-8 sm:text-xl">
            Master Domain-Driven Design, CQRS, database optimization, and AI-assisted development. Expert-led courses
            designed for professionals who ship production systems.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/courses"
              className="bg-navy hover:bg-blue inline-flex items-center rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors"
            >
              Explore Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-navy text-navy hover:bg-navy inline-flex items-center rounded-lg border-2 bg-transparent px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              View Pricing
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-slate mt-12 text-sm">
            Trusted by developers at Fortune 500 companies and innovative startups
          </p>
        </div>
      </div>
    </section>
  );
}
