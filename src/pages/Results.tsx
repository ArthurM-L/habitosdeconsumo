import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Share2, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuizStore } from '@/store/quizStore';
import { groups } from '@/data/quizData';
import { supabase } from '@/integrations/supabase/client';

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function ResultPercentage({ value }: { value: number }) {
  const count = useCountUp(value, 1500);
  return <span>{count}%</span>;
}

export default function Results() {
  const navigate = useNavigate();
  const { results, answers, resetQuiz, phase } = useQuizStore();
  const [copied, setCopied] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (phase === 'landing') { navigate('/'); return; }
    if (phase === 'quiz') { navigate('/quiz'); return; }
  }, [phase, navigate]);

  // Save to Supabase
  useEffect(() => {
    if (!results.length || savedRef.current) return;
    savedRef.current = true;

    const saveSession = async () => {
      const scoresObj: Record<string, number> = {};
      results.forEach((r) => { scoresObj[r.groupId] = r.percentage; });

      const { data: session, error } = await supabase
        .from('quiz_sessions')
        .insert({ results: scoresObj })
        .select()
        .single();

      if (error || !session) return;

      if (answers.length > 0) {
        await supabase.from('quiz_answers').insert(
          answers.map((a) => ({
            session_id: session.id,
            question_id: a.questionId,
            answer_value: a.value,
          }))
        );
      }
    };

    saveSession();
  }, [results, answers]);

  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  const primary = sorted[0];
  const secondaries = sorted.slice(1);
  const primaryGroup = primary ? groups.find((g) => g.id === primary.groupId) : null;

  const chartData = sorted.map((r) => {
    const g = groups.find((gp) => gp.id === r.groupId);
    return { name: g?.name ?? r.groupId, value: r.percentage, color: g?.color ?? '#6366F1' };
  });

  const handleCopy = async () => {
    const text = `Meu perfil no Quiz: ${primaryGroup?.icon} ${primaryGroup?.name} (${primary?.percentage}%)\n${primaryGroup?.description}\n\nDescubra o seu também!`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    resetQuiz();
    navigate('/');
  };

  if (!primary || !primaryGroup) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <p className="text-muted-foreground">Carregando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-2">
            Seu perfil foi encontrado! 🎉
          </h1>
          <p className="text-muted-foreground">Veja como você se encaixa em cada categoria</p>
        </motion.div>

        {/* Primary result */}
        <motion.div
          className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 50% 50%, ${primaryGroup.color}, transparent 70%)` }}
          />
          <div className="relative z-10">
            <div className="text-6xl mb-3">{primaryGroup.icon}</div>
            <h2 className="font-display text-2xl font-bold mb-1">{primaryGroup.name}</h2>
            <div
              className="font-display text-7xl sm:text-8xl font-extrabold mb-3"
              style={{ color: primaryGroup.color }}
            >
              <ResultPercentage value={primary.percentage} />
            </div>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
              {primaryGroup.description}
            </p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="glass rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-display font-bold text-lg mb-4 text-center">Distribuição do seu perfil</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive
                  animationBegin={400}
                  animationDuration={1200}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                  formatter={(value: number) => [`${value}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-sm text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Secondary groups */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          {secondaries.map((r, i) => {
            const g = groups.find((gp) => gp.id === r.groupId);
            if (!g) return null;
            return (
              <div key={r.groupId} className="glass rounded-2xl p-4 text-center">
                <div className="text-3xl mb-1">{g.icon}</div>
                <div className="font-display font-bold text-sm mb-1">{g.name}</div>
                <div className="font-bold text-2xl" style={{ color: g.color }}>
                  {r.percentage}%
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Interpretation */}
        <motion.div
          className="glass rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-display font-bold text-lg mb-3">O que isso significa?</h3>
          <p className="text-muted-foreground leading-relaxed">{primaryGroup.interpretation}</p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold glass border-border hover:border-primary/50 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer Quiz
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold gradient-bg text-white transition-all hover:scale-105 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Compartilhar Resultado'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
