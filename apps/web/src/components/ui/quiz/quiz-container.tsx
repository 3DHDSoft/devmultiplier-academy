'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { QuizProgress } from './quiz-progress';
import { QuestionMultipleChoice } from './question-multiple-choice';
import { QuestionTrueFalse } from './question-true-false';
import { QuizResults } from './quiz-results';
import type { QuizContainerProps, QuizQuestionsResponse, QuizAnswer, QuizSubmitResponse } from '@/lib/quiz/types';

type QuizState = 'loading' | 'taking' | 'submitting' | 'results' | 'error';

export function QuizContainer({ courseId, moduleId, lessonId, onComplete, onClose }: QuizContainerProps) {
  const [state, setState] = useState<QuizState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestionsResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | boolean>>(new Map());
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  // Fetch quiz questions on mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/quiz/${courseId}/${moduleId}/${lessonId}/questions`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load quiz');
        }

        const { data } = await response.json();
        setQuizData(data);
        setState('taking');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        setState('error');
      }
    }

    fetchQuiz();
  }, [courseId, moduleId, lessonId]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((questionId: string, answer: string | boolean) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, answer);
      return next;
    });
  }, []);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  }, []);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (quizData) {
      setCurrentQuestion((prev) => Math.min(quizData.questions.length - 1, prev + 1));
    }
  }, [quizData]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (!quizData) return;

    setState('submitting');
    const timeTakenMs = Date.now() - startTime;

    // Build answers array
    const submissionAnswers: QuizAnswer[] = quizData.questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers.get(q.id) ?? (q.type === 'true-false' ? false : ''),
    }));

    try {
      const response = await fetch(`/api/quiz/${courseId}/${moduleId}/${lessonId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: submissionAnswers, timeTakenMs }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit quiz');
      }

      const { data } = await response.json();
      setResult(data);
      setState('results');
      onComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setState('error');
    }
  }, [quizData, answers, startTime, courseId, moduleId, lessonId, onComplete]);

  // Retake quiz
  const handleRetake = useCallback(() => {
    setAnswers(new Map());
    setCurrentQuestion(0);
    setResult(null);
    setState('taking');
  }, []);

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Results state
  if (state === 'results' && result && quizData) {
    return <QuizResults score={result.score} passed={result.passed} passingScore={quizData.passingScore} correctAnswers={result.correctAnswers} totalQuestions={result.totalQuestions} results={result.results} isNewBestScore={result.isNewBestScore} onRetake={handleRetake} onClose={onClose || (() => {})} />;
  }

  // Taking quiz state
  if (!quizData) return null;

  const question = quizData.questions[currentQuestion];
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;
  const hasAnsweredCurrent = answers.has(question.id);
  const answeredQuestions = new Set(quizData.questions.filter((q) => answers.has(q.id)).map((q) => q.id));
  const allAnswered = answeredQuestions.size === quizData.questions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{quizData.title}</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress */}
      <QuizProgress currentQuestion={currentQuestion} totalQuestions={quizData.questions.length} answeredQuestions={answeredQuestions} />

      {/* Question */}
      <div className="min-h-[200px]">{question.type === 'multiple-choice' ? <QuestionMultipleChoice question={question} selectedAnswer={(answers.get(question.id) as string) ?? null} onSelect={(answer) => handleSelectAnswer(question.id, answer)} /> : <QuestionTrueFalse question={question} selectedAnswer={(answers.get(question.id) as boolean) ?? null} onSelect={(answer) => handleSelectAnswer(question.id, answer)} />}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion}>
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <Button variant="primary" onClick={handleNext} disabled={!hasAnsweredCurrent}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} disabled={!allAnswered || state === 'submitting'}>
              {state === 'submitting' ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
