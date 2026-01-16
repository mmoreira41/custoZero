import { Logo } from '@/components/Logo';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import Solution from '@/components/landing/Solution';
import SocialProof from '@/components/landing/SocialProof';
import ValueStack from '@/components/landing/ValueStack';
import Offer from '@/components/landing/Offer';
import FAQ from '@/components/landing/FAQ';

export function Landing() {
  const isDevelopment = !import.meta.env.VITE_SUPABASE_URL;

  const handleStartDiagnostic = () => {
    if (isDevelopment) {
      // Desenvolvimento: usar token dev (bypassa validação)
      const devToken = 'dev-' + Date.now();
      window.location.href = `/diagnostico?token=${devToken}`;
    } else {
      // Produção: redirecionar para checkout Cakto
      window.location.href = 'https://pay.cakto.com.br/rssnmc4_725942';
    }
  };

  const handleDevMode = () => {
    // Modo de desenvolvimento: token fixo para facilitar testes
    window.location.href = '/diagnostico?token=dev-123456789';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Banner de Desenvolvimento */}
      {isDevelopment && (
        <div className="bg-[#0f172a] text-white py-3 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-sm font-medium">
              🔧 Modo Desenvolvimento - Validação de token desabilitada
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <header className="mx-auto max-w-6xl px-6 pt-6">
          <Logo className="h-8 w-auto" variant="white" />
        </header>

        <Hero
          onStartDiagnostic={handleStartDiagnostic}
          showDevMode={isDevelopment}
          onDevMode={handleDevMode}
        />
        <PainPoints />
        <Solution />
        <SocialProof />
        <ValueStack />
        <Offer onStartDiagnostic={handleStartDiagnostic} />
        <FAQ />

        <footer className="py-8 text-center text-gray-500 border-t border-white/10 px-4">
          <p className="text-sm">© {new Date().getFullYear()} Zero Gasto. Todos os direitos reservados.</p>
          <p className="text-xs mt-2 italic text-gray-600">Este site não faz parte do Google ou Facebook. Os resultados podem variar.</p>
        </footer>
      </div>
    </div>
  );
}
