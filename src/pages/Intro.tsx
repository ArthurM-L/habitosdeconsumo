import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Calendar, ChevronDown } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { genderOptions } from '@/data/quizData';

type Step = 'name' | 'gender' | 'birthdate';
const STEPS: Step[] = ['name', 'gender', 'birthdate'];

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
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
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Por favor, insira seu nome completo.');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateBirthdate = () => {
    if (!birthdate) { setBdError('Por favor, informe sua data de nascimento.'); return false; }
    const parsed = new Date(birthdate);
    const now = new Date();
    if (isNaN(parsed.getTime())) { setBdError('Data inválida.'); return false; }
    if (parsed > now) { setBdError('A data não pode ser no futuro.'); return false; }
    const age = now.getFullYear() - parsed.getFullYear();
    if (age > 120) { setBdError('Por favor, insira uma data válida.'); return false; }
    setBdError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'name' && !validateName()) return;
    if (currentStep === 'gender' && !gender) return;
    if (currentStep === 'birthdate') {
      if (!validateBirthdate()) return;
      // All done — save and go to quiz
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
    (currentStep === 'birthdate' && !!birthdate);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-5 pt-12 pb-4 max-w-lg mx-auto w-full">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 active:opacity-60"
        >
          <ChevronDown className="w-3.5 h-3.5 rotate-90" />
          Voltar
        </button>

        {/* Progress dots */}
        <div className="flex gap-2 mb-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ background: 'hsl(var(--muted))' }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ scaleX: i <= stepIndex ? 1 : 0 }}
                initial={{ scaleX: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: 'left', background: 'var(--gradient-progress)' }}
              />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-display">
          Passo {stepIndex + 1} de {STEPS.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {currentStep === 'name' && (
              <NameStep
                value={name}
                onChange={setName}
                error={nameError}
                onEnter={handleNext}
              />
            )}
            {currentStep === 'gender' && (
              <GenderStep value={gender} onChange={setGender} />
            )}
            {currentStep === 'birthdate' && (
              <BirthdateStep
                value={birthdate}
                onChange={setBirthdate}
                error={bdError}
                onEnter={handleNext}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        className="shrink-0 px-5 pb-10 pt-4 max-w-lg mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-base transition-all duration-200 focus:outline-none"
          style={
            canProceed
              ? { background: 'var(--gradient-primary)', color: '#0B1A12', boxShadow: 'var(--glow-primary)' }
              : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
          }
        >
          {currentStep === 'birthdate' ? 'Iniciar quiz' : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}

// ── Sub-steps ──

function NameStep({
  value, onChange, error, onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string;
  onEnter: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
          <User className="w-5 h-5 text-background" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Pergunta 1</p>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Qual é o seu nome?</h2>
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        placeholder="Seu nome completo"
        autoFocus
        maxLength={120}
        className="w-full rounded-2xl px-5 py-4 font-display text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200"
        style={{
          background: 'hsl(var(--card) / 0.6)',
          border: '1.5px solid hsl(var(--border) / 0.6)',
          backdropFilter: 'blur(12px)',
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = 'hsl(var(--primary) / 0.8)')
        }
        onBlur={(e) =>
          (e.target.style.borderColor = 'hsl(var(--border) / 0.6)')
        }
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-2 px-1"
          style={{ color: 'hsl(var(--destructive))' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function GenderStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
          <span className="text-xl">🏳️‍🌈</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Pergunta 2</p>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Identidade de gênero</h2>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {genderOptions.map((opt) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.97 }}
              className="w-full text-left px-5 py-4 rounded-2xl font-display font-semibold text-base transition-all duration-200 focus:outline-none"
              style={
                selected
                  ? {
                      background: 'hsl(var(--primary) / 0.15)',
                      border: '1.5px solid hsl(var(--primary))',
                      color: 'hsl(var(--primary))',
                      boxShadow: 'var(--glow-primary)',
                    }
                  : {
                      background: 'hsl(var(--card) / 0.5)',
                      border: '1.5px solid hsl(var(--border) / 0.5)',
                      color: 'hsl(var(--foreground))',
                      backdropFilter: 'blur(12px)',
                    }
              }
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function BirthdateStep({
  value, onChange, error, onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string;
  onEnter: () => void;
}) {
  const maxDate = new Date().toISOString().split('T')[0];
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-background" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Pergunta 3</p>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Data de nascimento</h2>
        </div>
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        max={maxDate}
        autoFocus
        className="w-full rounded-2xl px-5 py-4 font-display text-lg font-semibold text-foreground focus:outline-none transition-all duration-200 appearance-none"
        style={{
          background: 'hsl(var(--card) / 0.6)',
          border: '1.5px solid hsl(var(--border) / 0.6)',
          backdropFilter: 'blur(12px)',
          colorScheme: 'dark',
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = 'hsl(var(--primary) / 0.8)')
        }
        onBlur={(e) =>
          (e.target.style.borderColor = 'hsl(var(--border) / 0.6)')
        }
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-2 px-1"
          style={{ color: 'hsl(var(--destructive))' }}
        >
          {error}
        </motion.p>
      )}
      <p className="text-xs text-muted-foreground mt-3 px-1">
        Sua data de nascimento não será compartilhada com terceiros.
      </p>
    </div>
  );
}
