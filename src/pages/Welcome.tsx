import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExpirationTimer from '@/components/ExpirationTimer'

const steps = [
  {
    icon: CheckCircle,
    title: 'Bem-vindo ao CustoZero!',
    description: 'Seu passe livre de 24h está ativo. Aproveite ao máximo!',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  {
    icon: Clock,
    title: 'Como funciona',
    description: 'Identificaremos seus gastos recorrentes em menos de 3 minutos.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Zap,
    title: 'Resultado imediato',
    description: 'Ao final, você terá um plano de ação para economizar hoje mesmo.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
  },
]

export default function Welcome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Validate token
    const storedToken = localStorage.getItem('custozero_token')
    if (!token && !storedToken) {
      navigate('/acesso')
      return
    }

    // Auto-advance steps for visual effect
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 800)

    return () => clearInterval(interval)
  }, [token, navigate])

  const handleStart = () => {
    const storedToken = localStorage.getItem('custozero_token') || token
    navigate(`/diagnostico?token=${storedToken}`)
  }

  const handleExpire = () => {
    navigate('/acesso-expirado')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ExpirationTimer onExpire={handleExpire} />

      <div className="flex items-center justify-center min-h-[calc(100vh-48px)] p-4">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              Acesso liberado
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pronto para economizar?
            </h1>
            <p className="text-gray-600">
              Veja como funciona em 3 passos simples
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStep

              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-all duration-500 ${
                    isActive
                      ? 'border-blue-200 opacity-100 translate-x-0'
                      : 'border-transparent opacity-40 translate-x-4'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Começar Diagnóstico
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Footer note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Leva menos de 3 minutos para completar
          </p>
        </div>
      </div>
    </div>
  )
}
