📋 CONTEXTO DO PRODUTO
Você vai construir um Diagnóstico Financeiro Pessoal - uma aplicação web que analisa gastos com assinaturas e serviços, mostrando desperdício financeiro em menos de 5 minutos.
Objetivo principal: Gerar choque visual numérico → Decisão imediata → Ação de cancelamento
Público-alvo: Pessoas que pagam múltiplas assinaturas e não sabem quanto desperdiçam mensalmente
Tempo de experiência: < 5 minutos (do início ao relatório completo)

🏗️ STACK TÉCNICA
Frontend:
- React 18 + TypeScript + Vite
- Tailwind CSS (com configuração dark/light mode)
- shadcn/ui (componentes base)
- Zustand (gerenciamento de estado)
- React Router DOM (navegação)

Backend:
- Supabase PostgreSQL (banco de dados)
- Supabase Edge Functions (webhook Kiwify + geração de tokens)

PDF:
- jsPDF (geração de relatórios)

Deploy:
- Vercel (frontend)
- Supabase (backend + database)

Pagamento:
- Kiwify (webhook para validação de acesso)

📊 ESTRUTURA DE DADOS (TypeScript)
typescript// types/index.ts

export type UsageFrequency = 'nunca' | 'raramente' | 'as-vezes' | 'sempre';

export type WasteLevel = 'WASTE' | 'LOW_USE' | 'ACTIVE';

export type CategoryId = 
  | 'streaming' 
  | 'utilitarios' 
  | 'produtividade' 
  | 'educacao' 
  | 'marketplaces' 
  | 'social' 
  | 'games' 
  | 'fitness' 
  | 'transporte' 
  | 'financeiro' 
  | 'extras';

export interface Service {
  id: string;
  name: string;
  logo: string; // URL da logo (usar logo.clearbit.com ou similar)
  avgPriceMin: number;
  avgPriceMax: number;
  cancelUrl?: string; // URL para cancelamento direto
  howToCancel?: string; // Instruções de cancelamento
}

export interface ServiceInput {
  serviceId: string;
  monthlyValue: number;
  frequency: UsageFrequency;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // emoji ou ícone
  services: Service[];
  isSubscription: boolean; // true = tem preview screen
}

export interface FinancialBlock {
  numCards: number;
  totalAnnuity: number;
  monthlyInterest: number;
  activeParcels: number;
}

export interface HabitInput {
  type: 'delivery' | 'transport' | 'coffee';
  frequency: number; // vezes por mês
  avgSpent: number; // gasto médio por vez
}

export interface DiagnosticResult {
  id: string;
  createdAt: string;
  email: string;
  
  // Inputs do usuário
  selectedServices: ServiceInput[];
  financialBlock?: FinancialBlock;
  habits?: HabitInput[];
  
  // Cálculos
  totalMonthly: number;
  totalYearly: number;
  wasteMonthly: number;
  wasteYearly: number;
  
  // Rankings
  topWasters: Array<{
    serviceName: string;
    yearlyValue: number;
    wasteLevel: WasteLevel;
  }>;
  
  // Economia potencial
  savings: {
    conservative: number; // 20%
    realistic: number;    // 35%
    aggressive: number;   // 50%
  };
}

