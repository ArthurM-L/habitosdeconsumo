
-- Quiz sessions table
CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  results JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz sessions"
  ON public.quiz_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz sessions"
  ON public.quiz_sessions FOR SELECT
  USING (true);

-- Quiz answers table
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id INT NOT NULL,
  answer_value INT NOT NULL CHECK (answer_value BETWEEN 1 AND 5)
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read quiz answers"
  ON public.quiz_answers FOR SELECT
  USING (true);

-- Questions table
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  weights JSONB NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update questions"
  ON public.questions FOR UPDATE
  USING (true);

-- Groups table
CREATE TABLE public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366F1',
  icon TEXT NOT NULL DEFAULT '🌟',
  description TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read groups"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage groups"
  ON public.groups FOR ALL
  USING (true);
