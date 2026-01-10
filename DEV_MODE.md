# 🔧 Modo de Desenvolvimento - Guia Completo

Este documento explica como o modo de desenvolvimento funciona e como testar a aplicação sem configurar o Supabase.

## 🎯 Objetivo

Permitir testes e desenvolvimento local **SEM precisar:**
- Configurar Supabase
- Criar conta no Kiwify
- Gerar tokens reais
- Salvar dados no banco

## 🚀 Como Ativar

O modo de desenvolvimento é ativado **AUTOMATICAMENTE** quando:

### Opção 1: Sem Configurar Supabase (Recomendado)

Deixe o arquivo `.env` vazio ou com credenciais vazias:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Opção 2: Usar Token de Teste

Use qualquer URL com token que comece com `dev-` ou `test-`:

```
http://localhost:5173/diagnostico?token=dev-123
http://localhost:5173/diagnostico?token=test-anything
```

## ✅ O Que Funciona em Dev Mode

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Landing Page | ✅ Funciona | Banner verde aparece |
| Navegação | ✅ Funciona | Todas as rotas |
| Questionário | ✅ Funciona | Completo |
| Seleção de Serviços | ✅ Funciona | Todos os 90+ serviços |
| Cálculos | ✅ Funciona | Totalmente funcional |
| Relatório | ✅ Funciona | Todas as seções |
| Geração de PDF | ✅ Funciona | Download normal |
| Animações | ✅ Funciona | Todas |
| Validação de Token | ⚠️ Desabilitada | Aceita qualquer token |
| Salvamento no Banco | ❌ Desabilitado | Esperado |
| Email Real | ❌ Mock | Usa `dev@example.com` |

## 🎬 Como Testar

### 1. Iniciar o Servidor

```bash
npm run dev
```

### 2. Acessar a Landing Page

```
http://localhost:5173
```

### 3. Você Verá

**Banner verde no topo:**
```
🔧 Modo Desenvolvimento - Validação de token desabilitada
```

**Dois botões:**
1. **"Fazer diagnóstico agora"** → Token aleatório
2. **"🧪 Modo Teste (sem token)"** → Token fixo

### 4. Clique em Qualquer Botão

Ambos funcionam! Escolha qualquer um.

### 5. Preencha o Questionário

- Selecione serviços (Netflix, Spotify, etc)
- Informe valores mensais
- Marque frequência de uso
- Navegue pelas categorias

### 6. Veja o Relatório

- Impacto total
- Desperdício identificado
- Top 5 drenos
- Economia potencial
- Possibilidades
- Ações de cancelamento

### 7. Baixe o PDF

Clique em "📄 Baixar PDF" - funciona normalmente!

## 🔍 Logs do Console

Quando em modo dev, você verá estes logs no console (F12):

### No Início

```
⚠️ Supabase credentials not found. Using dummy values for development.
📝 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file for full functionality.
```

### Ao Acessar o Questionário

```
🔧 DEV MODE: Validação de token desabilitada
💡 Token: dev-123456789
📧 Email: dev@example.com (mock)
```

### Ao Finalizar

```
🔧 DEV MODE: Salvamento no Supabase desabilitado
```

**Estes logs são NORMAIS e esperados!** Não são erros.

## 🆚 Diferenças: Dev vs Produção

| Aspecto | Dev Mode | Produção |
|---------|----------|----------|
| Validação de Token | ❌ Desabilitada | ✅ Validada no Supabase |
| Email | Mock (`dev@example.com`) | Real do Kiwify |
| Salvamento | ❌ Não salva | ✅ Salva no banco |
| Cálculos | ✅ Funciona | ✅ Funciona |
| PDF | ✅ Funciona | ✅ Funciona |
| Banner Verde | ✅ Visível | ❌ Oculto |
| Botão de Teste | ✅ Visível | ❌ Oculto |

## 🔐 URLs Válidas em Dev Mode

Todas estas URLs funcionam:

```
# Token aleatório (gerado automaticamente)
http://localhost:5173/diagnostico?token=test-token-1234567890

# Token fixo de desenvolvimento
http://localhost:5173/diagnostico?token=dev-123456789

# Token com prefixo "dev-"
http://localhost:5173/diagnostico?token=dev-anything-here

# Token com prefixo "test-"
http://localhost:5173/diagnostico?token=test-my-test-123
```

## ❌ O Que NÃO Funciona

### Acesso Direto sem Token

```
❌ http://localhost:5173/diagnostico
```

**Erro:** Será redirecionado para `/acesso-negado`

**Solução:** Sempre use um token:
```
✅ http://localhost:5173/diagnostico?token=dev-123
```

### Token Aleatório (sem prefixo)

Se o Supabase estiver configurado:

```
❌ http://localhost:5173/diagnostico?token=abc123
```

**Erro:** Validação vai falhar se não existir no banco

**Solução:** Use prefixo `dev-` ou `test-`:
```
✅ http://localhost:5173/diagnostico?token=dev-abc123
```

## 🧪 Cenários de Teste

### Teste 1: Usuário com Muitas Assinaturas

1. Selecione 10+ serviços
2. Coloque valores altos (R$ 50-100)
3. Marque "Nunca" ou "Raramente" em vários
4. Veja o desperdício alto

### Teste 2: Usuário Econômico

1. Selecione 3-5 serviços
2. Valores baixos (R$ 20-30)
3. Marque "Sempre" na maioria
4. Veja o desperdício baixo

### Teste 3: Mix Realista

1. Streaming: 4 serviços (R$ 25-50)
2. Produtividade: 2 serviços (R$ 40-100)
3. Mix de frequências
4. Veja relatório balanceado

## 🔄 Alternando Entre Modos

### Dev → Produção

1. Configure `.env` com credenciais reais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

2. Reinicie o servidor:
   ```bash
   # Ctrl+C
   npm run dev
   ```

3. **Banner verde desaparece**
4. **Botão de teste desaparece**
5. **Validação real ativada**

### Produção → Dev

1. Esvazie `.env`:
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

2. Reinicie o servidor

3. **Banner verde aparece**
4. **Botão de teste aparece**
5. **Modo dev ativado**

## 🐛 Troubleshooting

### "Acesso Negado" Mesmo com Token

**Problema:** URL sem token ou token sem prefixo

**Solução:**
```bash
# Errado
http://localhost:5173/diagnostico

# Certo
http://localhost:5173/diagnostico?token=dev-123
```

### Banner Verde Não Aparece

**Problema:** Supabase configurado no `.env`

**Solução:** Esvazie o `.env` ou use token com prefixo `dev-`

### Logs "Error saving diagnostic"

**Problema:** Tentando salvar sem Supabase configurado

**Status:** Normal em dev mode! O log mostra:
```
🔧 DEV MODE: Salvamento no Supabase desabilitado
```

## 💡 Dicas

### Teste Rápido

Use o token fixo para testes rápidos:
```
http://localhost:5173/diagnostico?token=dev-123
```

Adicione aos favoritos para acesso rápido!

### Debugging

Sempre mantenha o Console aberto (F12) para ver os logs:
- Verde 🔧 = Modo dev ativo
- Amarelo ⚠️ = Avisos (normais)
- Vermelho ❌ = Erros (verificar)

### Performance

Dev mode é mais rápido que produção pois pula:
- Validação no Supabase
- Salvamento no banco
- Atualização de token

## 📝 Resumo

**Dev Mode é:**
- ✅ Automático (sem configuração)
- ✅ Completo (tudo funciona localmente)
- ✅ Rápido (sem chamadas de API)
- ✅ Seguro (não afeta banco de produção)
- ✅ Visível (banner e botão indicam o modo)

**Use para:**
- Desenvolvimento local
- Testes de UI/UX
- Testes de cálculos
- Validação de PDF
- Demos e apresentações

**NÃO use para:**
- Produção
- Testes de integração real
- Validação de tokens reais
- Dados de clientes

---

**Última atualização:** 08/01/2026
**Versão:** 1.0
