# 💰 Diagnóstico Financeiro Pessoal

Uma aplicação web que analisa gastos com assinaturas e serviços, mostrando desperdício financeiro em menos de 5 minutos.

## 📋 Sobre o Projeto

**Objetivo:** Gerar choque visual numérico → Decisão imediata → Ação de cancelamento

**Público-alvo:** Pessoas que pagam múltiplas assinaturas e não sabem quanto desperdiçam mensalmente

**Tempo de experiência:** < 5 minutos (do início ao relatório completo)

## 🏗️ Stack Técnica

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (com configuração dark/light mode)
- **shadcn/ui** (componentes base)
- **Zustand** (gerenciamento de estado)
- **React Router DOM** (navegação)
- **jsPDF** (geração de relatórios)

### Backend
- **Supabase PostgreSQL** (banco de dados)
- **Supabase Edge Functions** (webhook Kiwify + geração de tokens)

### Pagamento
- **Kiwify** (webhook para validação de acesso)

### Deploy
- **Vercel** (frontend)
- **Supabase** (backend + database)

## 🚀 Início Rápido (2 minutos)

### Opção 1: Script Automático (Recomendado)

```bash
./start.sh
```

### Opção 2: Manual

```bash
npm install
npm run dev
```

Acesse: **http://localhost:5173**

✅ **Pronto!** A aplicação já funciona em modo desenvolvimento.

> **Nota:** Para funcionalidade completa (salvamento no banco, tokens reais), configure o Supabase abaixo.

---

## 📖 Instalação Completa

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita) - **Opcional para desenvolvimento**
- Conta no Kiwify (opcional, para pagamentos em produção)
- Conta no Vercel (opcional, para deploy)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd custoZero
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute em desenvolvimento** (sem backend)
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

**Modo desenvolvimento:** Tudo funciona localmente, exceto salvamento no banco e validação real de tokens.

### Configuração Opcional do Supabase

Para funcionalidade completa, crie um arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

Depois configure o banco de dados (veja seção abaixo).

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta e um novo projeto
3. Aguarde a criação do banco de dados

### 2. Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `database-schema.sql`
3. Cole no editor e execute
4. Verifique se as tabelas foram criadas:
   - `access_tokens`
   - `diagnostics`

**O schema inclui:**
- ✅ Validação automática de emails (constraints)
- ✅ Trigger para expiração automática de tokens (24h)
- ✅ Função de limpeza automática (LGPD compliance)
- ✅ Views para monitoramento em tempo real
- ✅ Índices otimizados para performance
- ✅ RLS desabilitado (acesso via service_role key)

### 3. Configurar Cron Job de Limpeza (Opcional mas Recomendado)

Para cumprir LGPD e manter o banco limpo:

1. No Supabase Dashboard, vá em **Database** > **Cron Jobs** (extensão pg_cron)
2. Clique em **Create a new cron job**
3. Configure:
   ```
   Nome: cleanup_expired_data
   Schedule: 0 3 * * * (todo dia às 3h da manhã)
   SQL: SELECT * FROM cleanup_expired_tokens();
   ```
4. Salve

Isso vai automaticamente:
- Deletar tokens expirados há mais de 7 dias
- Deletar diagnósticos com mais de 30 dias

### 4. Monitorar o Sistema (Opcional)

Use as views criadas para monitoramento:

```sql
-- Ver resumo de tokens
SELECT * FROM active_tokens_summary;

-- Ver diagnósticos recentes
SELECT * FROM recent_diagnostics;
```

### 5. Obter Credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
3. Adicione ao seu arquivo `.env`

## 🔗 Configuração do Webhook Kiwify

### 1. Deploy da Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-ref

# Deploy da função
supabase functions deploy kiwify-webhook
```

### 2. Configurar Variáveis de Ambiente da Edge Function

No Supabase Dashboard:

1. Vá em **Edge Functions** > **kiwify-webhook** > **Settings**
2. Adicione as variáveis:
   ```
   APP_URL=https://seu-app.vercel.app
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
   ```

### 3. Configurar Webhook no Kiwify

1. Acesse seu produto no Kiwify
2. Vá em **Configurações** > **Webhooks**
3. Adicione a URL: `https://seu-projeto.supabase.co/functions/v1/kiwify-webhook`
4. Selecione o evento: **Compra Aprovada**

