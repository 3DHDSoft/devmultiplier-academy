/**
 * Quiz Loader
 *
 * Loads quiz content from JSON files in the courses directory.
 * Supports locale fallback for i18n.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Quiz, QuizQuestionPublic } from './types';

// Course content is in monorepo at /courses/{courseId}/content/{moduleId}/
const COURSES_DIR = path.join(process.cwd(), '..', '..', 'courses');

/**
 * Load a quiz from JSON file.
 * Tries locale-specific file first, then falls back to default.
 *
 * @param courseId - Course identifier (e.g., "ddd-to-cqrs")
 * @param moduleId - Module identifier (e.g., "module-1")
 * @param lessonId - Lesson identifier (e.g., "lesson-1")
 * @param locale - Optional locale for i18n (e.g., "es", "fr")
 * @returns Quiz data or null if not found
 */
export async function loadQuiz(courseId: string, moduleId: string, lessonId: string, locale?: string): Promise<Quiz | null> {
  const baseDir = path.join(COURSES_DIR, courseId, 'content', moduleId);

  // Try locale-specific file first if locale is provided and not 'en'
  if (locale && locale !== 'en') {
    const localePath = path.join(baseDir, `quiz-${lessonId}.${locale}.json`);
    const localeQuiz = await tryLoadQuizFile(localePath);
    if (localeQuiz) {
      return localeQuiz;
    }
  }

  // Fall back to default (English) file
  const defaultPath = path.join(baseDir, `quiz-${lessonId}.json`);
  return tryLoadQuizFile(defaultPath);
}

/**
 * Check if a quiz exists for a lesson.
 *
 * @param courseId - Course identifier
 * @param moduleId - Module identifier
 * @param lessonId - Lesson identifier
 * @returns true if quiz file exists
 */
export async function quizExists(courseId: string, moduleId: string, lessonId: string): Promise<boolean> {
  const quizPath = path.join(COURSES_DIR, courseId, 'content', moduleId, `quiz-${lessonId}.json`);

  try {
    await fs.access(quizPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get public quiz questions (without correct answers).
 *
 * @param quiz - Full quiz data
 * @returns Quiz questions safe for client
 */
export function getPublicQuestions(quiz: Quiz): QuizQuestionPublic[] {
  return quiz.questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.options,
  }));
}

/**
 * Try to load and parse a quiz JSON file.
 *
 * @param filePath - Absolute path to quiz JSON file
 * @returns Parsed quiz or null if file doesn't exist
 */
async function tryLoadQuizFile(filePath: string): Promise<Quiz | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const quiz = JSON.parse(content) as Quiz;

    // Basic validation
    if (!quiz.id || !quiz.questions || !Array.isArray(quiz.questions)) {
      console.error(`Invalid quiz file format: ${filePath}`);
      return null;
    }

    return quiz;
  } catch (error) {
    // File doesn't exist or couldn't be parsed
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Error loading quiz file ${filePath}:`, error);
    }
    return null;
  }
}

/**
 * List all quizzes for a course.
 *
 * @param courseId - Course identifier
 * @returns Array of quiz metadata
 */
export async function listCourseQuizzes(courseId: string): Promise<{ moduleId: string; lessonId: string; quizId: string }[]> {
  const courseDir = path.join(COURSES_DIR, courseId, 'content');
  const quizzes: { moduleId: string; lessonId: string; quizId: string }[] = [];

  try {
    const modules = await fs.readdir(courseDir);

    for (const moduleId of modules) {
      const moduleDir = path.join(courseDir, moduleId);
      const stat = await fs.stat(moduleDir);

      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(moduleDir);
      const quizFiles = files.filter((f) => f.startsWith('quiz-') && f.endsWith('.json') && !f.includes('.'));

      for (const quizFile of quizFiles) {
        // Extract lessonId from filename: quiz-lesson-1.json -> lesson-1
        const lessonId = quizFile.replace('quiz-', '').replace('.json', '');
        quizzes.push({
          moduleId,
          lessonId,
          quizId: `quiz-${moduleId}-${lessonId}`,
        });
      }
    }
  } catch {
    // Course directory doesn't exist
  }

  return quizzes;
}
