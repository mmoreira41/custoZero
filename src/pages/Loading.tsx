import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingProps {
  onComplete: () => void;
}

export function Loading({ onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500; // 1.5 segundos
    const interval = 50; // Atualizar a cada 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200); // Pequeno delay antes de chamar onComplete
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-md px-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto" />

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Calculando quanto dinheiro você pode economizar...
          </h2>

          <Progress value={progress} className="w-full h-2" />

          <p className="text-sm text-muted-foreground">
            {progress < 30 && 'Analisando seus gastos...'}
            {progress >= 30 && progress < 60 && 'Identificando desperdícios...'}
            {progress >= 60 && progress < 90 && 'Calculando economia potencial...'}
            {progress >= 90 && 'Quase pronto!'}
          </p>
        </div>
      </div>
    </div>
  );
}
