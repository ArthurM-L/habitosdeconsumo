import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, CircleCheck, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { questions, likertOptions, calculateResults } from '@/data/quizData';
import {
  concordo_totalmente, concordo, neutro, discordo, discordo_totalmente,
} from '@/assets/inlineImages';

const likertImages: Record<number, string> = {
  1: discordo_totalmente,
  2: discordo,
  3: neutro,
  4: concordo,
  5: concordo_totalmente,
};

const likertColors: Record<number, string> = {
  1: 'hsl(0 80% 58%)',
  2: 'hsl(22 90% 54%)',
  3: 'hsl(45 95% 52%)',
  4: 'hsl(77 100% 48%)',
  5: 'hsl(77 100% 52%)',
};

const milestoneMessages: Record<number, string> = {
  3: 'Ótimo ritmo — continue assim',
  5: 'Metade do caminho — arrasando',
  7: 'Quase lá — só mais 3',
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0, scale: 0.98 }),
};

const slideTransition = { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.85 };

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
  const [direction, setDirection] = useState(1);

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

  const finishQuiz = useCallback((lastValue: 1 | 2 | 3 | 4 | 5) => {
    const currentAnswers = useQuizStore.getState().answers;
    const allAnswers = [
      ...currentAnswers.filter((a) => a.questionId !== questions[currentQuestion].id),
      { questionId: questions[currentQuestion].id, value: lastValue },
    ];
    setResults(calculateResults(allAnswers));
    setPhase('loading');
    navigate('/loading');
  }, [currentQuestion, setResults, setPhase, navigate]);

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
        setMilestoneMsg(milestoneMessages[nextIdx]);
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2200);
      }

      setTimeout(() => {
        setShowXpPop(false);
        setShowCheck(false);
        if (nextIdx >= questions.length) {
          finishQuiz(value);
        } else {
          setDirection(1);
          setCurrentQuestion(nextIdx);
        }
      }, 650);
    },
    [currentQuestion, showCheck, addAnswer, incrementXP, incrementStreak, finishQuiz, setCurrentQuestion]
  );

  const handleBack = useCallback(() => {
    if (currentQuestion === 0) { navigate('/intro'); return; }
    setDirection(-1);
    setCurrentQuestion(currentQuestion - 1);
  }, [currentQuestion, navigate, setCurrentQuestion]);

  const handleSwipeAdvance = useCallback(() => {
    if (selectedValue && !showCheck) {
      // Trigger full selection flow
      handleSelect(selectedValue as 1 | 2 | 3 | 4 | 5);
    }
  }, [selectedValue, showCheck, handleSelect]);

  const question = questions[currentQuestion];
  const filledCount = currentQuestion + (showCheck ? 1 : 0);
  if (!question) return null;

  const progressPct = Math.round(((currentQuestion) / questions.length) * 100);

  return (
    <div className="h-screen mesh-bg flex flex-col overflow-hidden md:flex-row">

      {/* ── Desktop Left Panel ── */}
      <aside className="hidden md:flex md:w-80 lg:w-96 shrink-0 flex-col justify-between p-8 border-r"
        style={{ borderColor: 'hsl(var(--border) / 0.2)', background: 'hsl(var(--card) / 0.25)', backdropFilter: 'blur(20px)' }}>

        {/* Logo / Brand */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shrink-0"
              style={{ boxShadow: 'var(--glow-primary)' }}>
              <span className="text-[10px] font-extrabold font-display" style={{ color: 'hsl(var(--primary-foreground))' }}>HQ</span>
            </div>
            <span className="font-display font-extrabold text-sm text-foreground">Hábitos de Consumo</span>
          </div>

          {/* Question progress list */}
          <div className="space-y-2">
            {questions.map((q, i) => {
              const answered = answers.some(a => a.questionId === q.id);
              const isCurrent = i === currentQuestion;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-display font-bold transition-all duration-300"
                    style={
                      answered
                        ? { background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))', border: '1.5px solid hsl(var(--primary) / 0.6)' }
                        : isCurrent
                        ? { background: 'var(--gradient-primary)', color: 'hsl(var(--primary-foreground))', boxShadow: 'var(--glow-primary)' }
                        : { background: 'hsl(var(--muted) / 0.5)', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border) / 0.3)' }
                    }
                  >
                    {answered ? '✓' : i + 1}
                  </div>
                  <p
                    className="text-[11px] font-display font-medium leading-tight line-clamp-1 transition-all duration-200"
                    style={{ color: isCurrent ? 'hsl(var(--foreground))' : answered ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.5)' }}
                  >
                    {q.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress stats */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-wider">Progresso</span>
            <span className="text-[11px] font-display font-extrabold" style={{ color: 'hsl(var(--primary))' }}>{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ background: 'var(--gradient-progress)' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-display">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 fill-warning text-warning" />{xp} XP</span>
            {streak >= 3 && <span className="flex items-center gap-1"><Flame className="w-3 h-3 fill-warning text-warning" />{streak} sequência</span>}
          </div>
        </div>
      </aside>

      {/* ── Main Right Panel (mobile: full width, desktop: flex-1) ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Sticky Header ── */}
        <header
          className="sticky top-0 z-10 shrink-0 px-4 pt-4 pb-2 max-w-lg mx-auto w-full md:max-w-none md:px-6"
          style={{ backdropFilter: 'blur(16px)', background: 'hsl(var(--background) / 0.75)', borderBottom: '1px solid hsl(var(--border) / 0.15)' }}
        >
          <div className="flex items-center justify-between mb-2">
            {/* Back + question count */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-7 h-7 rounded-xl transition-all active:scale-90 hover:opacity-80"
                style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border) / 0.3)' }}
                aria-label="Voltar"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground font-display">Pergunta</span>
              <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
                {currentQuestion + 1}
                <span className="text-muted-foreground/40 font-semibold">/{questions.length}</span>
              </span>
            </div>

            {/* XP badge */}
            <div className="relative flex items-center gap-1.5 glass rounded-full px-3 py-1">
              <Zap className="w-3 h-3 fill-warning text-warning" />
              <span className="text-xs font-extrabold font-display text-foreground tabular-nums">{xp}</span>
              <AnimatePresence>
                {showXpPop && (
                  <motion.span
                    key={xpPopKey}
                    className="absolute -top-5 right-1 text-[10px] font-bold pointer-events-none font-display"
                    style={{ color: 'hsl(var(--warning))' }}
                    initial={{ y: 0, opacity: 1, scale: 0.9 }}
                    animate={{ y: -14, opacity: 0, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65 }}
                  >
                    +10
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-[3px] mb-1">
            {questions.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
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

          <AnimatePresence>
            {streak >= 3 && (
              <motion.div
                className="flex items-center gap-1 text-[10px] font-semibold font-display"
                style={{ color: 'hsl(var(--warning))' }}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              >
                <Flame className="w-3 h-3 fill-warning" />
                <span>{streak} em sequência</span>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Question + Cards ── */}
        <div className="flex-1 min-h-0 relative px-4 pb-3 max-w-lg mx-auto w-full md:max-w-none md:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) handleSwipeAdvance();
                if (info.offset.x > 60) handleBack();
              }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '4px 16px 12px',
                cursor: 'grab',
                touchAction: 'pan-y',
              }}
            >
              {/* Pergunta */}
              <div
                className="shrink-0 glass-strong rounded-2xl px-4 py-3 relative overflow-hidden"
                style={{ border: '1px solid hsl(var(--border) / 0.3)' }}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: 'hsl(var(--primary))' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center shrink-0"
                      style={{ boxShadow: '0 0 8px hsl(77 100% 50% / 0.35)' }}
                    >
                      <span className="text-[10px] font-extrabold font-display" style={{ color: 'hsl(var(--primary-foreground))' }}>
                        {currentQuestion + 1}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-border/30" />
                    {/* Swipe hint */}
                    <div className="flex items-center gap-0.5 text-muted-foreground/30">
                      <ChevronLeft className="w-3 h-3" />
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                  <h2 className="font-display text-[0.95rem] font-bold leading-snug text-foreground">
                    {question.text}
                  </h2>
                </div>
              </div>

              {/* Cards Likert — grade uniforme 2+3 */}
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Linha 1 — 2 cards */}
                <div style={{ flex: '0 0 42%', display: 'flex', gap: 8 }}>
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
                {/* Linha 2 — 3 cards */}
                <div style={{ flex: '0 0 calc(58% - 8px)', display: 'flex', gap: 8 }}>
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

              {/* Hint */}
              <AnimatePresence>
                {!selectedValue && (
                  <motion.p
                    className="shrink-0 text-center text-[10px] text-muted-foreground/40 font-display tracking-wide"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}
                  >
                    Toque em uma opção · deslize para navegar
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Milestone toast ── */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className="fixed inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none px-5"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <div
              className="glass-strong rounded-2xl px-5 py-2.5 flex items-center gap-2.5"
              style={{ border: '1px solid hsl(var(--primary) / 0.25)', boxShadow: 'var(--glow-primary)' }}
            >
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
      onClick={() => onSelect(opt.value)}
      disabled={showCheck}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-2xl focus:outline-none overflow-hidden"
      style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 6px 8px',
        border: '1.5px solid',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.22s',
        ...(isSelected
          ? {
              background: color + '22',
              borderColor: color,
              boxShadow: `0 0 0 1px ${color}44, 0 0 18px ${color}30`,
            }
          : {
              background: 'hsl(var(--card) / 0.55)',
              borderColor: 'hsl(var(--border) / 0.5)',
              backdropFilter: 'blur(14px)',
            }),
      }}
    >
      {/* Glow radial quando selecionado */}
      {isSelected && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${color}15, transparent 70%)`,
          }}
        />
      )}

      {/* Imagem */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <img
          src={likertImages[opt.value]}
          alt={opt.label}
          style={{
            maxWidth: '76%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            borderRadius: 8,
            objectFit: 'contain',
            filter: isSelected ? `drop-shadow(0 0 8px ${color}88)` : 'grayscale(0.25) brightness(0.82)',
            transition: 'filter 0.18s, transform 0.18s',
            transform: isSelected ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 'clamp(9px, 1.5vw, 11px)',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2,
          fontFamily: 'inherit',
          flexShrink: 0,
          position: 'relative', zIndex: 1,
          color: isSelected ? color : 'hsl(var(--muted-foreground))',
          transition: 'color 0.18s',
          padding: '0 2px',
          maxWidth: '100%',
        }}
      >
        {opt.label}
      </span>

      {/* Check overlay */}
      <AnimatePresence>
        {isSelected && showCheck && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: color + '28' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}
            >
              <CircleCheck size={28} strokeWidth={2} color={color} style={{ filter: `drop-shadow(0 0 8px ${color}99)` }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
