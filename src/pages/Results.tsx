import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Share2, Check, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuizStore } from '@/store/quizStore';
import { groups } from '@/data/quizData';
import { supabase } from '@/integrations/supabase/client';

// ── Confetti canvas ──
function ConfettiCanvas({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parse the hex color and derive palette
    const palette = [color, '#B4FF00', '#ffffff', '#FAFF00', '#00FFB3', '#FF6BFF'];

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number;
      rotSpeed: number; shape: 'rect' | 'circle' | 'line';
      opacity: number;
    };

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 160,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 2.5 + Math.random() * 4,
      size: 5 + Math.random() * 8,
      color: palette[Math.floor(Math.random() * palette.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.18,
      shape: (['rect', 'circle', 'line'] as const)[Math.floor(Math.random() * 3)],
      opacity: 0.85 + Math.random() * 0.15,
    }));

    let raf: number;
    let startTime: number | null = null;
    const duration = 3200;

    const draw = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy += 0.06; // gravity
        p.opacity = Math.max(0, p.opacity - (progress > 0.6 ? 0.012 : 0));

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, 0);
          ctx.lineTo(p.size / 2, 0);
          ctx.stroke();
        }
        ctx.restore();
      });

      if (progress < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function useCountUp(target: number, duration = 1000) {
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
  geracaoX: '1965–1980',
  geracaoY: '1981–1996',
  geracaoZ: '1997–2012',
  geracaoAlpha: '2012–2025',
};

const generationAlerts: Record<string, { title: string; tip: string }> = {
  geracaoX: {
    title: 'Atenção: golpes por e-mail e WhatsApp',
    tip: 'Desconfie de links recebidos por mensagem, mesmo que pareçam vir de bancos. Antes de clicar, acesse o site diretamente pelo navegador.',
  },
  geracaoY: {
    title: 'Atenção: risco de superendividamento',
    tip: 'Millennials são os mais propensos ao superendividamento. Regra prática: nunca comprometa mais de 30% da renda com parcelas.',
  },
  geracaoZ: {
    title: 'Atenção: o Efeito Batom no seu bolso',
    tip: 'Pequenas compras frequentes somadas superam grandes gastos. Rastreie seus micro-consumos por 30 dias — o padrão costuma surpreender.',
  },
  geracaoAlpha: {
    title: 'Atenção: golpes dentro de jogos e apps',
    tip: 'Desconfie de itens grátis, sorteios em jogos e links de desconhecidos. Nunca compartilhe dados de pagamento fora dos canais oficiais.',
  },
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
        .from('quiz_sessions').insert(sessionPayload).select().single();
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
    const text = `Meu perfil: ${primaryGroup?.name} (${primary?.percentage}%)\n${primaryGroup?.description}\n\nDescubra o seu também!`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => { resetQuiz(); navigate('/'); };

  if (!primary || !primaryGroup) {
    return (
      <div className="h-screen mesh-bg flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando resultados...</p>
      </div>
    );
  }

  const alert = generationAlerts[primaryGroup.id];

  return (
    <div className="h-screen mesh-bg flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 max-w-md mx-auto w-full">

        {/* Greeting */}
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-display mb-0.5">Seu resultado</p>
          <h1 className="font-display text-lg font-extrabold text-foreground">
            {userInfo?.name ? `Olá, ${userInfo.name.split(' ')[0]}!` : 'Perfil encontrado!'}
          </h1>
        </motion.div>

        {/* Hero card */}
        <motion.div
          className="rounded-2xl p-4 relative overflow-hidden mb-3"
          style={{ background: primaryGroup.color + '12', border: `1.5px solid ${primaryGroup.color}38` }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${primaryGroup.color}15, transparent 70%)` }} />
          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              className="shrink-0 flex flex-col items-center gap-1"
              initial={{ scale: 0.5, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 240 }}
            >
              <span className="text-[2.8rem] leading-none">{primaryGroup.icon}</span>
              {generationRanges[primaryGroup.id] && (
                <span className="text-[9px] font-bold font-display px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: primaryGroup.color + '22', color: primaryGroup.color }}>
                  {generationRanges[primaryGroup.id]}
                </span>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-extrabold text-sm leading-tight mb-0.5" style={{ color: primaryGroup.color }}>
                {primaryGroup.name}
              </h2>
              <PrimaryPercentage value={primary.percentage} color={primaryGroup.color} />
              <p className="text-muted-foreground text-[11px] leading-snug mt-0.5 line-clamp-2">
                {primaryGroup.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chart + secondaries */}
        <motion.div
          className="grid grid-cols-2 gap-2.5 mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Donut */}
          <div className="glass rounded-2xl p-2.5 flex flex-col">
            <p className="font-display font-bold text-[9px] text-muted-foreground uppercase tracking-wider text-center mb-1.5">
              Distribuição
            </p>
            <div style={{ height: 90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={26} outerRadius={40}
                    paddingAngle={3} dataKey="value" isAnimationActive animationBegin={300} animationDuration={900}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 10 }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-0.5 mt-1.5">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-[9px] text-muted-foreground leading-none truncate">{d.name}</span>
                  <span className="ml-auto text-[9px] font-bold shrink-0" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary cards */}
          <div className="flex flex-col gap-1.5">
            <p className="font-display font-bold text-[9px] text-muted-foreground uppercase tracking-wider text-center">
              Outras gerações
            </p>
            {secondaries.map((r) => {
              const g = groups.find((gp) => gp.id === r.groupId);
              if (!g) return null;
              return (
                <div key={r.groupId} className="glass rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                  <span className="text-base leading-none shrink-0">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[9px] text-foreground truncate">{g.name}</div>
                    <div className="font-extrabold text-xs leading-tight" style={{ color: g.color }}>{r.percentage}%</div>
                  </div>
                  <div className="w-8 h-1 rounded-full overflow-hidden shrink-0" style={{ background: 'hsl(var(--muted))' }}>
                    <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: g.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Interpretation */}
        <motion.div
          className="glass rounded-2xl p-3.5 mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-0.5 h-4 rounded-full gradient-bg shrink-0" />
            <h3 className="font-display font-bold text-xs text-foreground">O que isso significa?</h3>
          </div>
          <p className="text-muted-foreground text-[12px] leading-relaxed">{primaryGroup.interpretation}</p>
        </motion.div>

        {/* Alert card */}
        {alert && (
          <motion.div
            className="rounded-2xl p-3.5 relative overflow-hidden"
            style={{ background: 'hsl(var(--warning) / 0.08)', border: '1.5px solid hsl(var(--warning) / 0.28)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--warning) / 0.06), transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
                <h3 className="font-display font-bold text-xs" style={{ color: 'hsl(var(--warning))' }}>{alert.title}</h3>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--foreground) / 0.75)' }}>{alert.tip}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pinned CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 70%, transparent)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-display font-bold text-sm glass border-border hover:border-primary/40 transition-all active:scale-95 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refazer
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm gradient-bg text-primary-foreground transition-all active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Copiado!</motion.span>
                : <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Compartilhar resultado</motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PrimaryPercentage({ value, color }: { value: number; color: string }) {
  const count = useCountUp(value, 1000);
  return (
    <div className="font-display font-extrabold tabular-nums leading-none" style={{ color, fontSize: '2.2rem' }}>
      {count}<span style={{ fontSize: '1.1rem' }}>%</span>
    </div>
  );
}
