import { Shield} from 'lucide-react'

interface FooterSectionProps {
  onAccessWithEmail: () => void
}

export function FooterSection({ onAccessWithEmail }: FooterSectionProps) {
  return (
    <div className="mt-10 space-y-6">
      {/* Already a customer */}

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          <span>Pagamento Seguro</span>
        </div>
        <span className="text-gray-700">|</span>
        <span>Acesso Imediato</span>
      </div>

      {/* Copyright */}
      <p className="text-center text-gray-600 text-xs">
        CustoZero - Todos os direitos reservados
      </p>
    </div>
  )
}
