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

export function LessonProgress({
  courseSlug,
  moduleId,
  lessonId,
  onComplete,
}: LessonProgressProps) {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const lessonKey = `${moduleId}/${lessonId}`;

  // Use useSyncExternalStore for reading localStorage
  const getSnapshot = useCallback(
    () => isLessonCompleted(courseSlug, lessonKey),
    [courseSlug, lessonKey]
  );
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
      data[courseSlug].completedLessons = data[courseSlug].completedLessons.filter(
        (key) => key !== lessonKey
      );
      saveProgressData(data);
    }

    // Trigger a storage event to update the UI via useSyncExternalStore
    window.dispatchEvent(new Event('storage'));
  };

  // Not logged in - show login prompt
  if (status !== 'authenticated') {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#848d97] rounded-md cursor-not-allowed font-medium text-sm"
      >
        <Circle className="w-4 h-4" />
        <span className="hidden sm:inline">Sign in to track progress</span>
      </button>
    );
  }

  if (isCompleted) {
    return (
      <button
        onClick={handleMarkIncomplete}
        className="flex items-center gap-2 px-4 py-2 bg-[#dafbe1] dark:bg-[#238636] text-[#1a7f37] dark:text-white rounded-md hover:bg-[#aceebb] dark:hover:bg-[#2ea043] transition-colors font-medium text-sm group"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline">Completed</span>
        <span className="hidden sm:group-hover:inline text-xs opacity-75 ml-1">
          (click to undo)
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-[#1f883d] dark:bg-[#238636] text-white rounded-md hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] transition-colors font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
        </>
      ) : (
        <>
          <Circle className="w-4 h-4" />
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
