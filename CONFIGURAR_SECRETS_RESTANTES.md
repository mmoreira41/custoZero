# 🔐 Configurar Secrets Restantes

## ✅ Status Atual

- ✅ **RESEND_API_KEY**: Configurado!
- ⏳ **APP_URL**: Aguardando deploy na Vercel
- ⏳ **KIWIFY_WEBHOOK_SECRET**: Aguardando do seu amigo

---

## 📝 Quando Fizer Deploy na Vercel

Após fazer deploy na Vercel, você receberá uma URL. Execute:

```bash
# Se for usar a URL automática da Vercel (exemplo)
supabase secrets set APP_URL=https://custozero.vercel.app

# OU se for usar domínio próprio
supabase secrets set APP_URL=https://custozero.com.br
```

**⚠️ IMPORTANTE**: Use a URL **SEM** barra no final!
- ✅ Correto: `https://custozero.vercel.app`
- ❌ Errado: `https://custozero.vercel.app/`

---

## 🥝 Quando Receber o Secret do Kiwify

Seu amigo vai te mandar um secret (uma string longa). Execute:

```bash
supabase secrets set KIWIFY_WEBHOOK_SECRET=cole-o-secret-aqui
```

**Exemplo:**
```bash
supabase secrets set KIWIFY_WEBHOOK_SECRET=whsec_abc123xyz789...
```

---

## ✅ Verificar se Está Tudo Configurado

Após configurar APP_URL e KIWIFY_WEBHOOK_SECRET, execute:

```bash
supabase secrets list
```

Você deve ver **7 secrets** no total:
- ✅ RESEND_API_KEY
- ✅ APP_URL
- ✅ KIWIFY_WEBHOOK_SECRET
- ✅ SUPABASE_ANON_KEY (já configurado)
- ✅ SUPABASE_DB_URL (já configurado)
- ✅ SUPABASE_SERVICE_ROLE_KEY (já configurado)
- ✅ SUPABASE_URL (já configurado)

---

## 🚀 Próximo Passo: Deploy na Vercel

### Opção 1: Via Interface da Vercel (Mais Fácil)

1. **Push seu código para GitHub:**
   ```bash
   git add .
   git commit -m "feat: projeto pronto para deploy"
   git push origin main
   ```

2. **Conecte na Vercel:**
   - Acesse https://vercel.com
   - Clique em "Add New" > "Project"
   - Importe seu repositório do GitHub
   - Configure:
     - Framework Preset: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Configure Variáveis de Ambiente:**
   Na seção "Environment Variables", adicione:
   ```
   VITE_SUPABASE_URL=https://vwpcomebhlvdqmhdyohm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cGNvbWViaGx2ZHFtaGR5b2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDA0NDIsImV4cCI6MjA4MzQxNjQ0Mn0.tTq2BF2ury_jqSm81bPDD3sXJN6l6O1S4e_f6SzpcAE
   ```

4. **Deploy!**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Copie a URL fornecida (ex: `https://custozero.vercel.app`)

5. **Configure APP_URL:**
   ```bash
   supabase secrets set APP_URL=https://custozero.vercel.app
   ```

### Opção 2: Via CLI da Vercel

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📋 Checklist Final

Antes de ir para produção, verifique:

- [ ] ✅ RESEND_API_KEY configurado
- [ ] Deploy feito na Vercel
- [ ] APP_URL configurado no Supabase
- [ ] KIWIFY_WEBHOOK_SECRET recebido e configurado
- [ ] Webhook configurado no dashboard do Kiwify com a URL: `https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook`
- [ ] Teste completo realizado (pagamento teste → email → diagnóstico)

---

## 🧪 Como Testar Depois de Tudo Configurado

### 1. Testar envio de email manualmente

```bash
curl -X POST https://vwpcomebhlvdqmhdyohm.supabase.co/functions/v1/kiwify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.paid",
    "order_id": "TEST-123",
    "customer": {
      "email": "seu-email@gmail.com",
      "name": "Seu Nome"
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

Se tudo estiver correto:
1. Você receberá um email no endereço fornecido
2. O email terá um link para acessar o diagnóstico
3. Ao clicar, você será redirecionado para fazer o questionário

### 2. Ver logs para debug

```bash
supabase functions logs kiwify-webhook --tail
```

---

## ❓ FAQ

**P: E se eu mudar a URL depois?**
R: Basta rodar `supabase secrets set APP_URL=nova-url` novamente.

**P: Posso usar um domínio customizado?**
R: Sim! Configure na Vercel e depois atualize o APP_URL.

**P: O email vai cair no spam?**
R: Pode acontecer. Para evitar:
1. Configure domínio próprio no Resend
2. Verifique SPF/DKIM/DMARC
3. Peça aos usuários para adicionar seu email aos contatos

**P: Como saber se o webhook está funcionando?**
R: Verifique os logs com `supabase functions logs kiwify-webhook`

---

**Última atualização**: 2026-01-10
**Criado para**: Configuração pós-deploy
