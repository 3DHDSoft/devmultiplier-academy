import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen, Database, Layers, Server, Layout, Bot } from 'lucide-react';

// Course data - this should eventually come from the database
const courses = [
  {
    id: 'ddd-to-cqrs',
    title: 'From DDD to CQRS with AI Agents',
    description:
      'Learn to design complex domains and implement CQRS patterns with AI-assisted tooling. From bounded contexts to event sourcing, master the architecture patterns that scale.',
    longDescription: `This comprehensive course takes you on a journey from Domain-Driven Design fundamentals to implementing Command Query Responsibility Segregation (CQRS) patterns with modern AI assistance.

You'll learn how to identify bounded contexts, design aggregates, and model complex business domains. Then we'll bridge the gap to CQRS and event sourcing, showing you how to separate read and write concerns for maximum scalability.

Throughout the course, you'll leverage AI agents to accelerate your development, from generating domain models to writing event handlers.`,
    icon: Layers,
    topics: ['Domain-Driven Design', 'CQRS', 'Event Sourcing', 'AI Agents', 'Bounded Contexts'],
    duration: '8 hours',
    lessons: 24,
    modules: [
      { title: 'Introduction to DDD', lessons: 4 },
      { title: 'Bounded Contexts & Strategic Design', lessons: 5 },
      { title: 'Aggregates & Tactical Patterns', lessons: 5 },
      { title: 'Introduction to CQRS', lessons: 4 },
      { title: 'Event Sourcing Fundamentals', lessons: 3 },
      { title: 'AI-Assisted Implementation', lessons: 3 },
    ],
  },
  {
    id: 'ddd-to-database',
    title: 'DDD to Database Schema',
    description:
      'Transform your domain models into optimized database schemas. Bridge the gap between business logic and data persistence with proven patterns.',
    longDescription: `Master the art of translating your domain models into efficient, maintainable database schemas. This course bridges the gap between object-oriented domain design and relational data persistence.

Learn proven patterns for mapping aggregates to tables, handling relationships, and managing schema evolution. You'll understand when to denormalize for performance and how to maintain data integrity while respecting your domain boundaries.

By the end, you'll be able to design database schemas that faithfully represent your domain while performing optimally under load.`,
    icon: Database,
    topics: ['Schema Design', 'ORM Mapping', 'Migration Strategies', 'Performance Tuning'],
    duration: '6 hours',
    lessons: 18,
    modules: [
      { title: 'Domain to Relational Mapping', lessons: 4 },
      { title: 'Aggregate Persistence Patterns', lessons: 4 },
      { title: 'Handling Relationships', lessons: 3 },
      { title: 'Schema Evolution & Migrations', lessons: 4 },
      { title: 'Performance Optimization', lessons: 3 },
    ],
  },
  {
    id: 'database-optimization',
    title: 'AI-Assisted Database Optimization',
    description:
      'SQL Server 2025 vs PostgreSQL 18 deep dive. Learn to optimize queries, indexes, and architecture with AI assistance for maximum performance.',
    longDescription: `Dive deep into database performance optimization with the latest versions of SQL Server and PostgreSQL. This hands-on course teaches you to identify bottlenecks, optimize queries, and design high-performance database architectures.

Compare and contrast SQL Server 2025 and PostgreSQL 18 features, understanding when to use each. Learn to leverage AI tools for query analysis, index recommendations, and performance tuning.

You'll work through real-world optimization scenarios, from slow query diagnosis to architectural improvements that deliver 10x performance gains.`,
    icon: Server,
    topics: ['SQL Server 2025', 'PostgreSQL 18', 'Query Optimization', 'AI Tools', 'Indexing'],
    duration: '10 hours',
    lessons: 30,
    modules: [
      { title: 'Database Internals Overview', lessons: 5 },
      { title: 'Query Execution & Analysis', lessons: 6 },
      { title: 'Index Strategy & Design', lessons: 5 },
      { title: 'SQL Server 2025 Features', lessons: 5 },
      { title: 'PostgreSQL 18 Features', lessons: 5 },
      { title: 'AI-Powered Optimization', lessons: 4 },
    ],
  },
  {
    id: 'data-driven-api',
    title: 'Data-Driven REST API Development',
    description:
      'Build scalable, maintainable REST APIs driven by your data models. From design to deployment with modern best practices and documentation.',
    longDescription: `Build production-ready REST APIs that scale with your business. This course covers everything from API design principles to deployment and documentation.

Learn to design intuitive endpoints, implement proper validation, handle errors gracefully, and version your APIs without breaking changes. You'll generate comprehensive OpenAPI documentation and implement security best practices.

By course end, you'll be able to ship APIs that developers love to use and that stand the test of growing traffic and evolving requirements.`,
    icon: Bot,
    topics: ['REST Design', 'OpenAPI', 'Validation', 'Documentation', 'Versioning'],
    duration: '7 hours',
    lessons: 21,
    modules: [
      { title: 'REST API Design Principles', lessons: 4 },
      { title: 'Request Handling & Validation', lessons: 4 },
      { title: 'Error Handling & Responses', lessons: 3 },
      { title: 'OpenAPI Documentation', lessons: 4 },
      { title: 'Versioning & Evolution', lessons: 3 },
      { title: 'Security & Deployment', lessons: 3 },
    ],
  },
  {
    id: 'ai-ui-design',
    title: 'AI-Assisted UI Design & Implementation',
    description:
      'Design and build modern interfaces with Next.js and AI tools. From wireframes to production-ready components with Tailwind CSS.',
    longDescription: `Transform your UI development workflow with AI-assisted design and implementation. This course teaches you to rapidly prototype, design, and build production-quality interfaces using modern tools.

Learn to leverage AI for generating component ideas, writing Tailwind CSS, and iterating on designs. Master Next.js App Router patterns, React Server Components, and component architecture for scalable frontends.

You'll build real projects from concept to deployed application, developing skills that dramatically accelerate your UI development process.`,
    icon: Layout,
    topics: ['Next.js', 'React', 'Tailwind CSS', 'AI Design Tools', 'Component Architecture'],
    duration: '9 hours',
    lessons: 27,
    modules: [
      { title: 'AI-Assisted Design Workflow', lessons: 4 },
      { title: 'Next.js App Router Patterns', lessons: 5 },
      { title: 'Tailwind CSS Mastery', lessons: 5 },
      { title: 'Component Architecture', lessons: 5 },
      { title: 'React Server Components', lessons: 4 },
      { title: 'From Design to Production', lessons: 4 },
    ],
  },
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return {
      title: 'Course Not Found | DevMultiplier Academy',
    };
  }

  return {
    title: `${course.title} | DevMultiplier Academy`,
    description: course.description,
  };
}

