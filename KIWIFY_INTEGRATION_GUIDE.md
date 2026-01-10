# 🥝 Guia de Integração Kiwify - Como Funciona?

## 🤔 Sua Dúvida: Como o Kiwify entra nisso?

Vou explicar o fluxo completo de como o usuário paga e acessa o diagnóstico, e responder sua dúvida sobre compartilhamento de links.

## 🔄 Fluxo Completo (Produção com Kiwify)

### 1️⃣ **Usuário na Landing Page**

```
Usuario acessa: https://custozero.com.br/
    ↓
Clica em "Fazer diagnóstico agora"
    ↓
Redireciona para: https://pay.kiwify.com.br/SEU_LINK_AQUI
```

**Landing.tsx** (em produção, você descomentaria):
```typescript
const handleStartDiagnostic = () => {
  // ✅ Produção: Redirecionar para checkout Kiwify
  window.location.href = 'https://pay.kiwify.com.br/SEU_LINK_AQUI';

  // ❌ Dev mode comentado:
  // const devToken = 'dev-' + Date.now();
  // window.location.href = `/diagnostico?token=${devToken}`;
};
```

### 2️⃣ **Usuário no Checkout Kiwify**

```
Checkout Kiwify
    ↓
Usuario preenche dados:
  - Nome: João Silva
  - Email: joao@example.com
  - Cartão de crédito
    ↓
Clica em "Pagar R$ 7,00"
    ↓
Pagamento aprovado ✅
```

### 3️⃣ **Kiwify Envia Webhook (Automático)**

Quando o pagamento é aprovado, **Kiwify envia um webhook para sua aplicação**:

```
POST https://custozero.com.br/api/kiwify-webhook

Body (JSON):
{
  "event": "order.paid",
  "order_id": "ORD-123456",
  "customer": {
    "email": "joao@example.com",
    "name": "João Silva"
  },
  "product": {
    "id": "PROD-789",
    "name": "Diagnóstico Financeiro"
  },
  "amount": 7.00,
  "created_at": "2026-01-09T10:30:00Z"
}
```

**Você precisa criar um endpoint** (backend) que:
1. Recebe o webhook do Kiwify
2. Valida o pagamento
3. Cria um token único no banco de dados
4. Envia email com link personalizado

### 4️⃣ **Backend Cria Token Único**

```typescript
// Exemplo: api/kiwify-webhook.ts (você precisa criar)
import { supabaseAdmin } from './supabase-admin'; // Service Role Key
import crypto from 'crypto';

app.post('/api/kiwify-webhook', async (req, res) => {
  const { customer, event } = req.body;

  if (event !== 'order.paid') {
    return res.status(200).send('OK');
  }

  // ✅ Criar token único e seguro (UUID)
  const token = crypto.randomUUID();

  // ✅ Inserir no banco (com Service Role Key, não via front-end!)
  await supabaseAdmin
    .from('access_tokens')
    .insert({
      email: customer.email,
      token: token,
      used: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    });

  // ✅ Enviar email com link personalizado
  await sendEmail({
    to: customer.email,
    subject: 'Seu diagnóstico está pronto! 🎉',
    html: `
      <h1>Olá, ${customer.name}!</h1>
      <p>Seu pagamento foi aprovado. Clique no link abaixo para acessar seu diagnóstico:</p>
      <a href="https://custozero.com.br/diagnostico?token=${token}">
        Acessar Diagnóstico
      </a>
      <p><strong>Importante:</strong> Este link é de uso único e expira em 30 dias.</p>
    `,
  });

  res.status(200).send('OK');
});
```

### 5️⃣ **Usuário Recebe Email**

```
📧 Email para: joao@example.com

Assunto: Seu diagnóstico está pronto! 🎉

Olá, João Silva!

Seu pagamento foi aprovado. Clique no link abaixo para acessar seu diagnóstico:

[Acessar Diagnóstico]
👆 https://custozero.com.br/diagnostico?token=abc-123-def-456

Importante: Este link é de uso único e expira em 30 dias.
```

