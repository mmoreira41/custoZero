import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PollTokenRequest {
  email: string
}

interface PollTokenResponse {
  token: string | null
  createdAt?: string    // Data de criação do token para calcular expiração no frontend
  expiresAt?: string    // Data de expiração do token (null se vitalício)
  isLifetime?: boolean  // Se true, usuário tem acesso vitalício
  message?: string
  hasAnyToken?: boolean
  emailSent?: boolean
  expired?: boolean     // Indica se o token expirou (>24h)
}

const PASS_DURATION_HOURS = 24

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { email } = await req.json() as PollTokenRequest

    // Validate input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({
          token: null,
          message: 'Email é obrigatório'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          token: null,
          message: 'Email inválido'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with SERVICE_ROLE_KEY for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({
          token: null,
          message: 'Configuração inválida do servidor'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const now = new Date()
    const normalizedEmail = email.toLowerCase().trim()

    // First, check for any unused token for this email
    // Order by is_lifetime DESC to prioritize lifetime tokens
    const { data: unusedTokens, error: unusedError } = await supabase
      .from('access_tokens')
      .select('token, created_at, expires_at, is_lifetime')
      .eq('email', normalizedEmail)
      .eq('used', false)
      .order('is_lifetime', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)

    if (unusedError) {
      console.error('Error querying access_tokens:', unusedError)
      return new Response(
        JSON.stringify({
          token: null,
          message: 'Erro ao buscar token'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If we found an unused token
    if (unusedTokens && unusedTokens.length > 0) {
      const tokenData = unusedTokens[0]
      const isLifetime = tokenData.is_lifetime === true

      // ========================================
      // CASO 1: Token Vitalício - Sempre válido
      // ========================================
      if (isLifetime) {
        console.log(`💎 LIFETIME token found for ${normalizedEmail}: ${tokenData.token}`)

        return new Response(
          JSON.stringify({
            token: tokenData.token,
            createdAt: tokenData.created_at,
            expiresAt: null,
            isLifetime: true,
            message: 'Acesso vitalício ativo!',
            hasAnyToken: true,
            emailSent: true,
            expired: false
          } as PollTokenResponse),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // ========================================
      // CASO 2: Token Temporário - Verificar expiração
      // ========================================
      const createdAt = new Date(tokenData.created_at)
      const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null

      // Usar expires_at se disponível, senão calcular baseado em created_at
      let isExpired = false
      if (expiresAt) {
        isExpired = now.getTime() > expiresAt.getTime()
      } else {
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        isExpired = hoursSinceCreation >= PASS_DURATION_HOURS
      }

      if (!isExpired) {
        // Token is valid - return it with created_at for frontend timer
        console.log(`Valid token found for ${normalizedEmail}: ${tokenData.token}`)

        return new Response(
          JSON.stringify({
            token: tokenData.token,
            createdAt: tokenData.created_at,
            expiresAt: tokenData.expires_at,
            isLifetime: false,
            message: 'Token encontrado com sucesso',
            hasAnyToken: true,
            emailSent: true,
            expired: false
          } as PollTokenResponse),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else {
        // Token expired - mark as used and return expired status
        console.log(`Token expired for ${normalizedEmail}: ${tokenData.token} - marking as used`)

        await supabase
          .from('access_tokens')
          .update({ used: true })
          .eq('token', tokenData.token)

        return new Response(
          JSON.stringify({
            token: null,
            message: 'Seu passe livre expirou. Renove seu acesso por apenas R$ 7,90!',
            hasAnyToken: true,
            emailSent: true,
            expired: true
          } as PollTokenResponse),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // No unused token found - check if email has ANY token (even used ones)
    const { data: anyTokens, error: anyTokenError } = await supabase
      .from('access_tokens')
      .select('token, created_at, used, is_lifetime')
      .eq('email', normalizedEmail)
      .order('is_lifetime', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)

    if (anyTokenError) {
      console.error('Error checking for any tokens:', anyTokenError)
    }

    const hasAnyToken = anyTokens && anyTokens.length > 0
    const wasUsed = hasAnyToken && anyTokens[0].used

    // No valid token found
    console.log(`No valid token found for email ${normalizedEmail}`)
    return new Response(
      JSON.stringify({
        token: null,
        message: wasUsed
          ? 'Seu passe livre já foi utilizado. Renove seu acesso por apenas R$ 7,90!'
          : hasAnyToken
            ? 'Nenhum token válido encontrado. Verifique seu email.'
            : 'Email não encontrado em nossa base de dados.',
        hasAnyToken,
        emailSent: hasAnyToken,
        expired: wasUsed
      } as PollTokenResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in poll-token function:', error)
    return new Response(
      JSON.stringify({
        token: null,
        message: 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
