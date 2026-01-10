import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';

interface SavingsSectionProps {
  conservative: number;
  realistic: number;
  aggressive: number;
}

export function SavingsSection({ conservative, realistic, aggressive }: SavingsSectionProps) {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold text-primary">
        📈 Economia Potencial Anual
      </h2>
      <p className="text-lg text-muted-foreground">
        Quanto você pode economizar por ano cancelando ou reduzindo serviços
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Conservador
            </p>
            <p className="text-2xl font-bold">{formatCurrency(conservative)}</p>
            <p className="text-xs text-muted-foreground">
              Cancelando 20% dos serviços pouco usados
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-primary">Realista</p>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                Recomendado
              </span>
            </div>
            <p className="text-3xl font-bold text-primary">{formatCurrency(realistic)}</p>
            <p className="text-xs text-muted-foreground">
              Cancelando 35% dos serviços pouco usados
            </p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Agressivo
            </p>
            <p className="text-2xl font-bold">{formatCurrency(aggressive)}</p>
            <p className="text-xs text-muted-foreground">
              Cancelando 50% dos serviços pouco usados
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
