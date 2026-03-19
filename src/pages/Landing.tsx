import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, Compass, Rocket, BatteryCharging, Globe } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import type { LucideIcon } from 'lucide-react';
import { avatar1, avatar2, avatar3 } from '@/assets/inlineImages';

const profiles: { icon: LucideIcon; name: string; color: string; sub: string }[] = [
  { icon: Compass,         name: 'Geração X',  color: 'hsl(38 92% 50%)',  sub: '1965–1980' },
  { icon: Rocket,          name: 'Millennial', color: 'hsl(77 100% 50%)', sub: '1981–1996' },
  { icon: BatteryCharging, name: 'Geração Z',  color: 'hsl(162 60% 48%)', sub: '1997–2012' },
  { icon: Globe,           name: 'Alpha',      color: 'hsl(265 80% 73%)', sub: '2013–hoje'  },
];

export default function Landing() {
  const navigate = useNavigate();
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const setPhase = useQuizStore((s) => s.setPhase);

  const handleStart = () => {
    resetQuiz();
    setPhase('intro');
    navigate('/intro');
  };

  return (
    <div className="relative h-screen flex flex-col mesh-bg overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'hsl(77 100% 50%)' }} />
      <div className="absolute bottom-20 right-0 w-48 h-48 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'hsl(120 80% 45%)' }} />

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-5 pt-4 pb-24 overflow-hidden">

        {/* Top badge row */}
        <motion.div
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Clock className="w-3 h-3" />
            ~3 min
          </div>
          <div className="flex items-center gap-1.5 glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            <Zap className="w-3 h-3 text-warning" />
            13 perguntas
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="mb-4"
        >
          <h1 className="font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight mb-2">
            Qual geração de<br />
            <span className="gradient-text">consumidor</span>
            <br />
            é você?
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Responda afirmações sobre seus hábitos de compra e descubra com qual geração você mais se identifica.
          </p>
        </motion.div>

        {/* Profile cards — horizontal list layout */}
        <motion.div
          className="grid grid-cols-2 gap-2 mb-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
        >
          {profiles.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.name}
                className="glass-strong rounded-xl p-2.5 flex items-center gap-2.5 cursor-default"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 + i * 0.06, type: 'spring', stiffness: 340, damping: 26 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: p.color + '20', border: `1px solid ${p.color}40` }}
                >
                  <Icon size={15} style={{ color: p.color }} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold font-display text-foreground/90 leading-tight truncate">{p.name}</div>
                  <div className="text-[10px] font-display text-muted-foreground/60">{p.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex -space-x-1.5">
            {[avatar1, avatar2, avatar3].map((src, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-border/60 overflow-hidden shrink-0">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span><span className="text-foreground font-semibold">+1.200</span> perfis descobertos</span>
        </motion.div>
      </div>

      {/* Pinned CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 65%, transparent)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <button
          onClick={handleStart}
          className="w-full group flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-display font-bold text-base text-primary-foreground gradient-bg animate-pulse-glow transition-all duration-200 active:scale-95 focus:outline-none"
        >
          Descobrir meu perfil
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-2">
          Gratuito · Sem cadastro · Resultado imediato
        </p>
      </motion.div>
    </div>
  );
}
