/**
 * ============================================================================
 * EXEMPLO DE WEBHOOK KIWIFY
 * ============================================================================
 * Este arquivo é um EXEMPLO de como implementar o webhook do Kiwify.
 * Você precisa adaptar para sua infraestrutura (Vercel, AWS Lambda, etc.)
 *
 * @example Deploy: Vercel Serverless Function
 * @example Deploy: AWS Lambda
 * @example Deploy: Node.js + Express
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

// ✅ Supabase Admin (Service Role Key - APENAS NO BACKEND!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 🔒 NUNCA exponha isso no front-end!
);

// ============================================================================
// TYPES
// ============================================================================

interface KiwifyWebhookPayload {
  event: 'order.paid' | 'order.refunded' | 'order.cancelled';
  order_id: string;
  customer: {
    email: string;
    name: string;
    phone?: string;
  };
  product: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// WEBHOOK HANDLER (Vercel Serverless Function)
// ============================================================================

/**
 * Arquivo: api/kiwify-webhook.ts (Vercel)
 * URL: https://custozero.com.br/api/kiwify-webhook
 */
export default async function handler(req: any, res: any) {
  // ========================================================================
  // 1. VALIDAR MÉTODO
  // ========================================================================

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ========================================================================
    // 2. PARSEAR PAYLOAD
    // ========================================================================

    const payload: KiwifyWebhookPayload = req.body;

    console.log('📥 Kiwify webhook received:', {
      event: payload.event,
      order_id: payload.order_id,
      email: payload.customer.email,
    });

    // ========================================================================
    // 3. VALIDAR ASSINATURA (IMPORTANTE!)
    // ========================================================================

    // Kiwify envia um header "X-Kiwify-Signature" para validar autenticidade
    const signature = req.headers['x-kiwify-signature'];
    const secret = process.env.KIWIFY_WEBHOOK_SECRET!;

    // Verificar assinatura (previne webhooks falsos)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // ========================================================================
    // 4. PROCESSAR EVENTO
    // ========================================================================

    switch (payload.event) {
      case 'order.paid':
        await handleOrderPaid(payload);
        break;

      case 'order.refunded':
        await handleOrderRefunded(payload);
        break;

      case 'order.cancelled':
        await handleOrderCancelled(payload);
        break;

      default:
        console.log(`⚠️ Unhandled event: ${payload.event}`);
    }

    // ========================================================================
    // 5. RESPONDER OK
    // ========================================================================

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// HANDLERS DE EVENTOS
// ============================================================================

/**
 * Handler: Pedido Pago (order.paid)
 * Cria token de acesso e envia email
 */
async function handleOrderPaid(payload: KiwifyWebhookPayload) {
  const { customer, order_id } = payload;

  console.log(`✅ Processing paid order: ${order_id}`);

  // ========================================================================
  // 1. VERIFICAR SE JÁ EXISTE TOKEN PARA ESTE PEDIDO
  // ========================================================================

  const { data: existingToken } = await supabaseAdmin
    .from('access_tokens')
    .select('token')
    .eq('order_id', order_id)
    .single();

  if (existingToken) {
    console.log(`⚠️ Token already exists for order ${order_id}`);
    return; // Já processado (webhook duplicado)
  }

  // ========================================================================
  // 2. GERAR TOKEN ÚNICO (UUID v4)
  // ========================================================================

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias

  // ========================================================================
  // 3. INSERIR TOKEN NO BANCO
  // ========================================================================

  const { error: insertError } = await supabaseAdmin
    .from('access_tokens')
    .insert({
      email: customer.email,
      token: token,
      used: false,
      expires_at: expiresAt.toISOString(),
      order_id: order_id, // Rastrear pedido
      customer_name: customer.name,
    });

  if (insertError) {
    console.error('❌ Error inserting token:', insertError);
    throw new Error('Failed to create access token');
  }

  console.log(`✅ Token created: ${token} for ${customer.email}`);

  // ========================================================================
  // 4. ENVIAR EMAIL COM LINK
  // ========================================================================

  const diagnosticUrl = `${process.env.APP_URL}/diagnostico?token=${token}`;

  await sendWelcomeEmail({
    to: customer.email,
    name: customer.name,
    diagnosticUrl: diagnosticUrl,
    expiresAt: expiresAt,
  });

  console.log(`📧 Email sent to: ${customer.email}`);
}

/**
 * Handler: Pedido Reembolsado (order.refunded)
 * Invalidar token associado
 */
async function handleOrderRefunded(payload: KiwifyWebhookPayload) {
  const { order_id } = payload;

  console.log(`💸 Processing refunded order: ${order_id}`);

  // Marcar token como inválido (ou deletar)
  await supabaseAdmin
    .from('access_tokens')
    .update({ used: true }) // Ou: .delete()
    .eq('order_id', order_id);

  console.log(`✅ Token invalidated for order: ${order_id}`);
}

/**
 * Handler: Pedido Cancelado (order.cancelled)
 */
async function handleOrderCancelled(payload: KiwifyWebhookPayload) {
  const { order_id } = payload;

  console.log(`❌ Processing cancelled order: ${order_id}`);

  // Similar ao refund
  await supabaseAdmin
    .from('access_tokens')
    .update({ used: true })
    .eq('order_id', order_id);

  console.log(`✅ Token invalidated for order: ${order_id}`);
}

// ============================================================================
// SERVIÇO DE EMAIL
// ============================================================================

interface EmailOptions {
  to: string;
  name: string;
  diagnosticUrl: string;
  expiresAt: Date;
}

/**
 * Envia email de boas-vindas com link de acesso
 * Adapte para seu provedor de email (SendGrid, Mailgun, Resend, etc.)
 */
async function sendWelcomeEmail(options: EmailOptions) {
  const { to, name, diagnosticUrl, expiresAt } = options;

  // ========================================================================
  // OPÇÃO 1: Resend (recomendado, simples)
  // ========================================================================

  const resend = await import('resend').then((m) => m.Resend);
  const client = new resend(process.env.RESEND_API_KEY);

  await client.emails.send({
    from: 'CustoZero <noreply@custozero.com.br>',
    to: to,
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
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  // ========================================================================
  // OPÇÃO 2: SendGrid
  // ========================================================================

  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: to,
    from: 'noreply@custozero.com.br',
    subject: '🎉 Seu diagnóstico financeiro está pronto!',
    html: '...',
  });
  */

  // ========================================================================
  // OPÇÃO 3: Mailgun
  // ========================================================================

  /*
  const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  await mailgun.messages().send({
    from: 'CustoZero <noreply@custozero.com.br>',
    to: to,
    subject: '🎉 Seu diagnóstico financeiro está pronto!',
    html: '...',
  });
  */
}

// ============================================================================
// MIGRATION SQL: Adicionar order_id e customer_name
// ============================================================================

/*
-- Executar no Supabase SQL Editor
ALTER TABLE access_tokens
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Criar índice para busca por order_id
CREATE INDEX IF NOT EXISTS idx_access_tokens_order_id
ON access_tokens(order_id);
*/

// ============================================================================
// VARIÁVEIS DE AMBIENTE NECESSÁRIAS
// ============================================================================

/*
# .env (backend)
SUPABASE_URL=https://vwpcomebhlvdqmhdyohm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # 🔒 Service Role Key
KIWIFY_WEBHOOK_SECRET=seu-secret-aqui
APP_URL=https://custozero.com.br
RESEND_API_KEY=re_...  # ou SENDGRID_API_KEY, etc.
*/

// ============================================================================
// CONFIGURAR WEBHOOK NO KIWIFY
// ============================================================================

/*
1. Dashboard Kiwify: https://dashboard.kiwify.com.br/
2. Configurações → Webhooks
3. Adicionar novo webhook:
   - URL: https://custozero.com.br/api/kiwify-webhook
   - Eventos: order.paid, order.refunded, order.cancelled
   - Secret: Gerar e copiar para .env
4. Salvar
5. Testar envio de webhook
*/

// ============================================================================
// TESTAR LOCALMENTE (com ngrok)
// ============================================================================

/*
# Terminal 1: Rodar servidor local
npm run dev

# Terminal 2: Expor via ngrok
ngrok http 3000

# Usar URL do ngrok no Kiwify:
# https://abc123.ngrok.io/api/kiwify-webhook

# Testar webhook manualmente:
curl -X POST https://abc123.ngrok.io/api/kiwify-webhook \
  -H "Content-Type: application/json" \
  -H "X-Kiwify-Signature: hash-aqui" \
  -d '{
    "event": "order.paid",
    "order_id": "TEST-123",
    "customer": {
      "email": "teste@example.com",
      "name": "João Teste"
    },
    "product": {
      "id": "PROD-123",
      "name": "Diagnóstico Financeiro"
    },
    "amount": 7.00,
    "currency": "BRL",
    "created_at": "2026-01-09T10:30:00Z"
  }'
*/

export {};
