import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🚫</div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Seu token de acesso é inválido, já foi usado ou expirou.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Tokens de acesso são válidos por 24 horas após a compra e podem ser usados apenas uma vez.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Voltar para a página inicial
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:suporte@exemplo.com'}
              className="w-full"
            >
              Falar com suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
