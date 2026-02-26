export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface UserAnswer {
  questionId: number;
  answer: string;
}

export interface QuizResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}
