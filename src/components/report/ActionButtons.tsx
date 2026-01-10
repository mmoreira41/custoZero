import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { getServiceById } from '@/data/services';
import type { DiagnosticResult } from '@/types';

interface ActionButtonsProps {
  topWasters: DiagnosticResult['topWasters'];
  onDownloadPDF: () => void;
  onRestart: () => void;
}

export function ActionButtons({ topWasters, onDownloadPDF, onRestart }: ActionButtonsProps) {
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  const handleShowCancelInstructions = (serviceId: string) => {
    setShowCancelModal(serviceId);
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
      <h2 className="text-3xl md:text-4xl font-bold">🎯 Ações Imediatas</h2>
      <p className="text-lg text-muted-foreground">
        Comece cancelando ou pausando estes serviços agora mesmo
      </p>

      <div className="space-y-3">
        {topWasters.map((item) => {
          const service = getServiceById(item.serviceId);
          if (!service) return null;

          return (
            <Card key={item.serviceId} className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={item.logo}
                    alt={item.serviceName}
                    className="w-12 h-12 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/48?text=' + item.serviceName.charAt(0);
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg">{item.serviceName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.monthlyValue)}/mês • {formatCurrency(item.yearlyValue)}/ano
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                  {service.cancelUrl ? (
                    <Button
                      variant="destructive"
                      onClick={() => window.open(service.cancelUrl, '_blank')}
                      className="flex-1 md:flex-initial"
                    >
                      Cancelar agora
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleShowCancelInstructions(item.serviceId)}
                      className="flex-1 md:flex-initial"
                    >
                      Como cancelar?
                    </Button>
                  )}
                </div>
              </div>

              {showCancelModal === item.serviceId && service.howToCancel && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Instruções de cancelamento:</p>
                  <p className="text-sm text-muted-foreground">{service.howToCancel}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelModal(null)}
                    className="mt-2"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Botões finais */}
      <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
        <Button onClick={onDownloadPDF} size="lg" className="text-lg px-8">
          📄 Baixar PDF
        </Button>
        <Button onClick={onRestart} variant="outline" size="lg" className="text-lg px-8">
          🔁 Fazer novo diagnóstico
        </Button>
      </div>
    </div>
  );
}
