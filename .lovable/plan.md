
# Gamified Profile Quiz App — Implementation Plan

## Project Structure
A 5-screen React app with Supabase backend, Framer Motion animations, Recharts visualizations, and a password-protected admin panel.

---

## Phase 1 — Foundation & Design System

- Set up design tokens in `index.css`: dark background (`#0F0F1A`), surface (`#1A1A2E`), primary gradient (`#6366F1 → #8B5CF6`), Plus Jakarta Sans + Inter via Google Fonts
- Install `framer-motion`, `recharts`, `zustand`
- Create `QuizContext` / Zustand store managing: `currentQuestion`, `answers[]`, `xp`, `streak`, `phase` (`landing | quiz | loading | results`)
- Create seed data file with 10 questions, 3 groups, and their weights

---

## Phase 2 — Screen 1: Landing Page (`/`)

- Full-screen dark layout with animated gradient mesh background (CSS keyframe pulse)
- Bold headline in Plus Jakarta Sans: *"Descubra seu perfil em menos de 3 minutos"*
- 2-line subtext + ⏱ time badge + social proof line
- Glowing, pulsing CTA button **"Iniciar Quiz →"** with indigo gradient
- Mobile: button pinned to bottom

---

## Phase 3 — Screen 2: Quiz Flow (`/quiz`)

**Top HUD:**
- 6px gradient progress bar (`#6366F1 → #EC4899`) with animated fill
- XP pill top-right with `+10` pop animation on each answer

**Question card:**
- Question number badge `#3`, large question text
- 5 Likert cards: horizontal on desktop, stacked on mobile
  - Emoji + label per card
  - Hover: lift + glow shadow
  - Selected: gradient fill + color ring + scale(0.95) bounce
- Auto-advance after 600ms with ✅ flash animation
- Slide-from-right transition between questions (Framer Motion)

**Gamification:**
- 🔥 Streak counter (3+ consecutive quick answers)
- Milestone modal at Q5: *"Metade do caminho! 💪"* — auto-dismisses in 2s

---

## Phase 4 — Screen 3: Loading (`/loading`)

- 2.5s fake processing screen
- Cycling animated text: "Analisando respostas…" → "Cruzando perfil…" → "Calculando similaridade…"
- Spinning SVG circular loader with gradient stroke
- Auto-redirects to results after cycle completes

---

## Phase 5 — Screen 4: Results (`/results`)

- Header: *"Seu perfil foi encontrado! 🎉"*
- **Primary match hero card**: group icon, name, animated count-up percentage (0→72% over 1.5s), 2-line description
- **Secondary matches**: 2-column grid of smaller cards with smaller percentages
- **Recharts PieChart/RadialBarChart**: animated draw-in on entry
- Personalized interpretation text block
- Two CTAs: **"Refazer Quiz"** (full state reset → `/`) and **"Compartilhar Resultado"** (copy to clipboard)
- Save session + answers to Supabase on results load

---

## Phase 6 — Screen 5: Admin Panel (`/admin`)

- Password gate (hardcoded, simple input + button)
- 4 tabs using shadcn Tabs:
  - **Perguntas**: editable question text table with per-row Save
  - **Pesos**: weight inputs (0.0–1.0) per group per question
  - **Grupos**: add/remove groups with name, color, icon, description
  - **Respostas**: read-only table of quiz sessions with timestamps and group scores
- All reads/writes go to Supabase

---

## Phase 7 — Supabase Integration

- Connect Lovable Cloud backend
- Create 4 tables via migration: `quiz_sessions`, `quiz_answers`, `questions`, `groups`
- Seed questions and groups tables with provided data
- Admin panel syncs live to Supabase; quiz reads questions from DB on start

---

## Routing Map

```
/          → Landing
/quiz      → Quiz flow (stateful, no URL index)
/results   → Results (reads from store)
/admin     → Admin panel
```

---

## Key Libraries
- `framer-motion` — all page/card transitions and micro-interactions
- `recharts` — animated donut chart on results
- `zustand` — lightweight global quiz state
- `@supabase/supabase-js` — DB reads/writes
