import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/quizStore';

const steps = [
  { msg: 'Analisando suas respostas...', emoji: '🔍' },
  { msg: 'Cruzando seu perfil...', emoji: '🧩' },
  { msg: 'Calculando similaridade...', emoji: '📊' },
  { msg: 'Quase pronto...', emoji: '✨' },
];

export default function Loading() {
  const navigate = useNavigate();
  const { phase, setPhase } = useQuizStore();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (phase === 'landing') { navigate('/'); return; }
    if (phase === 'results') { navigate('/results'); return; }
  }, [phase, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
    }, 650);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setPhase('results');
      navigate('/results');
    }, 2800);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [navigate, setPhase]);

  const current = steps[stepIndex];

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 gap-12">
      {/* Pulsing orb */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {[1, 0.6, 0.35].map((scale, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ background: 'hsl(var(--primary) / 0.15)' }}
            animate={{ scale: [scale, scale * 1.18, scale], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
          />
        ))}
        {/* SVG ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(77 100% 50%)" />
              <stop offset="100%" stopColor="hsl(120 80% 45%)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <motion.circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="276"
            strokeDashoffset="210"
            animate={{ strokeDashoffset: [210, 60, 210], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '50% 50%' }}
          />
        </svg>
        {/* Emoji */}
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            className="relative z-10 text-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {current.emoji}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Message */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            className="font-display font-bold text-xl text-foreground mb-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {current.msg}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-muted-foreground">Seu perfil está sendo calculado</p>
      </div>

      {/* Step dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            style={{ background: 'hsl(var(--primary))', opacity: i <= stepIndex ? 1 : 0.3 }}
            animate={{ width: i === stepIndex ? 24 : 8 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
