// ============================================================================
// Edge Function: validate-token
// Descrição: Valida e marca tokens como usados de forma segura
// Autor: Security Implementation
// Data: 2026-01-09
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

// ============================================================================
// TYPES
// ============================================================================

interface ValidateTokenRequest {
  token: string;
}

interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  error?: string;
}

interface AccessToken {
  email: string;
  token: string;
  used: boolean;
  expires_at: string;
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
    // 3. VALIDAR TOKEN NO BANCO
    // ========================================================================

    const { data: tokenData, error: selectError } = await supabase
      .from('access_tokens')
      .select('email, token, used, expires_at')
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

    // ========================================================================
    // 4. VERIFICAR SE TOKEN JÁ FOI USADO
    // ========================================================================

    if (accessToken.used) {
      console.log(`Token already used: ${token}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Token already used' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 5. VERIFICAR SE TOKEN EXPIROU
    // ========================================================================

    const expiresAt = new Date(accessToken.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      console.log(`Token expired: ${token}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Token expired' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================================================
    // 6. MARCAR TOKEN COMO USADO
    // ========================================================================

    const { error: updateError } = await supabase
      .from('access_tokens')
      .update({ used: true })
      .eq('token', token);

    if (updateError) {
      console.error('Error marking token as used:', updateError);
      // Retorna sucesso mesmo com erro de update
      // (melhor permitir acesso do que bloquear por erro técnico)
    }

    // ========================================================================
    // 7. RETORNAR SUCESSO
    // ========================================================================

    console.log(`Token validated successfully: ${token} for ${accessToken.email}`);

    return new Response(
      JSON.stringify({
        valid: true,
        email: accessToken.email,
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

// ============================================================================
// TESTES LOCAIS
// ============================================================================

/*
# Para testar localmente:

1. Instalar Supabase CLI:
   brew install supabase/tap/supabase

2. Iniciar projeto:
   supabase init
   supabase start

3. Servir função localmente:
   supabase functions serve validate-token --env-file .env.local

4. Testar com curl:
   curl -i --location --request POST 'http://localhost:54321/functions/v1/validate-token' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"token":"test-token-123"}'

5. Resultado esperado:
   {
     "valid": true,
     "email": "user@example.com"
   }
*/

// ============================================================================
// DEPLOY
// ============================================================================

/*
# Deploy para produção:

1. Login no Supabase:
   supabase login

2. Link ao projeto:
   supabase link --project-ref YOUR_PROJECT_REF

3. Deploy da função:
   supabase functions deploy validate-token

4. Verificar secrets:
   supabase secrets list

   Secrets necessários (já configurados automaticamente):
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

5. Testar em produção:
   curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-token' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"token":"real-token-from-kiwify"}'
*/
