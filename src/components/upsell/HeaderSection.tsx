import { Clock } from 'lucide-react'

export function HeaderSection() {
  return (
    <div className="text-center mb-10">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
        <Clock className="w-10 h-10 text-emerald-400" />
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        Seu tempo expirou!
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg max-w-sm mx-auto">
        Seu passe livre de 24 horas chegou ao fim. Continue economizando com nossos planos especiais.
      </p>
    </div>
  )
}
