/**
 * Quiz Types
 *
 * TypeScript interfaces for quiz data structures used throughout the application.
 * Quiz content is stored in JSON files, while attempts are stored in the database.
 */

// ==========================================
// Quiz Content Types (from JSON files)
// ==========================================

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: QuizOption[];
  correctAnswer: string | boolean;
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  moduleId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

// ==========================================
// API Request/Response Types
// ==========================================

/** Question without correct answer (for API response) */
export interface QuizQuestionPublic {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: QuizOption[];
}

/** Quiz metadata response */
export interface QuizMetadata {
  id: string;
  lessonId: string;
  moduleId: string;
  title: string;
  questionCount: number;
  passingScore: number;
  bestScore: number | null;
  passed: boolean;
  attemptCount: number;
}

/** Quiz questions response (no answers) */
export interface QuizQuestionsResponse {
  quizId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestionPublic[];
}

/** User's answer submission */
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | boolean;
}

/** Submit quiz request */
export interface QuizSubmitRequest {
  answers: QuizAnswer[];
  timeTakenMs: number;
}

/** Individual question result */
export interface QuestionResult {
  questionId: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  selectedAnswer: string | boolean;
  correctAnswer: string | boolean;
  isCorrect: boolean;
  explanation: string;
  options?: QuizOption[];
}

/** Submit quiz response */
export interface QuizSubmitResponse {
  attemptId: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  results: QuestionResult[];
  isNewBestScore: boolean;
  previousBestScore: number | null;
}

// ==========================================
// Database Types (stored in DB)
// ==========================================

/** Answer stored in quiz_attempts.answers JSON column */
export interface StoredAnswer {
  questionId: string;
  selectedAnswer: string | boolean;
  isCorrect: boolean;
}

// ==========================================
// Component Props Types
// ==========================================

export interface QuizContainerProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  onComplete?: (result: QuizSubmitResponse) => void;
  onClose?: () => void;
}

export interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<string>;
}

export interface QuestionMultipleChoiceProps {
  question: QuizQuestionPublic;
  selectedAnswer: string | null;
  onSelect: (answerId: string) => void;
  showResult?: boolean;
  result?: QuestionResult;
}

export interface QuestionTrueFalseProps {
  question: QuizQuestionPublic;
  selectedAnswer: boolean | null;
  onSelect: (answer: boolean) => void;
  showResult?: boolean;
  result?: QuestionResult;
}

export interface QuizResultsProps {
  score: number;
  passed: boolean;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
  results: QuestionResult[];
  isNewBestScore: boolean;
  onRetake: () => void;
  onClose: () => void;
}

export interface QuizSummaryCardProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}
