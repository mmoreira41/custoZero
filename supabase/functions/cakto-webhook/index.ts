// Edge Function para processar webhook da Cakto
// Deploy: supabase functions deploy cakto-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valores dos planos em centavos
const PRICE_REACTIVATION_24H = 790;  // R$ 7,90
const PRICE_LIFETIME = 4700;         // R$ 47,00

interface CaktoWebhookPayload {
  // Formato da Cakto (estrutura aninhada)
  event?: string; // "purchase_approved" (na raiz)
  data?: {
    id?: string; // ID da transação
    status?: string; // "paid", "approved"
    customer?: {
      email: string;
      name: string;
      phone?: string;
      docNumber?: string;
    };
    product?: {
      id: string;
      name: string;
    };
    amount?: number; // Valor em centavos
    currency?: string;
    created_at?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase client com SERVICE_ROLE_KEY
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse do payload do webhook
    const rawBody = await req.text();
    const payload: CaktoWebhookPayload = JSON.parse(rawBody);

    // Log do payload completo para debug
    console.log('📦 Cakto webhook payload:', JSON.stringify(payload, null, 2));

    // Extrair dados do payload da Cakto (estrutura aninhada)
    const event = payload.event; // "purchase_approved" (na raiz)
    const status = payload.data?.status; // "paid", "approved" (em data.status)
    const transactionId = payload.data?.id; // ID da transação (em data.id)
    const customerEmail = payload.data?.customer?.email; // Email (em data.customer.email)
    const customerName = payload.data?.customer?.name || 'Cliente'; // Nome
    const productName = payload.data?.product?.name || 'Diagnóstico Financeiro CustoZero';
    const amount = payload.data?.amount || 0; // Valor em centavos

    console.log('📥 Cakto webhook received:', {
      event,
      status,
      transaction_id: transactionId,
      email: customerEmail,
      name: customerName,
      product: productName,
      amount: amount,
    });

    // Validar se é um evento de compra aprovada
    // Baseado no log real: event === 'purchase_approved' OU data.status === 'paid'
    const isPurchaseApproved =
      event === 'purchase_approved' ||
      status === 'paid' ||
      status === 'approved';

    if (!isPurchaseApproved) {
      console.log(`⚠️ Ignoring event: ${event} (status: ${status})`);
      return new Response(
        JSON.stringify({ message: 'Event ignored', event, status }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar email
    if (!customerEmail) {
      console.error('❌ Email is missing in payload');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar se já existe token para esta transação (evitar duplicação)
    if (transactionId) {
      const { data: existingToken } = await supabase
        .from('access_tokens')
        .select('token')
        .eq('order_id', transactionId)
        .single();

      if (existingToken) {
        console.log(`⚠️ Token already exists for transaction ${transactionId}`);
        return new Response(
          JSON.stringify({
            message: 'Token already created',
            token: existingToken.token
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const normalizedEmail = customerEmail.toLowerCase().trim();
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    // Determinar tipo de plano baseado no valor
    const isLifetimePurchase = amount >= PRICE_LIFETIME;
    const isReactivation = amount >= PRICE_REACTIVATION_24H && amount < PRICE_LIFETIME;

    console.log('💰 Payment type detection:', {
      amount,
      isLifetimePurchase,
      isReactivation,
    });

    // Buscar token existente para este email
    const { data: existingUserTokens } = await supabase
      .from('access_tokens')
      .select('id, token, is_lifetime')
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    const existingUserToken = existingUserTokens?.[0];

    // ========================================
    // CASO 1: Compra Vitalícia (R$ 47,00)
    // ========================================
    if (isLifetimePurchase) {
      console.log('💎 Processing LIFETIME purchase');

      if (existingUserToken) {
        // Atualizar registro existente para vitalício
        const { error: updateError } = await supabase
          .from('access_tokens')
          .update({
            is_lifetime: true,
            used: false,
            expires_at: null,
            order_id: transactionId,
            customer_name: customerName,
          })
          .eq('id', existingUserToken.id);

        if (updateError) {
          console.error('❌ Error updating to lifetime:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to upgrade to lifetime', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Token upgraded to LIFETIME:', {
          email: normalizedEmail,
          token: existingUserToken.token,
          transaction_id: transactionId,
        });

        return new Response(
          JSON.stringify({
            success: true,
            redirect_url: `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`,
            token: existingUserToken.token,
            is_lifetime: true,
            message: 'Upgraded to lifetime access',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Criar novo token vitalício
        const newToken = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('access_tokens')
          .insert({
            token: newToken,
            email: normalizedEmail,
            used: false,
            is_lifetime: true,
            expires_at: null,
            order_id: transactionId,
            customer_name: customerName,
          });

        if (insertError) {
          console.error('❌ Error creating lifetime token:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create lifetime token', details: insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ New LIFETIME token created:', {
          email: normalizedEmail,
          token: newToken,
          transaction_id: transactionId,
        });

        return new Response(
          JSON.stringify({
            success: true,
            redirect_url: `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`,
            token: newToken,
            is_lifetime: true,
            message: 'Lifetime access created',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========================================
    // CASO 2: Reativação 24h (R$ 7,90)
    // ========================================
    if (isReactivation) {
      console.log('🔄 Processing REACTIVATION (24h) purchase');

      // Calcular nova expiração (24 horas a partir de agora)
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + 24);

      if (existingUserToken) {
        // Se já é vitalício, não fazer downgrade
        if (existingUserToken.is_lifetime) {
          console.log('⚠️ User already has lifetime access, ignoring reactivation');
          return new Response(
            JSON.stringify({
              success: true,
              redirect_url: `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`,
              token: existingUserToken.token,
              is_lifetime: true,
              message: 'User already has lifetime access',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Reativar token existente por mais 24h
        const { error: updateError } = await supabase
          .from('access_tokens')
          .update({
            used: false,
            expires_at: newExpiresAt.toISOString(),
            order_id: transactionId,
            customer_name: customerName,
          })
          .eq('id', existingUserToken.id);

        if (updateError) {
          console.error('❌ Error reactivating token:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to reactivate token', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Token REACTIVATED for 24h:', {
          email: normalizedEmail,
          token: existingUserToken.token,
          transaction_id: transactionId,
          expires_at: newExpiresAt.toISOString(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            redirect_url: `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`,
            token: existingUserToken.token,
            expires_at: newExpiresAt.toISOString(),
            message: 'Token reactivated for 24 hours',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Criar novo token com 24h de validade
        const newToken = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('access_tokens')
          .insert({
            token: newToken,
            email: normalizedEmail,
            used: false,
            is_lifetime: false,
            expires_at: newExpiresAt.toISOString(),
            order_id: transactionId,
            customer_name: customerName,
          });

        if (insertError) {
          console.error('❌ Error creating reactivation token:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create token', details: insertError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ New 24h token created:', {
          email: normalizedEmail,
          token: newToken,
          transaction_id: transactionId,
          expires_at: newExpiresAt.toISOString(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            redirect_url: `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`,
            token: newToken,
            expires_at: newExpiresAt.toISOString(),
            message: '24h access created',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========================================
    // CASO 3: Outro valor (primeira compra padrão ou valor desconhecido)
    // ========================================
    console.log('📦 Processing standard purchase (unknown amount or first purchase)');

    // Gerar token único (UUID)
    const token = crypto.randomUUID();

    // Calcular data de expiração (24 horas para passe livre)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Salvar token no banco
    const { error: insertError } = await supabase
      .from('access_tokens')
      .insert({
        token,
        email: normalizedEmail,
        used: false,
        is_lifetime: false,
        expires_at: expiresAt.toISOString(),
        order_id: transactionId,
        customer_name: customerName,
      });

    if (insertError) {
      console.error('❌ Error inserting token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create access token', details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const processingUrl = `${appUrl}/processando?email=${encodeURIComponent(normalizedEmail)}`;

    console.log('✅ Token created successfully:', {
      email: normalizedEmail,
      token,
      transaction_id: transactionId,
      expires_at: expiresAt.toISOString(),
    });

    // Retornar sucesso com URL de processamento (redirecionamento automático com polling)
    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: processingUrl,
        token,
        expires_at: expiresAt.toISOString(),
        message: 'Token created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
