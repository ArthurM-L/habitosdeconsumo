import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Zap,
  CircleCheck, Trophy,
} from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { questions, likertOptions, calculateResults } from '@/data/quizData';

import {
  concordo_totalmente,
  concordo,
  neutro,
  discordo,
  discordo_totalmente,
} from '@/assets/inlineImages';

// Inline base64 images — zero network requests, zero flicker
const likertImages: Record<number, string> = {
  1: discordo_totalmente,
  2: discordo,
  3: neutro,
  4: concordo,
  5: concordo_totalmente,
};

// Semantic color scale: disagree → red, neutral → yellow, agree → lime

// Semantic color scale: disagree → red, neutral → yellow, agree → lime
const likertColors: Record<number, string> = {
  1: 'hsl(0 80% 58%)',
  2: 'hsl(22 90% 54%)',
  3: 'hsl(45 95% 52%)',
  4: 'hsl(77 100% 48%)',
  5: 'hsl(77 100% 52%)',
};

const milestoneMessages: Record<number, { text: string }> = {
  3: { text: 'Ótimo ritmo — continue assim' },
  5: { text: 'Metade do caminho — arrasando' },
  7: { text: 'Quase lá — só mais 3' },
};

// Question panel — spring physics
const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 56 : -56, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -56 : 56, opacity: 0, scale: 0.97 }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 32,
  mass: 0.9,
};

// Staggered card container — separate name avoids collision with parent variants
const cardListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

// Per-card spring entry
const cardItemVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 26 },
  },
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
      if (milestoneMessages[nextIdx]) {
        setMilestoneMsg(milestoneMessages[nextIdx].text);
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
    <div className="h-screen mesh-bg flex flex-col overflow-hidden">

      {/* ── HUD — compacto ── */}
      <header className="shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground font-display">Pergunta</span>
            <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
              {currentQuestion + 1}<span className="text-muted-foreground/40 font-semibold">/{questions.length}</span>
            </span>
          </div>
          <div className="relative flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <Zap className="w-3 h-3 fill-warning text-warning" />
            <span className="text-xs font-extrabold font-display text-foreground tabular-nums">{xp}</span>
            <AnimatePresence>
              {showXpPop && (
                <motion.span key={xpPopKey} className="absolute -top-5 right-1 text-[10px] font-bold pointer-events-none font-display"
                  style={{ color: 'hsl(var(--warning))' }}
                  initial={{ y: 0, opacity: 1, scale: 0.9 }} animate={{ y: -14, opacity: 0, scale: 1.3 }} exit={{ opacity: 0 }} transition={{ duration: 0.65 }}>
                  +10
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex gap-[3px]">
          {questions.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
              <motion.div className="h-full rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: i < filledCount ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: i < currentQuestion ? 0 : 0.08 }}
                style={{ transformOrigin: 'left', background: 'var(--gradient-progress)' }} />
            </div>
          ))}
        </div>
        <AnimatePresence>
          {streak >= 3 && (
            <motion.div className="flex items-center gap-1 mt-1 text-[10px] font-semibold font-display" style={{ color: 'hsl(var(--warning))' }}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Flame className="w-3 h-3 fill-warning" />
              <span>{streak} em sequência</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Question + Cards — único bloco flex que preenche o restante ── */}
      <div className="flex-1 flex flex-col px-4 pt-1 pb-3 max-w-lg mx-auto w-full min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col flex-1 min-h-0 gap-2.5"
          >
            {/* Pergunta */}
            <motion.div
              className="glass-strong rounded-2xl px-4 py-3 relative overflow-hidden shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.04 }}
            >
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.08] blur-3xl pointer-events-none" style={{ background: 'hsl(var(--primary))' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 8px hsl(77 100% 50% / 0.4)' }}>
                    <span className="text-[10px] font-extrabold font-display" style={{ color: 'hsl(var(--primary-foreground))' }}>{currentQuestion + 1}</span>
                  </div>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
                <h2 className="font-display text-[1rem] font-bold leading-snug text-foreground">{question.text}</h2>
              </div>
            </motion.div>

            {/* Grid Likert — 2 linhas com alturas fixas que se encaixam na tela */}
            <motion.div
              className="flex-1 min-h-0 flex flex-col gap-2"
              variants={cardListVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Linha 1: 2 colunas */}
              <div className="grid grid-cols-2 gap-2 h-full" style={{ flex: '2 1 0', minHeight: 0 }}>
                {likertOptions.slice(0, 2).map((opt) => (
                  <LikertCard key={opt.value} opt={opt} isSelected={selectedValue === opt.value}
                    showCheck={showCheck} onSelect={handleSelect} color={likertColors[opt.value]} />
                ))}
              </div>
              {/* Linha 2: 3 colunas */}
              <div className="grid grid-cols-3 gap-2 h-full" style={{ flex: '3 1 0', minHeight: 0 }}>
                {likertOptions.slice(2).map((opt) => (
                  <LikertCard key={opt.value} opt={opt} isSelected={selectedValue === opt.value}
                    showCheck={showCheck} onSelect={handleSelect} color={likertColors[opt.value]} />
                ))}
              </div>
            </motion.div>

            {/* Hint */}
            <AnimatePresence>
              {!selectedValue && (
                <motion.p className="text-center text-[10px] text-muted-foreground/40 font-display tracking-wide shrink-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}>
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
          <motion.div className="fixed inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none px-5"
            initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
            <div className="glass-strong rounded-2xl px-5 py-2.5 flex items-center gap-2.5 border border-primary/25" style={{ boxShadow: 'var(--glow-primary)' }}>
              <Trophy className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
              <p className="font-display font-bold text-sm text-foreground">{milestoneMsg}</p>
            </div>
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
      variants={cardItemVariants}
      onClick={() => onSelect(opt.value)}
      disabled={showCheck}
      whileHover={!showCheck ? { scale: 1.03 } : {}}
      whileTap={!showCheck ? { scale: 0.93 } : {}}
      animate={isSelected ? { scale: [1, 1.06, 1], transition: { type: 'spring', stiffness: 500, damping: 18 } } : { scale: 1 }}
      className="relative flex flex-col items-center justify-center gap-2 rounded-2xl focus:outline-none w-full h-full"
      style={{
        padding: '10px 6px',
        border: '1.5px solid',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.25s',
        ...(isSelected
          ? { background: color + '20', borderColor: color, boxShadow: `0 0 0 1px ${color}55, 0 0 18px ${color}35` }
          : { background: 'hsl(var(--card) / 0.55)', borderColor: 'hsl(var(--border) / 0.55)', backdropFilter: 'blur(14px)' }),
      }}
    >
      <motion.img
        src={likertImages[opt.value]}
        alt={opt.label}
        animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        style={{
          width: 44, height: 44, borderRadius: 10, objectFit: 'cover',
          filter: isSelected ? `drop-shadow(0 0 6px ${color}99)` : 'grayscale(0.3) brightness(0.85)',
          transition: 'filter 0.18s',
        }}
      />
      <span className="text-[9px] font-semibold text-center leading-tight font-display"
        style={{ color: isSelected ? color : 'hsl(var(--muted-foreground))', transition: 'color 0.18s' }}>
        {opt.label}
      </span>
      <AnimatePresence>
        {isSelected && showCheck && (
          <motion.div className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: color + '28' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <motion.div initial={{ scale: 0.2, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}>
              <CircleCheck size={28} strokeWidth={2} color={color} style={{ filter: `drop-shadow(0 0 8px ${color}99)` }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
