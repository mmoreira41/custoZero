import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'

const PASS_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeRemaining(createdAt: string): TimeRemaining {
  const created = new Date(createdAt).getTime()
  const expiresAt = created + PASS_DURATION_MS
  const now = Date.now()
  const total = Math.max(0, expiresAt - now)

  const hours = Math.floor(total / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  return { hours, minutes, seconds, total }
}

function formatTime(value: number): string {
  return value.toString().padStart(2, '0')
}

interface ExpirationTimerProps {
  onExpire?: () => void
}

export default function ExpirationTimer({ onExpire }: ExpirationTimerProps) {
  const navigate = useNavigate()
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const createdAt = localStorage.getItem('custozero_created_at')

    if (!createdAt) {
      // No session data, redirect to access page
      navigate('/acesso')
      return
    }

    // Calculate initial time
    const initial = calculateTimeRemaining(createdAt)
    setTimeRemaining(initial)

    if (initial.total <= 0) {
      setIsExpired(true)
      if (onExpire) onExpire()
      return
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(createdAt)
      setTimeRemaining(remaining)

      if (remaining.total <= 0) {
        setIsExpired(true)
        clearInterval(interval)
        // Clear localStorage
        localStorage.removeItem('custozero_token')
        localStorage.removeItem('custozero_created_at')
        localStorage.removeItem('custozero_email')
        if (onExpire) onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate, onExpire])

  if (!timeRemaining) {
    return null
  }

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Seu passe livre expirou!</span>
          <button
            onClick={() => navigate('/acesso-expirado')}
            className="ml-2 bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            Renovar por R$ 7
          </button>
        </div>
      </div>
    )
  }

  // Determine urgency level for styling
  const isUrgent = timeRemaining.hours < 1
  const isCritical = timeRemaining.hours < 1 && timeRemaining.minutes < 30

  return (
    <div
      className={`py-2 px-4 text-center sticky top-0 z-50 shadow-sm transition-colors ${
        isCritical
          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
          : isUrgent
            ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Passe livre expira em:</span>
        <span className="font-mono font-bold text-lg">
          {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
        </span>
      </div>
    </div>
  )
}
