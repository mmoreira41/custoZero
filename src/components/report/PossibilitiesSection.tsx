import { Card } from '@/components/ui/card';
import { POSSIBILITIES } from '@/data/constants';

interface PossibilitiesSectionProps {
  realisticSavings: number;
}

export function PossibilitiesSection({ realisticSavings }: PossibilitiesSectionProps) {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold">✨ O que você pode fazer com essa economia</h2>
      <p className="text-lg text-muted-foreground">
        Baseado no cenário realista de {' '}
        <span className="font-semibold text-primary">
          R$ {realisticSavings.toFixed(2)}/ano
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {POSSIBILITIES.map((possibility, index) => {
          const result = possibility.calculate(realisticSavings);

          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${600 + index * 50}ms` }}
            >
              <div className="text-4xl mb-3">{possibility.icon}</div>
              <h3 className="font-bold text-lg mb-2">{possibility.title}</h3>
              <p className="text-2xl font-bold text-primary mb-1">
                {typeof result.value === 'number' ? result.value : `R$ ${result.value}`}
              </p>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
