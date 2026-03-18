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

/**
 * Grupos = 4 perfis geracionais de consumo
 * Os pesos de cada questão refletem quão fortemente
 * cada resposta "alta" (concordo/concordo totalmente)
 * identifica o respondente com cada geração.
 *
 * Baseado em: Pesquisa de Hábitos de Consumo por Geração
 * (Conversion/Mlabs 2025, Cielo/Expertise 2025, Skytef 2024, Sebrae 2024)
 *
 * Q1  – Compras online com frequência       → Z↑ Y↑ X~ Alpha~
 * Q2  – Evita online por medo de fraudes    → X↑ Alpha~ (cautela)
 * Q3  – Descobre produtos por canais dig.   → Z↑ Y↑ Alpha↑
 * Q4  – Preferência por pagamentos elet.    → Y↑ Z↑ Alpha↑
 * Q5  – Avaliações influenciam decisão      → X↑ Y↑
 * Q6  – Selos de segurança aumentam conf.   → X↑ Y~
 * Q7  – Promoções/cupons influenciam        → Y↑ Z↑
 * Q8  – Compras por impulso                 → Z↑ Alpha↑
 * Q9  – Celular como dispositivo principal  → Z↑ Alpha↑ Y~
 * Q10 – Prefere marketplaces consolidados   → X↑ Y↑
 */
export const questions: Question[] = [
  {
    id: 1,
    text: 'Realizo compras pela internet com frequência.',
    weights: { geracaoX: 0.4, geracaoY: 0.7, geracaoZ: 0.9, geracaoAlpha: 0.6 },
  },
  {
    id: 2,
    text: 'Evito realizar compras online por receio de fraudes ou golpes digitais.',
    weights: { geracaoX: 0.9, geracaoY: 0.4, geracaoZ: 0.2, geracaoAlpha: 0.5 },
  },
  {
    id: 3,
    text: 'Descubro novos produtos e serviços principalmente por meio de canais digitais (redes sociais, anúncios, sites especializados).',
    weights: { geracaoX: 0.3, geracaoY: 0.7, geracaoZ: 0.9, geracaoAlpha: 0.9 },
  },
  {
    id: 4,
    text: 'Prefiro métodos de pagamento eletrônicos (cartão de crédito/débito ou carteiras digitais) ao realizar compras online.',
    weights: { geracaoX: 0.5, geracaoY: 0.9, geracaoZ: 0.8, geracaoAlpha: 0.7 },
  },
  {
    id: 5,
    text: 'As avaliações de outros consumidores influenciam minha decisão de compra online.',
    weights: { geracaoX: 0.8, geracaoY: 0.8, geracaoZ: 0.5, geracaoAlpha: 0.3 },
  },
  {
    id: 6,
    text: 'A presença de selos de segurança ou certificações em um site aumenta minha confiança ao comprar.',
    weights: { geracaoX: 0.9, geracaoY: 0.6, geracaoZ: 0.3, geracaoAlpha: 0.2 },
  },
  {
    id: 7,
    text: 'Promoções temporárias, cupons ou ofertas relâmpago influenciam minha decisão de compra.',
    weights: { geracaoX: 0.5, geracaoY: 0.8, geracaoZ: 0.7, geracaoAlpha: 0.6 },
  },
  {
    id: 8,
    text: 'Tenho tendência a realizar compras por impulso, sem planejamento prévio.',
    weights: { geracaoX: 0.2, geracaoY: 0.6, geracaoZ: 0.8, geracaoAlpha: 0.9 },
  },
  {
    id: 9,
    text: 'Utilizo o celular como principal dispositivo para realizar compras online (em sites ou aplicativos).',
    weights: { geracaoX: 0.3, geracaoY: 0.6, geracaoZ: 0.9, geracaoAlpha: 0.9 },
  },
  {
    id: 10,
    text: 'Prefiro comprar em marketplaces consolidados (como Amazon ou Mercado Livre) a comprar diretamente em lojas virtuais independentes.',
    weights: { geracaoX: 0.9, geracaoY: 0.7, geracaoZ: 0.4, geracaoAlpha: 0.4 },
  },
];

export const groups: Group[] = [
  {
    id: 'geracaoX',
    name: 'Geração X',
    color: '#F59E0B',
    icon: '🧭',
    description:
      'Consumidor pragmático, híbrido e criterioso. Você pesquisa antes de comprar, valoriza custo-benefício, confia em avaliações e prioriza plataformas consolidadas com reputação comprovada.',
    interpretation:
      'Seu perfil reflete os traços da Geração X: alta sensibilidade ao preço e à qualidade (os maiores índices entre todas as gerações), forte valorização de selos de segurança e reputação das marcas. Você transita entre o físico e o digital com naturalidade, mas mantém cautela antes de fechar negócio — um diferencial valioso num ambiente cheio de armadilhas digitais.',
  },
  {
    id: 'geracaoY',
    name: 'Millennial',
    color: '#B4FF00',
    icon: '🚀',
    description:
      'Consumidor conectado, orientado a propósito e experiências. Você busca marcas com valores, usa múltiplos canais para pesquisar e é atraído por fidelidade, personalização e conveniência digital.',
    interpretation:
      'Seu perfil é Millennial (Geração Y): você valoriza marcas transparentes e engajadas em causas, e prefere experiências a produtos. Lembre-se: os Millennials são a geração mais propensa ao superendividamento — o crédito fácil e os estímulos constantes das redes exigem atenção redobrada ao planejamento financeiro.',
  },
  {
    id: 'geracaoZ',
    name: 'Geração Z',
    color: '#22D3A0',
    icon: '⚡',
    description:
      'Consumidor nativo digital, veloz e movido por identidade. Você compra pelo celular, descobre produtos em redes sociais e age rápido — muitas vezes antes de planejar.',
    interpretation:
      'Seu perfil é Geração Z: você vive o comércio digital de forma intensa e imediata. A descoberta ocorre em segundos via influenciadores e stories. Atenção ao consumo impulsivo amplificado pelo "Efeito Batom" — a tendência de fazer pequenas compras frequentes como recompensa emocional, especialmente em períodos de estresse ou crise.',
  },
  {
    id: 'geracaoAlpha',
    name: 'Geração Alpha',
    color: '#A78BFA',
    icon: '🌐',
    description:
      'Consumidor 100% nativo digital, influenciado por plataformas, jogos e tendências virais. Sua jornada de compra começa e termina na tela, com forte influência de criadores de conteúdo.',
    interpretation:
      'Seu perfil se alinha à Geração Alpha: você cresceu no mundo digital e o consumo é parte da sua identidade online. PIX, carteiras digitais e compras via app são sua realidade. Fique atento a golpes dentro de plataformas e ao consumo emocional de itens de baixo custo — o "Efeito Batom" é especialmente forte no seu perfil.',
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
