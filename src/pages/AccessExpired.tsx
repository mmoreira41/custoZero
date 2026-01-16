import { useNavigate } from 'react-router-dom'
import { Clock, Zap, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const UPSELL_URL = 'https://pay.cakto.com.br/rssnmc4_725942'

const benefits = [
  {
    icon: RefreshCw,
    title: 'Diagnósticos ilimitados',
    description: 'Refaça quantas vezes quiser por 30 dias',
  },
  {
    icon: Zap,
    title: 'Atualizações em tempo real',
    description: 'Veja quanto está economizando',
  },
  {
    icon: Shield,
    title: 'Suporte prioritário',
    description: 'Tire dúvidas quando precisar',
  },
]

export default function AccessExpired() {
  const navigate = useNavigate()

  const handleRenew = () => {
    window.location.href = UPSELL_URL
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Seu tempo expirou!
          </h1>
          <p className="text-gray-600 mb-6">
            Seu passe livre de 24 horas chegou ao fim. Mas não precisa parar por aqui!
          </p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <p className="text-sm font-medium text-green-700 mb-1">
              Renove seu acesso por apenas
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-green-600">R$ 7</span>
              <span className="text-gray-500 line-through text-lg">R$ 27</span>
            </div>
            <p className="text-sm text-green-600 font-medium">
              Acesso ilimitado por 30 dias
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6 text-left">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{benefit.title}</p>
                    <p className="text-gray-500 text-xs">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <Button
            onClick={handleRenew}
            size="lg"
            className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 mb-3"
          >
            Renovar Agora
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Pagamento seguro via Cakto. Acesso imediato após a confirmação.
        </p>
      </div>
    </div>
  )
}
