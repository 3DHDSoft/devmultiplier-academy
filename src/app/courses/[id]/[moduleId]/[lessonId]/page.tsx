import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import './lesson.css';
import { LessonProgress } from '@/components/ui/lesson-progress';
import { ContentProtection } from '@/components/ui/content-protection';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Privileged email domains and specific emails that can access all courses
const PRIVILEGED_DOMAINS = ['3dhdsoft.com', 'devmultiplier.com'];
const PRIVILEGED_EMAILS = ['3dhdsoft@gmail.com'];
// Blocked emails that should NOT have access even if on a privileged domain
const BLOCKED_EMAILS = ['forbid@devmultiplier.com'];

function isBlockedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  return BLOCKED_EMAILS.some(e => e.toLowerCase() === emailLower);
}

function hasPrivilegedAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();

  // Check if email is explicitly blocked
  if (isBlockedEmail(email)) {
    return false;
  }

  // Check specific privileged emails
  if (PRIVILEGED_EMAILS.some(e => e.toLowerCase() === emailLower)) {
    return true;
  }

  // Check privileged domains
  const domain = emailLower.split('@')[1];
  if (domain && PRIVILEGED_DOMAINS.some(d => d.toLowerCase() === domain)) {
    return true;
  }

  return false;
}

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

interface PageProps {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
}

// Course structure mapping
const courseModules = {
  'ddd-to-cqrs': [
    {
      id: 'module-1',
      title: 'Introduction to DDD',
      lessons: [
        { id: 'lesson-1', title: 'What is Domain-Driven Design?', duration: '20 min', file: 'lesson-1-what-is-ddd.md' },
        { id: 'lesson-2', title: 'Ubiquitous Language & Domain Modeling', duration: '25 min', file: 'lesson-2-ubiquitous-language.md' },
        { id: 'lesson-3', title: 'Identifying Your Core Domain', duration: '22 min', file: 'lesson-3-core-domain.md' },
        { id: 'lesson-4', title: 'Domain Modeling Techniques', duration: '28 min', file: 'lesson-4-domain-modeling-techniques.md' },
      ],
    },
    {
      id: 'module-2',
      title: 'Bounded Contexts & Strategic Design',
      lessons: [
        { id: 'lesson-1', title: 'Understanding Bounded Contexts', duration: '18 min', file: 'lesson-1-bounded-contexts.md' },
        { id: 'lesson-2', title: 'Context Mapping Patterns', duration: '20 min', file: 'lesson-2-context-mapping-patterns.md' },
        { id: 'lesson-3', title: 'Integration Strategies', duration: '18 min', file: 'lesson-3-integration-strategies.md' },
        { id: 'lesson-4', title: 'Anti-Corruption Layers', duration: '17 min', file: 'lesson-4-anti-corruption-layers.md' },
        { id: 'lesson-5', title: 'Strategic Design in Microservices', duration: '17 min', file: 'lesson-5-microservices.md' },
      ],
    },
    {
      id: 'module-3',
      title: 'Aggregates & Tactical Patterns',
      lessons: [
        { id: 'lesson-1', title: 'Entities and Identity', duration: '18 min', file: 'lesson-1-entities-and-identity.md' },
        { id: 'lesson-2', title: 'Value Objects', duration: '18 min', file: 'lesson-2-value-objects.md' },
        { id: 'lesson-3', title: 'Aggregates and Consistency Boundaries', duration: '20 min', file: 'lesson-3-aggregates-consistency-boundaries.md' },
        { id: 'lesson-4', title: 'Domain Services and Factories', duration: '17 min', file: 'lesson-4-domain-services-factories.md' },
        { id: 'lesson-5', title: 'Repositories and Persistence', duration: '17 min', file: 'lesson-5-repositories-persistence.md' },
      ],
    },
    {
      id: 'module-4',
      title: 'Introduction to CQRS',
      lessons: [
        { id: 'lesson-1', title: 'The Problem CQRS Solves', duration: '20 min', file: 'lesson-1-the-problem-cqrs-solves.md' },
        { id: 'lesson-2', title: 'Separating Reads and Writes', duration: '22 min', file: 'lesson-2-separating-reads-and-writes.md' },
        { id: 'lesson-3', title: 'Command and Query Handlers', duration: '23 min', file: 'lesson-3-command-and-query-handlers.md' },
        { id: 'lesson-4', title: 'Read Models and Projections', duration: '20 min', file: 'lesson-4-read-models-projections.md' },
      ],
    },
    {
      id: 'module-5',
      title: 'Event Sourcing Fundamentals',
      lessons: [
        { id: 'lesson-1', title: 'Event Sourcing Concepts', duration: '20 min', file: 'lesson-1-event-sourcing-concepts.md' },
        { id: 'lesson-2', title: 'Event Store Implementation', duration: '20 min', file: 'lesson-2-event-store-implementation.md' },
        { id: 'lesson-3', title: 'Projections and Read Models', duration: '20 min', file: 'lesson-3-projections-read-models.md' },
      ],
    },
    {
      id: 'module-6',
      title: 'AI-Assisted Implementation',
      lessons: [
        { id: 'lesson-1', title: 'AI for Boilerplate and Pattern Implementation', duration: '30 min', file: 'lesson-1-ai-boilerplate-patterns.md' },
        { id: 'lesson-2', title: 'AI-Assisted Testing and Validation', duration: '30 min', file: 'lesson-2-ai-testing-validation.md' },
        { id: 'lesson-3', title: 'Building Production-Ready Systems with AI', duration: '30 min', file: 'lesson-3-production-ready-systems.md' },
      ],
    },
  ],
};

