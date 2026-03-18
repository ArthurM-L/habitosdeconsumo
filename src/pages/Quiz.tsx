import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { questions, likertOptions, calculateResults } from '@/data/quizData';

const motivationalMessages: Record<number, string> = {
  3: 'Ótimo ritmo! Continue assim 🔥',
  5: 'Metade do caminho! Arrasando 💪',
  7: 'Quase lá! Só mais 3 ⭐',
};

// Semantic color scale: disagree → red, neutral → yellow, agree → lime
const likertColors: Record<number, string> = {
  1: 'hsl(0 80% 58%)',
  2: 'hsl(22 90% 54%)',
  3: 'hsl(45 95% 52%)',
  4: 'hsl(77 100% 48%)',
  5: 'hsl(77 100% 52%)',
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
};

export default function Quiz() {
  const navigate = useNavigate();
  const {
    currentQuestion, answers, xp, streak, phase,
    setCurrentQuestion, addAnswer, incrementXP, incrementStreak,
    setResults, setPhase,
  } = useQuizStore();

  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [xpPopKey, setXpPopKey] = useState(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState('');
  const [direction] = useState(1);

  useEffect(() => {
    if (phase === 'landing') navigate('/');
    if (phase === 'intro') navigate('/intro');
    if (phase === 'loading') navigate('/loading');
    if (phase === 'results') navigate('/results');
  }, [phase, navigate]);

  useEffect(() => {
    const existing = answers.find((a) => a.questionId === questions[currentQuestion]?.id);
    setSelectedValue(existing ? existing.value : null);
  }, [currentQuestion, answers]);

  const handleSelect = useCallback(
    (value: 1 | 2 | 3 | 4 | 5) => {
      if (showCheck) return;
      setSelectedValue(value);
      addAnswer({ questionId: questions[currentQuestion].id, value });
      incrementXP();
      incrementStreak();
      setShowCheck(true);
      setXpPopKey((k) => k + 1);
      setShowXpPop(true);

      const nextIdx = currentQuestion + 1;
      if (motivationalMessages[nextIdx]) {
        setMilestoneMsg(motivationalMessages[nextIdx]);
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2200);
      }

      setTimeout(() => {
        setShowXpPop(false);
        setShowCheck(false);
        if (nextIdx >= questions.length) {
          const currentAnswers = useQuizStore.getState().answers;
          const allAnswers = [
            ...currentAnswers.filter((a) => a.questionId !== questions[currentQuestion].id),
            { questionId: questions[currentQuestion].id, value },
          ];
          setResults(calculateResults(allAnswers));
          setPhase('loading');
          navigate('/loading');
        } else {
          setCurrentQuestion(nextIdx);
        }
      }, 650);
    },
    [currentQuestion, showCheck, addAnswer, incrementXP, incrementStreak, navigate, setCurrentQuestion, setResults, setPhase]
  );

  const question = questions[currentQuestion];
  const filledCount = currentQuestion + (showCheck ? 1 : 0);

  if (!question) return null;

  return (
    <div className="min-h-screen mesh-bg flex flex-col overflow-hidden">

      {/* ── HUD ── */}
      <header className="shrink-0 px-5 pt-safe-top pt-10 pb-3 max-w-lg mx-auto w-full">

        {/* Top row: label + counter + XP */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground font-display">
              Pergunta
            </span>
            <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
              {currentQuestion + 1}
              <span className="text-muted-foreground/40 font-semibold">/{questions.length}</span>
            </span>
          </div>

          {/* XP pill */}
          <div className="relative flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="text-sm font-extrabold font-display text-foreground tabular-nums">{xp}</span>
            <AnimatePresence>
              {showXpPop && (
                <motion.span
                  key={xpPopKey}
                  className="absolute -top-6 right-1 text-[11px] font-bold pointer-events-none"
                  style={{ color: 'hsl(var(--warning))' }}
                  initial={{ y: 0, opacity: 1, scale: 0.9 }}
                  animate={{ y: -16, opacity: 0, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65 }}
                >
                  +10
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-[3px]">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden"
              style={{ background: 'hsl(var(--muted))' }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i < filledCount ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: i < currentQuestion ? 0 : 0.08 }}
                style={{ transformOrigin: 'left', background: 'var(--gradient-progress)' }}
              />
            </div>
          ))}
        </div>

        {/* Streak badge */}
        <AnimatePresence>
          {streak >= 3 && (
            <motion.div
              className="flex items-center gap-1 mt-2 text-[11px] font-semibold font-display"
              style={{ color: 'hsl(var(--warning))' }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <Flame className="w-3 h-3 fill-warning" />
              <span>{streak} em sequência!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Question + Options ── */}
      <div className="flex-1 flex flex-col px-4 pb-6 max-w-lg mx-auto w-full min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex flex-col flex-1 gap-4"
          >
            {/* Question card */}
            <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
              {/* Ambient glow blob */}
              <div
                className="absolute -top-6 -right-6 w-36 h-36 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
                style={{ background: 'hsl(var(--primary))' }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  {/* Numbered badge */}
                  <div
                    className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shrink-0"
                    style={{ boxShadow: '0 0 12px hsl(77 100% 50% / 0.4)' }}
                  >
                    <span className="text-xs font-extrabold font-display" style={{ color: 'hsl(var(--primary-foreground))' }}>
                      {currentQuestion + 1}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
                <h2 className="font-display text-[1.15rem] sm:text-xl font-bold leading-snug text-foreground">
                  {question.text}
                </h2>
              </div>
            </div>

            {/* Likert options: 2 top + 3 bottom — fills remaining space */}
            <div className="flex flex-col gap-2.5 flex-1">
              <div className="grid grid-cols-2 gap-2.5 flex-1" style={{ minHeight: 0 }}>
                {likertOptions.slice(0, 2).map((opt) => (
                  <LikertCard
                    key={opt.value}
                    opt={opt}
                    isSelected={selectedValue === opt.value}
                    showCheck={showCheck}
                    onSelect={handleSelect}
                    color={likertColors[opt.value]}
                    stretch
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2.5 flex-1" style={{ minHeight: 0 }}>
                {likertOptions.slice(2).map((opt) => (
                  <LikertCard
                    key={opt.value}
                    opt={opt}
                    isSelected={selectedValue === opt.value}
                    showCheck={showCheck}
                    onSelect={handleSelect}
                    color={likertColors[opt.value]}
                    stretch
                  />
                ))}
              </div>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {!selectedValue && (
                <motion.p
                  className="text-center text-[11px] text-muted-foreground/60 font-display tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Toque em uma opção para responder
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Milestone toast ── */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className="fixed inset-x-0 bottom-8 flex justify-center z-50 pointer-events-none px-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <motion.div
              className="glass-strong rounded-2xl px-5 py-3.5 text-center border border-primary/25"
              style={{ boxShadow: 'var(--glow-primary)' }}
            >
              <p className="font-display font-bold text-sm text-foreground">{milestoneMsg}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── LikertCard ──
function LikertCard({
  opt, isSelected, showCheck, onSelect, color,
}: {
  opt: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string };
  isSelected: boolean;
  showCheck: boolean;
  onSelect: (v: 1 | 2 | 3 | 4 | 5) => void;
  color: string;
}) {
  return (
    <motion.button
      onClick={() => onSelect(opt.value)}
      disabled={showCheck}
      whileHover={!showCheck ? { y: -2, scale: 1.02 } : {}}
      whileTap={!showCheck ? { scale: 0.96 } : {}}
      className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl focus:outline-none"
      style={{
        minHeight: '80px',
        padding: '14px 8px',
        border: '1.5px solid',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
        ...(isSelected
          ? {
              background: color + '1e',
              borderColor: color,
              boxShadow: `0 0 16px ${color}44`,
            }
          : {
              background: 'hsl(var(--card) / 0.55)',
              borderColor: 'hsl(var(--border) / 0.55)',
              backdropFilter: 'blur(14px)',
            }),
      }}
    >
      {/* Emoji */}
      <span className="text-[1.6rem] leading-none select-none">{opt.emoji}</span>

      {/* Label */}
      <span
        className="text-[10.5px] font-semibold text-center leading-tight font-display px-0.5"
        style={{ color: isSelected ? color : 'hsl(var(--muted-foreground))' }}
      >
        {opt.label}
      </span>

      {/* Check flash overlay */}
      {isSelected && showCheck && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: color + '2a' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        >
          <motion.span
            className="text-2xl"
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.05 }}
          >
            ✅
          </motion.span>
        </motion.div>
      )}
    </motion.button>
  );
}
