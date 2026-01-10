# 🚀 Guia Completo de Deploy - CustoZero

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Kiwify](#configuração-do-kiwify)
4. [Configuração do Email (Resend)](#configuração-do-email-resend)
5. [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
6. [Testes e Validação](#testes-e-validação)
7. [Monitoramento](#monitoramento)

---

## 🎯 Pré-requisitos

- [ ] Conta no Supabase (https://supabase.com)
- [ ] Conta no Kiwify (https://kiwify.com.br)
- [ ] Conta no Resend (https://resend.com) - plano gratuito disponível
- [ ] Conta na Vercel (https://vercel.com) - plano gratuito disponível
- [ ] Node.js v18+ instalado
- [ ] Supabase CLI instalado (`brew install supabase/tap/supabase`)
- [ ] Git instalado

---

## 📊 Configuração do Supabase

### 1. Criar Projeto (se ainda não criou)

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Escolha nome, senha e região
4. Aguarde criação (2-3 minutos)

### 2. Aplicar Migrations

As migrations já foram aplicadas automaticamente durante o setup. Se precisar reaplicar:

```bash
# Link do projeto (se ainda não linkado)
supabase link --project-ref vwpcomebhlvdqmhdyohm

# Aplicar migrations
supabase db push
```

### 3. Configurar Variáveis de Ambiente das Edge Functions

```bash
# Configurar URL da aplicação (substitua pela sua URL de produção)
supabase secrets set APP_URL=https://custozero.com.br

# Configurar secret do webhook Kiwify (obter no dashboard do Kiwify)
supabase secrets set KIWIFY_WEBHOOK_SECRET=seu-secret-aqui

# Configurar API key do Resend (obter em resend.com/api-keys)
supabase secrets set RESEND_API_KEY=re_sua_api_key_aqui
```

### 4. Deploy das Edge Functions

As Edge Functions já foram deployadas. Se precisar redesployar:

```bash
# Deploy do webhook Kiwify
supabase functions deploy kiwify-webhook

# Deploy da validação de token
supabase functions deploy validate-token

# Verificar status
supabase functions list
```

### 5. URLs das Edge Functions

Após deploy, as URLs serão:

- **Webhook Kiwify**: `https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook`
- **Validar Token**: `https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/validate-token`

---

## 🥝 Configuração do Kiwify

### 1. Criar Produto

1. Acesse https://dashboard.kiwify.com.br/
2. Vá em "Produtos" > "Novo Produto"
3. Configure:
   - Nome: "Diagnóstico Financeiro Pessoal"
   - Preço: R$ 7,00
   - Tipo: Produto Digital

### 2. Configurar Webhook

1. No dashboard do Kiwify, vá em "Configurações" > "Webhooks"
2. Clique em "Adicionar Webhook"
3. Configure:
   ```
   URL: https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook
   Eventos: order.paid, order.refunded, order.cancelled
   ```
4. Copie o **Secret** gerado
5. Configure o secret no Supabase:
   ```bash
   supabase secrets set KIWIFY_WEBHOOK_SECRET=cole-o-secret-aqui
   ```

### 3. Configurar Página de Checkout

1. Configure URL de sucesso (opcional):
   ```
   https://custozero.com.br/aguardando-email
   ```

2. Configure URL de cancelamento (opcional):
   ```
   https://custozero.com.br/
   ```

### 4. Obter Link de Pagamento

1. Após criar o produto, copie o link de checkout
2. Exemplo: `https://pay.kiwify.com.br/abc123xyz`
3. Você usará esse link na Landing Page

---

## 📧 Configuração do Email (Resend)

### 1. Criar Conta

1. Acesse https://resend.com
2. Crie uma conta gratuita (100 emails/dia grátis)
3. Verifique seu email

### 2. Configurar Domínio (Recomendado)

**Opção A: Com domínio próprio**

1. Vá em "Domains" > "Add Domain"
2. Adicione seu domínio: `custozero.com.br`
3. Adicione os registros DNS fornecidos
4. Aguarde verificação (até 24h)

**Opção B: Usar domínio do Resend (desenvolvimento)**

Pode usar `onboarding@resend.dev` para testes, mas emails podem ir para spam.

### 3. Criar API Key

1. Vá em "API Keys" > "Create API Key"
2. Nome: "CustoZero Production"
3. Permissão: "Sending access"
4. Copie a API Key (começa com `re_`)
5. Configure no Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=re_sua_api_key_aqui
   ```

### 4. Atualizar Email no Código

Se estiver usando domínio próprio, atualize o remetente na Edge Function:

Arquivo: `supabase/functions/kiwify-webhook/index.ts` (linha 96)
```typescript
from: 'CustoZero <noreply@custozero.com.br>', // Alterar para seu domínio
```

Redesploy após alteração:
```bash
supabase functions deploy kiwify-webhook
```

---

## ☁️ Deploy do Frontend (Vercel)

### 1. Preparar Repositório

```bash
# Commit suas alterações
git add .
git commit -m "feat: integração completa com Kiwify e deploy ready"

# Push para GitHub
git push origin main
```

### 2. Conectar Vercel

1. Acesse https://vercel.com
2. Clique em "Add New" > "Project"
3. Importe seu repositório do GitHub
4. Configure:

**Framework Preset**: Vite
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 3. Configurar Variáveis de Ambiente

No painel da Vercel, vá em "Settings" > "Environment Variables":

```env
VITE_SUPABASE_URL=https://vwpcomebhlvdqmhdyohm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGNvbWViaGx2ZHFtaGR5b2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDA0NDIsImV4cCI6MjA4MzQxNjQ0Mn0.tTq2BF2ury_jqSm81bPDD3sXJN6l6O1S4e_f6SzpcAE
```

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Acesse a URL fornecida (ex: `https://custozero.vercel.app`)

### 5. Configurar Domínio Customizado (Opcional)

1. Vá em "Settings" > "Domains"
2. Adicione seu domínio: `custozero.com.br`
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

### 6. Atualizar URL no Supabase

Após obter a URL final:

```bash
# Usar URL da Vercel ou domínio customizado
supabase secrets set APP_URL=https://custozero.com.br
```

---

## 🧪 Testes e Validação

### 1. Testar Edge Functions

**Validar Token**
```bash
curl -X POST https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "test-token"}'
```

**Webhook Kiwify (simulação)**
```bash
curl -X POST https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook \
  -H "Content-Type: application/json" \
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
    "created_at": "2026-01-10T10:30:00Z"
  }'
```

### 2. Testar Fluxo Completo

1. **Landing Page**: Acesse sua URL de produção
2. **Checkout**: Clique no botão e verifique se redireciona para o Kiwify
3. **Pagamento Teste**: Use cartão de teste do Kiwify:
   - Número: `4242 4242 4242 4242`
   - CVV: `123`
   - Validade: Qualquer data futura
4. **Email**: Verifique se recebeu o email com o link
5. **Acesso**: Clique no link do email e faça o diagnóstico
6. **Relatório**: Complete o questionário e veja o relatório

### 3. Verificar Logs

**Logs das Edge Functions**
```bash
# Logs em tempo real
supabase functions logs kiwify-webhook --tail

# Logs específicos
supabase functions logs kiwify-webhook --limit 100
```

**Dashboard do Supabase**
1. Acesse https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm
2. Vá em "Edge Functions" > "Logs"

---

## 📈 Monitoramento

### 1. Verificar Tokens Ativos

```sql
-- No Supabase SQL Editor
SELECT * FROM active_tokens_summary;
```

### 2. Ver Diagnósticos Recentes

```sql
-- No Supabase SQL Editor
SELECT * FROM recent_diagnostics;
```

### 3. Verificar Emails Enviados

1. Acesse https://resend.com/emails
2. Veja status de envio de cada email
3. Monitore taxa de abertura e cliques

### 4. Analytics da Vercel

1. Acesse painel da Vercel
2. Vá em "Analytics"
3. Monitore visitas, performance, etc.

---

## 🔐 Configurações de Segurança

### 1. Validação de Assinatura do Webhook

A validação de assinatura HMAC já está implementada. Certifique-se de:
- Configurar `KIWIFY_WEBHOOK_SECRET` corretamente
- Nunca commitar o secret no código

### 2. Row Level Security (RLS)

O RLS está **desabilitado** nas tabelas pois usamos Service Role Key nas Edge Functions.
Isso é seguro porque:
- Acesso direto ao banco é bloqueado
- Todo acesso passa pelas Edge Functions
- Edge Functions validam tokens e assinaturas

### 3. Proteção de APIs

- Anon Key é pública (seguro)
- Service Role Key está apenas nas Edge Functions (seguro)
- Nunca exponha Service Role Key no frontend

---

## 📝 Checklist Pré-Produção

- [ ] Database migrations aplicadas
- [ ] Edge Functions deployadas
- [ ] Secrets configurados (APP_URL, KIWIFY_WEBHOOK_SECRET, RESEND_API_KEY)
- [ ] Webhook configurado no Kiwify
- [ ] Domínio do Resend verificado
- [ ] Frontend deployado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Fluxo completo testado
- [ ] Emails sendo enviados corretamente
- [ ] Logs monitorados

---

## 🆘 Troubleshooting

### Webhook não está funcionando

1. Verifique logs: `supabase functions logs kiwify-webhook`
2. Teste manualmente com curl (comando acima)
3. Verifique se secret está correto
4. Confirme URL do webhook no Kiwify

### Emails não estão sendo enviados

1. Verifique `RESEND_API_KEY` está configurado
2. Verifique domínio está verificado no Resend
3. Verifique logs da Edge Function
4. Teste API do Resend diretamente

### Token inválido

1. Verifique se token existe no banco
2. Verifique se não expirou
3. Verifique se não foi usado
4. Teste endpoint de validação com curl

### Build falhando

1. Execute localmente: `npm run build`
2. Corrija erros TypeScript
3. Verifique se todas dependências estão instaladas
4. Limpe cache: `rm -rf node_modules package-lock.json && npm install`

---

## 🚀 Próximos Passos

1. **Monitoramento**: Configurar Sentry ou similar para capturar erros
2. **Analytics**: Integrar Google Analytics ou PostHog
3. **A/B Testing**: Testar diferentes valores e CTAs na landing
4. **SEO**: Otimizar meta tags e performance
5. **Marketing**: Configurar Facebook Pixel / Google Ads

---

## 📞 Suporte

**Documentação Oficial:**
- Supabase: https://supabase.com/docs
- Kiwify: https://docs.kiwify.com.br
- Resend: https://resend.com/docs
- Vercel: https://vercel.com/docs

**Links Úteis:**
- Dashboard Supabase: https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm
- Dashboard Kiwify: https://dashboard.kiwify.com.br
- Dashboard Resend: https://resend.com/emails
- Dashboard Vercel: https://vercel.com/dashboard

---

**Última atualização**: 2026-01-10
**Status**: ✅ Pronto para produção
