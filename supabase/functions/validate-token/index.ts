// ============================================================================
// Edge Function: validate-token
// Descrição: Valida tokens - NÃO marca como usado durante 24h (Passe Livre)
// Autor: Security Implementation
// Data: 2026-01-16
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PASS_DURATION_HOURS = 24;

// ============================================================================
// TYPES
// ============================================================================

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  createdAt?: string;
  error?: string;
  expired?: boolean;
}

interface AccessToken {
  email: string;
  token: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ========================================================================
    // 1. VALIDAR REQUEST
    // ========================================================================

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse body
    const { token } = (await req.json()) as ValidateTokenRequest;

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 2. CRIAR CLIENTE SUPABASE COM SERVICE ROLE
    // ========================================================================

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ========================================================================
    // 3. BUSCAR TOKEN NO BANCO
    // ========================================================================

    const { data: tokenData, error: selectError } = await supabase
      .from('access_tokens')
      .select('email, token, used, expires_at, created_at')
      .eq('token', token)
      .single();

    // Token não encontrado
    if (selectError || !tokenData) {
      console.log(`Token not found: ${token}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid token' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const accessToken = tokenData as AccessToken;
    const now = new Date();
    const createdAt = new Date(accessToken.created_at);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // ========================================================================
    // 4. VERIFICAR SE TOKEN JÁ FOI MARCADO COMO USADO
    // ========================================================================

    if (accessToken.used) {
      console.log(`Token already used: ${token}`);
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Seu passe livre já foi utilizado. Renove por R$ 7,00!',
          expired: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 5. VERIFICAR SE TOKEN ESTÁ DENTRO DA JANELA DE 24H (PASSE LIVRE)
    // ========================================================================

    if (hoursSinceCreation < PASS_DURATION_HOURS) {
      // Token válido e dentro das 24h - NÃO marca como usado
      console.log(`Token valid (${hoursSinceCreation.toFixed(1)}h old): ${token} for ${accessToken.email}`);

      return new Response(
        JSON.stringify({
          valid: true,
          email: accessToken.email,
          createdAt: accessToken.created_at,
          expired: false
        } as ValidateTokenResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 6. TOKEN EXPIROU (>24H) - MARCAR COMO USADO
    // ========================================================================

    console.log(`Token expired (${hoursSinceCreation.toFixed(1)}h old): ${token} - marking as used`);

    await supabase
      .from('access_tokens')
      .update({ used: true })
      .eq('token', token);

    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Seu passe livre de 24h expirou. Renove por R$ 7,00!',
        expired: true
      } as ValidateTokenResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    console.error('Unexpected error in validate-token:', error);

    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Internal server error',
      } as ValidateTokenResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
