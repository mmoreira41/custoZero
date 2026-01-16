import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const POLLING_INTERVAL = 2000 // 2 seconds
const TIMEOUT_DURATION = 60000 // 60 seconds

export default function ProcessingLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'polling' | 'timeout' | 'error' | 'not-found'>('polling')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [, setHasAnyToken] = useState(false)

  useEffect(() => {
    // Validate email parameter
    if (!email) {
      console.error('Email parameter is missing')
      setStatus('error')
      return
    }

    let pollInterval: number
    let timeoutTimer: number
    let elapsedTimer: number

    const pollForToken = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/poll-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email }),
          }
        )

        if (!response.ok) {
          console.error('Error polling for token:', response.statusText)
          return
        }

        const data = await response.json()

        // Update hasAnyToken status
        if (data.hasAnyToken !== undefined) {
          setHasAnyToken(data.hasAnyToken)
        }

        if (data.token) {
          // Token found! First mark it as used, then redirect
          console.log('Token found, marking as used...')
          clearInterval(pollInterval)
          clearTimeout(timeoutTimer)
          clearInterval(elapsedTimer)

          try {
            // Mark token as used (burn the token)
            const burnResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/access_tokens?token=eq.${data.token}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({ used: true }),
              }
            )

            if (!burnResponse.ok) {
              console.error('Failed to burn token:', burnResponse.statusText)
            } else {
              console.log('Token burned successfully')
            }
          } catch (burnError) {
            console.error('Error burning token:', burnError)
          }

          // Redirect to questionnaire regardless of burn result
          // (user should still access even if burn fails)
          navigate(`/diagnostico?token=${data.token}`)
        }
      } catch (error) {
        console.error('Error in polling:', error)
      }
    }

    // Start polling immediately
    pollForToken()

    // Set up polling interval
    pollInterval = window.setInterval(pollForToken, POLLING_INTERVAL)

    // Set up timeout
    timeoutTimer = window.setTimeout(() => {
      clearInterval(pollInterval)
      clearInterval(elapsedTimer)
      // Use a callback to get the latest hasAnyToken value
      setHasAnyToken((latestHasAnyToken) => {
        setStatus(latestHasAnyToken ? 'timeout' : 'not-found')
        return latestHasAnyToken
      })
    }, TIMEOUT_DURATION)

    // Track elapsed time for visual feedback
    elapsedTimer = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeoutTimer)
      clearInterval(elapsedTimer)
    }
  }, [email, navigate])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Link Inválido
          </h2>
          <p className="text-gray-600 mb-6">
            O link de acesso está incompleto. Por favor, use o link que enviamos para seu email.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Acesso Não Encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Não encontramos nenhuma compra associada ao email <strong>{email}</strong>.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Possíveis motivos:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>O pagamento ainda não foi processado</li>
                <li>Você usou um email diferente na compra</li>
                <li>O link de acesso foi digitado incorretamente</li>
              </ul>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'timeout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Seu acesso está pronto!
          </h2>
          <p className="text-gray-600 mb-6">
            Por segurança, este link de entrada expira após o uso. Se você não foi redirecionado automaticamente, tente atualizar a página ou verifique seu e-mail de confirmação da Cakto.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Verifique seu email: <strong>{email}</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Caso não encontre, verifique a pasta de spam ou promoções.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Atualizar Página
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Polling state - show loading animation
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Animated spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
        </div>

        {/* Main message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Estamos validando seu pagamento...
        </h2>

        {/* Dynamic status messages based on time elapsed */}
        <p className="text-gray-600 mb-6">
          {timeElapsed < 10 && 'Aguarde alguns instantes enquanto confirmamos sua compra.'}
          {timeElapsed >= 10 && timeElapsed < 30 && 'Processando sua transação...'}
          {timeElapsed >= 30 && timeElapsed < 50 && 'Quase pronto! Finalizando a validação...'}
          {timeElapsed >= 50 && 'Isso está demorando mais do que o esperado...'}
        </p>

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min((timeElapsed / 60) * 100, 100)}%`,
            }}
          ></div>
        </div>

        {/* Email confirmation */}
        <p className="text-sm text-gray-500">
          Validando acesso para{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>

        {/* Help text after some time */}
        {timeElapsed > 30 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Se o processamento continuar por muito tempo, verifique seu email.
              Enviamos um link alternativo de acesso.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
