import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';

interface WasteSectionProps {
  wasteMonthly: number;
  wasteYearly: number;
}

export function WasteSection({ wasteMonthly, wasteYearly }: WasteSectionProps) {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold text-destructive">
        🚨 Desperdício Identificado
      </h2>
      <p className="text-lg text-muted-foreground">
        Baseado em serviços que você nunca ou raramente usa
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <p className="text-sm text-muted-foreground mb-2">Desperdício Mensal</p>
          <p className="text-3xl md:text-4xl font-bold text-destructive">
            {formatCurrency(wasteMonthly)}
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <p className="text-sm text-muted-foreground mb-2">Desperdício Anual</p>
          <p className="text-3xl md:text-4xl font-bold text-destructive">
            {formatCurrency(wasteYearly)}
          </p>
        </Card>
      </div>
    </div>
  );
}
