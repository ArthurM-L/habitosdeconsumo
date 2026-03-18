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

export interface UserInfo {
  name: string;
  gender: string;
  birthdate: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: 'Realizo compras pela internet com frequência.',
    weights: { digital: 0.9, seguranca: 0.2, impulso: 0.3 },
  },
  {
    id: 2,
    text: 'Evito realizar compras online por receio de fraudes ou golpes digitais.',
    weights: { digital: 0.1, seguranca: 0.9, impulso: 0.1 },
  },
  {
    id: 3,
    text: 'Descubro novos produtos e serviços principalmente por meio de canais digitais (redes sociais, anúncios, sites especializados).',
    weights: { digital: 0.8, seguranca: 0.3, impulso: 0.5 },
  },
  {
    id: 4,
    text: 'Prefiro métodos de pagamento eletrônicos (cartão de crédito/débito ou carteiras digitais) ao realizar compras online.',
    weights: { digital: 0.8, seguranca: 0.4, impulso: 0.3 },
  },
  {
    id: 5,
    text: 'As avaliações de outros consumidores influenciam minha decisão de compra online.',
    weights: { digital: 0.5, seguranca: 0.7, impulso: 0.4 },
  },
  {
    id: 6,
    text: 'A presença de selos de segurança ou certificações em um site aumenta minha confiança ao comprar.',
    weights: { digital: 0.3, seguranca: 0.9, impulso: 0.1 },
  },
  {
    id: 7,
    text: 'Promoções temporárias, cupons ou ofertas relâmpago influenciam minha decisão de compra.',
    weights: { digital: 0.5, seguranca: 0.2, impulso: 0.8 },
  },
  {
    id: 8,
    text: 'Tenho tendência a realizar compras por impulso, sem planejamento prévio.',
    weights: { digital: 0.3, seguranca: 0.1, impulso: 0.9 },
  },
  {
    id: 9,
    text: 'Utilizo o celular como principal dispositivo para realizar compras online (em sites ou aplicativos).',
    weights: { digital: 0.9, seguranca: 0.3, impulso: 0.4 },
  },
  {
    id: 10,
    text: 'Prefiro comprar em marketplaces consolidados (como Amazon ou Mercado Livre) a comprar diretamente em lojas virtuais independentes.',
    weights: { digital: 0.6, seguranca: 0.8, impulso: 0.3 },
  },
];

export const groups: Group[] = [
  {
    id: 'digital',
    name: 'Consumidor Digital',
    color: '#B4FF00',
    icon: '📱',
    description:
      'Você é um consumidor nativo digital — confortável com tecnologia, ativo em canais online e aberto a novas plataformas de compra.',
    interpretation:
      'Sua fluidez no ambiente digital é uma vantagem competitiva. Você navega com naturalidade entre apps, marketplaces e redes sociais para descobrir e adquirir produtos, aproveitando ao máximo as conveniências do comércio eletrônico.',
  },
  {
    id: 'seguranca',
    name: 'Consumidor Cauteloso',
    color: '#F59E0B',
    icon: '🛡️',
    description:
      'Você prioriza segurança e confiança nas suas decisões de compra, valorizando avaliações, selos e reputação das plataformas.',
    interpretation:
      'Sua cautela é um diferencial importante. Você pesquisa antes de comprar, verifica a credibilidade dos vendedores e evita riscos desnecessários — um comportamento que resulta em compras mais satisfatórias e seguras.',
  },
  {
    id: 'impulso',
    name: 'Consumidor Impulsivo',
    color: '#22D3A0',
    icon: '⚡',
    description:
      'Você responde rapidamente a estímulos como promoções, ofertas relâmpago e novidades, agindo com agilidade nas decisões de compra.',
    interpretation:
      'Sua disposição para aproveitar oportunidades em tempo real coloca você na vanguarda das tendências de consumo. Promoções e lançamentos têm forte apelo para o seu perfil, tornando suas compras dinâmicas e orientadas ao momento.',
  },
];

export const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'nao-binario', label: 'Não-binário' },
  { value: 'prefiro-nao-dizer', label: 'Prefiro não dizer' },
  { value: 'outro', label: 'Outro' },
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
