import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import type { DiagnosticResult } from '@/types';

interface RankingSectionProps {
  topWasters: DiagnosticResult['topWasters'];
}

export function RankingSection({ topWasters }: RankingSectionProps) {
  if (topWasters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold">🔥 Top 5 Drenos Financeiros</h2>
      <p className="text-lg text-muted-foreground">
        Os serviços que mais impactam seu orçamento sem retorno real
      </p>

      <div className="space-y-3">
        {topWasters.slice(0, 5).map((item, index) => (
          <Card
            key={item.serviceId}
            className="p-5 animate-fade-in"
            style={{ animationDelay: `${300 + index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Ranking number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{index + 1}</span>
              </div>

              {/* Logo */}
              <img
                src={item.logo}
                alt={item.serviceName}
                className="w-12 h-12 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=' + item.serviceName.charAt(0);
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{item.serviceName}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.wasteLevel === 'WASTE' && '🚫 Nunca usa'}
                  {item.wasteLevel === 'LOW_USE' && '🌙 Usa raramente'}
                </p>
              </div>

              {/* Values */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg">{formatCurrency(item.monthlyValue)}/mês</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.yearlyValue)}/ano</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
