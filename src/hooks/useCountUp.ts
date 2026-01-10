import { useEffect, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number; // em milissegundos
  start?: number;
  decimals?: number;
}

/**
 * Hook para animar contagem de números com easing
 * @param end - Valor final
 * @param duration - Duração da animação em ms (padrão: 2000)
 * @param start - Valor inicial (padrão: 0)
 * @param decimals - Número de casas decimais (padrão: 0)
 */
export function useCountUp({ end, duration = 2000, start = 0, decimals = 0 }: UseCountUpOptions) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentCount = start + (end - start) * easedProgress;
      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    // Cleanup: cancelar animação se componente desmontar
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [end, duration, start, decimals]);

  return count;
}
