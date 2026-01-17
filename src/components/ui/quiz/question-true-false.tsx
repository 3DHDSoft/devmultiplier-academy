'use client';

import { cn } from '@/lib/utils';
import type { QuestionTrueFalseProps } from '@/lib/quiz/types';

export function QuestionTrueFalse({ question, selectedAnswer, onSelect, showResult, result }: QuestionTrueFalseProps) {
  const options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ];

  return (
    <div className="space-y-4">
      {/* Question text */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{question.question}</h3>

      {/* True/False options */}
      <div className="flex gap-4">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.value;
          const isCorrect = showResult && result?.correctAnswer === option.value;
          const isWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => !showResult && onSelect(option.value)}
              disabled={showResult}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-4 text-lg font-medium transition-all',
                !showResult && 'hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20',
                !showResult && isSelected && 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
                !showResult && !isSelected && 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300',
                showResult && isCorrect && 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300',
                showResult && isWrong && 'border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300',
                showResult && !isCorrect && !isWrong && 'border-gray-200 text-gray-400 opacity-60 dark:border-gray-700',
                showResult && 'cursor-default'
              )}
            >
              {/* Icon */}
              {option.value ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}

              {option.label}

              {/* Result indicator */}
              {showResult && isCorrect && (
                <span className="text-green-600 dark:text-green-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {showResult && isWrong && (
                <span className="text-red-600 dark:text-red-400">
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
