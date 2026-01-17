/**
 * Quiz Submit API
 *
 * POST /api/quiz/[courseId]/[moduleId]/[lessonId]/submit
 * Submits quiz answers, grades them, and stores the attempt.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { withErrorHandling, type RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { loadQuiz } from '@/lib/quiz/loader';
import { gradeQuiz, validateAnswers, createSubmitResponse } from '@/lib/quiz/validator';
import type { QuizAnswer } from '@/lib/quiz/types';

// Zod schema for request validation
const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedAnswer: z.union([z.string(), z.boolean()]),
    })
  ),
  timeTakenMs: z.number().int().min(0),
});

export const POST = withErrorHandling(
  async (request: NextRequest, context?: RouteContext) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const params = await context!.params;
    const { courseId, moduleId, lessonId } = params;

    // Parse and validate request body
    const body = await request.json();
    const { answers, timeTakenMs } = submitSchema.parse(body);

    // Load quiz from JSON file
    const quiz = await loadQuiz(courseId, moduleId, lessonId);
    if (!quiz) {
      throw new NotFoundError('Quiz', `${courseId}/${moduleId}/${lessonId}`);
    }

    // Get course for database relation
    const course = await prisma.course.findFirst({
      where: { slug: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundError('Course', courseId);
    }

    // Validate answers match quiz questions
    const validation = validateAnswers(quiz, answers as QuizAnswer[]);
    if (!validation.valid) {
      throw new ValidationError('Invalid quiz answers', {
        answers: validation.errors,
      });
    }

    // Grade the quiz
    const gradeResult = gradeQuiz(quiz, answers as QuizAnswer[]);

    // Get previous best score
    const previousBestScore = await prisma.quiz_best_scores.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quiz.id,
        },
      },
    });

    // Calculate attempt number
    const attemptNumber = (previousBestScore?.totalAttempts ?? 0) + 1;

    // Store the attempt and update best score in a transaction
    const [attempt] = await prisma.$transaction([
      // Create the quiz attempt
      prisma.quiz_attempts.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          moduleId,
          lessonId,
          quizId: quiz.id,
          score: gradeResult.score,
          totalQuestions: gradeResult.totalQuestions,
          correctAnswers: gradeResult.correctAnswers,
          passed: gradeResult.passed,
          answers: gradeResult.storedAnswers as unknown as Prisma.InputJsonValue,
          timeTakenMs,
          attemptNumber,
        },
      }),

      // Upsert best score
      prisma.quiz_best_scores.upsert({
        where: {
          userId_quizId: {
            userId: session.user.id,
            quizId: quiz.id,
          },
        },
        create: {
          userId: session.user.id,
          quizId: quiz.id,
          bestScore: gradeResult.score,
          totalAttempts: 1,
          passed: gradeResult.passed,
          firstPassedAt: gradeResult.passed ? new Date() : null,
          updatedAt: new Date(),
        },
        update: {
          bestScore: gradeResult.score > (previousBestScore?.bestScore ?? 0) ? gradeResult.score : (previousBestScore?.bestScore ?? gradeResult.score),
          totalAttempts: { increment: 1 },
          passed: gradeResult.passed || previousBestScore?.passed || false,
          firstPassedAt: gradeResult.passed && !previousBestScore?.passed ? new Date() : previousBestScore?.firstPassedAt,
          updatedAt: new Date(),
        },
      }),
    ]);

    // Create response
    const response = createSubmitResponse(attempt.id, gradeResult, previousBestScore?.bestScore ?? null);

    return NextResponse.json({ data: response });
  },
  { route: '/api/quiz/[courseId]/[moduleId]/[lessonId]/submit' }
);
