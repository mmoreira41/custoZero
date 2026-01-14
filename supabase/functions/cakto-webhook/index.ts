// Edge Function para processar webhook da Cakto
// Deploy: supabase functions deploy cakto-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    amount?: number;
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

    console.log('📥 Cakto webhook received:', {
      event,
      status,
      transaction_id: transactionId,
      email: customerEmail,
      name: customerName,
      product: productName,
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

    // Gerar token único (UUID)
    const token = crypto.randomUUID();

    // Calcular data de expiração (30 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Salvar token no banco
    const { error: insertError } = await supabase
      .from('access_tokens')
      .insert({
        token,
        email: customerEmail.toLowerCase().trim(),
        used: false,
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

    // Construir URL de processamento (redirecionamento automático)
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const processingUrl = `${appUrl}/processando?email=${encodeURIComponent(customerEmail)}`;

    console.log('✅ Token created successfully:', {
      email: customerEmail,
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
