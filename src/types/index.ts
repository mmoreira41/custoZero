export type UsageFrequency = 'nunca' | 'raramente' | 'as-vezes' | 'sempre';

export type WasteLevel = 'WASTE' | 'LOW_USE' | 'ACTIVE';

export type CategoryId =
  | 'streaming'
  | 'utilitarios'
  | 'produtividade'
  | 'educacao'
  | 'marketplaces'
  | 'social'
  | 'games'
  | 'fitness'
  | 'transporte'
  | 'extras';

export interface ServicePlan {
  label: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  logo: string; // URL da logo (usar logo.clearbit.com ou similar)
  avgPriceMin: number;
  avgPriceMax: number;
  cancelUrl?: string; // URL para cancelamento direto
  howToCancel?: string; // Instruções de cancelamento
  plans?: ServicePlan[]; // Planos disponíveis (ex: Netflix Básico, Padrão, Premium)
  isVariableCost?: boolean; // Para serviços com custo variável (ex: corridas Uber/99)
}

export interface ServiceInput {
  serviceId: string;
  monthlyValue: number;
  frequency: UsageFrequency;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // emoji ou ícone
  services: Service[];
  isSubscription: boolean; // true = tem preview screen
}

export interface FinancialBlock {
  numCards: number;
  totalAnnuity: number;
  monthlyInterest: number;
  activeParcels: number;
}

export interface HabitInput {
  type: 'delivery' | 'transport' | 'coffee';
  frequency: number; // vezes por mês
  avgSpent: number; // gasto médio por vez
}

// Tipos de insight de transporte
export type TransportInsightType = 'optimization' | 'waste' | 'behavior';

export interface TransportInsight {
  type: TransportInsightType;
  title: string;
  description: string;
  monthlyValue: number;
  ridesPerWeek?: number;
}

export interface DiagnosticResult {
  id: string;
  createdAt: string;
  email: string;

  // Inputs do usuário
  selectedServices: ServiceInput[];
  financialBlock?: FinancialBlock;
  habits?: HabitInput[];

  // Cálculos
  totalMonthly: number;
  totalYearly: number;
  wasteMonthly: number;
  wasteYearly: number;

  // Rankings
  topWasters: Array<{
    serviceId: string;
    serviceName: string;
    logo: string;
    monthlyValue: number;
    yearlyValue: number;
    wasteLevel: WasteLevel;
  }>;

  // Economia potencial
  savings: {
    conservative: number; // 20%
    realistic: number;    // 35%
    aggressive: number;   // 50%
  };

  // Insights inteligentes de transporte
  transportInsights?: TransportInsight[];
}

export interface AccessToken {
  token: string;
  email: string;
  used: boolean;
  expiresAt: string;
}
