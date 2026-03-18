import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, ChevronLeft } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { questions, likertOptions, calculateResults } from '@/data/quizData';

const motivationalMessages: Record<number, string> = {
  3: 'Ótimo ritmo! Continue assim 🔥',
  5: 'Metade do caminho! Você está arrasando 💪',
  7: 'Quase lá! Só mais 3 ⭐',
};

// Color per likert value — Acid Lime gradient scale
const likertColors: Record<number, string> = {
  1: 'hsl(0 80% 55%)',
  2: 'hsl(25 90% 52%)',
  3: 'hsl(60 90% 50%)',
  4: 'hsl(77 100% 48%)',
  5: 'hsl(77 100% 50%)',
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
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
  const progress = ((currentQuestion + (showCheck ? 1 : 0)) / questions.length) * 100;

  if (!question) return null;

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* ── Header HUD ── */}
      <div className="shrink-0 px-4 pt-10 pb-2 max-w-lg mx-auto w-full">
        {/* Progress + question counter */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground font-display uppercase tracking-wider">
                Pergunta
              </span>
              <span className="text-xs font-bold text-muted-foreground font-display">
                {currentQuestion + 1}<span className="text-muted-foreground/50">/{questions.length}</span>
              </span>
            </div>
            {/* Segmented progress bar */}
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: 'hsl(var(--muted))' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i < currentQuestion + (showCheck ? 1 : 0) ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: i < currentQuestion ? 0 : 0.1 }}
                    style={{ transformOrigin: 'left' as const, background: 'var(--gradient-progress)' }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* XP counter */}
          <div className="relative flex items-center gap-1.5 glass rounded-full px-3 py-1.5 shrink-0">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-sm font-bold font-display text-foreground">{xp}</span>
            <AnimatePresence>
              {showXpPop && (
                <motion.span
                  key={xpPopKey}
                  className="absolute -top-7 right-0 text-xs font-bold"
                  style={{ color: 'hsl(var(--warning))' }}
                  initial={{ y: 0, opacity: 1, scale: 0.8 }}
                  animate={{ y: -18, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  +10
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Streak */}
        <AnimatePresence>
          {streak >= 3 && (
            <motion.div
              className="flex items-center gap-1.5 text-xs font-semibold mb-1"
              style={{ color: 'hsl(var(--warning))' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <Flame className="w-3.5 h-3.5 fill-warning" />
              <span>{streak} em sequência!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Question Card ── */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* Question text */}
            <div className="glass-strong rounded-3xl p-6 mb-5 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: 'hsl(var(--primary))' }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
                    <span className="text-xs font-bold text-white font-display">{currentQuestion + 1}</span>
                  </div>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-foreground">
                  {question.text}
                </h2>
              </div>
            </div>

            {/* Likert Options — 2+3 grid on mobile */}
            <div className="flex flex-col gap-2.5">
              {/* Top row: 2 options */}
              <div className="grid grid-cols-2 gap-2.5">
                {likertOptions.slice(0, 2).map((opt) => (
                  <LikertCard
                    key={opt.value}
                    opt={opt}
                    isSelected={selectedValue === opt.value}
                    showCheck={showCheck}
                    onSelect={handleSelect}
                    color={likertColors[opt.value]}
                  />
                ))}
              </div>
              {/* Bottom row: 3 options */}
              <div className="grid grid-cols-3 gap-2.5">
                {likertOptions.slice(2).map((opt) => (
                  <LikertCard
                    key={opt.value}
                    opt={opt}
                    isSelected={selectedValue === opt.value}
                    showCheck={showCheck}
                    onSelect={handleSelect}
                    color={likertColors[opt.value]}
                  />
                ))}
              </div>
            </div>

            {/* Hint text */}
            {!selectedValue && (
              <motion.p
                className="text-center text-xs text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Toque em uma opção para responder
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Milestone toast ── */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none px-4 pb-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-strong rounded-2xl px-6 py-4 text-center max-w-xs border border-primary/30"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350 }}
              style={{ boxShadow: 'var(--glow-primary)' }}
            >
              <p className="font-display font-bold text-base text-foreground">{milestoneMsg}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Subcomponent ──
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
      whileHover={!showCheck ? { y: -3, scale: 1.03 } : {}}
      whileTap={!showCheck ? { scale: 0.95 } : {}}
      className="relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 cursor-pointer transition-colors duration-200 border focus:outline-none min-h-[88px]"
      style={
        isSelected
          ? {
              background: color + '22',
              borderColor: color,
              boxShadow: `0 0 18px ${color}55`,
            }
          : {
              background: 'hsl(var(--card) / 0.5)',
              borderColor: 'hsl(var(--border) / 0.5)',
              backdropFilter: 'blur(12px)',
            }
      }
    >
      <span className="text-2xl leading-none">{opt.emoji}</span>
      <span
        className="text-[11px] font-semibold text-center leading-tight font-display"
        style={{ color: isSelected ? color : 'hsl(var(--muted-foreground))' }}
      >
        {opt.label}
      </span>
      {isSelected && showCheck && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: color + '33' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <span className="text-3xl">✅</span>
        </motion.div>
      )}
    </motion.button>
  );
}
