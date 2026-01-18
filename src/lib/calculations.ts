import type {
  ServiceInput,
  DiagnosticResult,
  UsageFrequency,
  WasteLevel,
  FinancialBlock,
  HabitInput,
  TransportInsight,
} from '@/types';
import type { CustomService } from '@/store/diagnosticStore';
import { getServiceById } from '@/data/services';
import { WASTE_PERCENTAGES, SAVINGS_PERCENTAGES } from '@/data/constants';

// Constantes para regras de negócio de transporte
const TRANSPORT_THRESHOLDS = {
  UBER_ONE_RECOMMENDED: 300, // Se gasta mais de R$300, recomenda Uber One
  UBER_ONE_WASTE: 199,       // Se gasta menos de R$199, Uber One é desperdício
  HIGH_SPEND_ALERT: 500,     // Se gasta mais de R$500, alerta de comportamento
  UBER_ONE_PRICE: 19.90,     // Preço do Uber One
};

export function getWasteLevel(frequency: UsageFrequency): WasteLevel {
  switch (frequency) {
    case 'nunca':
      return 'WASTE';
    case 'raramente':
      return 'LOW_USE';
    case 'as-vezes':
    case 'sempre':
      return 'ACTIVE';
  }
}

export function getWastePercentage(frequency: UsageFrequency): number {
  return WASTE_PERCENTAGES[frequency];
}

/**
 * Gera insights inteligentes sobre gastos com transporte
 */
export function generateTransportInsights(
  services: ServiceInput[],
  selectedServiceIds: string[]
): TransportInsight[] {
  const insights: TransportInsight[] = [];

  // Encontrar o serviço de gastos com corridas
  const ridesService = services.find(s => s.serviceId === 'gastos-corridas');
  if (!ridesService) return insights;

  const monthlyRidesCost = ridesService.monthlyValue;

  // Calcular corridas por semana (assumindo valor médio de R$25 por corrida)
  // Fórmula inversa: ridesPerWeek = monthlyValue / (avgCost * 4)
  // Como não temos o valor exato, estimamos
  const estimatedRidesPerWeek = Math.round(monthlyRidesCost / 100); // Estimativa aproximada

  // Verificar se usuário tem Uber One ou 99 Plus
  const hasUberOne = selectedServiceIds.includes('uber-one');
  // const has99Plus = selectedServiceIds.includes('99-plus'); // Para uso futuro

  // REGRA 1: Otimização de Assinatura (A Regra dos R$ 300)
  // Se gasta mais de R$300 e NÃO tem Uber One
  if (monthlyRidesCost > TRANSPORT_THRESHOLDS.UBER_ONE_RECOMMENDED && !hasUberOne) {
    insights.push({
      type: 'optimization',
      title: 'Oportunidade de Economia',
      description: `Você está deixando dinheiro na mesa! Com seu gasto de R$ ${monthlyRidesCost.toFixed(2).replace('.', ',')}, assinar o Uber One (R$ ${TRANSPORT_THRESHOLDS.UBER_ONE_PRICE.toFixed(2).replace('.', ',')}) traria um retorno líquido positivo em cashback, cobrindo a mensalidade e gerando economia.`,
      monthlyValue: monthlyRidesCost,
      ridesPerWeek: estimatedRidesPerWeek,
    });
  }

  // REGRA 2: Otimização de Corte (A Regra dos R$ 200)
  // Se gasta menos de R$199 e TEM Uber One
  if (monthlyRidesCost < TRANSPORT_THRESHOLDS.UBER_ONE_WASTE && hasUberOne) {
    insights.push({
      type: 'waste',
      title: 'Prejuízo Detectado',
      description: `Você gasta menos de R$ 200 em corridas, o que não cobre o custo da assinatura Uber One. Cancele e economize R$ ${TRANSPORT_THRESHOLDS.UBER_ONE_PRICE.toFixed(2).replace('.', ',')} por mês.`,
      monthlyValue: monthlyRidesCost,
      ridesPerWeek: estimatedRidesPerWeek,
    });
  }

  // REGRA 3: Alerta de Hábito (A Regra dos R$ 500)
  // Se gasta mais de R$500 em corridas
  if (monthlyRidesCost > TRANSPORT_THRESHOLDS.HIGH_SPEND_ALERT) {
    const yearlySpend = monthlyRidesCost * 12;
    const suggestedReduction = Math.max(1, estimatedRidesPerWeek - 2);
    insights.push({
      type: 'behavior',
      title: 'Alerta de Comportamento',
      description: `Transporte é um dos seus maiores vilões! Você gasta mais de R$ ${yearlySpend.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}/ano em apps de corrida. Tente estabelecer um teto de ${suggestedReduction} corridas por semana.`,
      monthlyValue: monthlyRidesCost,
      ridesPerWeek: estimatedRidesPerWeek,
    });
  }

  return insights;
}

export function calculateDiagnostic(
  services: ServiceInput[],
  email: string,
  customServices: CustomService[],
  financialBlock?: FinancialBlock,
  habits?: HabitInput[]
): DiagnosticResult {
  // Calcular totais de serviços
  const totalMonthly = services.reduce((sum, s) => sum + s.monthlyValue, 0);

  // Adicionar custos de hábitos se existirem
  const habitsMonthly = habits?.reduce((sum, h) => {
    return sum + (h.frequency * h.avgSpent);
  }, 0) || 0;

  // Adicionar custos financeiros se existirem
  const financialMonthly = financialBlock
    ? (financialBlock.totalAnnuity / 12) + financialBlock.monthlyInterest
    : 0;

  const totalMonthlyWithExtras = totalMonthly + habitsMonthly + financialMonthly;
  const totalYearly = totalMonthlyWithExtras * 12;

  // Calcular desperdício (apenas em serviços com uso baixo ou nulo)
  const wasteMonthly = services.reduce((sum, s) => {
    const wastePercent = getWastePercentage(s.frequency);
    return sum + (s.monthlyValue * wastePercent);
  }, 0);

  const wasteYearly = wasteMonthly * 12;

  // Criar ranking de top wasters (apenas WASTE e LOW_USE)
  const topWasters = services
    .filter(s => {
      const level = getWasteLevel(s.frequency);
      return level === 'WASTE' || level === 'LOW_USE';
    })
    .map(s => {
      const service = getServiceById(s.serviceId);
      const customService = customServices.find((cs) => cs.id === s.serviceId);
      // Usa nome do custom service se existir, senão usa o nome do serviço padrão, senão usa o ID
      const displayName = customService?.name || service?.name || s.serviceId;
      return {
        serviceId: s.serviceId,
        serviceName: displayName,
        logo: service?.logo || '',
        monthlyValue: s.monthlyValue,
        yearlyValue: s.monthlyValue * 12,
        wasteLevel: getWasteLevel(s.frequency),
      };
    })
    .sort((a, b) => b.yearlyValue - a.yearlyValue);

  // Calcular economia potencial (baseada no desperdício identificado)
  const savings = {
    conservative: wasteYearly * SAVINGS_PERCENTAGES.conservative,
    realistic: wasteYearly * SAVINGS_PERCENTAGES.realistic,
    aggressive: wasteYearly * SAVINGS_PERCENTAGES.aggressive,
  };

  // Gerar insights de transporte
  const allSelectedServiceIds = services.map(s => s.serviceId);
  const transportInsights = generateTransportInsights(services, allSelectedServiceIds);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    email,
    selectedServices: services,
    financialBlock,
    habits,
    totalMonthly: totalMonthlyWithExtras,
    totalYearly,
    wasteMonthly,
    wasteYearly,
    topWasters,
    savings,
    transportInsights,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
