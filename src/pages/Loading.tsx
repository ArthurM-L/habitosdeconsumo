import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/quizStore';

const messages = [
  'Analisando suas respostas...',
  'Cruzando seu perfil...',
  'Calculando similaridade...',
  'Finalizando resultados...',
];

export default function Loading() {
  const navigate = useNavigate();
  const { phase, setPhase } = useQuizStore();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (phase === 'landing') { navigate('/'); return; }
    if (phase === 'results') { navigate('/results'); return; }
  }, [phase, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i < messages.length - 1 ? i + 1 : i));
    }, 700);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setPhase('results');
      navigate('/results');
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, setPhase]);

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center gap-10 px-4">
      {/* Spinning loader */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(243 75% 63%)" />
              <stop offset="100%" stopColor="hsl(330 80% 65%)" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          {/* Animated arc */}
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="url(#loaderGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="264"
            strokeDashoffset="200"
            style={{ transformOrigin: '50% 50%' }}
            animate={{ rotate: 360, strokeDashoffset: [200, 60, 200] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          🧬
        </div>
      </div>

      {/* Cycling text */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="font-display font-semibold text-xl text-foreground text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
