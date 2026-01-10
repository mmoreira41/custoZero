export interface Dream {
  minPrice: number;
  title: string;
  subtitle: string;
  category: 'travel' | 'experience' | 'product' | 'tech';
  emoji: string;
}

export const DREAMS: Dream[] = [
  // Faixa R$ 150 - R$ 400
  {
    minPrice: 150,
    title: 'Dia no Parque Temático',
    subtitle: 'Ingresso + alimentação para a família',
    category: 'experience',
    emoji: '🎢',
  },
  {
    minPrice: 200,
    title: 'Jantar Sofisticado',
    subtitle: 'Restaurante estrelado para dois',
    category: 'experience',
    emoji: '🍽️',
  },
  {
    minPrice: 350,
    title: 'Fone Bluetooth Premium',
    subtitle: 'AirPods ou Galaxy Buds',
    category: 'tech',
    emoji: '🎧',
  },

  // Faixa R$ 400 - R$ 800
  {
    minPrice: 400,
    title: 'Fim de semana na Praia',
    subtitle: 'Pousada para casal no litoral',
    category: 'travel',
    emoji: '🏖️',
  },
  {
    minPrice: 500,
    title: 'Smartwatch Novo',
    subtitle: 'Apple Watch SE ou Galaxy Watch',
    category: 'tech',
    emoji: '⌚',
  },
  {
    minPrice: 650,
    title: 'Show VIP + Hotel',
    subtitle: 'Ingresso premium e hospedagem',
    category: 'experience',
    emoji: '🎤',
  },

  // Faixa R$ 800 - R$ 1.500
  {
    minPrice: 800,
    title: 'Campos do Jordão (3 dias)',
    subtitle: 'Chalé romântico na serra',
    category: 'travel',
    emoji: '⛰️',
  },
  {
    minPrice: 900,
    title: 'Passagem para o Rio',
    subtitle: 'Ida e volta + 2 diárias',
    category: 'travel',
    emoji: '✈️',
  },
  {
    minPrice: 1000,
    title: 'Notebook Gamer Entry',
    subtitle: 'Perfeito para estudos e jogos',
    category: 'tech',
    emoji: '💻',
  },
  {
    minPrice: 1200,
    title: 'Final de semana em Salvador',
    subtitle: 'Voo + hotel no Pelourinho',
    category: 'travel',
    emoji: '🎭',
  },

  // Faixa R$ 1.500 - R$ 2.500
  {
    minPrice: 1500,
    title: '5 dias em Porto Seguro',
    subtitle: 'Aéreo + pousada na orla',
    category: 'travel',
    emoji: '🌴',
  },
  {
    minPrice: 1600,
    title: 'Gramado no Natal das Luzes',
    subtitle: 'Pacote completo para casal',
    category: 'travel',
    emoji: '🎄',
  },
  {
    minPrice: 1800,
    title: 'PS5 ou Xbox Series X',
    subtitle: 'Console nova geração',
    category: 'tech',
    emoji: '🎮',
  },
  {
    minPrice: 2000,
    title: 'iPad 10ª Geração',
    subtitle: 'Para estudos e produtividade',
    category: 'tech',
    emoji: '📱',
  },
  {
    minPrice: 2200,
    title: 'Semana em Maragogi/AL',
    subtitle: 'Galés e piscinas naturais',
    category: 'travel',
    emoji: '🐠',
  },

  // Faixa R$ 2.500 - R$ 4.000
  {
    minPrice: 2500,
    title: 'Bonito/MS (5 dias)',
    subtitle: 'Flutuação + Abismo Anhumas',
    category: 'travel',
    emoji: '🤿',
  },
  {
    minPrice: 2800,
    title: 'Jericoacoara All-Inclusive',
    subtitle: '4 dias no paraíso cearense',
    category: 'travel',
    emoji: '🏄',
  },
  {
    minPrice: 3000,
    title: 'Fernando de Noronha (Entrada)',
    subtitle: 'Passagem + 3 diárias',
    category: 'travel',
    emoji: '🐢',
  },
  {
    minPrice: 3200,
    title: 'MacBook Air M1',
    subtitle: 'Notebook profissional Apple',
    category: 'tech',
    emoji: '💻',
  },
  {
    minPrice: 3500,
    title: 'iPhone 15 128GB',
    subtitle: 'Upgrade completo de smartphone',
    category: 'tech',
    emoji: '📱',
  },
  {
    minPrice: 3800,
    title: 'Amazônia Completa',
    subtitle: 'Cruzeiro + Encontro das Águas',
    category: 'travel',
    emoji: '🛶',
  },

  // Faixa R$ 4.000 - R$ 6.000
  {
    minPrice: 4000,
    title: 'Lençóis Maranhenses (Pacote)',
    subtitle: 'Voo + transfer + 4 dias de tour',
    category: 'travel',
    emoji: '🏜️',
  },
  {
    minPrice: 4200,
    title: 'Buenos Aires (5 dias)',
    subtitle: 'Voo + hotel + passeios',
    category: 'travel',
    emoji: '🥩',
  },
  {
    minPrice: 4500,
    title: 'Cancún (Básico)',
    subtitle: 'Passagem + 4 diárias',
    category: 'travel',
    emoji: '🇲🇽',
  },
  {
    minPrice: 5000,
    title: 'Santiago + Valle Nevado',
    subtitle: 'Neve no Chile para a família',
    category: 'travel',
    emoji: '⛷️',
  },
  {
    minPrice: 5500,
    title: 'iPhone 15 Pro Max',
    subtitle: 'Top de linha Apple',
    category: 'tech',
    emoji: '📱',
  },

  // Faixa R$ 6.000 - R$ 10.000
  {
    minPrice: 6000,
    title: 'Patagônia Argentina',
    subtitle: 'El Calafate + Perito Moreno',
    category: 'travel',
    emoji: '🏔️',
  },
  {
    minPrice: 6500,
    title: 'Cruzeiro Caribe (7 dias)',
    subtitle: 'All-inclusive pelo Caribe',
    category: 'travel',
    emoji: '🚢',
  },
  {
    minPrice: 7000,
    title: 'Orlando + Disney (1 Semana)',
    subtitle: 'Sonho da família realizado',
    category: 'travel',
    emoji: '🏰',
  },
  {
    minPrice: 8000,
    title: 'Moto Honda CB 500',
    subtitle: 'Entrada de moto zero km',
    category: 'product',
    emoji: '🏍️',
  },
  {
    minPrice: 8500,
    title: 'Europa Econômica',
    subtitle: 'Passagem + 7 dias em Lisboa',
    category: 'travel',
    emoji: '🇵🇹',
  },

  // Faixa R$ 10.000+
  {
    minPrice: 10000,
    title: 'Eurotrip Completa',
    subtitle: 'Paris, Londres, Roma (15 dias)',
    category: 'travel',
    emoji: '🗼',
  },
  {
    minPrice: 12000,
    title: 'Entrada de Carro 0km',
    subtitle: 'Modelo popular nacional',
    category: 'product',
    emoji: '🚗',
  },
  {
    minPrice: 15000,
    title: 'Ásia Premium',
    subtitle: 'Tailândia + Bali (3 semanas)',
    category: 'travel',
    emoji: '🏯',
  },
  {
    minPrice: 18000,
    title: 'Japão (Tokio + Kyoto)',
    subtitle: 'Sonho asiático completo',
    category: 'travel',
    emoji: '🗾',
  },
  {
    minPrice: 25000,
    title: 'Nova York + Miami',
    subtitle: '2 semanas nos EUA',
    category: 'travel',
    emoji: '🗽',
  },
];

/**
 * Retorna o sonho mais caro que cabe no orçamento
 */
export function getMainDream(budget: number): Dream {
  const affordableDreams = DREAMS.filter((d) => d.minPrice <= budget);
  return affordableDreams.length > 0
    ? affordableDreams[affordableDreams.length - 1]
    : DREAMS[0];
}

/**
 * Retorna 3 alternativas de sonhos que cabem no orçamento
 */
export function getAlternativeDreams(budget: number, mainDream: Dream): Dream[] {
  return DREAMS.filter(
    (d) => d.minPrice < mainDream.minPrice && d.minPrice <= budget
  ).slice(-3);
}

/**
 * Retorna múltiplas quantidades de sonhos menores
 * Ex: "3x Fone Bluetooth Premium"
 */
export function getMultipleDreams(budget: number): { dream: Dream; quantity: number } | null {
  // Pega sonhos na faixa de R$ 200 a R$ 2000
  const repeatableDreams = DREAMS.filter((d) => d.minPrice >= 200 && d.minPrice <= 2000);

  for (const dream of repeatableDreams.reverse()) {
    const quantity = Math.floor(budget / dream.minPrice);
    if (quantity >= 2) {
      return { dream, quantity };
    }
  }

  return null;
}
