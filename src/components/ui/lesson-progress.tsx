'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface LessonProgressProps {
  courseSlug: string;
  moduleId: string;
  lessonId: string;
  totalLessons: number;
  currentLessonNumber: number;
  onComplete?: () => void;
}

// Store completed lessons in localStorage for MVP
// This would be replaced with proper database tracking using UUIDs
const STORAGE_KEY = 'devmultiplier_lesson_progress';

interface ProgressData {
  [courseSlug: string]: {
    completedLessons: string[]; // Array of "moduleId/lessonId" strings
  };
}

function getProgressData(): ProgressData {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgressData(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

// Check if a specific lesson is completed
function isLessonCompleted(courseSlug: string, lessonKey: string): boolean {
  const data = getProgressData();
  const courseProgress = data[courseSlug];
  return courseProgress?.completedLessons.includes(lessonKey) ?? false;
}

// Subscribe to storage changes
function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function LessonProgress({ courseSlug, moduleId, lessonId, onComplete }: LessonProgressProps) {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const lessonKey = `${moduleId}/${lessonId}`;

  // Use useSyncExternalStore for reading localStorage
  const getSnapshot = useCallback(() => isLessonCompleted(courseSlug, lessonKey), [courseSlug, lessonKey]);
  const getServerSnapshot = useCallback(() => false, []);

  const isCompleted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleMarkComplete = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);

    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update local storage
    const data = getProgressData();
    if (!data[courseSlug]) {
      data[courseSlug] = { completedLessons: [] };
    }
    if (!data[courseSlug].completedLessons.includes(lessonKey)) {
      data[courseSlug].completedLessons.push(lessonKey);
    }
    saveProgressData(data);

    // Trigger a storage event to update the UI via useSyncExternalStore
    window.dispatchEvent(new Event('storage'));

    setIsLoading(false);
    onComplete?.();
  };

  const handleMarkIncomplete = () => {
    if (!isCompleted || isLoading) return;

    const data = getProgressData();
    if (data[courseSlug]) {
      data[courseSlug].completedLessons = data[courseSlug].completedLessons.filter((key) => key !== lessonKey);
      saveProgressData(data);
    }

    // Trigger a storage event to update the UI via useSyncExternalStore
    window.dispatchEvent(new Event('storage'));
  };

  // Not logged in - show login prompt
  if (status !== 'authenticated') {
    return (
      <button disabled className="flex cursor-not-allowed items-center gap-2 rounded-md bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#656d76] dark:bg-[#21262d] dark:text-[#848d97]">
        <Circle className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in to track progress</span>
      </button>
    );
  }

  if (isCompleted) {
    return (
      <button onClick={handleMarkIncomplete} className="group flex items-center gap-2 rounded-md bg-[#dafbe1] px-4 py-2 text-sm font-medium text-[#1a7f37] transition-colors hover:bg-[#aceebb] dark:bg-[#238636] dark:text-white dark:hover:bg-[#2ea043]">
        <CheckCircle2 className="h-4 w-4" />
        <span className="hidden sm:inline">Completed</span>
        <span className="ml-1 hidden text-xs opacity-75 sm:group-hover:inline">(click to undo)</span>
      </button>
    );
  }

  return (
    <button onClick={handleMarkComplete} disabled={isLoading} className="flex items-center gap-2 rounded-md bg-[#1f883d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a7f37] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#238636] dark:hover:bg-[#2ea043]">
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          <span className="hidden sm:inline">Mark Complete</span>
        </>
      )}
    </button>
  );
}

// Export helper to get course progress
export function getCourseProgress(courseSlug: string): {
  completedLessons: string[];
  completedCount: number;
} {
  const data = getProgressData();
  const courseProgress = data[courseSlug];
  return {
    completedLessons: courseProgress?.completedLessons || [],
    completedCount: courseProgress?.completedLessons.length || 0,
  };
}