### 4. Atualizar Landing Page

No arquivo `src/pages/Landing.tsx`, atualize a função `handleStartDiagnostic`:

```typescript
const handleStartDiagnostic = () => {
  // Substituir por seu link de checkout Kiwify
  window.location.href = 'https://pay.kiwify.com.br/SEU_LINK_AQUI';
};
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 🌐 Deploy na Vercel

### Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Via GitHub

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── landing/         # Componentes da landing page
│   ├── questionnaire/   # Componentes do questionário
│   ├── report/          # Componentes do relatório
│   └── common/          # Componentes compartilhados
├── data/
│   ├── categories.ts    # Todas as categorias
│   ├── services.ts      # Todos os serviços com preços
│   └── constants.ts     # Constantes globais
├── store/
│   └── diagnosticStore.ts  # Zustand store
├── lib/
│   ├── utils.ts         # Utilitários
│   ├── calculations.ts  # Lógica de cálculos
│   ├── pdf-generator.ts # Geração de PDF
│   └── supabase.ts      # Cliente Supabase
├── hooks/
│   └── useAuth.ts       # Validação de token
├── pages/
│   ├── Landing.tsx      # Landing page
│   ├── Questionnaire.tsx # Questionário
│   ├── Report.tsx       # Relatório final
│   ├── Loading.tsx      # Tela de loading
│   └── AccessDenied.tsx # Acesso negado
├── types/
│   └── index.ts         # Tipos TypeScript
├── App.tsx              # App principal com rotas
└── main.tsx             # Entry point
```

## 🎨 Personalização

### Cores

Edite `tailwind.config.js` para alterar as cores:

```javascript
colors: {
  accent: '#10B981', // Cor principal (verde)
  'dark-accent': '#84CC16', // Cor dark mode
  // ...
}
```

### Serviços

Adicione novos serviços em `src/data/services.ts`:

```typescript
export const novaCategoriaServices: Service[] = [
  {
    id: 'novo-servico',
    name: 'Novo Serviço',
    logo: 'https://logo.clearbit.com/exemplo.com',
    avgPriceMin: 10,
    avgPriceMax: 50,
    cancelUrl: 'https://exemplo.com/cancelar',
    howToCancel: 'Instruções aqui'
  }
];
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado no Supabase
- ✅ Tokens de acesso únicos e com expiração
- ✅ Validação de token no backend
- ✅ Variáveis de ambiente protegidas
- ✅ CORS configurado

## 📊 Funcionalidades

### ✅ Implementado

- [x] Landing page minimalista
- [x] Integração com Kiwify (webhook)
- [x] Validação de acesso via token
- [x] Questionário interativo (11 categorias)
- [x] Cálculo de desperdício financeiro
- [x] Relatório visual com métricas
- [x] Geração de PDF
- [x] 90+ serviços catalogados
- [x] Dark/Light mode
- [x] Mobile responsive
- [x] Salvamento no banco de dados

### 🚧 Melhorias Futuras

- [ ] Histórico de diagnósticos
- [ ] Sistema de login/senha
- [ ] Envio automático de email com PDF
- [ ] Analytics e tracking
- [ ] Compartilhamento em redes sociais
- [ ] Comparação entre diagnósticos

## 🐛 Troubleshooting

### Erro: "Supabase credentials not found"

**Solução:** Verifique se o arquivo `.env` está na raiz do projeto e contém as variáveis corretas.

### Erro: "Token validation error"

**Solução:**
1. Verifique se o schema SQL foi executado corretamente
2. Confirme que o webhook do Kiwify está configurado
3. Verifique os logs da Edge Function no Supabase

### Imagens de logos não carregam

**Solução:**
1. As logos usam `logo.clearbit.com`
2. Para logos customizadas, adicione URLs diretas em `services.ts`
3. Há um fallback automático para placeholders

## 📝 Licença

Este projeto é privado e proprietário.

## 🤝 Contribuindo

Este é um projeto fechado. Para reportar bugs ou sugestões, entre em contato.

## 📧 Suporte

Para suporte, entre em contato via email: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ para ajudar pessoas a economizarem dinheiro**
