import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-light-gray bg-off-white px-4 py-1.5 text-sm text-slate">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue" />
            For CTOs & Senior Developers
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
            Become a{" "}
            <span className="text-blue">10x–100x Developer</span>{" "}
            in the Age of AI
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-slate sm:text-xl">
            Master Domain-Driven Design, CQRS, database optimization, and
            AI-assisted development. Expert-led courses designed for
            professionals who ship production systems.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-lg bg-navy px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue"
            >
              Explore Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg border-2 border-navy bg-transparent px-6 py-3 text-base font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              View Pricing
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-12 text-sm text-slate">
            Trusted by developers at Fortune 500 companies and innovative startups
          </p>
        </div>
      </div>
    </section>
  );
}
