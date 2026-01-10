import { useState } from 'react';
import {
  CheckCircle,
  Frown,
  Meh,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { UsageFrequency, ServiceInput as ServiceInputType } from '@/types';
import { FREQUENCY_LABELS, VALIDATION_LIMITS } from '@/data/constants';
import { getServiceById } from '@/data/services';
import { buildAlternateLogoUrl, buildFallbackLogo } from '@/lib/utils';
import { useDiagnosticStore } from '@/store/diagnosticStore';

interface ServiceInputProps {
  serviceIds: string[];
  onComplete: (inputs: ServiceInputType[]) => void;
  onBack: () => void;
}

// Formata valor para moeda brasileira
const formatCurrency = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  // Remove zeros à esquerda, mas mantém se for apenas "0"
  const withoutLeadingZeros = numbers.replace(/^0+/, '') || '0';

  // Converte para número e aplica limites
  let numberValue = parseInt(withoutLeadingZeros, 10) / 100;

  // Validação de limites
  if (numberValue > VALIDATION_LIMITS.MAX_SERVICE_VALUE) {
    numberValue = VALIDATION_LIMITS.MAX_SERVICE_VALUE;
  }
  if (numberValue < 0) {
    numberValue = 0;
  }

  return numberValue.toFixed(2);
};

// Parse valor formatado de volta para número
const parseCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  let parsed = parseInt(numbers, 10) / 100;

  // Validação de limites
  if (isNaN(parsed) || parsed < 0) {
    return 0;
  }
  if (parsed > VALIDATION_LIMITS.MAX_SERVICE_VALUE) {
    return VALIDATION_LIMITS.MAX_SERVICE_VALUE;
  }

  return parsed;
};

