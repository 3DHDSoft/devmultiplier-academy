import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import './lesson.css';
import { LessonProgress } from '@/components/ui/lesson-progress';
import { ContentProtection } from '@/components/ui/content-protection';
import { CodeBlockWrapper } from '@/components/ui/code-block-wrapper';
import { MermaidRenderer } from '@/components/ui/mermaid-renderer';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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
        {
          id: 'lesson-0',
          title: 'The GenAI Landscape for Software Development',
          duration: '25 min',
          file: 'lesson-0-genai-landscape.md',
        },
        { id: 'lesson-1', title: 'What is Domain-Driven Design?', duration: '20 min', file: 'lesson-1-what-is-ddd.md' },
        {
          id: 'lesson-2',
          title: 'Ubiquitous Language & Domain Modeling',
          duration: '25 min',
          file: 'lesson-2-ubiquitous-language.md',
        },
        { id: 'lesson-3', title: 'Identifying Your Core Domain', duration: '22 min', file: 'lesson-3-core-domain.md' },
        {
          id: 'lesson-4',
          title: 'Domain Modeling Techniques',
          duration: '28 min',
          file: 'lesson-4-domain-modeling-techniques.md',
        },
      ],
    },
    {
      id: 'module-2',
      title: 'Bounded Contexts & Strategic Design',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Understanding Bounded Contexts',
          duration: '18 min',
          file: 'lesson-1-bounded-contexts.md',
        },
        {
          id: 'lesson-2',
          title: 'Context Mapping Patterns',
          duration: '20 min',
          file: 'lesson-2-context-mapping-patterns.md',
        },
        {
          id: 'lesson-3',
          title: 'Integration Strategies',
          duration: '18 min',
          file: 'lesson-3-integration-strategies.md',
        },
        {
          id: 'lesson-4',
          title: 'Anti-Corruption Layers',
          duration: '17 min',
          file: 'lesson-4-anti-corruption-layers.md',
        },
        {
          id: 'lesson-5',
          title: 'Strategic Design in Microservices',
          duration: '17 min',
          file: 'lesson-5-microservices.md',
        },
      ],
    },
    {
      id: 'module-3',
      title: 'Aggregates & Tactical Patterns',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Entities and Identity',
          duration: '18 min',
          file: 'lesson-1-entities-and-identity.md',
        },
        { id: 'lesson-2', title: 'Value Objects', duration: '18 min', file: 'lesson-2-value-objects.md' },
        {
          id: 'lesson-3',
          title: 'Aggregates and Consistency Boundaries',
          duration: '20 min',
          file: 'lesson-3-aggregates-consistency-boundaries.md',
        },
        {
          id: 'lesson-4',
          title: 'Domain Services and Factories',
          duration: '17 min',
          file: 'lesson-4-domain-services-factories.md',
        },
        {
          id: 'lesson-5',
          title: 'Repositories and Persistence',
          duration: '17 min',
          file: 'lesson-5-repositories-persistence.md',
        },
      ],
    },
    {
      id: 'module-4',
      title: 'Introduction to CQRS',
      lessons: [
        {
          id: 'lesson-1',
          title: 'The Problem CQRS Solves',
          duration: '20 min',
          file: 'lesson-1-the-problem-cqrs-solves.md',
        },
        {
          id: 'lesson-2',
          title: 'Separating Reads and Writes',
          duration: '22 min',
          file: 'lesson-2-separating-reads-and-writes.md',
        },
        {
          id: 'lesson-3',
          title: 'Command and Query Handlers',
          duration: '23 min',
          file: 'lesson-3-command-and-query-handlers.md',
        },
        {
          id: 'lesson-4',
          title: 'Read Models and Projections',
          duration: '20 min',
          file: 'lesson-4-read-models-projections.md',
        },
      ],
    },
    {
      id: 'module-5',
      title: 'Event Sourcing Fundamentals',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Event Sourcing Concepts',
          duration: '20 min',
          file: 'lesson-1-event-sourcing-concepts.md',
        },
        {
          id: 'lesson-2',
          title: 'Event Store Implementation',
          duration: '20 min',
          file: 'lesson-2-event-store-implementation.md',
        },
        {
          id: 'lesson-3',
          title: 'Projections and Read Models',
          duration: '20 min',
          file: 'lesson-3-projections-read-models.md',
        },
      ],
    },
    {
      id: 'module-6',
      title: 'AI-Assisted Implementation',
      lessons: [
        {
          id: 'lesson-1',
          title: 'AI for Boilerplate and Pattern Implementation',
          duration: '30 min',
          file: 'lesson-1-ai-boilerplate-patterns.md',
        },
        {
          id: 'lesson-2',
          title: 'AI-Assisted Testing and Validation',
          duration: '30 min',
          file: 'lesson-2-ai-testing-validation.md',
        },
        {
          id: 'lesson-3',
          title: 'Building Production-Ready Systems with AI',
          duration: '30 min',
          file: 'lesson-3-production-ready-systems.md',
        },
      ],
    },
  ],
};

