import Link from 'next/link';
import { ArrowRight, Database, Layers, Server, Layout, Bot } from 'lucide-react';

const courses = [
  {
    id: 'ddd-to-cqrs',
    title: 'From DDD to CQRS with AI Agents',
    description: 'Learn to design complex domains and implement CQRS patterns with AI-assisted tooling. From bounded contexts to event sourcing.',
    icon: Layers,
    topics: ['Domain-Driven Design', 'CQRS', 'Event Sourcing', 'AI Agents'],
  },
  {
    id: 'ddd-to-database',
    title: 'DDD to Database Schema',
    description: 'Transform your domain models into optimized database schemas. Bridge the gap between business logic and data persistence.',
    icon: Database,
    topics: ['Schema Design', 'ORM Mapping', 'Migration Strategies', 'Performance'],
  },
  {
    id: 'database-optimization',
    title: 'AI-Assisted Database Optimization',
    description: 'SQL Server 2025 vs PostgreSQL 18 deep dive. Learn to optimize queries, indexes, and architecture with AI assistance.',
    icon: Server,
    topics: ['SQL Server 2025', 'PostgreSQL 18', 'Query Optimization', 'AI Tools'],
  },
  {
    id: 'data-driven-api',
    title: 'Data-Driven REST API Development',
    description: 'Build scalable, maintainable REST APIs driven by your data models. From design to deployment with modern best practices.',
    icon: Bot,
    topics: ['REST Design', 'OpenAPI', 'Validation', 'Documentation'],
  },
  {
    id: 'ai-ui-design',
    title: 'AI-Assisted UI Design & Implementation',
    description: 'Design and build modern interfaces with Next.js and AI tools. From wireframes to production-ready components.',
    icon: Layout,
    topics: ['Next.js', 'React', 'Tailwind CSS', 'AI Design Tools'],
  },
];

export function Courses() {
  return (
    <section className="bg-[#f6f8fa] py-24 sm:py-32 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold tracking-wider text-[#0969da] uppercase dark:text-[#4493f8]">Curriculum</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2328] sm:text-4xl dark:text-[#e6edf3]">Master Modern Development</p>
          <p className="mt-4 text-lg text-[#656d76] dark:text-[#848d97]">Five comprehensive courses designed to transform how you architect, build, and ship software.</p>
        </div>

        {/* Course grid - GitHub style cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group relative flex flex-col rounded-md border border-[#d1d9e0] bg-white p-6 transition-all hover:border-[#0969da] hover:shadow-md dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#4493f8]">
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#1f2328] text-white transition-colors group-hover:bg-[#0969da] dark:bg-[#e6edf3] dark:text-[#0d1117] dark:group-hover:bg-[#4493f8]">
                <course.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[#1f2328] transition-colors group-hover:text-[#0969da] dark:text-[#e6edf3] dark:group-hover:text-[#4493f8]">{course.title}</h3>

              {/* Description */}
              <p className="mt-2 grow text-sm text-[#656d76] dark:text-[#848d97]">{course.description}</p>

              {/* Topics - GitHub style labels */}
              <div className="mt-4 flex flex-wrap gap-2">
                {course.topics.map((topic) => (
                  <span key={topic} className="inline-block rounded-full border border-[#54aeff66] bg-[#ddf4ff] px-2.5 py-0.5 text-xs font-medium text-[#0969da] dark:border-[#4493f866] dark:bg-[#388bfd26] dark:text-[#4493f8]">
                    {topic}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="mt-4 flex items-center text-sm font-medium text-[#0969da] opacity-0 transition-opacity group-hover:opacity-100 dark:text-[#4493f8]">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA - GitHub style button */}
        <div className="mt-16 text-center">
          <Link href="/courses" className="inline-flex items-center rounded-md bg-[#1f883d] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]">
            View All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