export function ServiceInput({ serviceIds, onComplete, onBack }: ServiceInputProps) {
  const { customServices } = useDiagnosticStore();

  const [inputs, setInputs] = useState<Record<string, Partial<ServiceInputType>>>(() => {
    const initial: Record<string, Partial<ServiceInputType>> = {};
    serviceIds.forEach((id) => {
      initial[id] = {
        serviceId: id,
        monthlyValue: 0,
        frequency: undefined,
      };
    });
    return initial;
  });

  // Estado para os valores formatados dos inputs
  const [displayValues, setDisplayValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    serviceIds.forEach((id) => {
      initial[id] = '0,00';
    });
    return initial;
  });

  const handleValueChange = (serviceId: string, field: 'monthlyValue' | 'frequency', value: number | UsageFrequency) => {
    setInputs((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const handleMoneyInputChange = (serviceId: string, rawValue: string) => {
    const formatted = formatCurrency(rawValue);
    const numericValue = parseCurrency(rawValue);

    setDisplayValues((prev) => ({
      ...prev,
      [serviceId]: formatted,
    }));

    handleValueChange(serviceId, 'monthlyValue', numericValue);
  };

  const handlePlanSelect = (serviceId: string, price: number) => {
    const formatted = price.toFixed(2).replace('.', ',');
    setDisplayValues((prev) => ({
      ...prev,
      [serviceId]: formatted,
    }));
    handleValueChange(serviceId, 'monthlyValue', price);
  };

  const handleSubmit = () => {
    const completed = serviceIds
      .map((id) => inputs[id])
      .filter((input): input is ServiceInputType => {
        return (
          input.monthlyValue !== undefined &&
          input.monthlyValue > 0 &&
          input.frequency !== undefined
        );
      });

    onComplete(completed);
  };

  const allFilled = serviceIds.every((id) => {
    const input = inputs[id];
    const isValid = (
      input &&
      input.monthlyValue !== undefined &&
      input.monthlyValue > 0 &&
      input.frequency !== undefined
    );

    // Debug temporário
    if (!isValid) {
      console.log('❌ Service not filled:', id, {
        input,
        monthlyValue: input?.monthlyValue,
        frequency: input?.frequency
      });
    } else {
      console.log('✅ Service filled:', id, {
        monthlyValue: input?.monthlyValue,
        frequency: input?.frequency
      });
    }

    return isValid;
  });

  // Debug: Mostra estado completo
  console.log('All filled?', allFilled, {
    serviceIds,
    totalServices: serviceIds.length,
    inputs: Object.keys(inputs).length
  });

  const FREQUENCY_OPTIONS: {
    value: UsageFrequency;
    label: string;
    shortLabel: string;
    icon: LucideIcon;
    color: 'rose' | 'amber' | 'slate' | 'emerald';
  }[] = [
    { value: 'nunca', label: FREQUENCY_LABELS.nunca, shortLabel: 'Nunca', icon: XCircle, color: 'rose' },
    { value: 'raramente', label: FREQUENCY_LABELS.raramente, shortLabel: 'Raramente', icon: Frown, color: 'amber' },
    { value: 'as-vezes', label: FREQUENCY_LABELS['as-vezes'], shortLabel: 'Às vezes', icon: Meh, color: 'slate' },
    { value: 'sempre', label: FREQUENCY_LABELS.sempre, shortLabel: 'Sempre', icon: CheckCircle, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-8 md:mb-12 space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 text-balance">
            Quanto você gasta?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Insira o valor mensal e com que frequência você usa cada serviço
          </p>
        </div>

        {/* Cards de serviços */}
        <div className="space-y-4 pb-40 xs:pb-36 md:pb-32">
          {serviceIds.map((serviceId) => {
            const service = getServiceById(serviceId);
            const customService = customServices.find((cs) => cs.id === serviceId);

            if (!service && !customService) {
              console.warn('⚠️ Service not found and not rendered:', serviceId);
              return null;
            }

            const input = inputs[serviceId];
            const isWaste = input.frequency === 'nunca';

            // Nome do serviço (custom ou padrão)
            const serviceName = customService?.name || service?.name || '';

            // Calcula placeholder inteligente
            const placeholderValue = service?.plans && service.plans.length > 0
              ? `Ex: R$ ${service.plans[0].price.toFixed(2).replace('.', ',')}`
              : '0,00';

            return (
              <Card
                key={serviceId}
                className={`p-4 xs:p-6 transition-all duration-300 ${
                  isWaste
                    ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 dark:ring-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 xs:gap-6">
                  {/* Logo e info do serviço */}
                  <div className="flex items-center gap-3 xs:gap-4 lg:flex-1 min-w-0">
                    {service && (
                      <>
                        <img
                          src={service.logo}
                          alt={service.name}
                          className="w-12 h-12 xs:w-16 xs:h-16 md:w-20 md:h-20 rounded-xl object-contain shadow-sm flex-shrink-0 bg-white dark:bg-slate-800"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.altTried) {
                              img.dataset.altTried = 'true';
                              const altUrl = buildAlternateLogoUrl(service.logo);
                              if (altUrl) {
                                img.src = altUrl;
                                return;
                              }
                            }
                            img.onerror = null;
                            img.src = buildFallbackLogo(service.name);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base xs:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-0.5 xs:mb-1 truncate">
                            {serviceName}
                          </h3>
                          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 truncate">
                            Normalmente custa R$ {service.avgPriceMin} a R$ {service.avgPriceMax}
                          </p>
                        </div>
                      </>
                    )}

                    {customService && (
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base xs:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-0.5 xs:mb-1 truncate">
                          {serviceName}
                        </h3>
                        <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">
                          Serviço personalizado
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="flex flex-col gap-4 lg:flex-1">

                    {/* Valor mensal */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Valor mensal
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                          R$
                        </span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={placeholderValue}
                          value={displayValues[serviceId] ?? '0,00'}
                          onChange={(e) => handleMoneyInputChange(serviceId, e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                        />
                      </div>

                      {/* Aviso de valor alto */}
                      {input.monthlyValue !== undefined && input.monthlyValue > 10000 && (
                        <p className="text-amber-600 dark:text-amber-500 text-xs mt-1 flex items-center gap-1">
                          ⚠️ Valor alto detectado. Confirme se está correto.
                        </p>
                      )}

                      {/* Badges de planos */}
                      {service?.plans && service.plans.length > 0 && (
                        <div className="mt-1.5 xs:mt-2 flex flex-wrap gap-1.5 xs:gap-2">
                          {service.plans.map((plan, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handlePlanSelect(serviceId, plan.price)}
                              className="inline-flex items-center px-2 xs:px-3 py-1 xs:py-1.5 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-[10px] xs:text-xs font-medium rounded-md transition-all cursor-pointer border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700"
                            >
                              {plan.label} · R$ {plan.price.toFixed(2).replace('.', ',')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Frequência de uso */}
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Frequência de uso
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 p-1 xs:p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {FREQUENCY_OPTIONS.map((option) => {
                          const isSelected = input.frequency === option.value;
                          const Icon = option.icon;

                          return (
                            <Button
                              key={option.value}
                              type="button"
                              variant="ghost"
                              onClick={() => handleValueChange(serviceId, 'frequency', option.value)}
                              className={`
                                relative flex flex-col items-center justify-center gap-1 xs:gap-2 py-2 xs:py-3 px-1 xs:px-2 rounded-md text-xs font-medium transition-all duration-200 h-auto min-h-[3.5rem] xs:min-h-[4rem]
                                ${
                                  isSelected
                                    ? option.color === 'rose'
                                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                      : option.color === 'amber'
                                        ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30'
                                        : option.color === 'emerald'
                                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                          : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }
                              `}
                            >
                              <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 flex-shrink-0 ${isSelected ? '' : 'opacity-70'}`} />
                              <span className="leading-tight text-center text-[9px] xs:text-[10px] sm:text-xs font-semibold">
                                {option.shortLabel}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerta de desperdício */}
                {isWaste && (
                  <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-900">
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Você está desperdiçando dinheiro com este serviço
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Botões fixos no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t shadow-lg" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-3 xs:gap-4 px-3 xs:px-4 pt-3 xs:pt-4">
          <Button onClick={onBack} variant="outline" size="lg" className="flex-shrink-0">
            <span className="hidden xs:inline">←</span> Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={!allFilled} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex-1 xs:flex-initial">
            Continuar <span className="hidden xs:inline">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