export async function generateStaticParams() {
  return courses.map((course) => ({
    id: course.id,
  }));
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);

  if (!course) {
    notFound();
  }

  const Icon = course.icon;

  return (
    <div className="bg-white dark:bg-[#0d1117] py-16 sm:py-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/courses"
          className="text-[#656d76] dark:text-[#848d97] hover:text-[#0969da] dark:hover:text-[#4493f8] mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all courses
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="bg-[#1f2328] dark:bg-[#e6edf3] mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl text-white dark:text-[#0d1117]">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="text-[#1f2328] dark:text-[#e6edf3] mb-4 text-4xl font-semibold tracking-tight">{course.title}</h1>
          <p className="text-[#656d76] dark:text-[#848d97] text-lg">{course.description}</p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="text-[#656d76] dark:text-[#848d97] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{course.duration}</span>
            </div>
            <div className="text-[#656d76] dark:text-[#848d97] flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>{course.lessons} lessons</span>
            </div>
          </div>

          {/* Topics - GitHub style labels */}
          <div className="mt-6 flex flex-wrap gap-2">
            {course.topics.map((topic) => (
              <span
                key={topic}
                className="bg-[#ddf4ff] dark:bg-[#388bfd26] text-[#0969da] dark:text-[#4493f8] border border-[#54aeff66] dark:border-[#4493f866] inline-block rounded-full px-3 py-1 text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* About section */}
        <div className="mb-12">
          <h2 className="text-[#1f2328] dark:text-[#e6edf3] mb-4 text-2xl font-semibold">About this course</h2>
          <div className="text-[#1f2328] dark:text-[#e6edf3] prose prose-lg max-w-none dark:prose-invert">
            {course.longDescription.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-[#1f2328] dark:text-[#e6edf3] mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Curriculum - GitHub style list */}
        <div className="mb-12">
          <h2 className="text-[#1f2328] dark:text-[#e6edf3] mb-6 text-2xl font-semibold">Curriculum</h2>
          <div className="border-[#d1d9e0] dark:border-[#30363d] divide-[#d1d9e0] dark:divide-[#30363d] divide-y rounded-md border bg-white dark:bg-[#161b22]">
            {course.modules.map((module, index) => (
              <Link
                key={module.title}
                href={`/courses/${course.id}/module-${index + 1}/lesson-1`}
                className="flex items-center justify-between p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#848d97] flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium group-hover:bg-[#0969da] dark:group-hover:bg-[#4493f8] group-hover:text-white transition-colors">
                    {index + 1}
                  </span>
                  <span className="text-[#1f2328] dark:text-[#e6edf3] font-medium group-hover:text-[#0969da] dark:group-hover:text-[#4493f8] transition-colors">{module.title}</span>
                </div>
                <span className="text-[#656d76] dark:text-[#848d97] text-sm">{module.lessons} lessons</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA - GitHub style card */}
        <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d1d9e0] dark:border-[#30363d] rounded-md p-8 text-center">
          <h2 className="text-[#1f2328] dark:text-[#e6edf3] mb-2 text-2xl font-semibold">Ready to start learning?</h2>
          <p className="text-[#656d76] dark:text-[#848d97] mb-6">Join thousands of developers mastering modern software architecture.</p>
          <Link
            href="/login"
            className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] inline-flex items-center justify-center rounded-md px-8 py-3 font-medium text-white transition-colors"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
}
