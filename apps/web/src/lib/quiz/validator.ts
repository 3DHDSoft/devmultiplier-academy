/**
 * Quiz Validator
 *
 * Server-side validation and grading of quiz submissions.
 */

import type { Quiz, QuizAnswer, QuestionResult, StoredAnswer, QuizSubmitResponse } from './types';

export interface GradeQuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  results: QuestionResult[];
  storedAnswers: StoredAnswer[];
}

/**
 * Grade a quiz submission.
 *
 * @param quiz - Full quiz data with correct answers
 * @param answers - User's submitted answers
 * @returns Grading results
 */
export function gradeQuiz(quiz: Quiz, answers: QuizAnswer[]): GradeQuizResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));
  const results: QuestionResult[] = [];
  const storedAnswers: StoredAnswer[] = [];
  let correctCount = 0;

  for (const question of quiz.questions) {
    const selectedAnswer = answerMap.get(question.id);
    const isCorrect = selectedAnswer !== undefined && isAnswerCorrect(question.correctAnswer, selectedAnswer);

    if (isCorrect) {
      correctCount++;
    }

    results.push({
      questionId: question.id,
      question: question.question,
      type: question.type,
      selectedAnswer: selectedAnswer ?? (question.type === 'true-false' ? false : ''),
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      options: question.options,
    });

    storedAnswers.push({
      questionId: question.id,
      selectedAnswer: selectedAnswer ?? (question.type === 'true-false' ? false : ''),
      isCorrect,
    });
  }

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= quiz.passingScore;

  return {
    score,
    passed,
    correctAnswers: correctCount,
    totalQuestions,
    results,
    storedAnswers,
  };
}

/**
 * Check if an answer is correct.
 *
 * @param correctAnswer - The correct answer (string for MC, boolean for T/F)
 * @param selectedAnswer - User's selected answer
 * @returns true if answer is correct
 */
function isAnswerCorrect(correctAnswer: string | boolean, selectedAnswer: string | boolean): boolean {
  // Handle boolean comparison for true/false questions
  if (typeof correctAnswer === 'boolean') {
    return correctAnswer === selectedAnswer;
  }

  // Handle string comparison for multiple choice
  return correctAnswer === selectedAnswer;
}

/**
 * Validate quiz answers before grading.
 *
 * @param quiz - Quiz data
 * @param answers - Submitted answers
 * @returns Validation result with errors if any
 */
export function validateAnswers(quiz: Quiz, answers: QuizAnswer[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const questionIds = new Set(quiz.questions.map((q) => q.id));

  // Check for invalid question IDs
  for (const answer of answers) {
    if (!questionIds.has(answer.questionId)) {
      errors.push(`Unknown question ID: ${answer.questionId}`);
    }
  }

  // Check answer types match question types
  for (const answer of answers) {
    const question = quiz.questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    if (question.type === 'true-false' && typeof answer.selectedAnswer !== 'boolean') {
      errors.push(`Question ${answer.questionId} requires a boolean answer`);
    }

    if (question.type === 'multiple-choice' && typeof answer.selectedAnswer !== 'string') {
      errors.push(`Question ${answer.questionId} requires a string answer`);
    }

    // Validate multiple choice answer is a valid option
    if (question.type === 'multiple-choice' && question.options) {
      const validOptionIds = question.options.map((o) => o.id);
      if (typeof answer.selectedAnswer === 'string' && !validOptionIds.includes(answer.selectedAnswer)) {
        errors.push(`Invalid option for question ${answer.questionId}: ${answer.selectedAnswer}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a QuizSubmitResponse from grading results.
 *
 * @param attemptId - Database ID of the quiz attempt
 * @param gradeResult - Grading results
 * @param previousBestScore - User's previous best score (or null)
 * @returns Response object for API
 */
export function createSubmitResponse(attemptId: string, gradeResult: GradeQuizResult, previousBestScore: number | null): QuizSubmitResponse {
  const isNewBestScore = previousBestScore === null || gradeResult.score > previousBestScore;

  return {
    attemptId,
    score: gradeResult.score,
    passed: gradeResult.passed,
    correctAnswers: gradeResult.correctAnswers,
    totalQuestions: gradeResult.totalQuestions,
    results: gradeResult.results,
    isNewBestScore,
    previousBestScore,
  };
}
