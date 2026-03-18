import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Share2, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuizStore } from '@/store/quizStore';
import { groups } from '@/data/quizData';
import { supabase } from '@/integrations/supabase/client';

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export default function Results() {
  const navigate = useNavigate();
  const { results, answers, resetQuiz, phase, userInfo } = useQuizStore();
  const [copied, setCopied] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (phase === 'landing') { navigate('/'); return; }
    if (phase === 'quiz') { navigate('/quiz'); return; }
  }, [phase, navigate]);

  // Save session
  useEffect(() => {
    if (!results.length || savedRef.current) return;
    savedRef.current = true;
    const save = async () => {
      const scoresObj: Record<string, number> = {};
      results.forEach((r) => { scoresObj[r.groupId] = r.percentage; });
      const { data: session, error } = await supabase
        .from('quiz_sessions').insert({ results: scoresObj }).select().single();
      if (error || !session) return;
      if (answers.length > 0) {
        await supabase.from('quiz_answers').insert(
          answers.map((a) => ({ session_id: session.id, question_id: a.questionId, answer_value: a.value }))
        );
      }
    };
    save();
  }, [results, answers]);

  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  const primary = sorted[0];
  const secondaries = sorted.slice(1);
  const primaryGroup = primary ? groups.find((g) => g.id === primary.groupId) : null;

  const chartData = sorted.map((r) => {
    const g = groups.find((gp) => gp.id === r.groupId);
    return { name: g?.name ?? r.groupId, value: r.percentage, color: g?.color ?? '#B4FF00' };
  });

  const handleCopy = async () => {
    const text = `Meu perfil: ${primaryGroup?.icon} ${primaryGroup?.name} (${primary?.percentage}%)\n${primaryGroup?.description}\n\nDescubra o seu também!`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => { resetQuiz(); navigate('/'); };

  if (!primary || !primaryGroup) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <p className="text-muted-foreground">Carregando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg px-4 py-8 pb-32">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground text-sm mb-1">Seu resultado</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            {userInfo?.name ? `Olá, ${userInfo.name.split(' ')[0]}! 🎉` : 'Perfil encontrado! 🎉'}
          </h1>
        </motion.div>

        {/* Primary card — hero */}
        <motion.div
          className="rounded-3xl p-6 mb-4 text-center relative overflow-hidden"
          style={{ background: primaryGroup.color + '18', border: `1.5px solid ${primaryGroup.color}44` }}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Glow spot */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 30%, ${primaryGroup.color}25, transparent 65%)` }} />

          <div className="relative z-10">
            {/* Big icon */}
            <motion.div
              className="text-7xl mb-3"
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              {primaryGroup.icon}
            </motion.div>

            <h2 className="font-display text-xl font-extrabold mb-1" style={{ color: primaryGroup.color }}>
              {primaryGroup.name}
            </h2>

            {/* Animated count-up */}
            <PrimaryPercentage value={primary.percentage} color={primaryGroup.color} />

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mt-3">
              {primaryGroup.description}
            </p>
          </div>
        </motion.div>

        {/* Donut chart */}
        <motion.div
          className="glass rounded-3xl p-5 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Distribuição do perfil
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={42} outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive
                  animationBegin={400}
                  animationDuration={1100}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: 13,
                  }}
                  formatter={(v: number) => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-5 mt-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Secondary groups — horizontal scroll */}
        <motion.div
          className="flex gap-3 mb-4 overflow-x-auto pb-1 scrollbar-none"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {secondaries.map((r) => {
            const g = groups.find((gp) => gp.id === r.groupId);
            if (!g) return null;
            return (
              <div
                key={r.groupId}
                className="shrink-0 glass rounded-2xl p-4 text-center w-32"
                style={{ borderColor: g.color + '33' }}
              >
                <div className="text-3xl mb-1">{g.icon}</div>
                <div className="font-display font-bold text-xs mb-1 text-foreground">{g.name}</div>
                <div className="font-bold text-xl" style={{ color: g.color }}>{r.percentage}%</div>
              </div>
            );
          })}
        </motion.div>

        {/* Interpretation */}
        <motion.div
          className="glass rounded-3xl p-5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full gradient-bg" />
            <h3 className="font-display font-bold text-sm text-foreground">O que isso significa?</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{primaryGroup.interpretation}</p>
        </motion.div>

      </div>

      {/* Pinned CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 60%, transparent)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-bold text-sm glass border-border hover:border-primary/50 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer
          </button>
          <button
            onClick={handleCopy}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-bold text-sm gradient-bg text-white transition-all active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2"><Check className="w-4 h-4" /> Copiado!</motion.span>
                : <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Compartilhar</motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PrimaryPercentage({ value, color }: { value: number; color: string }) {
  const count = useCountUp(value, 1400);
  return (
    <div className="font-display text-[5.5rem] leading-none font-extrabold tabular-nums" style={{ color }}>
      {count}<span className="text-4xl">%</span>
    </div>
  );
}
