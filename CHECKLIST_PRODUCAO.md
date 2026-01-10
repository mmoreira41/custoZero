# ✅ Checklist para Produção

## 🎯 Status Atual: O que já está PRONTO?

### ✅ Front-end Completo
- [x] Landing Page responsiva
- [x] Questionário com categorias
- [x] Custom services
- [x] Inputs de valores e frequências
- [x] Página de relatório
- [x] Página de acesso negado
- [x] Loading animations
- [x] Responsividade mobile (280px+)
- [x] Footer fixo funcionando

### ✅ Back-end/Segurança
- [x] RLS habilitado no Supabase
- [x] Edge Function `validate-token` deployada
- [x] Policies de segurança criadas
- [x] Secure client implementado
- [x] Tokens de uso único
- [x] Validação via Edge Function
- [x] Dev mode funcionando

### ✅ Funcionalidades
- [x] Cálculo de diagnóstico
- [x] Salvamento no banco (diagnostics)
- [x] Store Zustand funcionando
- [x] Navegação entre páginas
- [x] Validação de inputs

## ⚠️ O que precisa TESTAR agora (DEV MODE):

Antes de implementar webhook, você precisa garantir que o FLUXO COMPLETO funciona:

### 1. Testar Fluxo End-to-End

```bash
# 1. Rodar app
npm run dev

# 2. Acessar com token dev
http://localhost:5173/diagnostico?token=dev-test-123
```

**Checklist de teste**:
- [ ] Landing carrega corretamente
- [ ] Clicar em "Fazer diagnóstico" leva ao questionário
- [ ] Consegue selecionar serviços em TODAS as categorias
- [ ] Consegue adicionar serviços personalizados
- [ ] Consegue inserir valores e frequências
- [ ] Consegue navegar entre categorias (voltar/avançar)
- [ ] Consegue completar todo o questionário
- [ ] Loading aparece após finalizar
- [ ] Relatório é exibido com dados corretos
- [ ] Valores calculados estão corretos (mensal, anual, 5 anos)
- [ ] Consegue baixar PDF do relatório
- [ ] PDF contém todas as informações corretas

### 2. Verificar Salvamento no Banco

```sql
-- Executar no Supabase SQL Editor
SELECT * FROM diagnostics
ORDER BY created_at DESC
LIMIT 5;
```

**Deve retornar**:
- Diagnósticos salvos com email `dev@example.com`
- Campo `data` com JSON completo
- `created_at` com timestamp correto

**Se não aparecer nada**:
- ❌ Salvamento não está funcionando
- Verifique console do navegador por erros
- Verifique se RLS permite INSERT

### 3. Testar Geração de PDF

- [ ] Clicar em "Baixar PDF" no relatório
- [ ] PDF é gerado e baixado
- [ ] PDF abre corretamente
- [ ] PDF contém todas as seções:
  - [ ] Resumo executivo
  - [ ] Gráficos de gastos
  - [ ] Tabela de serviços
  - [ ] Recomendações
  - [ ] Plano de ação

**Se PDF não gerar**:
- Verificar erros no console
- Os erros de build TypeScript (`pdf-generator.ts`) não afetam funcionamento
- Mas podem indicar que alguns estilos estão quebrados

### 4. Testar Casos Extremos

- [ ] **Zero serviços selecionados**: Botão "Continuar" deve ficar desabilitado
- [ ] **Valores muito altos**: R$ 100.000+ deve ser rejeitado
- [ ] **Valores negativos**: Não deve permitir
- [ ] **Nomes muito longos**: Custom services com 60+ caracteres
- [ ] **Caracteres especiais**: Tentar XSS nos custom services (`<script>alert('xss')</script>`)
- [ ] **Token inválido**: Acessar `/diagnostico?token=invalid` → Deve ir para /acesso-negado
- [ ] **Sem token**: Acessar `/diagnostico` sem token → Deve ir para /acesso-negado
- [ ] **Token usado 2 vezes**: Usar token real, marcar como usado, tentar de novo

## 🚧 O que FALTA implementar (PRODUÇÃO):

### 1. ❌ Webhook Kiwify (Backend)

