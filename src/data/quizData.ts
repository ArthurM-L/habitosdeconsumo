export interface Question {
  id: number;
  text: string;
  weights: {
    [groupId: string]: number;
  };
}

export interface Group {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  interpretation: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: 'Prefiro tomar decisões baseadas em dados e análises.',
    weights: { grupoA: 0.9, grupoB: 0.2, grupoC: 0.4 },
  },
  {
    id: 2,
    text: 'Gosto de experimentar coisas novas com frequência.',
    weights: { grupoA: 0.3, grupoB: 0.8, grupoC: 0.5 },
  },
  {
    id: 3,
    text: 'Me sinto confortável liderando equipes em situações de pressão.',
    weights: { grupoA: 0.7, grupoB: 0.5, grupoC: 0.2 },
  },
  {
    id: 4,
    text: 'Prefiro rotinas previsíveis a ambientes dinâmicos.',
    weights: { grupoA: 0.2, grupoB: 0.1, grupoC: 0.9 },
  },
  {
    id: 5,
    text: 'Tenho facilidade em comunicar ideias complexas de forma simples.',
    weights: { grupoA: 0.6, grupoB: 0.7, grupoC: 0.3 },
  },
  {
    id: 6,
    text: 'Busco constantemente aprender novas habilidades.',
    weights: { grupoA: 0.5, grupoB: 0.9, grupoC: 0.2 },
  },
  {
    id: 7,
    text: 'Priorizo estabilidade e segurança nas minhas escolhas.',
    weights: { grupoA: 0.2, grupoB: 0.1, grupoC: 0.8 },
  },
  {
    id: 8,
    text: 'Me energizo ao trabalhar em colaboração com outras pessoas.',
    weights: { grupoA: 0.4, grupoB: 0.6, grupoC: 0.5 },
  },
  {
    id: 9,
    text: 'Gosto de criar sistemas e processos para organizar o trabalho.',
    weights: { grupoA: 0.8, grupoB: 0.3, grupoC: 0.6 },
  },
  {
    id: 10,
    text: 'Prefiro agir rapidamente mesmo com informações incompletas.',
    weights: { grupoA: 0.3, grupoB: 0.9, grupoC: 0.1 },
  },
];

export const groups: Group[] = [
  {
    id: 'grupoA',
    name: 'Analítico',
    color: '#B4FF00',
    icon: '🧠',
    description:
      'Você toma decisões baseadas em lógica, dados e processos bem definidos. Seu perfil tende à precisão e organização.',
    interpretation:
      'Seu forte pensamento analítico é uma superpotência. Você encontra padrões onde outros veem caos, e transforma dados em decisões inteligentes. Ambientes estruturados onde a lógica prevalece são onde você mais brilha.',
  },
  {
    id: 'grupoB',
    name: 'Inovador',
    color: '#F59E0B',
    icon: '🚀',
    description:
      'Você prospera em ambientes dinâmicos, adora experimentar e se adapta rapidamente a mudanças.',
    interpretation:
      'Sua mente inovadora é um motor de criatividade. Você enxerga oportunidades onde outros veem obstáculos e tem coragem de testar o desconhecido. Ambientes em transformação e desafios inéditos são seu combustível natural.',
  },
  {
    id: 'grupoC',
    name: 'Executor',
    color: '#22D3A0',
    icon: '⚡',
    description:
      'Você valoriza estabilidade, consistência e entrega resultados de forma confiável e estruturada.',
    interpretation:
      'Sua confiabilidade é inestimável. Você é o pilar que sustenta equipes e projetos, entregando consistentemente e mantendo o foco no que importa. Onde outros hesitam, você age com clareza e determinação.',
  },
];

export const likertOptions = [
  { value: 1 as const, emoji: '😠', label: 'Discordo totalmente' },
  { value: 2 as const, emoji: '😕', label: 'Discordo' },
  { value: 3 as const, emoji: '😐', label: 'Neutro' },
  { value: 4 as const, emoji: '🙂', label: 'Concordo' },
  { value: 5 as const, emoji: '😄', label: 'Concordo totalmente' },
];

export function calculateResults(answers: { questionId: number; value: number }[]) {
  const groupIds = groups.map((g) => g.id);
  const scores: Record<string, number> = {};
  groupIds.forEach((id) => (scores[id] = 0));

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;
    for (const groupId of groupIds) {
      const weight = question.weights[groupId] ?? 0;
      scores[groupId] += answer.value * weight;
    }
  }

  const grandTotal = Object.values(scores).reduce((a, b) => a + b, 0);

  return groupIds.map((id) => ({
    groupId: id,
    score: scores[id],
    percentage: grandTotal > 0 ? Math.round((scores[id] / grandTotal) * 100) : 0,
  }));
}
