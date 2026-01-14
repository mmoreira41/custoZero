// Edge Function para processar webhook do Kiwify
// Deploy: supabase functions deploy kiwify-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
};

interface KiwifyWebhookPayload {
  // Formato do Kiwify (campos no nível raiz)
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  Customer?: {
    email: string;
    full_name: string;
    first_name?: string;
    mobile?: string;
  };
  Product?: {
    product_id: string;
    product_name: string;
  };
  Commissions?: {
    charge_amount: number;
    product_base_price_currency: string;
  };

  // Formato alternativo (compatibilidade)
  event?: 'order.paid' | 'order.refunded' | 'order.cancelled';
  customer?: {
    email: string;
    name: string;
    phone?: string;
  };
  product?: {
    id: string;
    name: string;
  };
  amount?: number;
  currency?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;

  // Campos alternativos
  email?: string;
  transaction_id?: string;
  status?: string;
  customer_name?: string;
}

// Função para validar assinatura do webhook
async function validateWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.warn('⚠️ No signature provided, skipping validation');
    return true; // Em desenvolvimento, aceitar sem assinatura
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Error validating signature:', error);
    return false;
  }
}

// Função para enviar email (usando Resend API)
async function sendWelcomeEmail(
  email: string,
  name: string,
  diagnosticUrl: string,
  expiresAt: Date
) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CustoZero <onboarding@resend.dev>',
        to: email,
        subject: '🎉 Seu diagnóstico financeiro está pronto!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Pagamento Confirmado!</h1>
                </div>
                <div class="content">
                  <p>Olá, <strong>${name}</strong>!</p>
                  <p>Seu pagamento foi aprovado com sucesso. Agora você pode acessar seu diagnóstico financeiro personalizado!</p>
                  <p style="text-align: center;">
                    <a href="${diagnosticUrl}" class="button">
                      Acessar Meu Diagnóstico
                    </a>
                  </p>
                  <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                      <li>Este link é de <strong>uso único</strong></li>
                      <li>Não compartilhe este link com outras pessoas</li>
                      <li>O link expira em: <strong>${expiresAt.toLocaleDateString('pt-BR')}</strong></li>
                    </ul>
                  </div>
                  <p>Após completar o diagnóstico, você receberá um relatório detalhado com:</p>
                  <ul>
                    <li>💰 Quanto você gasta por mês com assinaturas</li>
                    <li>📊 Análise completa dos seus custos</li>
                    <li>💡 Recomendações para economizar</li>
                    <li>🎯 Plano de ação personalizado</li>
                  </ul>
                  <p>Qualquer dúvida, responda este email.</p>
                  <p>Bom diagnóstico! 🚀</p>
                  <p><strong>Equipe CustoZero</strong></p>
                </div>
                <div class="footer">
                  <p>© 2026 CustoZero. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log('✅ Email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse do payload do webhook
    const rawBody = await req.text();
    let payload: KiwifyWebhookPayload = JSON.parse(rawBody);

    // Log do payload completo para debug
    console.log('📦 Raw payload:', JSON.stringify(payload, null, 2));

    // Normalizar campos (suportar formato Kiwify e outros formatos)
    let event: string;
    let orderId: string | undefined;
    let customerEmail: string | undefined;
    let customerName: string;
    let productName: string;

    // Verificar se é formato Kiwify (campos no nível raiz com Customer e webhook_event_type)
    if (payload.webhook_event_type && payload.Customer) {
      // Formato do Kiwify (campos no nível raiz)
      const webhookEventType = payload.webhook_event_type;

      // Mapear webhook_event_type para nosso formato interno
      if (webhookEventType === 'order_approved' || payload.order_status === 'paid') {
        event = 'order.paid';
      } else if (webhookEventType === 'order_refunded') {
        event = 'order.refunded';
      } else if (webhookEventType === 'order_cancelled') {
        event = 'order.cancelled';
      } else {
        event = 'unknown';
      }

      orderId = payload.order_id;
      customerEmail = payload.Customer.email;
      customerName = payload.Customer.full_name || payload.Customer.first_name || 'Cliente';
      productName = payload.Product?.product_name || 'Produto';
    } else {
      // Formato alternativo (compatibilidade)
      event = payload.event || (payload.status === 'paid' || payload.status === 'approved' ? 'order.paid' : 'unknown');
      orderId = payload.order_id || payload.transaction_id;
      customerEmail = payload.customer?.email || payload.email;
      customerName = payload.customer?.name || payload.customer_name || 'Cliente';
      productName = payload.product?.name || 'Produto';
    }

    console.log('📥 Kiwify webhook received:', {
      event,
      order_id: orderId,
      email: customerEmail,
      name: customerName,
      product: productName,
    });

    // Validar assinatura do webhook
    const signature = req.headers.get('x-kiwify-signature');
    const webhookSecret = Deno.env.get('KIWIFY_WEBHOOK_SECRET') ?? '';

    const isValid = await validateWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid && webhookSecret) {
      console.error('❌ Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Processar apenas eventos de pagamento confirmado
    if (event !== 'order.paid') {
      console.log(`⚠️ Ignoring event: ${event}`);
      return new Response(
        JSON.stringify({ message: 'Event ignored', event }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar email
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar se já existe token para este pedido (evitar duplicação)
    if (orderId) {
      const { data: existingToken } = await supabase
        .from('access_tokens')
        .select('token')
        .eq('order_id', orderId)
        .single();

      if (existingToken) {
        console.log(`⚠️ Token already exists for order ${orderId}`);
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
        email: customerEmail,
        used: false,
        expires_at: expiresAt.toISOString(),
        order_id: orderId,
        customer_name: customerName,
      });

    if (insertError) {
      console.error('❌ Error inserting token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create access token' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construir URLs
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const diagnosticUrl = `${appUrl}/diagnostico?token=${token}`;
    const processingUrl = `${appUrl}/processando?email=${encodeURIComponent(customerEmail)}`;

    console.log('✅ Token created successfully:', {
      email: customerEmail,
      token,
      order_id: orderId,
      expires_at: expiresAt.toISOString(),
    });

    // Enviar email com link de acesso direto (fallback)
    try {
      await sendWelcomeEmail(customerEmail, customerName, diagnosticUrl, expiresAt);
    } catch (emailError) {
      console.error('⚠️ Email sending failed, but token was created:', emailError);
      // Não falhar a requisição se apenas o email falhar
    }

    // Retornar sucesso com URL de processamento (novo fluxo com polling)
    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: processingUrl,
        token,
        expires_at: expiresAt.toISOString(),
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