### 6️⃣ **Usuário Clica no Link**

```
Usuario clica no email:
    ↓
https://custozero.com.br/diagnostico?token=abc-123-def-456
    ↓
useAuth hook detecta token na URL
    ↓
Chama validateToken(token) → Edge Function
    ↓
Edge Function:
  - Busca token no banco
  - Verifica se não foi usado ✅
  - Verifica se não expirou ✅
  - Marca como usado (used = true)
  - Retorna: { valid: true, email: 'joao@example.com' }
    ↓
Usuário acessa o questionário ✅
```

### 7️⃣ **Segunda Tentativa de Usar o Mesmo Link**

```
Usuario clica no email novamente (ou compartilha link):
    ↓
https://custozero.com.br/diagnostico?token=abc-123-def-456
    ↓
useAuth hook detecta token na URL
    ↓
Chama validateToken(token) → Edge Function
    ↓
Edge Function:
  - Busca token no banco
  - Verifica se não foi usado ❌ JÁ FOI USADO!
  - Retorna: { valid: false, error: 'Token already used' }
    ↓
Usuário é redirecionado para: /acesso-negado ❌
```

## 🔒 Segurança: E se Alguém Compartilhar o Link?

### ✅ **Proteções Implementadas:**

#### 1. **Token de Uso Único**
```
João recebe: /diagnostico?token=abc-123
João acessa → Token marcado como usado ✅
    ↓
João compartilha com Maria
Maria tenta acessar → Token já usado ❌
```

**No banco:**
```sql
-- Antes do acesso
email: joao@example.com | token: abc-123 | used: false | expires_at: 2026-02-09

-- Depois que João acessa
email: joao@example.com | token: abc-123 | used: true | expires_at: 2026-02-09

-- Maria tenta acessar
Edge Function retorna: { valid: false, error: "Token already used" }
```

#### 2. **Token Expira**
```
Token criado: 2026-01-09 10:30:00
Expira em: 2026-02-09 10:30:00 (30 dias)
    ↓
João não acessa por 31 dias
Token expirado → Acesso negado ❌
```

#### 3. **Token É Único (UUID)**
```
Token 1: a7f3c2e5-8b9d-4e21-9c6f-1234567890ab
Token 2: b8g4d3f6-9c0e-5f32-0d7g-2345678901bc
Token 3: c9h5e4g7-0d1f-6g43-1e8h-3456789012cd

❌ Impossível adivinhar outros tokens
❌ Não há padrão para enumerar
```

#### 4. **Vinculado ao Email**
```
Token abc-123 → Email: joao@example.com

Quando João acessa:
  - Email salvo no store: joao@example.com
  - Diagnóstico salvo no banco com email: joao@example.com
  - Relatório mostra: "Diagnóstico de João"
```

### ⚠️ **Cenários de Compartilhamento:**

#### Cenário 1: João compartilha ANTES de usar
```
1. João recebe: /diagnostico?token=abc-123
2. João NÃO acessa ainda
3. João compartilha com Maria
4. Maria acessa PRIMEIRO → Token marcado como usado
5. Maria vê o email dela (maria@example.com)? ❌
   Na verdade, vê o email vinculado ao token (joao@example.com)
6. João tenta acessar depois → Token já usado ❌
```

**Problema**: Maria pode acessar usando o email do João.

**Solução adicional** (você pode implementar futuramente):
```typescript
// No useAuth, após validar token
if (result.email !== 'user-email-from-session') {
  // Detectar se email do token não bate com quem está acessando
  // Pode adicionar verificação extra
}
```

#### Cenário 2: João usa e depois compartilha
```
1. João acessa → Token marcado como usado ✅
2. João compartilha link
3. Maria tenta acessar → Token já usado ❌
4. Maria é redirecionada para /acesso-negado
```

**Resultado**: ✅ **Maria NÃO consegue acessar**

