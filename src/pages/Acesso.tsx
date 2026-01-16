import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Acesso() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Por favor, insira um email válido.')
      return
    }

    setIsLoading(true)
    navigate(`/processando?email=${encodeURIComponent(email.trim().toLowerCase())}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesse seu Diagnóstico
          </h1>
          <p className="text-gray-600">
            Digite o email usado na compra para acessar seu diagnóstico financeiro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email da compra
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Acessar Diagnóstico
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Acabou de comprar?</strong> Aguarde alguns segundos após o pagamento para que seu acesso seja liberado.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}
