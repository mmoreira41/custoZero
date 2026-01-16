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

    // First, check for any unused token for this email (regardless of age)
    const { data: unusedTokens, error: unusedError } = await supabase
      .from('access_tokens')
      .select('token, created_at, expires_at')
      .eq('email', email.toLowerCase().trim())
      .eq('used', false)
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

    // If we found an unused token, check if it's within 24h
    if (unusedTokens && unusedTokens.length > 0) {
      const tokenData = unusedTokens[0]
      const createdAt = new Date(tokenData.created_at)
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      // Check if token is within the 24h window
      if (hoursSinceCreation < PASS_DURATION_HOURS) {
        // Token is valid - return it with created_at for frontend timer
        console.log(`Valid token found for ${email}: ${tokenData.token} (${hoursSinceCreation.toFixed(1)}h old)`)

        return new Response(
          JSON.stringify({
            token: tokenData.token,
            createdAt: tokenData.created_at,
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
        // Token expired (>24h) - mark as used and return expired status
        console.log(`Token expired for ${email}: ${tokenData.token} (${hoursSinceCreation.toFixed(1)}h old) - marking as used`)

        await supabase
          .from('access_tokens')
          .update({ used: true })
          .eq('token', tokenData.token)

        return new Response(
          JSON.stringify({
            token: null,
            message: 'Seu passe livre de 24h expirou. Renove seu acesso por apenas R$ 7,00!',
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
      .select('token, created_at, used')
      .eq('email', email.toLowerCase().trim())
      .order('created_at', { ascending: false })
      .limit(1)

    if (anyTokenError) {
      console.error('Error checking for any tokens:', anyTokenError)
    }

    const hasAnyToken = anyTokens && anyTokens.length > 0
    const wasUsed = hasAnyToken && anyTokens[0].used

    // No valid token found
    console.log(`No valid token found for email ${email}`)
    return new Response(
      JSON.stringify({
        token: null,
        message: wasUsed
          ? 'Seu passe livre já foi utilizado. Renove seu acesso por apenas R$ 7,00!'
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
