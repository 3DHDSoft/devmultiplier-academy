'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { QuizContainer } from './quiz-container';
import type { QuizSummaryCardProps, QuizMetadata } from '@/lib/quiz/types';

export function QuizSummaryCard({ courseId, moduleId, lessonId }: QuizSummaryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<QuizMetadata | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz metadata
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(`/api/quiz/${courseId}/${moduleId}/${lessonId}`);

        if (response.status === 404) {
          // No quiz for this lesson
          setMetadata(null);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load quiz');
        }

        const { data } = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetadata();
  }, [courseId, moduleId, lessonId]);

  // Refresh metadata after quiz completion
  const handleQuizComplete = () => {
    // Refetch metadata to get updated scores
    fetch(`/api/quiz/${courseId}/${moduleId}/${lessonId}`)
      .then((res) => res.json())
      .then(({ data }) => setMetadata(data))
      .catch(() => {});
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  // No quiz or error
  if (!metadata || error) {
    return null;
  }

  // Quiz modal/overlay
  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setShowQuiz(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <QuizContainer courseId={courseId} moduleId={moduleId} lessonId={lessonId} onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      </div>
    );
  }

  // Summary card
  const hasTaken = metadata.attemptCount > 0;

  return (
    <div className={cn('rounded-lg border p-6', metadata.passed ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Title */}
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <svg className={cn('h-5 w-5', metadata.passed ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Knowledge Check
          </h3>

          {/* Description */}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {metadata.questionCount} questions • Passing score: {metadata.passingScore}%
          </p>

          {/* Status */}
          {hasTaken && (
            <div className="mt-3 flex items-center gap-4">
              {/* Best score */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Best score:</span>
                <span className={cn('text-sm font-semibold', metadata.passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>{metadata.bestScore}%</span>
              </div>

              {/* Attempts */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">Attempts:</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metadata.attemptCount}</span>
              </div>

              {/* Passed badge */}
              {metadata.passed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Passed
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        <Button variant={hasTaken ? 'outline' : 'primary'} size="md" onClick={() => setShowQuiz(true)}>
          {hasTaken ? 'Retake Quiz' : 'Take Quiz'}
        </Button>
      </div>
    </div>
  );
}
