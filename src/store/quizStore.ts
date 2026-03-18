import { create } from 'zustand';
import type { UserInfo } from '@/data/quizData';

export type Phase = 'landing' | 'intro' | 'quiz' | 'loading' | 'results';

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
  userInfo: UserInfo | null;

  setPhase: (phase: Phase) => void;
  setCurrentQuestion: (index: number) => void;
  addAnswer: (answer: Answer) => void;
  incrementXP: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setResults: (results: GroupResult[]) => void;
  setUserInfo: (info: UserInfo) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  phase: 'landing',
  currentQuestion: 0,
  answers: [],
  xp: 0,
  streak: 0,
  results: [],
  userInfo: null,

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
  setUserInfo: (userInfo) => set({ userInfo }),
  resetQuiz: () =>
    set({
      phase: 'landing',
      currentQuestion: 0,
      answers: [],
      xp: 0,
      streak: 0,
      results: [],
      userInfo: null,
    }),
}));
