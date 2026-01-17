'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { QuestionMultipleChoice } from './question-multiple-choice';
import { QuestionTrueFalse } from './question-true-false';
import type { QuizResultsProps, QuizQuestionPublic } from '@/lib/quiz/types';

export function QuizResults({ score, passed, passingScore, correctAnswers, totalQuestions, results, isNewBestScore, onRetake, onClose }: QuizResultsProps) {
  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="text-center">
        {/* Score circle */}
        <div className={cn('mx-auto flex h-32 w-32 items-center justify-center rounded-full', passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
          <span className={cn('text-4xl font-bold', passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>{score}%</span>
        </div>

        {/* Pass/Fail indicator */}
        <div className="mt-4">
          <span className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium', passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300')}>
            {passed ? (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Passed!
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Keep Learning
              </>
            )}
          </span>
        </div>

        {/* New best score badge */}
        {isNewBestScore && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              New Best Score!
            </span>
          </div>
        )}

        {/* Stats */}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          You got {correctAnswers} out of {totalQuestions} questions correct.
          <br />
          Passing score: {passingScore}%
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onRetake}>
          Retake Quiz
        </Button>
      </div>

      {/* Question review */}
      <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">Review Your Answers</h3>
        <div className="space-y-8">
          {results.map((result, index) => {
            const questionPublic: QuizQuestionPublic = {
              id: result.questionId,
              type: result.type,
              question: result.question,
              options: result.options,
            };

            return (
              <div key={result.questionId} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Question {index + 1}</div>
                {result.type === 'multiple-choice' ? <QuestionMultipleChoice question={questionPublic} selectedAnswer={result.selectedAnswer as string} onSelect={() => {}} showResult={true} result={result} /> : <QuestionTrueFalse question={questionPublic} selectedAnswer={result.selectedAnswer as boolean} onSelect={() => {}} showResult={true} result={result} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
