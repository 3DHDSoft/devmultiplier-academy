'use client';

import { cn } from '@/lib/utils';
import type { QuestionMultipleChoiceProps } from '@/lib/quiz/types';

export function QuestionMultipleChoice({ question, selectedAnswer, onSelect, showResult, result }: QuestionMultipleChoiceProps) {
  return (
    <div className="space-y-4">
      {/* Question text */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options?.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = showResult && result?.correctAnswer === option.id;
          const isWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !showResult && onSelect(option.id)}
              disabled={showResult}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                !showResult && 'hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20',
                !showResult && isSelected && 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30',
                !showResult && !isSelected && 'border-gray-200 dark:border-gray-700',
                showResult && isCorrect && 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/30',
                showResult && isWrong && 'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/30',
                showResult && !isCorrect && !isWrong && 'border-gray-200 opacity-60 dark:border-gray-700',
                showResult && 'cursor-default'
              )}
            >
              {/* Option letter */}
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
                  !showResult && isSelected && 'border-blue-500 bg-blue-500 text-white',
                  !showResult && !isSelected && 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400',
                  showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
                  showResult && isWrong && 'border-red-500 bg-red-500 text-white',
                  showResult && !isCorrect && !isWrong && 'border-gray-300 text-gray-400'
                )}
              >
                {option.id.toUpperCase()}
              </span>

              {/* Option text */}
              <span className={cn('pt-0.5 text-gray-700 dark:text-gray-300', showResult && isCorrect && 'font-medium text-green-700 dark:text-green-400', showResult && isWrong && 'text-red-700 dark:text-red-400')}>{option.text}</span>

              {/* Result indicator */}
              {showResult && isCorrect && (
                <span className="ml-auto text-green-600 dark:text-green-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {showResult && isWrong && (
                <span className="ml-auto text-red-600 dark:text-red-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submission) */}
      {showResult && result?.explanation && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Explanation</p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