#### Cenário 3: João quer acessar múltiplas vezes
```
1. João acessa primeira vez → Token usado
2. João fecha navegador
3. João tenta acessar novamente → Token já usado ❌
```

**Problema**: João não consegue acessar de novo!

**Solução**:
- **Opção A**: Salvar diagnóstico no banco com ID único e enviar link separado
  ```
  Email 1: Link para CRIAR diagnóstico (uso único)
  Email 2: Link para VER diagnóstico (múltiplos usos)

  Link criação: /diagnostico?token=abc-123 (uso único)
  Link visualização: /relatorio/id-diagnostico (múltiplos usos)
  ```

- **Opção B**: Permitir revalidar token se email bater
  ```typescript
  // Edge Function adaptada
  if (accessToken.used && accessToken.email === requestEmail) {
    // Permitir reutilização para o mesmo email
    return { valid: true, email: accessToken.email };
  }
  ```

## 📋 Resumo das Respostas

### ❓ Como a pessoa é redirecionada automaticamente após pagar?

**Resposta**: O Kiwify **NÃO redireciona automaticamente**. O fluxo é:
1. Pagamento aprovado no Kiwify
2. Kiwify envia webhook para seu backend
3. Seu backend cria token e **envia email**
4. Usuário **clica no link do email** para acessar

**Alternativa** (se quiser redirecionamento):
Configure "URL de sucesso" no Kiwify:
```
https://custozero.com.br/aguardando-email
```

Mas **AINDA PRECISA DO WEBHOOK** para criar o token.

### ❓ E se compartilhar o link?

**Resposta**:

✅ **Proteção padrão (implementada)**:
- Token de uso único
- Só funciona 1 vez
- Quem usar primeiro, bloqueia para os outros

⚠️ **Vulnerabilidade possível**:
- Se João compartilha ANTES de usar, Maria pode acessar primeiro
- Maria veria diagnóstico com email do João

✅ **Solução futura**:
- Validar email do navegador com email do token
- Enviar dois links: um para criar, outro para visualizar
- Link de visualização não usa token (usa ID do diagnóstico salvo)

## 🛠️ O Que Você Precisa Implementar

### 1. **Endpoint de Webhook**
```typescript
// Backend (Node.js, Vercel Serverless, etc.)
POST /api/kiwify-webhook
  → Recebe pagamento
  → Cria token no banco
  → Envia email
```

### 2. **Serviço de Email**
```typescript
// Usar: SendGrid, Mailgun, Resend, etc.
sendEmail({
  to: customer.email,
  subject: 'Seu diagnóstico está pronto!',
  html: template
});
```

### 3. **Configurar Webhook no Kiwify**
```
Dashboard Kiwify → Configurações → Webhooks
URL: https://custozero.com.br/api/kiwify-webhook
Eventos: order.paid
```

### 4. **Supabase Service Role (Backend)**
```typescript
// Criar cliente com Service Role Key (não usar no front-end!)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔒 Só no backend!
);
```

## 📊 Comparação: Dev vs Produção

| Aspecto | Dev Mode (Atual) | Produção (Kiwify) |
|---------|-----------------|-------------------|
| Token | `dev-123456789` | UUID único |
| Validação | Bypassed | Edge Function |
| Email | `dev@example.com` | Email real do cliente |
| Uso | Ilimitado | Único |
| Expiração | Nunca | 30 dias |
| Compartilhável | ✅ Sim | ❌ Não (uso único) |

## 🎯 Próximos Passos

1. **Agora (Dev)**: Testar fluxo completo em dev mode
2. **Depois**: Criar endpoint webhook
3. **Depois**: Configurar serviço de email
4. **Depois**: Configurar webhook no Kiwify
5. **Deploy**: Mudar Landing para redirecionar para Kiwify

## 📚 Exemplo Completo de Webhook

Veja arquivo separado: `KIWIFY_WEBHOOK_EXAMPLE.md` (criarei a seguir)

---

**Criado em**: 2026-01-09
**Dúvidas?** Pergunte sobre qualquer parte do fluxo!
