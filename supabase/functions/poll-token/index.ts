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
  message?: string
  hasAnyToken?: boolean  // Indica se o email tem ALGUM token (mesmo antigo)
  emailSent?: boolean    // Indica se foi enviado email para esse cliente
}

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

    // Calculate the time threshold (24 hours ago)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Search for a valid token
    // Conditions:
    // 1. Email matches
    // 2. Not used yet (used = false)
    // 3. Created within the last 24 hours
    // 4. Not expired
    const { data: tokens, error } = await supabase
      .from('access_tokens')
      .select('token, created_at, expires_at')
      .eq('email', email.toLowerCase().trim())
      .eq('used', false)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error querying access_tokens:', error)
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

    // If a valid token is found, return it
    if (tokens && tokens.length > 0) {
      const tokenData = tokens[0]
      console.log(`Token found for email ${email}: ${tokenData.token}`)

      return new Response(
        JSON.stringify({
          token: tokenData.token,
          message: 'Token encontrado com sucesso',
          hasAnyToken: true,
          emailSent: true
        } as PollTokenResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // No recent token found, but check if email has ANY token (even old ones)
    // This helps differentiate between "email with purchase" vs "random email"
    const { data: anyTokens, error: anyTokenError } = await supabase
      .from('access_tokens')
      .select('token, created_at')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    if (anyTokenError) {
      console.error('Error checking for any tokens:', anyTokenError)
    }

    const hasAnyToken = anyTokens && anyTokens.length > 0

    // No valid token found within 24 hours
    console.log(`No valid token found for email ${email} within the last 24 hours`)
    return new Response(
      JSON.stringify({
        token: null,
        message: hasAnyToken
          ? 'Nenhum token válido encontrado ainda. Verifique seu email.'
          : 'Email não encontrado em nossa base de dados.',
        hasAnyToken,
        emailSent: hasAnyToken
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
