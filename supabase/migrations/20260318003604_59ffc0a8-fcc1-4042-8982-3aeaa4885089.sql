
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS user_gender TEXT,
  ADD COLUMN IF NOT EXISTS user_birthdate DATE;