export interface AccessToken {
  token: string;
  email: string;
  used: boolean;
  expiresAt: string;
}
```

---

## 🗂️ ESTRUTURA DE PASTAS
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layouts/
│   │   └── ThemeProvider.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   └── Features.tsx
│   ├── questionnaire/
│   │   ├── CategoryPreview.tsx
│   │   ├── ServiceSelection.tsx
│   │   ├── ServiceInput.tsx
│   │   ├── FinancialBlock.tsx
│   │   ├── HabitsBlock.tsx
│   │   └── ProgressBar.tsx
│   ├── report/
│   │   ├── ImpactHeader.tsx
│   │   ├── WasteSection.tsx
│   │   ├── RankingSection.tsx
│   │   ├── SavingsSection.tsx
│   │   ├── PossibilitiesSection.tsx
│   │   └── ActionButtons.tsx
│   └── common/
│       ├── Loading.tsx
│       └── ThemeToggle.tsx
│
├── data/
│   ├── categories.ts     # Todas as categorias
│   ├── services.ts       # Todos os serviços com preços
│   └── constants.ts      # Constantes globais
│
├── store/
│   └── diagnosticStore.ts  # Zustand store
│
├── lib/
│   ├── calculations.ts   # Lógica de cálculos
│   ├── pdf-generator.ts  # Geração de PDF
│   ├── supabase.ts       # Cliente Supabase
│   └── utils.ts          # Utilitários gerais
│
├── pages/
│   ├── Landing.tsx
│   ├── Questionnaire.tsx
│   ├── Loading.tsx
│   ├── Report.tsx
│   └── AccessDenied.tsx
│
├── hooks/
│   ├── useAuth.ts        # Validação de token
│   └── useDiagnostic.ts  # Lógica do questionário
│
├── types/
│   └── index.ts          # Todos os tipos TypeScript
│
├── App.tsx
├── main.tsx
└── index.css

🎨 DESIGN SYSTEM
Paleta de Cores
css/* tailwind.config.js - adicionar no theme */
colors: {
  // Light mode
  background: '#FFFFFF',
  foreground: '#000000',
  card: '#E5E5E5',
  accent: '#10B981', // verde estilo GrowMate
  
  // Dark mode
  'dark-background': '#0A0A0A',
  'dark-foreground': '#FFFFFF',
  'dark-card': '#1F1F1F',
  'dark-accent': '#84CC16', // verde limão
  
  // Feedback de uso
  waste: '#FCA5A5',      // vermelho claro
  'low-use': '#FDE68A',  // amarelo claro
  active: '#86EFAC',     // verde claro
}
Tipografia
css/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.headline {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 72px; /* mobile: 48px */
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.category-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px; /* mobile: 24px */
}

.body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
}
Componentes Base (shadcn/ui)
bashnpx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

---

## 🔄 FLUXO COMPLETO DO USUÁRIO

### **1. Landing Page**

**Layout (baseado na imagem 3):**
- Headline grande à esquerda (70% da largura)
- Espaço negativo generoso
- CTA único e destacado
- Rodapé minimalista

**Copy:**
```
Headline: "Você sabe quanto dinheiro perde todo mês?"
Subheadline: "Em 5 minutos mostramos, com números, onde está o desperdício."
CTA: "Fazer diagnóstico agora"
Comportamento:

Ao clicar no CTA, redireciona para Kiwify checkout
Mobile-first (100% responsivo)
Animações sutis (fade-in)


2. Integração Kiwify (CRÍTICO)
Fluxo de pagamento:

Usuário clica "Fazer diagnóstico agora" → redireciona para checkout Kiwify
Kiwify processa pagamento
Após sucesso, Kiwify envia webhook para: https://seu-projeto.supabase.co/functions/v1/kiwify-webhook
Edge Function recebe:

json   {
     "email": "user@example.com",
     "transaction_id": "kw_123456",
     "status": "paid"
   }

Edge Function gera token único (UUID)
Salva no banco:

sql   INSERT INTO access_tokens (token, email, used, expires_at)
   VALUES ('uuid-here', 'user@example.com', false, NOW() + INTERVAL '24 hours');

Kiwify redireciona para: https://seu-app.com/diagnostico?token=uuid-here

Edge Function (Supabase):
typescript// supabase/functions/kiwify-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { email, transaction_id, status } = await req.json()

  if (status !== 'paid') {
    return new Response(JSON.stringify({ error: 'Payment not confirmed' }), {
      status: 400,
    })
  }

  // Gerar token único
  const token = crypto.randomUUID()

  // Salvar no banco
  const { error } = await supabase
    .from('access_tokens')
    .insert({
      token,
      email,
      used: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }

  // Retornar URL de redirecionamento
  return new Response(
    JSON.stringify({
      redirect_url: `https://seu-app.com/diagnostico?token=${token}`,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})
Schema do banco (Supabase):
sql-- access_tokens table
CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- diagnostics table
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  data JSONB NOT NULL, -- armazena todo DiagnosticResult
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_access_tokens_token ON access_tokens(token);
CREATE INDEX idx_access_tokens_email ON access_tokens(email);
CREATE INDEX idx_diagnostics_email ON diagnostics(email);
Validação de acesso no frontend:
typescript// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [email, setEmail] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      navigate('/acesso-negado')
      return
    }

    validateToken(token)
  }, [])

  async function validateToken(token: string) {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      navigate('/acesso-negado')
      return
    }

    // Marcar como usado
    await supabase
      .from('access_tokens')
      .update({ used: true })
      .eq('token', token)

    setEmail(data.email)
    setIsValid(true)
  }

  return { isValid, email }
}

