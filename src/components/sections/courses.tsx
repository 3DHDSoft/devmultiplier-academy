import Link from 'next/link';
import { ArrowRight, Database, Layers, Server, Layout, Bot } from 'lucide-react';

const courses = [
  {
    id: 'ddd-to-cqrs',
    title: 'From DDD to CQRS with AI Agents',
    description:
      'Learn to design complex domains and implement CQRS patterns with AI-assisted tooling. From bounded contexts to event sourcing.',
    icon: Layers,
    topics: ['Domain-Driven Design', 'CQRS', 'Event Sourcing', 'AI Agents'],
  },
  {
    id: 'ddd-to-database',
    title: 'DDD to Database Schema',
    description:
      'Transform your domain models into optimized database schemas. Bridge the gap between business logic and data persistence.',
    icon: Database,
    topics: ['Schema Design', 'ORM Mapping', 'Migration Strategies', 'Performance'],
  },
  {
    id: 'database-optimization',
    title: 'AI-Assisted Database Optimization',
    description:
      'SQL Server 2025 vs PostgreSQL 18 deep dive. Learn to optimize queries, indexes, and architecture with AI assistance.',
    icon: Server,
    topics: ['SQL Server 2025', 'PostgreSQL 18', 'Query Optimization', 'AI Tools'],
  },
  {
    id: 'data-driven-api',
    title: 'Data-Driven REST API Development',
    description:
      'Build scalable, maintainable REST APIs driven by your data models. From design to deployment with modern best practices.',
    icon: Bot,
    topics: ['REST Design', 'OpenAPI', 'Validation', 'Documentation'],
  },
  {
    id: 'ai-ui-design',
    title: 'AI-Assisted UI Design & Implementation',
    description:
      'Design and build modern interfaces with Next.js and AI tools. From wireframes to production-ready components.',
    icon: Layout,
    topics: ['Next.js', 'React', 'Tailwind CSS', 'AI Design Tools'],
  },
];

export function Courses() {
  return (
    <section className="bg-off-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-blue text-sm font-semibold tracking-wider uppercase">Curriculum</h2>
          <p className="text-navy mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Master Modern Development</p>
          <p className="text-slate mt-4 text-lg">
            Five comprehensive courses designed to transform how you architect, build, and ship software.
          </p>
        </div>

        {/* Course grid */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group border-light-gray hover:border-blue relative flex flex-col rounded-2xl border bg-white p-6 transition-all hover:shadow-lg"
            >
              {/* Icon */}
              <div className="bg-navy group-hover:bg-blue mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white transition-colors">
                <course.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="text-navy group-hover:text-blue text-lg font-semibold">{course.title}</h3>

              {/* Description */}
              <p className="text-slate mt-2 flex-grow text-sm">{course.description}</p>

              {/* Topics */}
              <div className="mt-4 flex flex-wrap gap-2">
                {course.topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-off-white text-slate inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="text-blue mt-4 flex items-center text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/courses"
            className="bg-navy hover:bg-blue inline-flex items-center rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors"
          >
            View All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