**O que fazer**:
```bash
# Criar arquivo api/kiwify-webhook.ts
# Copiar de KIWIFY_WEBHOOK_EXAMPLE.ts e adaptar
```

**Onde hospedar**:
- **Opção A**: Vercel Serverless Functions (recomendado, grátis)
- **Opção B**: AWS Lambda
- **Opção C**: Railway, Render
- **Opção D**: Servidor próprio Node.js

**Tempo estimado**: 2-4 horas (primeiro webhook)

### 2. ❌ Serviço de Email

**Opções**:
| Serviço | Preço | Facilidade | Recomendação |
|---------|-------|------------|--------------|
| **Resend** | 100 emails/dia grátis | ⭐⭐⭐⭐⭐ Muito fácil | ✅ Recomendado |
| **SendGrid** | 100 emails/dia grátis | ⭐⭐⭐⭐ Fácil | ✅ Bom |
| **Mailgun** | 5k emails/mês grátis | ⭐⭐⭐ Médio | ✅ OK |
| **AWS SES** | Muito barato | ⭐⭐ Complexo | ⚠️ Só se já usa AWS |

**Setup Resend** (mais fácil):
```bash
1. Criar conta: https://resend.com/
2. Verificar domínio (ou usar resend.dev)
3. Copiar API Key
4. Adicionar ao .env: RESEND_API_KEY=re_...
```

**Tempo estimado**: 30 minutos

### 3. ❌ Criar Produto no Kiwify

**Passo a passo**:
```
1. Login: https://dashboard.kiwify.com.br/
2. Produtos → Novo Produto
3. Preencher:
   - Nome: Diagnóstico Financeiro CustoZero
   - Preço: R$ 7,00
   - Descrição: "Descubra quanto você gasta com assinaturas..."
   - Tipo: Produto Digital
4. Salvar
5. Copiar Link de Checkout
6. Atualizar Landing.tsx com o link
```

**Tempo estimado**: 15 minutos

### 4. ❌ Configurar Webhook no Kiwify

```
1. Dashboard Kiwify → Produto → Configurações → Webhooks
2. Adicionar novo webhook:
   - URL: https://seu-dominio.com.br/api/kiwify-webhook
   - Eventos: order.paid, order.refunded
   - Secret: Gerar e salvar no .env
3. Testar webhook (Kiwify tem opção de "Enviar teste")
```

**Tempo estimado**: 10 minutos

### 5. ⚠️ Deploy do Backend

**Se usar Vercel** (mais fácil):
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variáveis de ambiente no dashboard
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# KIWIFY_WEBHOOK_SECRET
# RESEND_API_KEY
# APP_URL
```

**Tempo estimado**: 30 minutos

### 6. ❌ Atualizar Landing para Produção

**Landing.tsx:10-17** - Descomentar redirect Kiwify:
```typescript
const handleStartDiagnostic = () => {
  // ✅ Produção: Redirecionar para checkout Kiwify
  window.location.href = 'https://pay.kiwify.com.br/SEU_LINK_AQUI';

  // ❌ Dev mode (comentar):
  // const devToken = 'dev-' + Date.now();
  // window.location.href = `/diagnostico?token=${devToken}`;
};
```

**Tempo estimado**: 2 minutos

### 7. ⚠️ Deploy do Front-end

**Opções**:
- **Vercel** (recomendado, grátis)
- **Netlify** (bom, grátis)
- **Cloudflare Pages** (rápido, grátis)

```bash
# Se usar Vercel
vercel --prod

# Configurar variáveis de ambiente:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

**Tempo estimado**: 20 minutos

### 8. ❌ Configurar Domínio (Opcional mas Recomendado)

**Por que**:
- Profissionalismo
- Confiança dos clientes
- Links de email não vão para spam

**Como**:
```
1. Registrar domínio: custozero.com.br
2. Apontar para Vercel/Netlify
3. Configurar SSL automático
4. Atualizar APP_URL no backend
```

**Tempo estimado**: 1 hora (propagação DNS)

## 📊 Resumo: O que falta?