3. Questionário - Estrutura por Categorias
ORDEM FIXA (NÃO ALTERAR):

Streaming
Utilitários
Produtividade
Educação
Marketplaces
Social/Namoro
Games
Fitness
Transporte
Financeiro
Extras

Para cada categoria de assinatura:
TELA A - Seleção (baseada na imagem 3):
tsx// CategorySelection.tsx
<div className="min-h-screen p-8">
  <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
    {/* Título à esquerda */}
    <div className="col-span-5">
      <h1 className="headline">
        Selecione seus<br/>
        Serviços de<br/>
        {category.name}
      </h1>
    </div>

    {/* Grid de serviços à direita */}
    <div className="col-span-7">
      <div className="grid grid-cols-4 gap-4">
        {category.services.map(service => (
          <button
            key={service.id}
            onClick={() => toggleService(service.id)}
            className={cn(
              "aspect-square rounded-lg transition-all",
              "flex flex-col items-center justify-center gap-2",
              selected.includes(service.id)
                ? "bg-accent ring-2 ring-accent"
                : "bg-card hover:bg-card/80"
            )}
          >
            <img 
              src={service.logo} 
              alt={service.name}
              className="w-12 h-12 object-contain"
            />
            <span className="text-xs text-center font-medium">
              {service.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Botão continuar (fixo no rodapé) */}
  <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
    <Button 
      onClick={goToNextStep}
      disabled={selected.length === 0}
      className="mx-auto"
    >
      Continuar →
    </Button>
  </div>
</div>
TELA B - Preenchimento de Valores:
tsx// ServiceInput.tsx
{selectedServices.map(service => (
  <Card key={service.id} className="p-6">
    <div className="flex items-start gap-4">
      <img src={service.logo} className="w-16 h-16" />
      
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{service.name}</h3>
        <p className="text-sm text-muted-foreground">
          Normalmente custa R$ {service.avgPriceMin} a R$ {service.avgPriceMax}
        </p>

        <div className="mt-4 space-y-4">
          {/* Valor mensal */}
          <div>
            <label className="text-sm font-medium">Valor mensal</label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={values[service.id]?.monthlyValue || ''}
              onChange={(e) => updateValue(service.id, 'monthlyValue', e.target.value)}
            />
          </div>

          {/* Frequência de uso */}
          <div>
            <label className="text-sm font-medium">Com que frequência você usa?</label>
            <RadioGroup
              value={values[service.id]?.frequency}
              onValueChange={(val) => updateValue(service.id, 'frequency', val)}
            >
              <div className="flex gap-2">
                <RadioGroupItem value="nunca" id={`${service.id}-nunca`} />
                <label htmlFor={`${service.id}-nunca`}>
                  🚫 Nunca
                </label>
              </div>
              <div className="flex gap-2">
                <RadioGroupItem value="raramente" id={`${service.id}-raramente`} />
                <label htmlFor={`${service.id}-raramente`}>
                  🌙 Raramente (1-3x/mês)
                </label>
              </div>
              <div className="flex gap-2">
                <RadioGroupItem value="as-vezes" id={`${service.id}-as-vezes`} />
                <label htmlFor={`${service.id}-as-vezes`}>
                  ⭐ Às vezes (5-10x/mês)
                </label>
              </div>
              <div className="flex gap-2">
                <RadioGroupItem value="sempre" id={`${service.id}-sempre`} />
                <label htmlFor={`${service.id}-sempre`}>
                  🔥 Sempre (Diário)
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  </Card>
))}
Blocos Não-Assinatura (entrada direta, sem preview):
typescript// Serviços fixos
const fixedServices = [
  'Internet',
  'Celular',
  'TV por assinatura',
  'Academia',
  'Outros'
]

// Financeiro
interface FinancialBlock {
  numCards: number
  totalAnnuity: number
  monthlyInterest: number
  activeParcels: number
}

// Hábitos
const habits = [
  { type: 'delivery', label: 'Delivery (iFood, Rappi, etc)' },
  { type: 'transport', label: 'Transporte (Uber, 99, táxi)' },
  { type: 'coffee', label: 'Cafés e lanches' }
]

4. Loading Screen
tsx// Loading.tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center space-y-6">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-accent mx-auto" />
    <p className="text-2xl font-semibold">
      Calculando quanto dinheiro você pode economizar...
    </p>
    <Progress value={progress} className="w-64 mx-auto" />
  </div>
</div>
Lógica:

Duração: 1.5 segundos
Animação de progresso (0% → 100%)
Ao terminar, calcula tudo e redireciona para /relatorio


5. Relatório Final
Estrutura:
tsx// Report.tsx
<div className="max-w-6xl mx-auto p-8 space-y-12">
  {/* Bloco 1 - Impacto Total */}
  <ImpactHeader 
    monthly={result.totalMonthly}
    yearly={result.totalYearly}
  />

  {/* Bloco 2 - Desperdício */}
  <WasteSection 
    wasteMonthly={result.wasteMonthly}
    wasteYearly={result.wasteYearly}
    services={result.topWasters}
  />

  {/* Bloco 3 - Ranking Top 5 */}
  <RankingSection 
    topWasters={result.topWasters.slice(0, 5)}
  />

  {/* Bloco 4 - Economia Potencial */}
  <SavingsSection 
    conservative={result.savings.conservative}
    realistic={result.savings.realistic}
    aggressive={result.savings.aggressive}
  />

  {/* Bloco 5 - Possibilidades */}
  <PossibilitiesSection 
    realisticSavings={result.savings.realistic}
  />

  {/* Bloco 6 - Ações Imediatas */}
  <ActionButtons 
    services={result.topWasters}
    onDownloadPDF={handleDownloadPDF}
    onRestart={handleRestart}
  />
</div>
Seção de Possibilidades:
tsx// PossibilitiesSection.tsx
const possibilities = [
  {
    icon: '✈️',
    title: 'Viagens',
    description: (savings) => 
      `${Math.floor(savings / 3000)} viagens nacionais por ano`
  },
  {
    icon: '📈',
    title: 'Rendimento na Selic',
    description: (savings) => 
      `R$ ${(savings * 0.13).toFixed(2)} em 1 ano investindo na Selic`
  },
  {
    icon: '❤️',
    title: 'Cestas básicas',
    description: (savings) => 
      `${Math.floor(savings / 150)} cestas básicas doadas`
  },
  {
    icon: '🛡️',
    title: 'Reserva de emergência',
    description: (savings) => 
      `${Math.floor(savings / 6000)} meses de reserva (baseado em R$ 6.000)`
  },
  {
    icon: '🎓',
    title: 'Cursos',
    description: (savings) => 
      `${Math.floor(savings / 500)} cursos profissionalizantes`
  }
]

<div className="grid md:grid-cols-3 gap-6">
  {possibilities.map((item, index) => (
    <Card 
      key={index}
      className="p-6 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl mb-3">{item.icon}</div>
      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
      <p className="text-muted-foreground">
        {item.description(realisticSavings)}
      </p>
    </Card>
  ))}
</div>
Ação Imediata (Cancelamentos):
tsx// ActionButtons.tsx
{topWasters.map(service => (
  <div key={service.serviceId} className="flex items-center justify-between p-4 border rounded-lg">
    <div className="flex items-center gap-4">
      <img src={service.logo} className="w-12 h-12" />
      <div>
        <p className="font-semibold">{service.name}</p>
        <p className="text-sm text-muted-foreground">
          R$ {service.monthlyValue}/mês • R$ {service.yearlyValue}/ano
        </p>
      </div>
    </div>

    {service.cancelUrl ? (
      <Button 
        variant="destructive"
        onClick={() => window.open(service.cancelUrl, '_blank')}
      >
        Cancelar agora
      </Button>
    ) : (
      <Button 
        variant="outline"
        onClick={() => showCancelModal(service)}
      >
        Como cancelar?
      </Button>
    )}
  </div>
))}
Botões finais:
tsx<div className="flex gap-4 justify-center mt-8">
  <Button onClick={handleDownloadPDF} size="lg">
    📄 Baixar PDF
  </Button>
  <Button onClick={handleRestart} variant="outline" size="lg">
    🔁 Fazer novo diagnóstico
  </Button>
</div>

6. Geração de PDF
typescript// lib/pdf-generator.ts
import jsPDF from 'jspdf'
import type { DiagnosticResult } from '@/types'

export function generatePDF(result: DiagnosticResult) {
  const doc = new jsPDF()
  let yPos = 20

  // Cabeçalho
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Diagnóstico Financeiro Pessoal', 20, yPos)
  yPos += 15

  // Data
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('pt-BR'), 20, yPos)
  yPos += 20

  // Impacto Total
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('💰 Impacto Total', 20, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mensal: R$ ${result.totalMonthly.toFixed(2)}`, 20, yPos)
  yPos += 7
  doc.text(`Anual: R$ ${result.totalYearly.toFixed(2)}`, 20, yPos)
  yPos += 15

  // Desperdício
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('🚨 Desperdício Identificado', 20, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mensal: R$ ${result.wasteMonthly.toFixed(2)}`, 20, yPos)
  yPos += 7
  doc.text(`Anual: R$ ${result.wasteYearly.toFixed(2)}`, 20, yPos)
  yPos += 15

  // Top 5 Drenos
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('🔥 Top 5 Drenos Financeiros', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  result.topWasters.slice(0, 5).forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.serviceName} - R$ ${item.yearlyValue.toFixed(2)}/ano`,
      25,
      yPos
    )
    yPos += 7
  })
  yPos += 10

  // Economia Potencial
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('📈 Economia Potencial', 20, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Conservador (20%): R$ ${result.savings.conservative.toFixed(2)}`, 20, yPos)
  yPos += 7
  doc.text(`Realista (35%): R$ ${result.savings.realistic.toFixed(2)}`, 20, yPos)
  yPos += 7
  doc.text(`Agressivo (50%): R$ ${result.savings.aggressive.toFixed(2)}`, 20, yPos)

  // Rodapé
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    'Diagnóstico gerado em ' + new Date().toLocaleString('pt-BR'),
    20,
    280
  )

  // Salvar
  doc.save(`diagnostico-financeiro-${Date.now()}.pdf`)
}

