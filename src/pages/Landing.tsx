import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Clock } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';

const profiles = [
  { icon: '🧠', name: 'Analítico', color: 'hsl(77 100% 50%)' },
  { icon: '🚀', name: 'Inovador', color: 'hsl(38 92% 50%)' },
  { icon: '⚡', name: 'Executor', color: 'hsl(142 60% 42%)' },
];

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
    <div className="relative min-h-screen flex flex-col mesh-bg overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'hsl(77 100% 50%)' }} />
      <div className="absolute bottom-20 right-0 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'hsl(120 80% 45%)' }} />

      {/* Main content — scrollable area */}
      <div className="flex-1 flex flex-col justify-center px-5 pt-14 pb-36">

        {/* Top badge row */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs font-semibold text-primary">
            <Clock className="w-3 h-3" />
            ~3 min
          </div>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Zap className="w-3 h-3 text-warning" />
            10 perguntas
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="font-display text-[2.6rem] sm:text-5xl font-extrabold leading-[1.15] tracking-tight mb-4">
            Descubra qual <br />
            <span className="gradient-text">perfil profissional</span>
            <br />
            é o seu. 🎯
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Responda 10 perguntas e receba um perfil personalizado com base nas suas tendências reais.
          </p>
        </motion.div>

        {/* Profile preview cards */}
        <motion.div
          className="flex gap-3 mt-8 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {profiles.map((p, i) => (
            <motion.div
              key={p.name}
              className="flex-1 glass-strong rounded-2xl p-4 flex flex-col items-center gap-2 cursor-default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: p.color + '33' }}
              >
                {p.icon}
              </div>
              <span className="text-xs font-bold font-display text-foreground/80">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center gap-2 mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex -space-x-2">
            {['🧑', '👩', '🧑‍💼'].map((emoji, i) => (
              <div key={i} className="w-7 h-7 rounded-full glass-strong flex items-center justify-center text-sm border border-border/60">
                {emoji}
              </div>
            ))}
          </div>
          <span><span className="text-foreground font-semibold">+1.200</span> perfis descobertos</span>
        </motion.div>
      </div>

      {/* Pinned CTA at bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 60%, transparent)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <button
          onClick={handleStart}
          className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl font-display font-bold text-lg text-white gradient-bg animate-pulse-glow transition-all duration-200 active:scale-95 focus:outline-none shadow-2xl"
        >
          Descobrir meu perfil
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Gratuito · Sem cadastro · Resultado imediato
        </p>
      </motion.div>
    </div>
  );
}
