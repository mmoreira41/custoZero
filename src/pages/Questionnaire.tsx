import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { CategorySelection } from '@/components/questionnaire/CategorySelection';
import { ServiceInput } from '@/components/questionnaire/ServiceInput';
import { Loading } from './Loading';
import { categories } from '@/data/categories';
import { calculateDiagnostic } from '@/lib/calculations';
import { insertDiagnosticSecure } from '@/lib/supabase-secure';
import ExpirationTimer from '@/components/ExpirationTimer';
import type { ServiceInput as ServiceInputType } from '@/types';

type Step = 'selection' | 'input';

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 160 : -160,
    opacity: 0,
    position: 'absolute' as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 160 : -160,
    opacity: 0,
    position: 'absolute' as const,
  }),
};

export function Questionnaire() {
  const navigate = useNavigate();
  const { isValid, email, isLoading } = useAuth();
  const {
    currentCategoryIndex,
    selectedServices,
    selectService,
    deselectService,
    addServiceInput,
    nextCategory,
    setCurrentCategory,
    setEmail,
    setResult,
  } = useDiagnosticStore();

  const [step, setStep] = useState<Step>('selection');
  const [direction, setDirection] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const categoryServices = selectedServices[currentCategory.id] || [];

  // ✅ Setar email no store usando useEffect (evita setState durante render)
  useEffect(() => {
    if (email && !useDiagnosticStore.getState().email) {
      setEmail(email);
    }
  }, [email, setEmail]);

  // Loading de autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, o hook já redirecionou
  if (!isValid) {
    return null;
  }

  const handleToggleService = (serviceId: string) => {
    const servicesByCategory = selectedServices[currentCategory.id] || [];
    if (servicesByCategory.includes(serviceId)) {
      deselectService(currentCategory.id, serviceId);
    } else {
      selectService(currentCategory.id, serviceId);
    }
  };

  const handleCategoryClick = (index: number) => {
    if (index < currentCategoryIndex) {
      setCurrentCategory(index);
      setStep('selection');
    }
  };

  const handleContinueSelection = () => {
    if (categoryServices.length > 0) {
      setDirection(1);
      setStep('input');
    }
  };

  const handleSkipCategory = () => {
    if (isLastCategory) {
      // Se for a última categoria, finalizar
      handleFinishQuestionnaire();
    } else {
      nextCategory();
      setDirection(0);
      setStep('selection');
    }
  };

  const handleCompleteInput = (inputs: ServiceInputType[]) => {
    // Adicionar inputs ao store
    inputs.forEach((input) => addServiceInput(input));

    if (isLastCategory) {
      // Se for a última categoria, finalizar
      handleFinishQuestionnaire();
    } else {
      // Avançar para próxima categoria
      nextCategory();
      setDirection(-1);
      setStep('selection');
    }
  };

  const handleBackToSelection = () => {
    setDirection(-1);
    setStep('selection');
  };

  const handleFinishQuestionnaire = async () => {
    setIsCalculating(true);

    // Simular delay de cálculo (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Pegar todos os inputs do store
    const allInputs = useDiagnosticStore.getState().serviceInputs;
    const customServices = useDiagnosticStore.getState().customServices;

    // Calcular resultado
    const result = calculateDiagnostic(allInputs, email, customServices);

    // Salvar no store
    setResult(result);

    // ✅ Salvar no Supabase usando secure client (se Supabase estiver configurado)
    const hasSupabaseConfig =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabaseConfig) {
      try {
        const diagnosticId = await insertDiagnosticSecure({
          email: result.email,
          data: result,
        });

        if (diagnosticId) {
          console.log('✅ Diagnóstico salvo no Supabase:', diagnosticId);
        } else {
          console.warn('⚠️ Diagnóstico pode não ter sido salvo');
        }
      } catch (error) {
        console.error('❌ Error saving diagnostic:', error);
      }
    } else {
      console.log('🔧 DEV MODE: Supabase não configurado, salvamento desabilitado');
    }

    // Aguardar loading terminar e navegar para relatório
    // O componente Loading vai chamar onComplete após 1.5s
  };

  const handleLoadingComplete = () => {
    navigate('/relatorio');
  };

  const handleExpire = () => {
    navigate('/acesso-expirado');
  };

  // Se está calculando, mostrar loading
  if (isCalculating) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ExpirationTimer onExpire={handleExpire} />
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`${currentCategory.id}-${step}`}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 260, damping: 26 },
            opacity: { duration: 0.22 },
          }}
          className="min-h-screen"
        >
          {step === 'selection' ? (
            <CategorySelection
              category={currentCategory}
              selectedServices={categoryServices}
              onToggleService={handleToggleService}
              onContinue={handleContinueSelection}
              onSkip={handleSkipCategory}
              currentCategoryIndex={currentCategoryIndex}
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />
          ) : (
            <ServiceInput
              serviceIds={categoryServices}
              onComplete={handleCompleteInput}
              onBack={handleBackToSelection}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