🧮 LÓGICA DE CÁLCULOS
typescript// lib/calculations.ts
import type { ServiceInput, DiagnosticResult, UsageFrequency } from '@/types'

export function getWasteLevel(frequency: UsageFrequency): 'WASTE' | 'LOW_USE' | 'ACTIVE' {
  switch (frequency) {
    case 'nunca':
      return 'WASTE'
    case 'raramente':
      return 'LOW_USE'
    case 'as-vezes':
    case 'sempre':
      return 'ACTIVE'
  }
}

export function getWastePercentage(frequency: UsageFrequency): number {
  switch (frequency) {
    case 'nunca':
      return 1.0 // 100%
    case 'raramente':
      return 0.7 // 70%
    case 'as-vezes':
    case 'sempre':
      return 0.0 // 0%
  }
}

export function calculateDiagnostic(
  services: ServiceInput[],
  email: string
): DiagnosticResult {
  // Totais
  const totalMonthly = services.reduce((sum, s) => sum + s.monthlyValue, 0)
  const totalYearly = totalMonthly * 12

  // Desperdício
  const wasteMonthly = services.reduce((sum, s) => {
    const wastePercent = getWastePercentage(s.frequency)
    return sum + (s.monthlyValue * wastePercent)
  }, 0)
  const wasteYearly = wasteMonthly * 12

  // Top wasters (apenas WASTE e LOW_USE)
  const topWasters = services
    .filter(s => getWasteLevel(s.frequency) !== 'ACTIVE')
    .map(s => ({
      serviceId: s.serviceId,
      serviceName: getServiceName(s.serviceId), // buscar do data/services.ts
      yearlyValue: s.monthlyValue * 12,
      wasteLevel: getWasteLevel(s.frequency)
    }))
    .sort((a, b) => b.yearlyValue - a.yearlyValue)

  // Economia potencial (sobre o total de desperdício)
  const savings = {
    conservative: wasteYearly * 0.20,
    realistic: wasteYearly * 0.35,
    aggressive: wasteYearly * 0.50
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    email,
    selectedServices: services,
    totalMonthly,
    totalYearly,
    wasteMonthly,
    wasteYearly,
    topWasters,
    savings
  }
}

