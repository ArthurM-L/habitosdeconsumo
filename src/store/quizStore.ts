import { create } from 'zustand';

export type Phase = 'landing' | 'quiz' | 'loading' | 'results';

export interface Answer {
  questionId: number;
  value: 1 | 2 | 3 | 4 | 5;
}

export interface GroupResult {
  groupId: string;
  score: number;
  percentage: number;
}

interface QuizState {
  phase: Phase;
  currentQuestion: number;
  answers: Answer[];
  xp: number;
  streak: number;
  results: GroupResult[];

  setPhase: (phase: Phase) => void;
  setCurrentQuestion: (index: number) => void;
  addAnswer: (answer: Answer) => void;
  incrementXP: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setResults: (results: GroupResult[]) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  phase: 'landing',
  currentQuestion: 0,
  answers: [],
  xp: 0,
  streak: 0,
  results: [],

  setPhase: (phase) => set({ phase }),
  setCurrentQuestion: (index) => set({ currentQuestion: index }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers.filter((a) => a.questionId !== answer.questionId), answer],
    })),
  incrementXP: () => set((state) => ({ xp: state.xp + 10 })),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
  setResults: (results) => set({ results }),
  resetQuiz: () =>
    set({
      phase: 'landing',
      currentQuestion: 0,
      answers: [],
      xp: 0,
      streak: 0,
      results: [],
    }),
}));
