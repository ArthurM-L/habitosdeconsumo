import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';

export default function Landing() {
  const navigate = useNavigate();
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const setPhase = useQuizStore((s) => s.setPhase);

  const handleStart = () => {
    resetQuiz();
    setPhase('quiz');
    navigate('/quiz');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center mesh-bg overflow-hidden px-4">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Time badge */}
        <motion.div
          className="flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-muted-foreground"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Clock className="w-4 h-4 text-primary" />
          <span>~3 minutos</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Descubra seu{' '}
          <span className="gradient-text">perfil</span>
          <br />
          em menos de 3 minutos
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Responda 10 perguntas e descubra qual perfil profissional mais combina com você — Analítico, Inovador ou Executor.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="w-full sm:w-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleStart}
            className="relative w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-lg text-white gradient-bg animate-pulse-glow transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
          >
            Iniciar Quiz
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center gap-2 mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Users className="w-4 h-4" />
          <span>Mais de 1.200 pessoas já descobriram seu perfil</span>
        </motion.div>
      </motion.div>

      {/* Floating decoration */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </div>
  );
}
