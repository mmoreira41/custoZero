import type React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, TrendingDown, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Landing() {
  const isDevelopment = !import.meta.env.VITE_SUPABASE_URL;

  const handleStartDiagnostic = () => {
    if (isDevelopment) {
      // Desenvolvimento: usar token dev (bypassa validação)
      const devToken = 'dev-' + Date.now();
      window.location.href = `/diagnostico?token=${devToken}`;
    } else {
      // Produção: redirecionar para checkout Kiwify
      window.location.href = 'https://pay.kiwify.com.br/N9qXUaf';
    }
  };

  const handleDevMode = () => {
    // Modo de desenvolvimento: token fixo para facilitar testes
    window.location.href = '/diagnostico?token=dev-123456789';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner de Desenvolvimento */}
      {isDevelopment && (
        <div className="bg-primary text-primary-foreground py-3">
          <div className="mx-auto max-w-7xl px-8 text-center">
            <p className="text-sm font-medium">
              🔧 Modo Desenvolvimento - Validação de token desabilitada
            </p>
          </div>
        </div>
      )}

      {/* Padrão de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <div className="relative">
        {/* Header com Logo */}
        <header className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
          <Logo className="h-8 w-auto" />
        </header>

        {/* Hero */}
        <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:pb-32 lg:px-8 lg:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Diagnóstico gratuito em 5 minutos
            </div>

            <h1 className="text-balance text-4xl xs:text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
              Você sabe quanto dinheiro perde todo mês?
            </h1>

            <p className="mt-4 xs:mt-6 text-pretty text-base xs:text-lg leading-7 xs:leading-8 text-gray-600 sm:text-xl">
              Em 5 minutos mostramos, com números, onde está o desperdício.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
              <Button
                size="lg"
                onClick={handleStartDiagnostic}
                className="h-14 bg-emerald-600 px-8 text-lg font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/40"
              >
                Fazer diagnóstico agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {isDevelopment && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDevMode}
                  className="h-14 px-6 text-lg"
                >
                  🧪 Modo Teste (sem token)
                </Button>
              )}
            </div>

            {isDevelopment && (
              <p className="mt-2 text-sm text-gray-500">
                💡 Ambos os botões funcionam sem validação de token em modo de desenvolvimento.
              </p>
            )}

            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D', 'E'].map((label) => (
                  <Avatar key={label} className="h-10 w-10 border-2 border-white">
                    <AvatarImage
                      src={`https://placehold.co/100x100/10b981/ffffff?text=${label}`}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        // Limpa src para ativar o fallback do Avatar
                        e.currentTarget.src = '';
                      }}
                    />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {label}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600">
                Join <span className="font-semibold text-gray-900">10,000+ users</span> saving money
              </p>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <TrendingDown className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">R$ 847</p>
                <p className="mt-2 text-sm text-gray-600">Economia média mensal</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <svg
                      className="h-6 w-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">5 min</p>
                <p className="mt-2 text-sm text-gray-600">Tempo do diagnóstico</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <svg
                      className="h-6 w-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">100%</p>
                <p className="mt-2 text-sm text-gray-600">Gratuito e confidencial</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <p className="text-center text-sm leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Diagnóstico Financeiro Pessoal. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
