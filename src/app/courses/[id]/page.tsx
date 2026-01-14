import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen, Database, Layers, Server, Layout, Bot } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { EnrollmentCTA } from '@/components/ui/enrollment-cta';

// Privileged email domains and specific emails that can access all courses
const PRIVILEGED_DOMAINS = ['3dhdsoft.com', 'devmultiplier.com'];
const PRIVILEGED_EMAILS = ['3dhdsoft@gmail.com', 'herb.coder@gmail.com'];
// Blocked emails that should NOT have access even if on a privileged domain
const BLOCKED_EMAILS = ['forbid@devmultiplier.com'];

function isBlockedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  return BLOCKED_EMAILS.some((e) => e.toLowerCase() === emailLower);
}

function hasPrivilegedAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();

  // Check if email is explicitly blocked
  if (isBlockedEmail(email)) {
    return false;
  }

  // Check specific privileged emails
  if (PRIVILEGED_EMAILS.some((e) => e.toLowerCase() === emailLower)) {
    return true;
  }

  // Check privileged domains
  const domain = emailLower.split('@')[1];
  if (domain && PRIVILEGED_DOMAINS.some((d) => d.toLowerCase() === domain)) {
    return true;
  }

  return false;
}

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Icon mapping for courses
const iconMap: Record<string, typeof Layers> = {
  'ddd-to-cqrs': Layers,
  'ddd-to-database': Database,
  'database-optimization': Server,
  'data-driven-api': Bot,
  'ai-ui-design': Layout,
};

// Fallback course data for courses not yet in database
const fallbackCourses = [
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

// Helper to get course data (from DB or fallback)
async function getCourseData(slug: string) {
  // Try to get from database first
  const dbCourse = await prisma.course.findUnique({
    where: { slug },
    include: {
      course_translations: {
        where: { locale: 'en' },
        take: 1,
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          module_translations: {
            where: { locale: 'en' },
            take: 1,
          },
          lessons: true,
        },
      },
    },
  });

  if (dbCourse && dbCourse.course_translations.length > 0) {
    const translation = dbCourse.course_translations[0];
    const fallback = fallbackCourses.find((c) => c.id === slug);

    return {
      id: dbCourse.id,
      slug: dbCourse.slug,
      title: translation.title,
      description: translation.description,
      longDescription: translation.content || fallback?.longDescription || '',
      icon: iconMap[slug] || Layers,
      topics: fallback?.topics || [],
      duration: fallback?.duration || '6 hours',
      lessons: dbCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0) || fallback?.lessons || 20,
      modules: dbCourse.modules.map((m) => ({
        title: m.module_translations[0]?.title || `Module ${m.order}`,
        lessons: m.lessons.length,
      })),
      price: dbCourse.price,
      currency: dbCourse.currency,
      fromDatabase: true,
    };
  }

  // Fallback to hardcoded data
  const fallback = fallbackCourses.find((c) => c.id === slug);
  if (fallback) {
    return {
      ...fallback,
      slug: fallback.id,
      price: 7900, // Default price $79
      currency: 'usd',
      fromDatabase: false,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseData(id);

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
  return fallbackCourses.map((course) => ({
    id: course.id,
  }));
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Check authentication and authorization
  const session = await auth();

  if (!session?.user?.email) {
    // Not authenticated - redirect to login
    redirect(`/login?callbackUrl=${encodeURIComponent(`/courses/${id}`)}`);
  }

  const userEmail = session.user.email;
  const userId = session.user.id;

  // Check if user is explicitly blocked
  if (isBlockedEmail(userEmail)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] px-4 dark:bg-[#0d1117]">
        <div className="w-full max-w-md rounded-lg border border-[#d1d9e0] bg-white p-8 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="mb-4 text-red-500 dark:text-red-400">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Access Denied</h1>
          <p className="mb-6 text-[#656d76] dark:text-[#848d97]">
            You are not allowed to view this course. Please contact support at{' '}
            <a
              href="mailto:support@devmultiplier.com"
              className="text-[#0969da] hover:underline dark:text-[#4493f8]"
            >
              support@devmultiplier.com
            </a>
          </p>
          <Link
            href="/courses"
            className="inline-block rounded-md bg-[#1f883d] px-4 py-2 font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has privileged access
  const isPrivileged = hasPrivilegedAccess(userEmail);

  // If not privileged, check enrollment
  if (!isPrivileged && userId) {
    // Get course by slug (id param is the slug, not UUID)
    const dbCourse = await prisma.course.findFirst({
      where: isValidUUID(id) ? { id: id } : { slug: id },
      select: { id: true },
    });

    if (dbCourse) {
      const enrollment = await prisma.enrollments.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: dbCourse.id,
          },
        },
      });

      if (!enrollment) {
        // Not enrolled - redirect to courses list with message
        redirect(`/courses?error=not_enrolled&course=${id}`);
      }
    }
    // If course not in DB, we allow access (fallback courses for testing)
  }

  const course = await getCourseData(id);

  if (!course) {
    notFound();
  }

  const Icon = course.icon;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#656d76] transition-colors hover:text-[#0969da] dark:text-[#848d97] dark:hover:text-[#4493f8]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all courses
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#1f2328] text-white dark:bg-[#e6edf3] dark:text-[#0d1117]">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#1f2328] dark:text-[#e6edf3]">
            {course.title}
          </h1>
          <p className="text-lg text-[#656d76] dark:text-[#848d97]">{course.description}</p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[#656d76] dark:text-[#848d97]">
              <Clock className="h-5 w-5" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-[#656d76] dark:text-[#848d97]">
              <BookOpen className="h-5 w-5" />
              <span>{course.lessons} lessons</span>
            </div>
          </div>

          {/* Topics - GitHub style labels */}
          <div className="mt-6 flex flex-wrap gap-2">
            {course.topics.map((topic) => (
              <span
                key={topic}
                className="inline-block rounded-full border border-[#54aeff66] bg-[#ddf4ff] px-3 py-1 text-xs font-medium text-[#0969da] dark:border-[#4493f866] dark:bg-[#388bfd26] dark:text-[#4493f8]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* About section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">About this course</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-[#1f2328] dark:text-[#e6edf3]">
            {course.longDescription.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="mb-4 text-[#1f2328] dark:text-[#e6edf3]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Curriculum - GitHub style list */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Curriculum</h2>
          <div className="divide-y divide-[#d1d9e0] rounded-md border border-[#d1d9e0] bg-white dark:divide-[#30363d] dark:border-[#30363d] dark:bg-[#161b22]">
            {course.modules.map((module, index) => (
              <Link
                key={module.title}
                href={`/courses/${course.id}/module-${index + 1}/lesson-1`}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f8fa] text-sm font-medium text-[#656d76] transition-colors group-hover:bg-[#0969da] group-hover:text-white dark:bg-[#21262d] dark:text-[#848d97] dark:group-hover:bg-[#4493f8]">
                    {index + 1}
                  </span>
                  <span className="font-medium text-[#1f2328] transition-colors group-hover:text-[#0969da] dark:text-[#e6edf3] dark:group-hover:text-[#4493f8]">
                    {module.title}
                  </span>
                </div>
                <span className="text-sm text-[#656d76] dark:text-[#848d97]">{module.lessons} lessons</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA - Enrollment component */}
        <EnrollmentCTA
          courseId={course.id}
          courseSlug={course.slug}
          price={course.price ?? undefined}
          currency={course.currency}
        />
      </div>
    </div>
  );
}
