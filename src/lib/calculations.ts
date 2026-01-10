import type {
  ServiceInput,
  DiagnosticResult,
  UsageFrequency,
  WasteLevel,
  FinancialBlock,
  HabitInput,
} from '@/types';
import type { CustomService } from '@/store/diagnosticStore';
import { getServiceById } from '@/data/services';
import { WASTE_PERCENTAGES, SAVINGS_PERCENTAGES } from '@/data/constants';

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
