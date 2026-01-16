import { Check } from 'lucide-react'

interface PricingCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  badge?: string
  isPremium?: boolean
  onSelect: () => void
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  badge,
  isPremium = false,
  onSelect,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
          : 'bg-white/5 border border-white/10 hover:border-white/20'
      }`}
    >
      {/* Badge */}
      {badge && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
            isPremium
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
              : 'bg-white/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="pt-2">
        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-4xl font-bold ${isPremium ? 'text-emerald-400' : 'text-white'}`}>
            {price}
          </span>
          {period && <span className="text-gray-500 text-sm">{period}</span>}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-5">{description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-gray-300">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isPremium ? 'bg-emerald-500/20' : 'bg-white/10'
                }`}
              >
                <Check className={`w-3 h-3 ${isPremium ? 'text-emerald-400' : 'text-gray-400'}`} />
              </div>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={onSelect}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
            isPremium
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          }`}
        >
          Escolher Plano
        </button>
      </div>
    </div>
  )
}
