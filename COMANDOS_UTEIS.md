# ⚡ Comandos Úteis - CustoZero

## 🎯 Quick Start

```bash
# Instalar dependências
npm install

# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## 📊 Supabase

### Edge Functions

```bash
# Deploy todas as functions
supabase functions deploy

# Deploy função específica
supabase functions deploy kiwify-webhook
supabase functions deploy validate-token

# Logs em tempo real
supabase functions logs kiwify-webhook --tail
supabase functions logs validate-token --tail

# Logs com limite
supabase functions logs kiwify-webhook --limit 100
```

### Database

```bash
# Aplicar migrations
supabase db push

# Resetar banco local (cuidado!)
supabase db reset

# Gerar types TypeScript
supabase gen types typescript --local > src/types/supabase.ts

# Dump do schema
supabase db dump -f database-schema.sql
```

### Secrets

```bash
# Listar secrets
supabase secrets list

# Configurar secret
supabase secrets set NOME_SECRET=valor

# Configurar múltiplos secrets
supabase secrets set \
  APP_URL=https://custozero.com.br \
  KIWIFY_WEBHOOK_SECRET=seu-secret \
  RESEND_API_KEY=re_sua_key
```

### Link do Projeto

```bash
# Link projeto remoto
supabase link --project-ref vwpcomebhlvdqmhdyohm

# Status do link
supabase status
```

---

## 🧪 Testes

### Testar Webhook Localmente

```bash
# Teste básico (sem assinatura)
curl -X POST http://localhost:54321/functions/v1/kiwify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.paid",
    "order_id": "TEST-'$(date +%s)'",
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
    "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### Testar Webhook em Produção

```bash
# Substitua por valores reais
curl -X POST https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.paid",
    "order_id": "TEST-'$(date +%s)'",
    "customer": {
      "email": "seu-email@example.com",
      "name": "Seu Nome"
    },
    "product": {
      "id": "PROD-123",
      "name": "Diagnóstico Financeiro"
    },
    "amount": 7.00,
    "currency": "BRL",
    "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### Testar Validação de Token

```bash
# Local
curl -X POST http://localhost:54321/functions/v1/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "seu-token-aqui"}'

# Produção
curl -X POST https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "seu-token-aqui"}'
```

---

## 📧 Resend (Email)

### Testar Envio de Email

```bash
# Usando API diretamente
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_sua_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "CustoZero <noreply@custozero.com.br>",
    "to": "seu-email@example.com",
    "subject": "Teste",
    "html": "<p>Email de teste</p>"
  }'
```

---

## 🗄️ SQL Úteis

### Consultas de Monitoramento

```sql
-- Tokens ativos
SELECT * FROM active_tokens_summary;

-- Diagnósticos recentes
SELECT * FROM recent_diagnostics;

-- Tokens não usados
SELECT * FROM access_tokens
WHERE used = false
AND expires_at > NOW()
ORDER BY created_at DESC;

-- Tokens expirados
SELECT COUNT(*) FROM access_tokens
WHERE expires_at < NOW();

-- Total de diagnósticos por dia
SELECT
  DATE(created_at) as dia,
  COUNT(*) as total
FROM diagnostics
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

### Manutenção

```sql
-- Limpar tokens expirados (manual)
DELETE FROM access_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';

-- Limpar diagnósticos antigos (manual)
DELETE FROM diagnostics
WHERE created_at < NOW() - INTERVAL '30 days';

-- Executar limpeza automática (via função)
SELECT * FROM cleanup_expired_tokens();
```

### Debug

```sql
-- Ver último token criado
SELECT * FROM access_tokens
ORDER BY created_at DESC
LIMIT 1;

-- Verificar token específico
SELECT * FROM access_tokens
WHERE token = 'seu-token-aqui';

-- Ver diagnósticos de um email
SELECT * FROM diagnostics
WHERE email = 'email@example.com'
ORDER BY created_at DESC;
```

---

## 🚀 Deploy

### Vercel

```bash
# Install Vercel CLI (se ainda não tiver)
npm i -g vercel

# Deploy para preview
vercel

# Deploy para produção
vercel --prod

# Verificar deployment
vercel ls

# Logs
vercel logs
```

### Git

```bash
# Status
git status

# Adicionar alterações
git add .

# Commit
git commit -m "feat: descrição da alteração"

# Push
git push origin main

# Ver histórico
git log --oneline -10
```

---

## 🔍 Debug e Troubleshooting

### Verificar Variáveis de Ambiente

```bash
# Vercel
vercel env ls

# Supabase (secrets)
supabase secrets list
```

### Verificar Logs

```bash
# Logs da Edge Function em tempo real
supabase functions logs kiwify-webhook --tail

# Logs com filtro de erro
supabase functions logs kiwify-webhook | grep -i error

# Últimos 50 logs
supabase functions logs kiwify-webhook --limit 50
```

### Verificar Conectividade

```bash
# Testar conexão com Supabase
curl https://vwpcomebhlvdqmhdyohm.supabase.co/rest/v1/

# Testar Edge Function
curl https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook

# Verificar DNS do domínio
dig custozero.com.br
nslookup custozero.com.br
```

---

## 📝 Scripts Personalizados

### Criar Token Manualmente (desenvolvimento)

```sql
-- No SQL Editor do Supabase
INSERT INTO access_tokens (email, token, used, expires_at)
VALUES (
  'dev@example.com',
  gen_random_uuid(),
  false,
  NOW() + INTERVAL '30 days'
)
RETURNING *;
```

### Gerar Relatório de Uso

```sql
-- Estatísticas gerais
SELECT
  COUNT(DISTINCT email) as usuarios_unicos,
  COUNT(*) as total_diagnosticos,
  AVG((data->>'totalYearly')::numeric) as gasto_medio_anual,
  AVG((data->>'wasteYearly')::numeric) as desperdicio_medio_anual
FROM diagnostics
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🛠️ Manutenção Regular

### Diária

```bash
# Verificar logs de erros
supabase functions logs kiwify-webhook --limit 100 | grep -i error

# Verificar emails enviados (no dashboard do Resend)
# https://resend.com/emails
```

### Semanal

```sql
-- Ver estatísticas da semana
SELECT * FROM recent_diagnostics;

-- Limpar dados antigos
SELECT * FROM cleanup_expired_tokens();
```

### Mensal

```bash
# Atualizar dependências (com cuidado)
npm outdated
npm update

# Rebuild e redeploy
npm run build
vercel --prod

# Verificar uso de recursos no Supabase
# Dashboard > Settings > Usage
```

---

## 🔗 Links Rápidos

### Dashboards

```bash
# Supabase
open https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm

# Kiwify
open https://dashboard.kiwify.com.br

# Resend
open https://resend.com/emails

# Vercel
open https://vercel.com/dashboard

# Produção
open https://custozero.com.br
```

---

## 💡 Dicas

### Performance

```bash
# Analisar bundle size
npm run build
# Verificar warning de chunks grandes

# Lighthouse no Chrome DevTools
# DevTools > Lighthouse > Generate report
```

### Backup

```bash
# Backup do banco (schema + dados)
supabase db dump -f backup-$(date +%Y%m%d).sql

# Backup do código
git archive --format=zip --output=backup-$(date +%Y%m%d).zip HEAD
```

### Rollback

```bash
# Reverter último commit (localmente)
git reset --soft HEAD~1

# Reverter deploy na Vercel
vercel rollback [deployment-url]

# Reverter Edge Function
supabase functions deploy kiwify-webhook --no-verify-jwt
```

---

**Última atualização**: 2026-01-10
