'use client';

import { cn } from '@/lib/utils';
import type { QuizProgressProps } from '@/lib/quiz/types';

export function QuizProgress({ currentQuestion, totalQuestions, answeredQuestions }: QuizProgressProps) {
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      {/* Question counter */}
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-gray-600 dark:text-gray-400">{answeredQuestions.size} answered</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Question dots */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionId = `q${i + 1}`;
          const isAnswered = answeredQuestions.has(questionId);
          const isCurrent = i === currentQuestion;

          return <div key={i} className={cn('h-2.5 w-2.5 rounded-full transition-all', isCurrent && 'ring-2 ring-blue-400 ring-offset-1', isAnswered ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600')} title={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}`} />;
        })}
      </div>
    </div>
  );
}
