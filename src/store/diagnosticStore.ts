import { create } from 'zustand';
import type {
  ServiceInput,
  DiagnosticResult,
  FinancialBlock,
  HabitInput,
  UsageFrequency,
} from '@/types';

export interface CustomService {
  id: string;
  categoryId: string;
  name: string;
}

interface DiagnosticStore {
  // Estado
  currentCategoryIndex: number;
  selectedServices: Record<string, string[]>; // categoryId -> serviceIds[]
  customServices: CustomService[]; // Serviços personalizados criados pelo usuário
  serviceInputs: ServiceInput[];
  financialBlock?: FinancialBlock;
  habits: HabitInput[];
  result: DiagnosticResult | null;
  email: string;

  // Actions
  setEmail: (email: string) => void;
  selectService: (categoryId: string, serviceId: string) => void;
  deselectService: (categoryId: string, serviceId: string) => void;
  toggleService: (categoryId: string, serviceId: string) => void;
  addCustomService: (categoryId: string, name: string) => void;
  removeCustomService: (serviceId: string) => void;
  addServiceInput: (input: ServiceInput) => void;
  updateServiceInput: (serviceId: string, field: keyof ServiceInput, value: number | UsageFrequency) => void;
  removeServiceInput: (serviceId: string) => void;
  setFinancialBlock: (block: FinancialBlock) => void;
  addHabit: (habit: HabitInput) => void;
  updateHabit: (index: number, habit: HabitInput) => void;
  removeHabit: (index: number) => void;
  nextCategory: () => void;
  prevCategory: () => void;
  setCurrentCategory: (index: number) => void;
  setResult: (result: DiagnosticResult) => void;
  reset: () => void;
}

export const useDiagnosticStore = create<DiagnosticStore>((set) => ({
  currentCategoryIndex: 0,
  selectedServices: {},
  customServices: [],
  serviceInputs: [],
  habits: [],
  result: null,
  email: '',

  setEmail: (email) => set({ email }),

  selectService: (categoryId, serviceId) =>
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [categoryId]: [...(state.selectedServices[categoryId] || []), serviceId],
      },
    })),

  deselectService: (categoryId, serviceId) =>
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [categoryId]:
          state.selectedServices[categoryId]?.filter((id) => id !== serviceId) || [],
      },
    })),

  toggleService: (categoryId, serviceId) =>
    set((state) => {
      const currentServices = state.selectedServices[categoryId] || [];
      const isSelected = currentServices.includes(serviceId);

      if (isSelected) {
        return {
          selectedServices: {
            ...state.selectedServices,
            [categoryId]: currentServices.filter((id) => id !== serviceId),
          },
        };
      } else {
        return {
          selectedServices: {
            ...state.selectedServices,
            [categoryId]: [...currentServices, serviceId],
          },
        };
      }
    }),

  addCustomService: (categoryId, name) =>
    set((state) => {
      // Usar crypto.randomUUID() para garantir IDs únicos
      const customId = `custom-${crypto.randomUUID()}`;
      const newCustomService: CustomService = {
        id: customId,
        categoryId,
        name,
      };

      // Adiciona ao array de custom services
      const updatedCustomServices = [...state.customServices, newCustomService];

      // Automaticamente seleciona o serviço personalizado
      const currentServices = state.selectedServices[categoryId] || [];
      const updatedSelectedServices = {
        ...state.selectedServices,
        [categoryId]: [...currentServices, customId],
      };

      return {
        customServices: updatedCustomServices,
        selectedServices: updatedSelectedServices,
      };
    }),

  removeCustomService: (serviceId) =>
    set((state) => {
      // Remove do array de custom services
      const updatedCustomServices = state.customServices.filter((s) => s.id !== serviceId);

      // Remove das seleções em todas as categorias
      const updatedSelectedServices = { ...state.selectedServices };
      Object.keys(updatedSelectedServices).forEach((categoryId) => {
        updatedSelectedServices[categoryId] = updatedSelectedServices[categoryId].filter(
          (id) => id !== serviceId
        );
      });

      // Remove dos inputs se existir
      const updatedServiceInputs = state.serviceInputs.filter(
        (input) => input.serviceId !== serviceId
      );

      return {
        customServices: updatedCustomServices,
        selectedServices: updatedSelectedServices,
        serviceInputs: updatedServiceInputs,
      };
    }),

  addServiceInput: (input) =>
    set((state) => ({
      serviceInputs: [...state.serviceInputs, input],
    })),

  updateServiceInput: (serviceId, field, value) =>
    set((state) => ({
      serviceInputs: state.serviceInputs.map((input) =>
        input.serviceId === serviceId ? { ...input, [field]: value } : input
      ),
    })),

  removeServiceInput: (serviceId) =>
    set((state) => ({
      serviceInputs: state.serviceInputs.filter((input) => input.serviceId !== serviceId),
    })),

  setFinancialBlock: (block) => set({ financialBlock: block }),

  addHabit: (habit) =>
    set((state) => ({
      habits: [...state.habits, habit],
    })),

  updateHabit: (index, habit) =>
    set((state) => ({
      habits: state.habits.map((h, i) => (i === index ? habit : h)),
    })),

  removeHabit: (index) =>
    set((state) => ({
      habits: state.habits.filter((_, i) => i !== index),
    })),

  nextCategory: () =>
    set((state) => ({
      currentCategoryIndex: state.currentCategoryIndex + 1,
    })),

  prevCategory: () =>
    set((state) => ({
      currentCategoryIndex: Math.max(0, state.currentCategoryIndex - 1),
    })),

  setCurrentCategory: (index) => set({ currentCategoryIndex: index }),

  setResult: (result) => set({ result }),

  reset: () =>
    set({
      currentCategoryIndex: 0,
      selectedServices: {},
      customServices: [],
      serviceInputs: [],
      financialBlock: undefined,
      habits: [],
      result: null,
    }),
}));