📦 DADOS - CATEGORIAS E SERVIÇOS
typescript// data/services.ts
import type { Service } from '@/types'

export const streamingServices: Service[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    avgPriceMin: 21,
    avgPriceMax: 60,
    cancelUrl: 'https://www.netflix.com/cancelplan'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    logo: 'https://logo.clearbit.com/disneyplus.com',
    avgPriceMin: 28,
    avgPriceMax: 67,
    cancelUrl: 'https://www.disneyplus.com/account'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    logo: 'https://logo.clearbit.com/primevideo.com',
    avgPriceMin: 20,
    avgPriceMax: 30,
    cancelUrl: 'https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G34EUPKVMYFW8N2U'
  },
  {
    id: 'hbo-max',
    name: 'Max (HBO Max)',
    logo: 'https://logo.clearbit.com/max.com',
    avgPriceMin: 30,
    avgPriceMax: 56,
    cancelUrl: 'https://www.max.com/account'
  },
  {
    id: 'globoplay',
    name: 'Globoplay',
    logo: 'https://logo.clearbit.com/globoplay.globo.com',
    avgPriceMin: 23,
    avgPriceMax: 40
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    logo: 'https://logo.clearbit.com/apple.com',
    avgPriceMin: 30,
    avgPriceMax: 30,
    cancelUrl: 'https://support.apple.com/pt-br/HT202039'
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    logo: 'https://logo.clearbit.com/paramountplus.com',
    avgPriceMin: 19,
    avgPriceMax: 35
  },
  {
    id: 'spotify',
    name: 'Spotify',
    logo: 'https://logo.clearbit.com/spotify.com',
    avgPriceMin: 24,
    avgPriceMax: 41,
    cancelUrl: 'https://www.spotify.com/br/account/subscription/'
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    logo: 'https://logo.clearbit.com/youtube.com',
    avgPriceMin: 20,
    avgPriceMax: 35,
    cancelUrl: 'https://www.youtube.com/paid_memberships'
  },
  {
    id: 'deezer',
    name: 'Deezer',
    logo: 'https://logo.clearbit.com/deezer.com',
    avgPriceMin: 25,
    avgPriceMax: 40
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: 'https://logo.clearbit.com/music.apple.com',
    avgPriceMin: 22,
    avgPriceMax: 43,
    cancelUrl: 'https://support.apple.com/pt-br/HT204939'
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    logo: 'https://logo.clearbit.com/crunchyroll.com',
    avgPriceMin: 20,
    avgPriceMax: 35
  }
]

