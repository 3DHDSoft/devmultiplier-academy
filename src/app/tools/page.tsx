import { Metadata } from 'next';
import Link from 'next/link';
import { Video, Mic, Code, Palette, Server, Zap, Info } from 'lucide-react';
import { ToolCard } from '@/components/ui/tool-card';
import { tools, categoryInfo, type ToolCategory } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Tools I Use | DevMultiplier Academy',
  description:
    'The AI tools, code editors, and infrastructure I use to build courses and this platform. Affiliate links with exclusive discounts.',
};

// Category icons
const categoryIcons: Record<ToolCategory, typeof Code> = {
  video: Video,
  voice: Mic,
  code: Code,
  design: Palette,
  infrastructure: Server,
  productivity: Zap,
};

// Category order for display
const categoryOrder: ToolCategory[] = ['code', 'video', 'voice', 'design', 'infrastructure', 'productivity'];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1f2328] sm:text-5xl dark:text-[#e6edf3]">
            Tools I Use
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#656d76] dark:text-[#848d97]">
            These are the actual tools I use to build courses, create content, and run this platform. I only recommend
            tools I genuinely use and believe in.
          </p>
        </div>

        {/* Affiliate Disclosure */}
        <div className="mb-12 rounded-lg border border-[#d4a72c66] bg-[#fff8c5] p-4 dark:border-[#d29922] dark:bg-[#bb800926]">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-[#9a6700] dark:text-[#d29922]" />
            <div className="text-sm text-[#6c5012] dark:text-[#d29922]">
              <p className="font-semibold">Affiliate Disclosure</p>
              <p className="mt-1">
                Some links on this page are affiliate links. This means I may earn a commission if you make a purchase
                through these links, at no additional cost to you. I only recommend products I personally use and
                believe will add value to your learning journey. This helps support the creation of free content and
                keeps DevMultiplier Academy running.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {categoryOrder.map((category) => {
            const Icon = categoryIcons[category];
            const info = categoryInfo[category];
            return (
              <a
                key={category}
                href={`#${category}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#d1d9e0] bg-white px-4 py-2 text-sm font-medium text-[#656d76] transition-colors hover:border-[#0969da] hover:text-[#0969da] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#848d97] dark:hover:border-[#4493f8] dark:hover:text-[#4493f8]"
              >
                <Icon className="h-4 w-4" />
                {info.name}
              </a>
            );
          })}
        </div>

        {/* Tool Categories */}
        {categoryOrder.map((category) => {
          const Icon = categoryIcons[category];
          const info = categoryInfo[category];
          const categoryTools = tools.filter((tool) => tool.category === category);

          if (categoryTools.length === 0) return null;

          return (
            <section
              key={category}
              id={category}
              className="mb-16 scroll-mt-24"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f8fa] dark:bg-[#21262d]">
                  <Icon className="h-5 w-5 text-[#656d76] dark:text-[#848d97]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">{info.name}</h2>
                  <p className="text-sm text-[#656d76] dark:text-[#848d97]">{info.description}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {categoryTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <div className="mt-16 rounded-lg border border-[#d1d9e0] bg-[#f6f8fa] p-8 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <h2 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Learn How to Use These Tools</h2>
          <p className="mt-2 text-[#656d76] dark:text-[#848d97]">
            My courses teach you how to integrate these tools into your workflow for maximum productivity.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses/ai-ui-design"
              className="inline-block rounded-md bg-[#1f883d] px-6 py-2 font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
            >
              AI-Assisted UI Design
            </Link>
            <Link
              href="/courses"
              className="inline-block rounded-md border border-[#d1d9e0] bg-white px-6 py-2 font-medium text-[#1f2328] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
            >
              All Courses
            </Link>
          </div>
        </div>

        {/* Trust Note */}
        <p className="mt-8 text-center text-sm text-[#656d76] dark:text-[#848d97]">
          Questions about any of these tools?{' '}
          <Link
            href="/contact"
            className="text-[#0969da] hover:underline dark:text-[#4493f8]"
          >
            Contact me
          </Link>{' '}
          and I&apos;ll share my honest experience.
        </p>
      </div>
    </div>
  );
}
