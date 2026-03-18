import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Share2, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuizStore } from '@/store/quizStore';
import { groups } from '@/data/quizData';
import { supabase } from '@/integrations/supabase/client';

function useCountUp(target: number, duration = 1200) {
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

const generationAlerts: Record<string, { icon: string; title: string; tip: string }> = {
  geracaoX: {
    icon: '🔐',
    title: 'Atenção: golpes por e-mail e WhatsApp',
    tip: 'Seu perfil demonstra alta cautela digital — ótimo! Reforce esse instinto: desconfie de links recebidos por e-mail ou mensagem, mesmo que pareçam vir de bancos ou marketplaces. Antes de clicar, acesse o site diretamente pelo navegador. Golpistas sabem que a Geração X valoriza segurança e exploram isso com páginas falsas muito convincentes.',
  },
  geracaoY: {
    icon: '💳',
    title: 'Atenção: o risco do superendividamento',
    tip: 'Millennials são a geração mais propensa ao superendividamento no Brasil. O acesso fácil ao crédito, combinado com estímulos constantes nas redes sociais, cria armadilhas invisíveis. Antes de parcelar, pergunte-se: "preciso disso agora ou estou comprando para me sentir melhor?" Regra prática: nunca comprometa mais de 30% da sua renda com parcelas.',
  },
  geracaoZ: {
    icon: '🛍️',
    title: 'Atenção: o Efeito Batom no seu bolso',
    tip: 'O "Efeito Batom" é real para o seu perfil: pequenas compras frequentes — R$20 aqui, R$35 ali — parecem inofensivas, mas somadas superam facilmente grandes gastos planejados. Rastreie seus micro-consumos por 30 dias usando qualquer app de finanças. O padrão que vai aparecer costuma surpreender — e mudar.',
  },
  geracaoAlpha: {
    icon: '🎮',
    title: 'Atenção: golpes dentro de jogos e apps',
    tip: 'Seu perfil é 100% nativo digital — mas isso também atrai golpistas especializados em plataformas. Desconfie de "itens grátis", sorteios dentro de jogos e links enviados por desconhecidos no chat. Nunca compartilhe dados de pagamento fora dos canais oficiais. Lembre-se: nenhuma empresa legítima pede sua senha ou código de verificação.',
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
        <p className="text-muted-foreground text-sm">Carregando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      <div className="px-4 pt-8 pb-32 max-w-md mx-auto space-y-3">

        {/* ── Greeting ── */}
        <motion.div
          className="text-center pb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-[11px] uppercase tracking-widest font-display mb-0.5">
            Seu resultado
          </p>
          <h1 className="font-display text-xl font-extrabold text-foreground">
            {userInfo?.name ? `Olá, ${userInfo.name.split(' ')[0]}! 🎉` : 'Perfil encontrado! 🎉'}
          </h1>
        </motion.div>

        {/* ── Hero: icon + percentage + name side by side ── */}
        <motion.div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: primaryGroup.color + '12',
            border: `1.5px solid ${primaryGroup.color}38`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {/* ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${primaryGroup.color}18, transparent 70%)` }} />

          <div className="relative z-10 flex items-center gap-4">
            {/* Icon + badge */}
            <motion.div
              className="shrink-0 flex flex-col items-center gap-1.5"
              initial={{ scale: 0.5, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 240 }}
            >
              <span className="text-[3.5rem] leading-none">{primaryGroup.icon}</span>
              {generationRanges[primaryGroup.id] && (
                <span
                  className="text-[9px] font-bold font-display px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: primaryGroup.color + '22', color: primaryGroup.color }}
                >
                  {generationRanges[primaryGroup.id]}
                </span>
              )}
            </motion.div>

            {/* Text + count-up */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-extrabold text-base leading-tight mb-0.5" style={{ color: primaryGroup.color }}>
                {primaryGroup.name}
              </h2>
              <PrimaryPercentage value={primary.percentage} color={primaryGroup.color} />
              <p className="text-muted-foreground text-[11px] leading-snug mt-1 line-clamp-3">
                {primaryGroup.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Chart + Secondary grid side by side ── */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Donut */}
          <div className="glass rounded-3xl p-3 flex flex-col">
            <p className="font-display font-bold text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">
              Distribuição
            </p>
            <div className="flex-1" style={{ height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive
                    animationBegin={350}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* legend */}
            <div className="flex flex-col gap-1 mt-2">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-[9px] text-muted-foreground leading-none">{d.name}</span>
                  <span className="ml-auto text-[9px] font-bold" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary cards stacked */}
          <div className="flex flex-col gap-2">
            <p className="font-display font-bold text-[10px] text-muted-foreground uppercase tracking-wider text-center">
              Outras gerações
            </p>
            {secondaries.map((r) => {
              const g = groups.find((gp) => gp.id === r.groupId);
              if (!g) return null;
              return (
                <div
                  key={r.groupId}
                  className="glass rounded-2xl px-3 py-2.5 flex items-center gap-2"
                  style={{ borderColor: g.color + '28' }}
                >
                  <span className="text-xl leading-none shrink-0">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[10px] text-foreground truncate">{g.name}</div>
                    <div className="font-extrabold text-sm leading-tight" style={{ color: g.color }}>{r.percentage}%</div>
                  </div>
                  {/* mini bar */}
                  <div className="w-10 h-1 rounded-full overflow-hidden shrink-0" style={{ background: 'hsl(var(--muted))' }}>
                    <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: g.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Interpretation ── */}
        <motion.div
          className="glass rounded-3xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-0.5 h-5 rounded-full gradient-bg shrink-0" />
            <h3 className="font-display font-bold text-sm text-foreground">O que isso significa?</h3>
          </div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">{primaryGroup.interpretation}</p>
        </motion.div>

      </div>

      {/* ── Pinned CTA ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3 z-20"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 70%, transparent)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex gap-2.5 max-w-md mx-auto">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl font-display font-bold text-sm glass border-border hover:border-primary/40 transition-all active:scale-95 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-bold text-sm gradient-bg text-primary-foreground transition-all active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Copiado!
                  </motion.span>
                : <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Compartilhar resultado
                  </motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PrimaryPercentage({ value, color }: { value: number; color: string }) {
  const count = useCountUp(value, 1200);
  return (
    <div className="font-display font-extrabold tabular-nums leading-none" style={{ color, fontSize: '2.6rem' }}>
      {count}<span style={{ fontSize: '1.4rem' }}>%</span>
    </div>
  );
}
