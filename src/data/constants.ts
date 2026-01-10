// Constantes globais da aplicação

export const APP_NAME = 'Diagnóstico Financeiro Pessoal';

export const WASTE_PERCENTAGES = {
  nunca: 1.0,      // 100% de desperdício
  raramente: 0.7,  // 70% de desperdício
  'as-vezes': 0.0, // 0% de desperdício (uso ativo)
  sempre: 0.0,     // 0% de desperdício (uso ativo)
} as const;

export const SAVINGS_PERCENTAGES = {
  conservative: 0.20, // 20%
  realistic: 0.35,    // 35%
  aggressive: 0.50,   // 50%
} as const;

export const FREQUENCY_LABELS = {
  nunca: '🚫 Nunca',
  raramente: '🌙 Raramente (1-3x/mês)',
  'as-vezes': '⭐ Às vezes (5-10x/mês)',
  sempre: '🔥 Sempre (Diário)',
} as const;

export const POSSIBILITIES = [
  {
    icon: '✈️',
    title: 'Viagens',
    calculate: (savings: number) => ({
      value: Math.floor(savings / 3000),
      description: 'viagens nacionais por ano'
    })
  },
  {
    icon: '💰',
    title: 'Rendimento na Selic',
    calculate: (savings: number) => ({
      value: (savings * 0.13).toFixed(2),
      description: 'em 1 ano investindo na Selic'
    })
  },
  {
    icon: '❤️',
    title: 'Cestas básicas',
    calculate: (savings: number) => ({
      value: Math.floor(savings / 150),
      description: 'cestas básicas doadas'
    })
  },
  {
    icon: '🛡️',
    title: 'Reserva de emergência',
    calculate: (savings: number) => ({
      value: Math.floor(savings / 6000),
      description: 'meses de reserva (baseado em R$ 6.000)'
    })
  },
  {
    icon: '🎓',
    title: 'Cursos',
    calculate: (savings: number) => ({
      value: Math.floor(savings / 500),
      description: 'cursos profissionalizantes'
    })
  }
] as const;

export const HABIT_TYPES = [
  {
    type: 'delivery' as const,
    label: 'Delivery (iFood, Rappi, etc)',
    icon: '🍕',
    avgCost: 50
  },
  {
    type: 'transport' as const,
    label: 'Transporte (Uber, 99, táxi)',
    icon: '🚕',
    avgCost: 30
  },
  {
    type: 'coffee' as const,
    label: 'Cafés e lanches',
    icon: '☕',
    avgCost: 15
  }
] as const;

// Limites de validação para valores monetários
export const VALIDATION_LIMITS = {
  MAX_SERVICE_VALUE: 100000, // R$ 100.000,00 (valor máximo razoável por serviço)
  MIN_SERVICE_VALUE: 0.01, // R$ 0,01 (valor mínimo)
  MAX_CUSTOM_NAME_LENGTH: 60, // Máximo de caracteres para nome personalizado
} as const;
