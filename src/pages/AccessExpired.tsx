import { useNavigate } from 'react-router-dom'
import { HeaderSection, PricingCard, FooterSection } from '@/components/upsell'

const PAYMENT_30_DAYS = 'https://pay.cakto.com.br/38wjsj6'
const PAYMENT_LIFETIME = 'https://pay.cakto.com.br/3cppbz2'

export default function AccessExpired() {
  const navigate = useNavigate()

  const handleSelect30Days = () => {
    window.location.href = PAYMENT_30_DAYS
  }

  const handleSelectLifetime = () => {
    window.location.href = PAYMENT_LIFETIME
  }

  const handleAccessWithEmail = () => {
    navigate('/acesso')
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-12 sm:py-16 max-w-lg mx-auto">
        <HeaderSection />

        {/* Pricing Cards */}
        <div className="space-y-6">
          {/* 30 Days - Most Popular */}
          <PricingCard
            title="Use uma vez"
            price="R$ 7,90"
            period="/ 24 Horas"
            description="Perfeito para quem quer testar o poder dos diagnósticos."
            features={[
              'Diagnósticos Ilimitados',
              'Relatórios Detalhados',
              '24 horas de acesso completo',
            ]}
            badge="Mais Popular"
            onSelect={handleSelect30Days}
          />

          {/* Lifetime - Premium */}
          <PricingCard
            title="Acesso Vitalício"
            price="R$ 57,90"
            description="Pagamento único. Economia para sempre."
            features={[
              'Diagnósticos Ilimitados',
              'Selo de Acesso Vitalício',
              'Suporte Prioritário',
              'Todas as atualizações futuras',
            ]}
            badge="Melhor Custo-Benefício"
            isPremium
            onSelect={handleSelectLifetime}
          />
        </div>

        <FooterSection onAccessWithEmail={handleAccessWithEmail} />
      </div>
    </main>
  )
}