export const utilitariosServices: Service[] = [
  {
    id: 'icloud',
    name: 'iCloud',
    logo: 'https://logo.clearbit.com/icloud.com',
    avgPriceMin: 5,
    avgPriceMax: 50
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    logo: 'https://logo.clearbit.com/google.com',
    avgPriceMin: 8,
    avgPriceMax: 60
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    logo: 'https://logo.clearbit.com/microsoft.com',
    avgPriceMin: 30,
    avgPriceMax: 100
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    logo: 'https://logo.clearbit.com/dropbox.com',
    avgPriceMin: 50,
    avgPriceMax: 150
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    logo: 'https://logo.clearbit.com/nordvpn.com',
    avgPriceMin: 20,
    avgPriceMax: 40
  }
]

export const produtividadeServices: Service[] = [
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    logo: 'https://logo.clearbit.com/openai.com',
    avgPriceMin: 100,
    avgPriceMax: 120,
    cancelUrl: 'https://platform.openai.com/account/billing/overview'
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    logo: 'https://logo.clearbit.com/canva.com',
    avgPriceMin: 40,
    avgPriceMax: 80
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: 'https://logo.clearbit.com/notion.so',
    avgPriceMin: 30,
    avgPriceMax: 60
  },
  {
    id: 'adobe-cc',
    name: 'Adobe Creative Cloud',
    logo: 'https://logo.clearbit.com/adobe.com',
    avgPriceMin: 150,
    avgPriceMax: 300
  },
  {
    id: 'linkedin-premium',
    name: 'LinkedIn Premium',
    logo: 'https://logo.clearbit.com/linkedin.com',
    avgPriceMin: 120,
    avgPriceMax: 250
  }
]

