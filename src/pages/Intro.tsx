import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Calendar, ChevronLeft, Users } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { genderOptions } from '@/data/quizData';

type Step = 'name' | 'gender' | 'birthdate';
const STEPS: Step[] = ['name', 'gender', 'birthdate'];

const slideVariants = {
  enter: { x: 48, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -48, opacity: 0 },
};

const stepMeta: Record<Step, { icon: React.ElementType; label: string; title: string; number: string }> = {
  name:      { icon: User,     label: 'Identificação', title: 'Qual é o seu nome?',  number: '01' },
  gender:    { icon: Users,    label: 'Identidade',    title: 'Identidade de gênero', number: '02' },
  birthdate: { icon: Calendar, label: 'Nascimento',    title: 'Data de nascimento',   number: '03' },
};

export default function Intro() {
  const navigate = useNavigate();
  const { setUserInfo, setPhase } = useQuizStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nameError, setNameError] = useState('');
  const [bdError, setBdError] = useState('');

  const currentStep = STEPS[stepIndex];

  const validateName = () => {
    if (!name.trim() || name.trim().length < 2) { setNameError('Por favor, insira seu nome completo.'); return false; }
    setNameError(''); return true;
  };

  const validateBirthdate = () => {
    if (!birthdate) { setBdError('Por favor, informe sua data de nascimento.'); return false; }
    const parsed = new Date(birthdate);
    const now = new Date();
    if (isNaN(parsed.getTime())) { setBdError('Data inválida.'); return false; }
    if (parsed > now) { setBdError('A data não pode ser no futuro.'); return false; }
    if (now.getFullYear() - parsed.getFullYear() > 120) { setBdError('Por favor, insira uma data válida.'); return false; }
    setBdError(''); return true;
  };

  const handleNext = () => {
    if (currentStep === 'name' && !validateName()) return;
    if (currentStep === 'gender' && !gender) return;
    if (currentStep === 'birthdate') {
      if (birthdate && !validateBirthdate()) return;
      setUserInfo({ name: name.trim(), gender, birthdate });
      setPhase('quiz');
      navigate('/quiz');
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) { navigate('/'); return; }
    setStepIndex((i) => i - 1);
  };

  const canProceed =
    (currentStep === 'name' && name.trim().length >= 2) ||
    (currentStep === 'gender' && !!gender) ||
    currentStep === 'birthdate';

  return (
    <div className="h-screen mesh-bg flex flex-col overflow-hidden">

      {/* ── Header compacto ── */}
      <div className="shrink-0 px-4 pt-5 pb-2 max-w-lg mx-auto w-full">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3 active:opacity-60 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

        {/* Progress strip */}
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <motion.div key={i} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ scaleX: i <= stepIndex ? 1 : 0 }}
                initial={{ scaleX: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  transformOrigin: 'left',
                  background: i < stepIndex ? 'hsl(var(--primary) / 0.45)' : 'var(--gradient-progress)',
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Step chips */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const meta = stepMeta[s];
            const active = i === stepIndex;
            return (
              <motion.div
                key={s}
                animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.92 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-display font-semibold uppercase tracking-wider"
                style={{
                  background: active ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                  border: active ? '1px solid hsl(var(--primary) / 0.35)' : '1px solid transparent',
                  color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                }}
              >
                <meta.icon className="w-2.5 h-2.5" />
                {meta.label}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Content — expands to fill remaining space ── */}
      <div className="flex-1 flex flex-col px-4 pb-2 max-w-lg mx-auto w-full min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex flex-col flex-1 min-h-0"
          >
            {currentStep === 'name' && (
              <NameStep value={name} onChange={setName} error={nameError} onEnter={handleNext} />
            )}
            {currentStep === 'gender' && (
              <GenderStep value={gender} onChange={setGender} />
            )}
            {currentStep === 'birthdate' && (
              <BirthdateStep value={birthdate} onChange={setBirthdate} error={bdError} onEnter={handleNext} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CTA fixo no fundo ── */}
      <div className="shrink-0 px-4 pb-6 pt-2 max-w-lg mx-auto w-full">
        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-bold text-base transition-all duration-200 focus:outline-none"
          style={
            canProceed
              ? { background: 'var(--gradient-primary)', color: '#0B1A12', boxShadow: 'var(--glow-primary)' }
              : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
          }
        >
          {currentStep === 'birthdate' ? 'Iniciar quiz' : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// ── Shared step header ──
function StepHeader({ icon: Icon, number, title }: { icon: React.ElementType; number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.25)' }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: 'hsl(var(--primary))' }} />
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-display font-bold flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)', color: '#0B1A12' }}
        >
          {number}
        </span>
      </div>
      <h2 className="font-display text-lg font-extrabold text-foreground leading-tight">{title}</h2>
    </div>
  );
}

// ── Name step ──
function NameStep({ value, onChange, error, onEnter }: { value: string; onChange: (v: string) => void; error: string; onEnter: () => void }) {
  return (
    <div className="flex flex-col flex-1 pt-4">
      <StepHeader icon={User} number="01" title="Qual é o seu nome?" />

      {/* Card de contexto */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: 'hsl(var(--card) / 0.4)', border: '1px solid hsl(var(--border) / 0.3)' }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          Seu nome será usado para personalizar sua experiência no quiz. Nenhum dado é compartilhado.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          placeholder="Seu nome completo"
          autoFocus
          maxLength={120}
          className="w-full rounded-2xl px-4 py-3.5 font-display text-base font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all duration-200"
          style={{
            background: 'hsl(var(--card) / 0.6)',
            border: '1.5px solid hsl(var(--border) / 0.5)',
            backdropFilter: 'blur(12px)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary) / 0.7)')}
          onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border) / 0.5)')}
        />
        {value.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: 'hsl(var(--primary) / 0.15)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
          </motion.div>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 px-1" style={{ color: 'hsl(var(--destructive))' }}>
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ── Gender step ──
function GenderStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col flex-1 pt-4">
      <StepHeader icon={Users} number="02" title="Identidade de gênero" />
      <div className="flex flex-col gap-2.5 flex-1">
        {genderOptions.map((opt) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.975 }}
              className="w-full text-left px-4 py-3.5 rounded-2xl font-display font-semibold text-sm transition-all duration-200 focus:outline-none flex items-center gap-3 flex-1"
              style={
                selected
                  ? { background: 'hsl(var(--primary) / 0.12)', border: '1.5px solid hsl(var(--primary) / 0.7)', color: 'hsl(var(--primary))', boxShadow: '0 0 14px hsl(var(--primary) / 0.15)' }
                  : { background: 'hsl(var(--card) / 0.5)', border: '1.5px solid hsl(var(--border) / 0.4)', color: 'hsl(var(--foreground))', backdropFilter: 'blur(12px)' }
              }
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))', background: selected ? 'hsl(var(--primary))' : 'transparent' }}
              >
                {selected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full" style={{ background: '#0B1A12' }} />
                )}
              </div>
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Birthdate step ──
function BirthdateStep({ value, onChange, error, onEnter }: { value: string; onChange: (v: string) => void; error: string; onEnter: () => void }) {
  const maxDate = new Date().toISOString().split('T')[0];
  return (
    <div className="flex flex-col flex-1 pt-4">
      <StepHeader icon={Calendar} number="03" title="Data de nascimento" />

      {/* Card de contexto */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: 'hsl(var(--card) / 0.4)', border: '1px solid hsl(var(--border) / 0.3)' }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          Usamos sua data de nascimento para identificar sua geração. Este campo é opcional — seus dados não são compartilhados com terceiros.
        </p>
      </div>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        max={maxDate}
        autoFocus
        className="w-full rounded-2xl px-4 py-3.5 font-display text-base font-semibold text-foreground focus:outline-none transition-all duration-200 appearance-none"
        style={{ background: 'hsl(var(--card) / 0.6)', border: '1.5px solid hsl(var(--border) / 0.5)', backdropFilter: 'blur(12px)', colorScheme: 'dark' }}
        onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary) / 0.7)')}
        onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border) / 0.5)')}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 px-1" style={{ color: 'hsl(var(--destructive))' }}>
          {error}
        </motion.p>
      )}
    </div>
  );
}