### Desenvolvimento (ANTES de produção):
- [ ] Testar fluxo completo end-to-end em dev mode
- [ ] Verificar salvamento no banco
- [ ] Testar geração de PDF
- [ ] Testar casos extremos
- [ ] Corrigir qualquer bug encontrado

### Infraestrutura (PARA produção):
- [ ] Implementar webhook Kiwify (2-4h)
- [ ] Configurar serviço de email (30min)
- [ ] Criar produto no Kiwify (15min)
- [ ] Deploy backend (30min)
- [ ] Configurar webhook no Kiwify (10min)
- [ ] Atualizar Landing (2min)
- [ ] Deploy front-end (20min)
- [ ] (Opcional) Configurar domínio (1h)

**Tempo total estimado**: 5-7 horas

### Testes Finais (DEPOIS do deploy):
- [ ] Fazer compra teste no Kiwify
- [ ] Verificar se webhook chega
- [ ] Verificar se token é criado no banco
- [ ] Verificar se email chega
- [ ] Acessar link do email
- [ ] Completar diagnóstico
- [ ] Verificar relatório
- [ ] Baixar PDF
- [ ] Tentar usar link novamente (deve falhar)

## 🎯 Resposta à Sua Pergunta

> "Diria que só falta isso para já rodarmos o produto?"

**Resposta**: Sim e não! 😅

✅ **SIM, falta "só isso"** em termos de código e infraestrutura.

⚠️ **MAS ANTES** você precisa:
1. **Testar tudo em dev mode** (pode ter bugs escondidos)
2. **Verificar se salvamento no banco funciona**
3. **Testar PDF** (pode ter problemas)
4. **Implementar e testar o webhook localmente** (antes de deploy)

**Ordem recomendada**:

```
1. AGORA: Testar fluxo completo em dev mode
   ↓
2. Corrigir bugs (se houver)
   ↓
3. Implementar webhook localmente
   ↓
4. Testar webhook com ngrok
   ↓
5. Configurar email (Resend)
   ↓
6. Criar produto Kiwify
   ↓
7. Deploy backend + frontend
   ↓
8. Configurar webhook no Kiwify
   ↓
9. Teste end-to-end real (compra de verdade)
   ↓
10. 🚀 PRODUÇÃO!
```

## ⏱️ Cronograma Realista

| Etapa | Tempo | Quando |
|-------|-------|--------|
| Testes dev mode | 1-2h | **HOJE** |
| Implementar webhook | 2-4h | Hoje/Amanhã |
| Configurar email | 30min | Hoje/Amanhã |
| Criar produto Kiwify | 15min | Hoje/Amanhã |
| Deploy tudo | 1h | Amanhã |
| Testes finais | 1h | Amanhã |

**Total**: ~6-9 horas

**Se dedicar 3-4h por dia**: Pronto em **2-3 dias**

## 🚨 Coisas que Podem Dar Errado

### 1. PDF não gera
**Sintoma**: Botão "Baixar PDF" não funciona
**Causa**: Erros TypeScript em `pdf-generator.ts`
**Solução**: Vou corrigir se necessário

### 2. Webhook não chega
**Sintomas**: Compra aprovada, mas email não chega
**Causas possíveis**:
- URL webhook incorreta
- Signature validation falhando
- Backend com erro
**Debug**: Ver logs do Vercel/Kiwify

### 3. Email vai para spam
**Sintoma**: Cliente não recebe email
**Causas**:
- Domínio não verificado
- SPF/DKIM não configurados
**Solução**: Verificar domínio no Resend

### 4. Token não valida
**Sintoma**: Link do email dá "Acesso negado"
**Causas**:
- Token não foi criado no banco
- RLS bloqueando
- Edge Function com erro
**Debug**: Ver logs da Edge Function

## 🎓 Dica Final

**Não pule os testes em dev mode!**

É muito mais fácil encontrar e corrigir bugs ANTES de colocar no ar do que depois com clientes reais tentando usar.

Faça o checklist completo em dev mode primeiro. Quando tudo estiver 100%, aí sim implementa o webhook e deploy.

---

**Próximo passo**: Teste o fluxo completo em dev mode e me avise se encontrar algum problema! 🚀