// ... Continue para todas as categorias restantes seguindo o mesmo padrão
typescript// data/categories.ts
import type { Category } from '@/types'
import {
  streamingServices,
  utilitariosServices,
  produtividadeServices,
  // ... outros imports
} from './services'

export const categories: Category[] = [
  {
    id: 'streaming',
    name: 'Streaming',
    icon: '📺',
    services: streamingServices,
    isSubscription: true
  },
  {
    id: 'utilitarios',
    name: 'Utilitários',
    icon: '🔧',
    services: utilitariosServices,
    isSubscription: true
  },
  {
    id: 'produtividade',
    name: 'Produtividade',
    icon: '💼',
    services: produtividadeServices,
    isSubscription: true
  },
  // ... restante das categorias
]

🎯 ZUSTAND STORE
typescript// store/diagnosticStore.ts
import { create } from 'zustand'
import type { ServiceInput, Category, DiagnosticResult } from '@/types'

interface DiagnosticStore {
  // Estado
  currentCategoryIndex: number
  selectedServices: Record<string, string[]> // categoryId -> serviceIds[]
  serviceInputs: ServiceInput[]
  result: DiagnosticResult | null
  email: string

  // Actions
  setEmail: (email: string) => void
  selectService: (categoryId: string, serviceId: string) => void
  deselectService: (categoryId: string, serviceId: string) => void
  addServiceInput: (input: ServiceInput) => void
  updateServiceInput: (serviceId: string, field: keyof ServiceInput, value: any) => void
  nextCategory: () => void
  prevCategory: () => void
  setResult: (result: DiagnosticResult) => void
  reset: () => void
}

export const useDiagnosticStore = create<DiagnosticStore>((set) => ({
  currentCategoryIndex: 0,
  selectedServices: {},
  serviceInputs: [],
  result: null,
  email: '',

  setEmail: (email) => set({ email }),

  selectService: (categoryId, serviceId) =>
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [categoryId]: [...(state.selectedServices[categoryId] || []), serviceId]
      }
    })),

  deselectService: (categoryId, serviceId) =>
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [categoryId]: state.selectedServices[categoryId]?.filter(id => id !== serviceId) || []
      }
    })),

  addServiceInput: (input) =>
    set((state) => ({
      serviceInputs: [...state.serviceInputs, input]
    })),

  updateServiceInput: (serviceId, field, value) =>
    set((state) => ({
      serviceInputs: state.serviceInputs.map(input =>
        input.serviceId === serviceId
          ? { ...input, [field]: value }
          : input
      )
    })),

  nextCategory: () =>
    set((state) => ({
      currentCategoryIndex: state.currentCategoryIndex + 1
    })),

  prevCategory: () =>
    set((state) => ({
      currentCategoryIndex: Math.max(0, state.currentCategoryIndex - 1)
    })),

  setResult: (result) => set({ result }),

  reset: () =>
    set({
      currentCategoryIndex: 0,
      selectedServices: {},
      serviceInputs: [],
      result: null
    })
}))