async function getLessonContent(courseId: string, moduleId: string, fileName: string) {
  try {
    const contentPath = path.join(process.cwd(), 'course-content', courseId, moduleId, fileName);
    const fileContent = await fs.readFile(contentPath, 'utf8');

    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(fileContent);

    return processedContent.toString();
  } catch (error) {
    console.error('Error reading lesson content:', error);
    return null;
  }
}

function getNavigationInfo(courseId: string, moduleId: string, lessonId: string) {
  const modules = courseModules[courseId as keyof typeof courseModules];
  if (!modules) return null;

  const moduleIndex = modules.findIndex(m => m.id === moduleId);
  const currentModule = modules[moduleIndex];
  if (!currentModule) return null;

  const lessonIndex = currentModule.lessons.findIndex((l: { id: string }) => l.id === lessonId);
  const lesson = currentModule.lessons[lessonIndex];
  if (!lesson) return null;

  // Find previous lesson
  let prevLesson = null;
  if (lessonIndex > 0) {
    prevLesson = {
      moduleId,
      lessonId: currentModule.lessons[lessonIndex - 1].id,
      title: currentModule.lessons[lessonIndex - 1].title,
    };
  } else if (moduleIndex > 0) {
    const prevModule = modules[moduleIndex - 1];
    const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
    prevLesson = {
      moduleId: prevModule.id,
      lessonId: lastLesson.id,
      title: lastLesson.title,
    };
  }

  // Find next lesson
  let nextLesson = null;
  if (lessonIndex < currentModule.lessons.length - 1) {
    nextLesson = {
      moduleId,
      lessonId: currentModule.lessons[lessonIndex + 1].id,
      title: currentModule.lessons[lessonIndex + 1].title,
    };
  } else if (moduleIndex < modules.length - 1) {
    const nextModule = modules[moduleIndex + 1];
    const firstLesson = nextModule.lessons[0];
    nextLesson = {
      moduleId: nextModule.id,
      lessonId: firstLesson.id,
      title: firstLesson.title,
    };
  }

  return {
    module: currentModule,
    lesson,
    prevLesson,
    nextLesson,
    progress: {
      current: modules.slice(0, moduleIndex).reduce((sum, m) => sum + m.lessons.length, 0) + lessonIndex + 1,
      total: modules.reduce((sum, m) => sum + m.lessons.length, 0),
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, moduleId, lessonId } = await params;
  const navInfo = getNavigationInfo(id, moduleId, lessonId);

  if (!navInfo) {
    return {
      title: 'Lesson Not Found',
    };
  }

  return {
    title: `${navInfo.lesson.title} - ${navInfo.module.title} - DevMultiplier Academy`,
    description: `Learn ${navInfo.lesson.title} in the ${navInfo.module.title} module.`,
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { id, moduleId, lessonId } = await params;

  // Check authentication and authorization
  const session = await auth();

  if (!session?.user?.email) {
    // Not authenticated - redirect to login
    redirect(`/login?callbackUrl=${encodeURIComponent(`/courses/${id}/${moduleId}/${lessonId}`)}`);
  }

  const userEmail = session.user.email;
  const userId = session.user.id;

  // Check if user is explicitly blocked
  if (isBlockedEmail(userEmail)) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white dark:bg-[#161b22] rounded-lg border border-[#d1d9e0] dark:border-[#30363d] p-8">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-[#cf222e] dark:text-[#f85149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-2">
              Access Denied
            </h1>
            <p className="text-[#656d76] dark:text-[#848d97] mb-4">
              You are not allowed to view this lesson.
            </p>
            <p className="text-[#656d76] dark:text-[#848d97]">
              Please contact support at{' '}
              <a
                href="mailto:support@devmultiplier.com"
                className="text-[#0969da] dark:text-[#4493f8] hover:underline"
              >
                support@devmultiplier.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has privileged access
  const isPrivileged = hasPrivilegedAccess(userEmail);

  // If not privileged, check enrollment
  if (!isPrivileged && userId) {
    // Get course ID first (could be UUID or slug)
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

  const navInfo = getNavigationInfo(id, moduleId, lessonId);

  if (!navInfo) {
    notFound();
  }

  const content = await getLessonContent(id, moduleId, navInfo.lesson.file);

  if (!content) {
    notFound();
  }

  const { module, lesson, prevLesson, nextLesson, progress } = navInfo;

  return (
    <ContentProtection userEmail={userEmail} enabled={true}>
      <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
        {/* Header - GitHub style */}
        <div className="bg-white dark:bg-[#161b22] border-b border-[#d1d9e0] dark:border-[#30363d] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/courses/${id}`}
                  className="flex items-center gap-2 text-[#656d76] dark:text-[#848d97] hover:text-[#0969da] dark:hover:text-[#4493f8] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Course</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 text-sm text-[#656d76] dark:text-[#848d97]">
                  <span>{module.title}</span>
                  <span>•</span>
                  <span>Lesson {progress.current} of {progress.total}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#656d76] dark:text-[#848d97]">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}</span>
                </div>
                <LessonProgress
                  courseSlug={id}
                  moduleId={moduleId}
                  lessonId={lessonId}
                  totalLessons={progress.total}
                  currentLessonNumber={progress.current}
                />
              </div>
            </div>

            {/* Progress bar - GitHub style */}
            <div className="mt-4">
              <div className="w-full bg-[#d1d9e0] dark:bg-[#30363d] rounded-full h-2">
                <div
                  className="bg-[#1f883d] dark:bg-[#3fb950] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d1d9e0] dark:border-[#30363d] p-8">
            {/* Module badge - GitHub style */}
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-[#ddf4ff] dark:bg-[#388bfd26] text-[#0969da] dark:text-[#4493f8] border border-[#54aeff66] dark:border-[#4493f866]">
                {module.title}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-[#ddf4ff] dark:bg-[#388bfd26] text-[#0969da] dark:text-[#4493f8] border border-[#54aeff66] dark:border-[#4493f866]">
                Module {moduleId.replace('module-', '')} - Lesson {lessonId.replace('lesson-', '')}
              </span>
            </div>

            {/* Lesson content */}
            <article
              className="lesson-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Navigation - GitHub style */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${id}/${prevLesson.moduleId}/${prevLesson.lessonId}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d1d9e0] dark:border-[#30363d] rounded-md hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#656d76] dark:text-[#848d97]" />
                <div className="text-left">
                  <div className="text-xs text-[#656d76] dark:text-[#848d97]">Previous</div>
                  <div className="font-medium text-[#1f2328] dark:text-[#e6edf3] text-sm">{prevLesson.title}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${id}/${nextLesson.moduleId}/${nextLesson.lessonId}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f883d] dark:bg-[#238636] text-white rounded-md hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] transition-colors ml-auto"
              >
                <div className="text-right">
                  <div className="text-xs opacity-80">Next</div>
                  <div className="font-medium text-sm">{nextLesson.title}</div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href={`/courses/${id}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f883d] dark:bg-[#238636] text-white rounded-md hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] transition-colors ml-auto"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">Course Complete!</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ContentProtection>
  );
}
