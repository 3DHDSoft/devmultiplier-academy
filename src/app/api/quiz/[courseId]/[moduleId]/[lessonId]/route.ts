/**
 * Quiz Metadata API
 *
 * GET /api/quiz/[courseId]/[moduleId]/[lessonId]
 * Returns quiz metadata and user's best score if available.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withErrorHandling, type RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError } from '@/lib/errors';
import { loadQuiz } from '@/lib/quiz/loader';
import type { QuizMetadata } from '@/lib/quiz/types';

export const GET = withErrorHandling(
  async (_request: NextRequest, context?: RouteContext) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const params = await context!.params;
    const { courseId, moduleId, lessonId } = params;

    // Load quiz from JSON file
    const quiz = await loadQuiz(courseId, moduleId, lessonId);
    if (!quiz) {
      throw new NotFoundError('Quiz', `${courseId}/${moduleId}/${lessonId}`);
    }

    // Get user's best score if available
    const bestScore = await prisma.quiz_best_scores.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quiz.id,
        },
      },
    });

    const metadata: QuizMetadata = {
      id: quiz.id,
      lessonId: quiz.lessonId,
      moduleId: quiz.moduleId,
      title: quiz.title,
      questionCount: quiz.questions.length,
      passingScore: quiz.passingScore,
      bestScore: bestScore?.bestScore ?? null,
      passed: bestScore?.passed ?? false,
      attemptCount: bestScore?.totalAttempts ?? 0,
    };

    return NextResponse.json({ data: metadata });
  },
  { route: '/api/quiz/[courseId]/[moduleId]/[lessonId]' }
);