🚀 SETUP E DEPLOY
1. Inicializar projeto:
bashnpm create vite@latest diagnostico-financeiro -- --template react-ts
cd diagnostico-financeiro
npm install

# Dependências
npm install @supabase/supabase-js zustand react-router-dom jspdf
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input radio-group progress dialog dropdown-menu
2. Configurar Supabase:
bash# Criar projeto no Supabase
# Copiar URL e anon key

# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
3. Deploy:
bash# Vercel
npm install -g vercel
vercel --prod

# Configurar variáveis de ambiente no Vercel Dashboard

✅ CHECKLIST DE IMPLEMENTAÇÃO
Fase 1 - Estrutura Base

 Setup Vite + React + TypeScript
 Configurar Tailwind CSS + shadcn/ui
 Criar sistema de temas (dark/light)
 Configurar React Router
 Setup Zustand store

Fase 2 - Dados

 Criar arquivo data/services.ts com TODOS os serviços e preços reais
 Criar arquivo data/categories.ts com todas as categorias
 Implementar lógica de busca de logos (logo.clearbit.com)

Fase 3 - Integração Kiwify

 Criar Edge Function no Supabase (kiwify-webhook)
 Criar schema do banco (tabelas access_tokens e diagnostics)
 Implementar hook useAuth para validação de token
 Testar fluxo completo: pagamento → webhook → redirecionamento

Fase 4 - Landing Page

 Implementar layout minimalista (baseado na imagem 3)
 Copy impactante
 CTA que redireciona para Kiwify
 Mobile responsive

Fase 5 - Questionário

 Implementar CategorySelection (Tela A)
 Implementar ServiceInput (Tela B)
 Barra de progresso
 Navegação entre categorias
 Validações de campos

Fase 6 - Cálculos

 Implementar lib/calculations.ts
 Testar lógica de desperdício
 Testar economia potencial
 Testar ranking

Fase 7 - Relatório

 Implementar todas as seções do relatório
 Animações de fade-in
 Seção de possibilidades
 Botões de ação (cancelamento)

Fase 8 - PDF

 Implementar lib/pdf-generator.ts
 Testar geração com dados reais
 Ajustar layout do PDF

Fase 9 - Salvamento

 Salvar diagnóstico no Supabase após conclusão
 Enviar PDF por email (opcional)
 Implementar lógica de delete após 24h

Fase 10 - Testes e Deploy

 Testar fluxo completo end-to-end
 Testar em mobile
 Testar modo escuro/claro
 Deploy na Vercel
 Configurar domínio


🎨 REFERÊNCIAS VISUAIS
Layout baseado na imagem 3:

70% espaço negativo (título à esquerda)
30% conteúdo (grid de cards à direita)
Tipografia bold e grande
Cards minimalistas (cinza claro)
Rodapé preto sólido

Inspiração GrowMate (imagens 1 e 2):

Gradiente verde vibrante no hero
Cards com glass morphism sutil
Métricas em destaque
Social proof


🚨 PONTOS DE ATENÇÃO

Logos dos serviços:

Usar logo.clearbit.com como CDN principal
Fallback para placeholder se logo não existir
Cache local para performance


Validações:

Valores sempre positivos
Campos vazios = 0
Não permitir avanço sem preencher frequência


Mobile:

Grid de 4 colunas → 2 colunas em mobile
Headline grande → menor em mobile
Touch targets mínimos de 44px


Performance:

Lazy load de imagens
Code splitting por rota
Otimizar bundle size


Segurança:

Validar token no backend (não confiar no frontend)
Sanitizar inputs antes de salvar
Rate limiting na Edge Function




📝 NOTAS FINAIS
Este prompt está 100% executável e cobre TODA a aplicação. Use este documento como referência única durante o desenvolvimento.
Prioridades:

Integração Kiwify (crítico para validação de acesso)
Questionário funcional (core da experiência)
Relatório impactante (momento do "choque")
PDF de qualidade (entregável final)

Não implementar (por enquanto):

Histórico de diagnósticos
Sistema de login/senha
Envio automático de email
Analytics/tracking

Foque em entregar a V1 funcional o mais rápido possível. Iterações futuras adicionam complexidade.