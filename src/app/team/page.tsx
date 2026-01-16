import { Metadata } from 'next';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { InstructorCard } from '@/components/ui/instructor-card';
import { platformCreator, aiCollaborator } from '@/lib/instructors';

export const metadata: Metadata = {
  title: 'Our Team | DevMultiplier Academy',
  description:
    'Meet the team behind DevMultiplier Academy. Human expertise meets AI collaboration—we practice what we teach.',
};

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1f2328] sm:text-5xl dark:text-[#e6edf3]">
            Meet the Team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#656d76] dark:text-[#848d97]">
            We practice what we teach. This platform and all its courses are built through human-AI collaboration—the
            exact workflow we&apos;re teaching you.
          </p>
        </div>

        {/* Philosophy Banner */}
        <div className="mb-12 rounded-lg border border-[#54aeff66] bg-[#ddf4ff] p-6 dark:border-[#4493f866] dark:bg-[#388bfd26]">
          <p className="text-center text-lg font-medium text-[#0969da] dark:text-[#4493f8]">
            &ldquo;I&apos;m not just teaching AI-assisted development—I&apos;m using it every day to build this
            platform.&rdquo;
          </p>
        </div>

        {/* Creator Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Course Creator</h2>
          <InstructorCard
            instructor={platformCreator}
            variant="full"
          />
        </section>

        {/* AI Collaborator Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">AI Collaborator</h2>
          <div className="rounded-lg border border-[#d1d9e0] bg-white p-6 dark:border-[#30363d] dark:bg-[#161b22]">
            {/* Header with AI indicator */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8250df] to-[#bf3989] text-white">
                <Bot className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">{aiCollaborator.name}</h3>
                  <span className="inline-flex items-center rounded-full border border-[#8250df66] bg-[#fbefff] px-2 py-0.5 text-xs font-medium text-[#8250df] dark:border-[#a371f766] dark:bg-[#a371f726] dark:text-[#a371f7]">
                    AI
                  </span>
                </div>
                <p className="text-sm font-medium text-[#8250df] dark:text-[#a371f7]">{aiCollaborator.role}</p>
                <p className="mt-1 text-sm text-[#656d76] dark:text-[#848d97]">{aiCollaborator.title}</p>
              </div>
            </div>

            {/* Bio */}
            <p className="mt-4 text-sm leading-relaxed text-[#656d76] dark:text-[#848d97]">{aiCollaborator.bio}</p>

            {/* Expertise tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {aiCollaborator.expertise.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex rounded-full border border-[#d1d9e0] bg-[#f6f8fa] px-3 py-1 text-xs font-medium text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#848d97]"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Anthropic credit */}
            <div className="mt-4 border-t border-[#d1d9e0] pt-4 dark:border-[#30363d]">
              <p className="text-xs text-[#656d76] dark:text-[#848d97]">
                Claude is created by{' '}
                <a
                  href="https://www.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0969da] hover:underline dark:text-[#4493f8]"
                >
                  Anthropic
                </a>
                . We use Claude for content development, code generation, and platform building.
              </p>
            </div>
          </div>
        </section>

        {/* Why Transparency Matters */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Why We&apos;re Transparent</h2>
          <div className="space-y-4 text-[#656d76] dark:text-[#848d97]">
            <p>
              Many platforms hide their use of AI. We don&apos;t. Here&apos;s why:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-[#1f2328] dark:text-[#e6edf3]">We practice what we teach.</strong> Our courses
                are about AI-assisted development. It would be hypocritical not to use AI ourselves.
              </li>
              <li>
                <strong className="text-[#1f2328] dark:text-[#e6edf3]">Human expertise still matters.</strong> Ivan
                brings 30+ years of architecture experience. AI amplifies that expertise—it doesn&apos;t replace it.
              </li>
              <li>
                <strong className="text-[#1f2328] dark:text-[#e6edf3]">You deserve honesty.</strong> When you learn from
                us, you&apos;re seeing a real human-AI workflow in action, not fictional personas.
              </li>
              <li>
                <strong className="text-[#1f2328] dark:text-[#e6edf3]">This is the future.</strong> The developers who
                thrive will be those who learn to collaborate with AI effectively. We&apos;re showing you how.
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-lg border border-[#d1d9e0] bg-[#f6f8fa] p-8 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <h2 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Learn the Workflow</h2>
          <p className="mt-2 text-[#656d76] dark:text-[#848d97]">
            See human-AI collaboration in action. Every course demonstrates the productivity gains we&apos;ve achieved.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-md bg-[#1f883d] px-6 py-2 font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
