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

const generationRanges: Record<string, string> = {
  geracaoX: '1965 – 1980',
  geracaoY: '1981 – 1996',
  geracaoZ: '1997 – 2012',
  geracaoAlpha: '2012 – 2025',
};

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionPayload: any = {
        results: scoresObj,
        user_name: userInfo?.name ?? null,
        user_gender: userInfo?.gender ?? null,
        user_birthdate: userInfo?.birthdate ?? null,
      };

      const { data: session, error } = await supabase
        .from('quiz_sessions')
        .insert(sessionPayload)
        .select()
        .single();

      if (error || !session) return;
      if (answers.length > 0) {
        await supabase.from('quiz_answers').insert(
          answers.map((a) => ({ session_id: session.id, question_id: a.questionId, answer_value: a.value }))
        );
      }
    };
    save();
  }, [results, answers, userInfo]);

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
    <div className="min-h-screen mesh-bg px-4 pt-6 pb-32">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-muted-foreground text-xs mb-0.5 uppercase tracking-widest font-display">Seu resultado</p>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold">
            {userInfo?.name ? `Olá, ${userInfo.name.split(' ')[0]}! 🎉` : 'Perfil encontrado! 🎉'}
          </h1>
        </motion.div>

        {/* Primary hero card */}
        <motion.div
          className="rounded-3xl p-5 text-center relative overflow-hidden"
          style={{ background: primaryGroup.color + '14', border: `1.5px solid ${primaryGroup.color}40` }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 20%, ${primaryGroup.color}20, transparent 65%)` }} />

          <div className="relative z-10">
            <motion.div
              className="text-6xl mb-2"
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.28, type: 'spring', stiffness: 220 }}
            >
              {primaryGroup.icon}
            </motion.div>

            <h2 className="font-display text-lg font-extrabold mb-1" style={{ color: primaryGroup.color }}>
              {primaryGroup.name}
            </h2>

            {generationRanges[primaryGroup.id] && (
              <span
                className="inline-block text-xs font-semibold font-display px-3 py-0.5 rounded-full mb-1"
                style={{ background: primaryGroup.color + '20', color: primaryGroup.color }}
              >
                {generationRanges[primaryGroup.id]}
              </span>
            )}

            <PrimaryPercentage value={primary.percentage} color={primaryGroup.color} />

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mt-2">
              {primaryGroup.description}
            </p>
          </div>
        </motion.div>

        {/* Secondary groups — 2-column grid, no horizontal scroll */}
        {secondaries.length > 0 && (
          <motion.div
            className="grid grid-cols-3 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {secondaries.map((r) => {
              const g = groups.find((gp) => gp.id === r.groupId);
              if (!g) return null;
              return (
                <div
                  key={r.groupId}
                  className="glass rounded-2xl p-3 text-center"
                  style={{ borderColor: g.color + '30' }}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="font-display font-bold text-[11px] mb-0.5 text-foreground leading-tight">{g.name}</div>
                  <div className="font-bold text-base" style={{ color: g.color }}>{r.percentage}%</div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Donut chart */}
        <motion.div
          className="glass rounded-3xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <h3 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">
            Distribuição do perfil
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={38} outerRadius={60}
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
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend — wrap to avoid overflow */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interpretation */}
        <motion.div
          className="glass rounded-3xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full gradient-bg shrink-0" />
            <h3 className="font-display font-bold text-sm text-foreground">O que isso significa?</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{primaryGroup.interpretation}</p>
        </motion.div>

      </div>

      {/* Pinned CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 65%, transparent)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm glass border-border hover:border-primary/50 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer
          </button>
          <button
            onClick={handleCopy}
            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm gradient-bg text-primary-foreground transition-all active:scale-95"
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
    <div className="font-display text-[4.5rem] leading-none font-extrabold tabular-nums mt-1" style={{ color }}>
      {count}<span className="text-3xl">%</span>
    </div>
  );
}
