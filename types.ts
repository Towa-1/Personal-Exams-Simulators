
export interface QuestionAnswer {
  type: 'MCQ' | 'NUM';
  question: string;
  options: string[]; // For MCQ
  unit: string;      // For NUM
  answerKey: string;
  explanation: string;
  imageUrl?: string | null;
}

export enum AppState {
  INPUT,
  SETUP,
  QUIZ,
  RESULTS,
}
