import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Layers, Server, Layout, Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses | DevMultiplier Academy",
  description:
    "Explore our comprehensive courses on Domain-Driven Design, CQRS, database optimization, REST APIs, and AI-assisted development.",
};

const courses = [
  {
    id: "ddd-to-cqrs",
    title: "From DDD to CQRS with AI Agents",
    description:
      "Learn to design complex domains and implement CQRS patterns with AI-assisted tooling. From bounded contexts to event sourcing, master the architecture patterns that scale.",
    icon: Layers,
    topics: ["Domain-Driven Design", "CQRS", "Event Sourcing", "AI Agents", "Bounded Contexts"],
    duration: "8 hours",
    lessons: 24,
  },
  {
    id: "ddd-to-database",
    title: "DDD to Database Schema",
    description:
      "Transform your domain models into optimized database schemas. Bridge the gap between business logic and data persistence with proven patterns.",
    icon: Database,
    topics: ["Schema Design", "ORM Mapping", "Migration Strategies", "Performance Tuning"],
    duration: "6 hours",
    lessons: 18,
  },
  {
    id: "database-optimization",
    title: "AI-Assisted Database Optimization",
    description:
      "SQL Server 2025 vs PostgreSQL 18 deep dive. Learn to optimize queries, indexes, and architecture with AI assistance for maximum performance.",
    icon: Server,
    topics: ["SQL Server 2025", "PostgreSQL 18", "Query Optimization", "AI Tools", "Indexing"],
    duration: "10 hours",
    lessons: 30,
  },
  {
    id: "data-driven-api",
    title: "Data-Driven REST API Development",
    description:
      "Build scalable, maintainable REST APIs driven by your data models. From design to deployment with modern best practices and documentation.",
    icon: Bot,
    topics: ["REST Design", "OpenAPI", "Validation", "Documentation", "Versioning"],
    duration: "7 hours",
    lessons: 21,
  },
  {
    id: "ai-ui-design",
    title: "AI-Assisted UI Design & Implementation",
    description:
      "Design and build modern interfaces with Next.js and AI tools. From wireframes to production-ready components with Tailwind CSS.",
    icon: Layout,
    topics: ["Next.js", "React", "Tailwind CSS", "AI Design Tools", "Component Architecture"],
    duration: "9 hours",
    lessons: 27,
  },
];

export default function CoursesPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Our Courses
          </h1>
          <p className="mt-4 text-lg text-slate">
            Comprehensive, expert-led courses designed to transform how you
            architect, build, and ship production software.
          </p>
        </div>

        {/* Course list */}
        <div className="mx-auto mt-16 max-w-4xl space-y-8">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex flex-col rounded-2xl border border-light-gray bg-white p-6 transition-all hover:border-blue hover:shadow-lg sm:flex-row sm:items-start sm:gap-6"
            >
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-navy text-white transition-colors group-hover:bg-blue sm:mb-0">
                <course.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-navy group-hover:text-blue">
                    {course.title}
                  </h2>
                  <ArrowRight className="h-5 w-5 text-slate opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <p className="mt-2 text-slate">{course.description}</p>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate">
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.lessons} lessons</span>
                </div>

                {/* Topics */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-block rounded-full bg-off-white px-3 py-1 text-xs font-medium text-slate"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
