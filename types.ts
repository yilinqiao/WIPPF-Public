export interface Question {
  id: number;
  text: string;
  textZh: string; // Added Chinese text
  categoryCode: string; // e.g., '1a', '20a'
}

export type AnswerValue = 1 | 2 | 3 | 4; // 1: No, 2: More No, 3: More Yes, 4: Yes

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export interface MacroScores {
  social: {
    active: number;  // Sum of 'a' in Secondary (1-11)
    passive: number; // Sum of 'b' in Secondary (1-11)
    concept: number; // Sum of 'c' in Secondary (1-11)
  };
  emotional: {
    self: number;    // Sum of 'a' in Primary (12-19)
    we: number;      // Sum of 'b' in Primary (12-19)
    ideal: number;   // Sum of 'c' in Primary (12-19)
  };
}

export interface AssessmentResult {
  id: string;
  date: string; // ISO string
  name: string;
  answers: Record<number, AnswerValue>;
  scores: Record<string, number>; // Maps category ID (e.g., "1", "20") to raw sum score
  macro: MacroScores;
}

export interface CategoryDefinition {
  id: string; // "1", "2", ... "27"
  name: string;
  nameZh: string;
  group: 'secondary' | 'primary' | 'conflict' | 'model';
}

export enum AppView {
  HOME = 'HOME',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  IMPORT = 'IMPORT',
}