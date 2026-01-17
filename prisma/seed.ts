import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env.local which contains DATABASE_URL
config({ path: '.env.local' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const courses = [
  {
    slug: 'ddd-to-cqrs',
    status: 'published',
    price: 7900,
    currency: 'usd',
    translation: {
      locale: 'en',
      title: 'From DDD to CQRS with AI Agents',
      description:
        'Learn to design complex domains and implement CQRS patterns with AI-assisted tooling. From bounded contexts to event sourcing, master the architecture patterns that scale.',
      content: `This comprehensive course takes you on a journey from Domain-Driven Design fundamentals to implementing Command Query Responsibility Segregation (CQRS) patterns with modern AI assistance.

You'll learn how to identify bounded contexts, design aggregates, and model complex business domains. Then we'll bridge the gap to CQRS and event sourcing, showing you how to separate read and write concerns for maximum scalability.

Throughout the course, you'll leverage AI agents to accelerate your development, from generating domain models to writing event handlers.`,
    },
    modules: [
      { order: 1, title: 'Introduction to DDD', lessonCount: 5 },
      { order: 2, title: 'Bounded Contexts & Strategic Design', lessonCount: 5 },
      { order: 3, title: 'Aggregates & Tactical Patterns', lessonCount: 5 },
      { order: 4, title: 'Introduction to CQRS', lessonCount: 4 },
      { order: 5, title: 'Event Sourcing Fundamentals', lessonCount: 3 },
      { order: 6, title: 'AI-Assisted Implementation', lessonCount: 3 },
    ],
  },
  {
    slug: 'ddd-to-database',
    status: 'draft',
    price: 7900,
    currency: 'usd',
    translation: {
      locale: 'en',
      title: 'DDD to Database Schema',
      description:
        'Transform your domain models into optimized database schemas. Bridge the gap between business logic and data persistence with proven patterns.',
      content: `Master the art of translating your domain models into efficient, maintainable database schemas. This course bridges the gap between object-oriented domain design and relational data persistence.

Learn proven patterns for mapping aggregates to tables, handling relationships, and managing schema evolution. You'll understand when to denormalize for performance and how to maintain data integrity while respecting your domain boundaries.

By the end, you'll be able to design database schemas that faithfully represent your domain while performing optimally under load.`,
    },
    modules: [
      { order: 1, title: 'Domain to Relational Mapping', lessonCount: 4 },
      { order: 2, title: 'Aggregate Persistence Patterns', lessonCount: 4 },
      { order: 3, title: 'Handling Relationships', lessonCount: 3 },
      { order: 4, title: 'Schema Evolution & Migrations', lessonCount: 4 },
      { order: 5, title: 'Performance Optimization', lessonCount: 3 },
    ],
  },
  {
    slug: 'database-optimization',
    status: 'draft',
    price: 9900,
    currency: 'usd',
    translation: {
      locale: 'en',
      title: 'AI-Assisted Database Optimization',
      description:
        'SQL Server 2025 vs PostgreSQL 18 deep dive. Learn to optimize queries, indexes, and architecture with AI assistance for maximum performance.',
      content: `Dive deep into database performance optimization with the latest versions of SQL Server and PostgreSQL. This hands-on course teaches you to identify bottlenecks, optimize queries, and design high-performance database architectures.

Compare and contrast SQL Server 2025 and PostgreSQL 18 features, understanding when to use each. Learn to leverage AI tools for query analysis, index recommendations, and performance tuning.

You'll work through real-world optimization scenarios, from slow query diagnosis to architectural improvements that deliver 10x performance gains.`,
    },
    modules: [
      { order: 1, title: 'Database Internals Overview', lessonCount: 5 },
      { order: 2, title: 'Query Execution & Analysis', lessonCount: 6 },
      { order: 3, title: 'Index Strategy & Design', lessonCount: 5 },
      { order: 4, title: 'SQL Server 2025 Features', lessonCount: 5 },
      { order: 5, title: 'PostgreSQL 18 Features', lessonCount: 5 },
      { order: 6, title: 'AI-Powered Optimization', lessonCount: 4 },
    ],
  },
  {
    slug: 'data-driven-api',
    status: 'draft',
    price: 7900,
    currency: 'usd',
    translation: {
      locale: 'en',
      title: 'Data-Driven REST API Development',
      description:
        'Build scalable, maintainable REST APIs driven by your data models. From design to deployment with modern best practices and documentation.',
      content: `Build production-ready REST APIs that scale with your business. This course covers everything from API design principles to deployment and documentation.

Learn to design intuitive endpoints, implement proper validation, handle errors gracefully, and version your APIs without breaking changes. You'll generate comprehensive OpenAPI documentation and implement security best practices.

By course end, you'll be able to ship APIs that developers love to use and that stand the test of growing traffic and evolving requirements.`,
    },
    modules: [
      { order: 1, title: 'REST API Design Principles', lessonCount: 4 },
      { order: 2, title: 'Request Handling & Validation', lessonCount: 4 },
      { order: 3, title: 'Error Handling & Responses', lessonCount: 3 },
      { order: 4, title: 'OpenAPI Documentation', lessonCount: 4 },
      { order: 5, title: 'Versioning & Evolution', lessonCount: 3 },
      { order: 6, title: 'Security & Deployment', lessonCount: 3 },
    ],
  },
  {
    slug: 'ai-ui-design',
    status: 'draft',
    price: 8900,
    currency: 'usd',
    translation: {
      locale: 'en',
      title: 'AI-Assisted UI Design & Implementation',
      description:
        'Design and build modern interfaces with Next.js and AI tools. From wireframes to production-ready components with Tailwind CSS.',
      content: `Transform your UI development workflow with AI-assisted design and implementation. This course teaches you to rapidly prototype, design, and build production-quality interfaces using modern tools.

Learn to leverage AI for generating component ideas, writing Tailwind CSS, and iterating on designs. Master Next.js App Router patterns, React Server Components, and component architecture for scalable frontends.

You'll build real projects from concept to deployed application, developing skills that dramatically accelerate your UI development process.`,
    },
    modules: [
      { order: 1, title: 'AI-Assisted Design Workflow', lessonCount: 4 },
      { order: 2, title: 'Next.js App Router Patterns', lessonCount: 5 },
      { order: 3, title: 'Tailwind CSS Mastery', lessonCount: 5 },
      { order: 4, title: 'Component Architecture', lessonCount: 5 },
      { order: 5, title: 'React Server Components', lessonCount: 4 },
      { order: 6, title: 'From Design to Production', lessonCount: 4 },
    ],
  },
];

async function main() {
  console.log('Seeding courses...');

  for (const courseData of courses) {
    const now = new Date();

    // Check if course already exists
    const existing = await prisma.course.findUnique({
      where: { slug: courseData.slug },
    });

    if (existing) {
      console.log(`Course "${courseData.slug}" already exists, skipping...`);
      continue;
    }

    // Create course with translation and modules
    const course = await prisma.course.create({
      data: {
        slug: courseData.slug,
        status: courseData.status,
        price: courseData.price,
        currency: courseData.currency,
        updatedAt: now,
        course_translations: {
          create: {
            locale: courseData.translation.locale,
            title: courseData.translation.title,
            description: courseData.translation.description,
            content: courseData.translation.content,
            updatedAt: now,
          },
        },
        modules: {
          create: courseData.modules.map((mod) => ({
            order: mod.order,
            updatedAt: now,
            module_translations: {
              create: {
                locale: 'en',
                title: mod.title,
                updatedAt: now,
              },
            },
            lessons: {
              create: Array.from({ length: mod.lessonCount }, (_, i) => ({
                order: i,
                updatedAt: now,
                lesson_translations: {
                  create: {
                    locale: 'en',
                    title: `Lesson ${i + 1}`,
                    content: '',
                    updatedAt: now,
                  },
                },
              })),
            },
          })),
        },
      },
    });

    console.log(`Created course: ${course.slug} (${course.id})`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
