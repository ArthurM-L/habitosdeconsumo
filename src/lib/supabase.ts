import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbQuestion = {
  id: number;
  text: string;
  weights: Record<string, number>;
  order_index: number;
};

export type DbGroup = {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
};

export type DbQuizSession = {
  id: string;
  created_at: string;
  results: Record<string, number>;
};

export type DbQuizAnswer = {
  id: string;
  session_id: string;
  question_id: number;
  answer_value: number;
};
