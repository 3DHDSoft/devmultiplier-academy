import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import './lesson.css';

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
  const module = modules[moduleIndex];
  if (!module) return null;

  const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
  const lesson = module.lessons[lessonIndex];
  if (!lesson) return null;

  // Find previous lesson
  let prevLesson = null;
  if (lessonIndex > 0) {
    prevLesson = {
      moduleId,
      lessonId: module.lessons[lessonIndex - 1].id,
      title: module.lessons[lessonIndex - 1].title,
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
  if (lessonIndex < module.lessons.length - 1) {
    nextLesson = {
      moduleId,
      lessonId: module.lessons[lessonIndex + 1].id,
      title: module.lessons[lessonIndex + 1].title,
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
    module,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/courses/${id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Course</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <span>{module.title}</span>
                <span>•</span>
                <span>Lesson {progress.current} of {progress.total}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Complete</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Module badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {module.title}
            </span>
          </div>

          {/* Lesson content */}
          <article
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link
              href={`/courses/${id}/${prevLesson.moduleId}/${prevLesson.lessonId}`}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="font-medium">{prevLesson.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${id}/${nextLesson.moduleId}/${nextLesson.lessonId}`}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
            >
              <div className="text-right">
                <div className="text-xs text-blue-100">Next</div>
                <div className="font-medium">{nextLesson.title}</div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href={`/courses/${id}`}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Course Complete!</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
