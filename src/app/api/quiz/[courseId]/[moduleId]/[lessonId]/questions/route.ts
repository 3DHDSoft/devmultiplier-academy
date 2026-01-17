/**
 * Quiz Questions API
 *
 * GET /api/quiz/[courseId]/[moduleId]/[lessonId]/questions
 * Returns quiz questions without correct answers (for taking the quiz).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { withErrorHandling, type RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError } from '@/lib/errors';
import { loadQuiz, getPublicQuestions } from '@/lib/quiz/loader';
import type { QuizQuestionsResponse } from '@/lib/quiz/types';

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

    // Return questions without correct answers
    const response: QuizQuestionsResponse = {
      quizId: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: getPublicQuestions(quiz),
    };

    return NextResponse.json({ data: response });
  },
  { route: '/api/quiz/[courseId]/[moduleId]/[lessonId]/questions' }
);
