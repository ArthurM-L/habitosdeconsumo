
## Analysis of Current State

The app already has:
- Framer Motion everywhere (Quiz.tsx, Intro.tsx, Results.tsx)
- `calculateResults` returns proper percentages (not all 28%) — already fixed
- Recharts PieChart in Results.tsx
- Confetti on Results
- Mobile-first layout on all pages

The user is asking for a major **UI/UX overhaul** focused on:
1. Advanced calculation engine (already works, but needs radar/bar chart)
2. Swipe navigation in Quiz
3. Split-screen desktop layout for Quiz
4. Skeleton loading for AI analysis (no AI analysis currently exists — needs to be built)
5. Sticky header with blur in Quiz
6. Glassmorphism AI card

## What Actually Needs to Be Built

**Quiz.tsx** — 4 changes:
- Add swipe gesture (`drag="x"` + `dragConstraints`) to navigate between questions
- Make header `sticky top-0 backdrop-blur` with proper z-index
- Desktop split-screen: left column (progress + illustration), right column (question + cards)
- `whileTap={{ scale: 0.98 }}` on LikertCard already uses CSS transform; switch to motion.button

**Results.tsx** — 2 changes:
- Replace PieChart with a `RadarChart` from Recharts showing all 4 profiles
- Add horizontal animated bar chart option alongside or replace the donut

**New AI Analysis feature** — the user explicitly mentions `handleGenerateAiAnalysis`. This does NOT exist anywhere in the codebase. Must be added:
- Button "Gerar análise personalizada" on Results page
- Calls a Supabase Edge Function that queries an AI model (using Lovable AI)
- Shows Skeleton loading while waiting
- Renders response in a glassmorphism Card

**Intro.tsx** — Minor: `whileTap` already present, no changes needed

## Plan

### Step 1: Upgrade `src/pages/Quiz.tsx`

**Sticky header with blur:**
```
<header className="sticky top-0 z-10 backdrop-blur-md bg-background/60 border-b border-border/20 px-4 pt-4 pb-2">
```

**Desktop split-screen (md+ breakpoint):**
```
<div className="md:grid md:grid-cols-2 md:gap-0 md:h-screen">
  {/* Left panel — progress + illustration */}
  <div className="hidden md:flex flex-col justify-between p-8 border-r border-border/20">
    <ProgressSidebar ... />
    <GradientIllustration ... />
  </div>
  {/* Right panel — question + cards */}
  <div className="flex flex-col ...">
    ...
  </div>
</div>
```

**Swipe gesture on question card:**
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => {
    if (info.offset.x < -60 && selectedValue) handleAdvance();
    if (info.offset.x > 60 && currentQuestion > 0) handleBack();
  }}
>
```

**LikertCard — motion.button with `whileTap`:**
Replace `<button>` with `<motion.button whileTap={{ scale: 0.97 }}>` inside the card.

### Step 2: Upgrade `src/pages/Results.tsx`

Replace PieChart donut with a **RadarChart** from Recharts:
```tsx
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const radarData = groups.map(g => {
  const r = results.find(r => r.groupId === g.id);
  return { subject: g.name, value: r?.percentage ?? 0, fullMark: 100 };
});
// Render inside ResponsiveContainer
```

Add a **horizontal bar chart** section replacing/supplementing secondaries:
```tsx
{sorted.map(r => (
  <div key={r.groupId}>
    <motion.div 
      style={{ width: `${r.percentage}%`, background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${r.percentage}%` }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
  </div>
))}
```

### Step 3: Add AI Analysis feature to `src/pages/Results.tsx` + Edge Function

**Edge function** `supabase/functions/generate-analysis/index.ts`:
- Receives: `{ profile: string, percentage: number, name: string, secondaryProfiles: {...} }`
- Calls Lovable AI model (google/gemini-2.5-flash-lite for speed)
- Returns a personalized analysis paragraph (~3-4 sentences)

**Results.tsx additions:**
```tsx
const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
const [aiLoading, setAiLoading] = useState(false);

const handleGenerateAiAnalysis = async () => {
  setAiLoading(true);
  const { data } = await supabase.functions.invoke('generate-analysis', {
    body: { profile: primaryGroup.name, percentage: primary.percentage, ... }
  });
  setAiAnalysis(data.analysis);
  setAiLoading(false);
};
```

**Skeleton loading** (using shadcn `Skeleton`):
```tsx
{aiLoading && (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
)}
```

**Glassmorphism AI Card:**
```tsx
<div className="glass-strong rounded-2xl p-4" style={{ border: '1px solid hsl(var(--primary) / 0.2)', backdropFilter: 'blur(20px)' }}>
  <p className="text-sm leading-relaxed">{aiAnalysis}</p>
</div>
```

## Files to Modify

| File | Changes |
|---|---|
| `src/pages/Quiz.tsx` | Sticky header, swipe gesture, desktop split-screen, `whileTap` on cards |
| `src/pages/Results.tsx` | RadarChart, animated bars, AI analysis button + skeleton + glass card |
| `supabase/functions/generate-analysis/index.ts` | New edge function using Lovable AI |

## Architecture Notes

- Swipe left = advance (only if answer selected), swipe right = go back
- Swipe threshold: ±60px offset
- Desktop breakpoint: `md:` (768px+) — Quiz gets 2-column grid, mobile stays 1-column
- AI analysis is optional — one tap button, result cached in component state
- RadarChart will have `fill` with the primary group color at 20% opacity
- No changes to `quizData.ts`, `store/quizStore.ts`, or other pages
