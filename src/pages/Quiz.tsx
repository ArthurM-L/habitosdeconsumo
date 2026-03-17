import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { questions, likertOptions, calculateResults } from '@/data/quizData';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const motivationalMessages: Record<number, string> = {
  3: 'Ótimo ritmo! Continue assim 🔥',
  5: 'Metade do caminho! Continue assim 💪',
  7: 'Quase lá! Você está indo muito bem ⭐',
};

export default function Quiz() {
  const navigate = useNavigate();
  const {
    currentQuestion,
    answers,
    xp,
    streak,
    phase,
    setCurrentQuestion,
    addAnswer,
    incrementXP,
    incrementStreak,
    setResults,
    setPhase,
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
          const computed = calculateResults(allAnswers);
          setResults(computed);
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
  const progress = (currentQuestion / questions.length) * 100;
  const progressAfter = ((currentQuestion + 1) / questions.length) * 100;

  if (!question) return null;

  return (
    <div className="min-h-screen mesh-bg flex flex-col px-4 pt-6 pb-8">
      {/* Top HUD */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground font-display">
            Pergunta{' '}
            <span className="text-foreground font-bold">{currentQuestion + 1}</span>
            {' '}de {questions.length}
          </span>

          <div className="relative flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-sm font-bold font-display text-foreground">{xp} XP</span>
            <AnimatePresence>
              {showXpPop && (
                <motion.span
                  key={xpPopKey}
                  className="absolute -top-6 right-0 text-xs font-bold text-warning"
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -20, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  +10
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'var(--gradient-progress)' }}
            initial={{ width: `${progress}%` }}
            animate={{ width: `${showCheck ? progressAfter : progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence>
          {streak >= 3 && (
            <motion.div
              className="flex items-center gap-1 text-xs text-warning font-medium mb-2"
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

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full py-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
              <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 mb-4">
                <span className="text-xs font-bold text-primary font-display">
                  #{currentQuestion + 1}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-foreground">
                {question.text}
              </h2>
            </div>

            {/* Likert Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {likertOptions.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    disabled={showCheck}
                    whileHover={!showCheck ? { y: -4, scale: 1.03 } : {}}
                    whileTap={!showCheck ? { scale: 0.95 } : {}}
                    className={[
                      'relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 sm:p-3 cursor-pointer transition-all duration-200 border focus:outline-none',
                      isSelected
                        ? 'gradient-bg border-transparent glow-primary text-white shadow-lg scale-[1.03]'
                        : 'glass border-border/50 text-foreground hover:border-primary/50 hover:shadow-lg',
                    ].join(' ')}
                  >
                    <span className="text-2xl sm:text-xl leading-none">{opt.emoji}</span>
                    <span className="text-xs font-medium text-center leading-tight">
                      {opt.label}
                    </span>
                    {isSelected && showCheck && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <span className="text-2xl">✅</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Milestone modal */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-strong rounded-2xl px-8 py-5 text-center max-w-xs"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <p className="font-display font-bold text-lg text-foreground">{milestoneMsg}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
