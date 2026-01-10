import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';

interface ImpactHeaderProps {
  monthly: number;
  yearly: number;
}

export function ImpactHeader({ monthly, yearly }: ImpactHeaderProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold">💰 Impacto Total</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <p className="text-sm text-muted-foreground mb-2">Gasto Mensal</p>
          <p className="text-3xl md:text-4xl font-bold text-primary">
            {formatCurrency(monthly)}
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <p className="text-sm text-muted-foreground mb-2">Gasto Anual</p>
          <p className="text-3xl md:text-4xl font-bold text-primary">
            {formatCurrency(yearly)}
          </p>
        </Card>
      </div>
    </div>
  );
}
