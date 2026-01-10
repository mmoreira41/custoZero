# 🚀 Guia Rápido - Como Rodar o Sistema

## ⚡ Início Rápido (2 minutos)

### 1. Instalar Dependências

```bash
npm install
```

### 2. Rodar em Modo Desenvolvimento

```bash
npm run dev
```

O sistema vai abrir em: **http://localhost:5173** (ou 5174 se a porta estiver ocupada)

✅ **Pronto!** A aplicação já deve estar funcionando.

---

## 🎯 O Que Você Vai Ver

### Landing Page (/)

Quando o Supabase NÃO está configurado (`.env` vazio), você verá:

- **Banner verde no topo:** "🔧 Modo Desenvolvimento - Validação de token desabilitada"
- **Dois botões:**
  1. **"Fazer diagnóstico agora"** → Gera token aleatório (`test-token-123456...`)
  2. **"🧪 Modo Teste (sem token)"** → Usa token fixo (`dev-123456789`)

**Ambos funcionam sem validação!** Escolha qualquer um para testar.

### 🔧 Modo de Desenvolvimento Automático

O sistema detecta automaticamente que está em modo dev quando:
- Arquivo `.env` está vazio OU
- Não tem `VITE_SUPABASE_URL` configurada OU
- Token começa com `dev-` ou `test-`

**Neste modo:**
- ✅ Landing page funciona
- ✅ Questionário funciona (sem validar token)
- ✅ Relatório funciona
- ✅ Geração de PDF funciona
- ✅ Todos os cálculos funcionam
- ❌ Salvamento no banco NÃO funciona (esperado)
- ⚠️ Email usado: `dev@example.com` (mock)

**Console mostrará:**
```
🔧 DEV MODE: Validação de token desabilitada
💡 Token: dev-123456789
📧 Email: dev@example.com (mock)
🔧 DEV MODE: Salvamento no Supabase desabilitado
```

**Isso é esperado e normal para desenvolvimento!**

---

## 🔧 Configuração Completa (Opcional)

Para ter funcionalidade completa (salvamento no banco, tokens reais):

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Aguarde a criação do banco

### 2. Executar Schema SQL

1. No Supabase Dashboard → **SQL Editor**
2. Copie todo o conteúdo de `database-schema.sql`
3. Cole e execute
4. Verifique se as tabelas foram criadas

### 3. Adicionar Credenciais

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

**Como obter:**
- Supabase Dashboard → **Settings** → **API**
- Copie **Project URL** e **anon/public key**

### 4. Reiniciar o Servidor

```bash
# Ctrl+C para parar
npm run dev
```

---

## 🐛 Problemas Comuns

### Tela Branca

**Solução:**
1. Abra o Console do Navegador (F12)
2. Veja se há erros
3. Verifique se o arquivo `.env` existe
4. Rode: `npm run dev` novamente

### Erro "Supabase credentials not found"

**Isso é NORMAL em desenvolvimento!**

Você verá este aviso no console:
```
⚠️ Supabase credentials not found. Using dummy values for development.
```

**Solução:** Ignore ou configure o Supabase (opcional)

### Porta 5173 já em uso

**O Vite automaticamente usa outra porta (5174, 5175, etc)**

Procure no terminal:
```
➜  Local:   http://localhost:5174/
```

### Build falha

```bash
# Limpar cache e reinstalar
rm -rf node_modules dist
npm install
npm run build
```

---

## 📁 Estrutura de Rotas

| Rota | Descrição | Precisa Token? |
|------|-----------|----------------|
| `/` | Landing Page | Não |
| `/diagnostico?token=xxx` | Questionário | Sim (mock em dev) |
| `/relatorio` | Relatório Final | Sim (após questionário) |
| `/acesso-negado` | Erro de Token | - |

---

## 🎨 Testando o Fluxo Completo

### Sem Supabase (Modo Mock)

1. Acesse: `http://localhost:5173`
2. Clique em "Fazer diagnóstico agora"
3. Preencha o questionário (selecione serviços)
4. Veja o relatório final
5. Baixe o PDF

**Tudo funciona, exceto salvamento no banco!**

### Com Supabase (Produção)

1. Configure `.env` com credenciais
2. Mesmo fluxo acima
3. **Agora os dados são salvos no banco**
4. Tokens são validados de verdade

---

## 📊 Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Verificar tipos TypeScript
npm run tsc

# Limpar tudo e reinstalar
rm -rf node_modules dist .vite
npm install
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Não esqueça:**
- Adicionar variáveis de ambiente no Vercel Dashboard
- Configurar Edge Function no Supabase
- Configurar webhook no Kiwify

---

## 💡 Dicas

### Desenvolvimento Rápido

- **Hot Reload ativado:** Mudanças aparecem instantaneamente
- **Console é seu amigo:** Sempre aberto (F12)
- **Warnings amarelos são OK:** Erros vermelhos não

### Dados de Teste

Para testar o questionário rapidamente:
- Selecione 2-3 serviços por categoria
- Use valores como: R$ 30, R$ 50, R$ 100
- Marque frequências variadas (nunca, raramente, sempre)

### Performance

O build final é otimizado:
- **Bundle principal:** ~260 KB gzipped
- **Carregamento:** < 2s
- **Lighthouse Score:** 95+

---

## ❓ Precisa de Ajuda?

1. **Erro não documentado?** → Veja o console do navegador
2. **Dúvida sobre Supabase?** → Leia `README.md` completo
3. **Schema do banco?** → Veja `SCHEMA_IMPROVEMENTS.md`

---

## ✅ Checklist de Funcionamento

- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` roda sem erros
- [ ] Landing page carrega (`http://localhost:5173`)
- [ ] Botão "Fazer diagnóstico" funciona
- [ ] Questionário carrega
- [ ] Pode selecionar serviços
- [ ] Relatório é gerado
- [ ] PDF pode ser baixado

**Se todos ✅ = Sistema funcionando perfeitamente!**

---

**Última atualização:** 08/01/2026
**Versão:** 1.0