async function getLessonContent(courseId: string, moduleId: string, fileName: string) {
  try {
    const contentPath = path.join(process.cwd(), 'course-content', courseId, moduleId, fileName);
    const fileContent = await fs.readFile(contentPath, 'utf8');

    // Store mermaid blocks to restore after rehype-pretty-code processing
    const mermaidBlocks: Map<string, string> = new Map();
    let mermaidCounter = 0;

    // Custom rehype plugin to extract mermaid blocks before syntax highlighting
    function rehypeExtractMermaid() {
      return (tree: Root) => {
        visit(tree, 'element', (node: Element, index, parent) => {
          // Find pre > code elements with mermaid language
          if (
            node.tagName === 'pre' &&
            node.children.length === 1 &&
            (node.children[0] as Element).tagName === 'code'
          ) {
            const codeElement = node.children[0] as Element;
            const className = codeElement.properties?.className as string[] | undefined;

            if (className?.some((c) => c === 'language-mermaid')) {
              // Get the mermaid code content
              const textNode = codeElement.children[0];
              const mermaidCode = textNode && 'value' in textNode ? (textNode as { value: string }).value : '';

              // Generate a placeholder ID
              const placeholderId = `__MERMAID_PLACEHOLDER_${mermaidCounter++}__`;
              mermaidBlocks.set(placeholderId, mermaidCode);

              // Replace with a div placeholder that won't be processed
              // Use camelCase property name as that's what hast uses internally
              if (parent && typeof index === 'number') {
                (parent.children as Element[])[index] = {
                  type: 'element',
                  tagName: 'div',
                  properties: { dataMermaidPlaceholder: placeholderId },
                  children: [],
                };
              }
            }
          }
        });
      };
    }

    // Custom rehype plugin to restore mermaid blocks after syntax highlighting
    function rehypeRestoreMermaid() {
      return (tree: Root) => {
        let restoredCount = 0;
        visit(tree, 'element', (node: Element, index, parent) => {
          if (node.tagName === 'div' && node.properties?.['dataMermaidPlaceholder']) {
            const placeholderId = node.properties['dataMermaidPlaceholder'] as string;
            const mermaidCode = mermaidBlocks.get(placeholderId);

            if (mermaidCode && parent && typeof index === 'number') {
              restoredCount++;
              // Restore the mermaid code block with proper structure for MermaidRenderer
              (parent.children as Element[])[index] = {
                type: 'element',
                tagName: 'pre',
                properties: { 'data-language': 'mermaid' },
                children: [
                  {
                    type: 'element',
                    tagName: 'code',
                    properties: { className: ['language-mermaid'] },
                    children: [{ type: 'text', value: mermaidCode }],
                  },
                ],
              } as Element;
            }
          }
        });
        console.log(`[Mermaid] Restored ${restoredCount} mermaid blocks out of ${mermaidBlocks.size} extracted`);
      };
    }

    // Convert markdown to HTML with syntax highlighting
    // Mermaid diagrams are rendered client-side via MermaidRenderer component
    // Use dual themes for light/dark mode support
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm) // Enable GitHub Flavored Markdown (tables, strikethrough, etc.)
      .use(remarkRehype)
      .use(rehypeExtractMermaid) // Extract mermaid blocks before syntax highlighting
      .use(rehypePrettyCode, {
        theme: {
          dark: 'github-dark',
          light: 'github-light',
        },
        keepBackground: false, // We'll handle background in CSS
        defaultLang: 'typescript',
      })
      .use(rehypeRestoreMermaid) // Restore mermaid blocks after syntax highlighting
      .use(rehypeStringify)
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

  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-lg border border-[#d1d9e0] bg-white p-8 dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-[#cf222e] dark:text-[#f85149]"
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
            <p className="mb-4 text-[#656d76] dark:text-[#848d97]">You are not allowed to view this lesson.</p>
            <p className="text-[#656d76] dark:text-[#848d97]">
              Please contact support at{' '}
              <a
                href="mailto:support@devmultiplier.com"
                className="text-[#0969da] hover:underline dark:text-[#4493f8]"
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
    <ContentProtection
      userEmail={userEmail}
      enabled={true}
    >
      <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
        {/* Header - GitHub style */}
        <div className="sticky top-0 z-10 border-b border-[#d1d9e0] bg-white dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/courses/${id}`}
                  className="flex items-center gap-2 text-[#656d76] transition-colors hover:text-[#0969da] dark:text-[#848d97] dark:hover:text-[#4493f8]"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Course</span>
                </Link>
                <div className="hidden items-center gap-2 text-sm text-[#656d76] md:flex dark:text-[#848d97]">
                  <span>{module.title}</span>
                  <span>•</span>
                  <span>
                    Lesson {progress.current} of {progress.total}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#656d76] dark:text-[#848d97]">
                  <Clock className="h-4 w-4" />
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
              <div className="h-2 w-full rounded-full bg-[#d1d9e0] dark:bg-[#30363d]">
                <div
                  className="h-2 rounded-full bg-[#1f883d] transition-all duration-300 dark:bg-[#3fb950]"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md border border-[#d1d9e0] bg-white p-8 dark:border-[#30363d] dark:bg-[#161b22]">
            {/* Module badge - GitHub style */}
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[#54aeff66] bg-[#ddf4ff] px-4 py-2 text-base font-medium text-[#0969da] dark:border-[#4493f866] dark:bg-[#388bfd26] dark:text-[#4493f8]">
                {module.title}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#54aeff66] bg-[#ddf4ff] px-4 py-2 text-base font-medium text-[#0969da] dark:border-[#4493f866] dark:bg-[#388bfd26] dark:text-[#4493f8]">
                Module {moduleId.replace('module-', '')} - Lesson {lessonId.replace('lesson-', '')}
              </span>
            </div>

            {/* Lesson content */}
            <MermaidRenderer>
              <CodeBlockWrapper>
                <article
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CodeBlockWrapper>
            </MermaidRenderer>
          </div>

          {/* Navigation - GitHub style */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${id}/${prevLesson.moduleId}/${prevLesson.lessonId}`}
                className="flex items-center gap-2 rounded-md border border-[#d1d9e0] bg-[#f6f8fa] px-4 py-2 transition-colors hover:bg-[#f3f4f6] dark:border-[#30363d] dark:bg-[#21262d] dark:hover:bg-[#30363d]"
              >
                <ChevronLeft className="h-5 w-5 text-[#656d76] dark:text-[#848d97]" />
                <div className="text-left">
                  <div className="text-xs text-[#656d76] dark:text-[#848d97]">Previous</div>
                  <div className="text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">{prevLesson.title}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${id}/${nextLesson.moduleId}/${nextLesson.lessonId}`}
                className="ml-auto flex items-center gap-2 rounded-md bg-[#1f883d] px-4 py-2 text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
              >
                <div className="text-right">
                  <div className="text-xs opacity-80">Next</div>
                  <div className="text-sm font-medium">{nextLesson.title}</div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href={`/courses/${id}`}
                className="ml-auto flex items-center gap-2 rounded-md bg-[#1f883d] px-4 py-2 text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Course Complete!</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ContentProtection>
  );
}
