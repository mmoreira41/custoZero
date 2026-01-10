# 🔒 Auditoria de Segurança e Qualidade de Código
**Projeto:** custoZero
**Data:** 2026-01-09
**Auditor:** Senior Software Architect & Security Specialist

---

## 📋 Sumário Executivo

Esta auditoria examinou **35 arquivos** do projeto custoZero através de 4 pilares:
1. **Segurança** (Input validation, XSS, injection, secrets)
2. **Arquitetura** (TypeScript safety, state management, patterns)
3. **Performance** (Bundle size, memory leaks, re-renders)
4. **UX/Acessibilidade** (Mobile responsive, WCAG, error states)

### 🎯 Resultado Geral
- 🔴 **6 issues CRÍTICOS** (segurança & breaking bugs)
- 🟡 **8 issues de ALERTA** (UX & boas práticas pré-lançamento)
- 🔵 **5 SUGESTÕES** (melhorias futuras)

---

## 🔴 ISSUES CRÍTICOS (Ação Imediata Necessária)

### 1. 🚨 Memory Leak - useCountUp Hook
**Arquivo:** `src/hooks/useCountUp.ts:20-38`
**Severidade:** CRÍTICA
**Risco:** Memory leak, performance degradation

**Problema:**
```typescript
// ❌ ATUAL - SEM CLEANUP
useEffect(() => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    // ... animation logic
    if (progress < 1) {
      window.requestAnimationFrame(step); // ⚠️ Nunca é cancelado!
    }
  };
  window.requestAnimationFrame(step);
}, [end, duration, start, decimals]);
```

Se o componente desmontar durante a animação, o `requestAnimationFrame` continua rodando indefinidamente, causando memory leak.

**Solução:**
```typescript
// ✅ CORRETO - COM CLEANUP
useEffect(() => {
  let startTimestamp: number | null = null;
  let rafId: number;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentCount = start + (end - start) * easedProgress;
    setCount(Number(currentCount.toFixed(decimals)));

    if (progress < 1) {
      rafId = window.requestAnimationFrame(step);
    }
  };

  rafId = window.requestAnimationFrame(step);

  // 🔧 CLEANUP
  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  };
}, [end, duration, start, decimals]);
```

---

### 2. 🚨 XSS Risk - Custom Service Names
**Arquivo:** `src/components/questionnaire/CategorySelection.tsx:46-52`
**Severidade:** CRÍTICA
**Risco:** Cross-Site Scripting (XSS)

**Problema:**
```typescript
// ❌ ATUAL - SEM SANITIZAÇÃO
const handleAddCustomService = () => {
  if (trimmedCustomName) {
    addCustomService(category.id, trimmedCustomName); // ⚠️ Aceita qualquer string!
    setCustomServiceName('');
    setShowAddCustom(false);
  }
};
```

Usuário pode inserir `<script>alert('XSS')</script>` ou `<img src=x onerror=alert(1)>`.

**Solução:**
```typescript
// ✅ CORRETO - COM SANITIZAÇÃO
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '') // Remove caracteres HTML perigosos
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const handleAddCustomService = () => {
  if (trimmedCustomName) {
    const safeName = sanitizeInput(trimmedCustomName);

    // Validação adicional
    if (safeName.length === 0 || safeName.length > 60) {
      // Mostrar erro ao usuário
      return;
    }

    addCustomService(category.id, safeName);
    setCustomServiceName('');
    setShowAddCustom(false);
  }
};
```

**Alternativa usando DOMPurify:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

const handleAddCustomService = () => {
  if (trimmedCustomName) {
    const safeName = DOMPurify.sanitize(trimmedCustomName, {
      ALLOWED_TAGS: [] // Remove todas as tags HTML
    });
    addCustomService(category.id, safeName);
    // ...
  }
};
```

---

### 3. 🚨 Input Validation - Monetary Values
**Arquivo:** `src/components/questionnaire/ServiceInput.tsx:25-42`
**Severidade:** CRÍTICA
**Risco:** Dados inválidos, cálculos incorretos

**Problema:**
```typescript
// ❌ ATUAL - SEM VALIDAÇÃO DE LIMITES
const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const withoutLeadingZeros = numbers.replace(/^0+/, '') || '0';
  const numberValue = parseInt(withoutLeadingZeros, 10);
  return (numberValue / 100).toFixed(2);
};
// ⚠️ Aceita valores absurdos: R$ 9.999.999.999,99
// ⚠️ Não valida valores negativos injetados via DevTools
```

**Solução:**
```typescript
// ✅ CORRETO - COM VALIDAÇÃO
const MAX_VALUE = 100000; // R$ 100.000,00 (valor máximo razoável)
const MIN_VALUE = 0.01; // R$ 0,01 (valor mínimo)

const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const withoutLeadingZeros = numbers.replace(/^0+/, '') || '0';
  let numberValue = parseInt(withoutLeadingZeros, 10) / 100;

  // 🔧 VALIDAÇÃO DE LIMITES
  if (numberValue > MAX_VALUE) {
    numberValue = MAX_VALUE;
  }
  if (numberValue < 0) {
    numberValue = 0;
  }

  return numberValue.toFixed(2);
};

const parseCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  let parsed = parseInt(numbers, 10) / 100;

  // 🔧 VALIDAÇÃO DE LIMITES
  if (isNaN(parsed) || parsed < MIN_VALUE) {
    return 0;
  }
  if (parsed > MAX_VALUE) {
    return MAX_VALUE;
  }

  return parsed;
};
```

**Adicionar feedback visual:**
```tsx
{input.monthlyValue > 10000 && (
  <p className="text-amber-600 text-xs mt-1">
    ⚠️ Valor alto detectado. Confirme se está correto.
  </p>
)}
```

---

### 4. 🚨 ID Collision Risk - Custom Services
**Arquivo:** `src/store/diagnosticStore.ts:100`
**Severidade:** ALTA
**Risco:** Serviços duplicados, dados perdidos

**Problema:**
```typescript
// ❌ ATUAL - RISCO DE COLISÃO
addCustomService: (categoryId, name) =>
  set((state) => {
    const customId = `custom-${Date.now()}`; // ⚠️ Colisão se criados no mesmo ms!
    // ...
  }),
```

Se dois serviços forem criados rapidamente (mesmo milissegundo), terão IDs idênticos.

**Solução:**
```typescript
// ✅ CORRETO - ID ÚNICO GARANTIDO
addCustomService: (categoryId, name) =>
  set((state) => {
    const customId = `custom-${crypto.randomUUID()}`; // ✅ UUID único
    const newCustomService: CustomService = {
      id: customId,
      categoryId,
      name,
    };
    // ...
  }),
```

**Alternativa com contador:**
```typescript
// ✅ TAMBÉM FUNCIONA - Contador + timestamp
let customServiceCounter = 0;

addCustomService: (categoryId, name) =>
  set((state) => {
    const customId = `custom-${Date.now()}-${++customServiceCounter}`;
    // ...
  }),
```

---

### 5. 🚨 Race Condition - Token Validation
**Arquivo:** `src/hooks/useAuth.ts:19-52`
**Severidade:** MÉDIA-ALTA
**Risco:** Estado inconsistente, navegação incorreta

**Problema:**
```typescript
// ❌ ATUAL - RACE CONDITION
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    console.error('No token provided');
    navigate('/acesso-negado'); // ⚠️ Pode navegar antes de validar!
    return;
  }

  if (skipValidation) {
    setIsValid(true); // ⚠️ Múltiplas atualizações de estado
    setIsLoading(false);
    return;
  }

  validateToken(token); // ⚠️ Async sem await
}, [navigate]); // ⚠️ navigate não deveria ser dependency
```

**Solução:**
```typescript
// ✅ CORRETO - SEM RACE CONDITION
useEffect(() => {
  let cancelled = false;

  const validateAccess = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      if (!cancelled) {
        navigate('/acesso-negado');
      }
      return;
    }

    const hasSupabaseConfig =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY;

    const isDevToken = token?.startsWith('dev-') || token?.startsWith('test-');
    const skipValidation = !hasSupabaseConfig || isDevToken;

    if (skipValidation) {
      if (!cancelled) {
        setIsDevMode(true);
        setEmail('dev@example.com');
        setIsValid(true);
        setIsLoading(false);
      }
      return;
    }

    // Produção
    await validateToken(token, cancelled);
  };

  validateAccess();

  return () => {
    cancelled = true;
  };
}, []); // ✅ Sem dependencies desnecessárias

async function validateToken(token: string, cancelled: boolean) {
  try {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cancelled) return; // ✅ Evita updates após unmount

    if (error || !data) {
      navigate('/acesso-negado');
      return;
    }

    // Marcar como usado
    await supabase
      .from('access_tokens')
      .update({ used: true })
      .eq('token', token);

    if (!cancelled) {
      setEmail(data.email);
      setIsValid(true);
    }
  } catch (err) {
    if (!cancelled) {
      navigate('/acesso-negado');
    }
  } finally {
    if (!cancelled) {
      setIsLoading(false);
    }
  }
}
```

---

### 6. 🚨 Validation Bug - "Continuar" Button
**Arquivo:** `src/components/questionnaire/ServiceInput.tsx:113-137`
**Severidade:** ALTA
**Risco:** UX quebrada, usuários bloqueados

**Problema:**
```typescript
// ❌ ATUAL - VALIDAÇÃO PODE FALHAR
const allFilled = serviceIds.every((id) => {
  const input = inputs[id];
  const isValid = (
    input &&
    input.monthlyValue !== undefined &&
    input.monthlyValue > 0 &&
    input.frequency !== undefined
  );
  // ⚠️ Problema: inputs[id] pode ser undefined mesmo com valores preenchidos
  // ⚠️ Estado pode estar desatualizado devido a batching do React
  return isValid;
});
```

**Causa Raiz:**
O estado `inputs` é atualizado através de `setInputs`, mas a validação roda no mesmo render. React pode fazer batching de updates, causando leitura de estado stale.

**Solução:**
```typescript
// ✅ CORRETO - VALIDAÇÃO ROBUSTA
const allFilled = useMemo(() => {
  return serviceIds.every((id) => {
    const input = inputs[id];

    // Log de debug (remover após fix)
    console.log('Validating service:', id, {
      exists: !!input,
      monthlyValue: input?.monthlyValue,
      frequency: input?.frequency,
    });

    if (!input) {
      return false;
    }

    const hasValue =
      typeof input.monthlyValue === 'number' &&
      !isNaN(input.monthlyValue) &&
      input.monthlyValue > 0;

    const hasFrequency =
      input.frequency !== undefined &&
      input.frequency !== null &&
      ['nunca', 'raramente', 'as-vezes', 'sempre'].includes(input.frequency);

    return hasValue && hasFrequency;
  });
}, [serviceIds, inputs]); // ✅ useMemo para memoização

// Debug: Mostrar estado no console
useEffect(() => {
  console.log('🔍 Validation state:', {
    allFilled,
    serviceIds,
    inputs: Object.entries(inputs).map(([id, input]) => ({
      id,
      monthlyValue: input.monthlyValue,
      frequency: input.frequency,
    })),
  });
}, [allFilled, serviceIds, inputs]);
```

**Garantir inicialização correta:**
```typescript
// No início do componente
useEffect(() => {
  // Garantir que todos os serviceIds têm entrada no estado
  setInputs((prev) => {
    const updated = { ...prev };
    serviceIds.forEach((id) => {
      if (!updated[id]) {
        updated[id] = {
          serviceId: id,
          monthlyValue: 0,
          frequency: undefined,
        };
      }
    });
    return updated;
  });
}, [serviceIds]);
```

---

## 🟡 ISSUES DE ALERTA (Corrigir Antes do Lançamento)

### 7. ⚠️ No Error Boundaries
**Arquivo:** `src/App.tsx`
**Severidade:** MÉDIA
**Risco:** App crash completo em caso de erro

**Problema:**
Nenhum Error Boundary implementado. Qualquer erro não tratado crasheia o app inteiro.

**Solução:**
```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Enviar para serviço de logging (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-rose-600 mb-4">
              Algo deu errado
            </h1>
            <p className="text-slate-600 mb-6">
              Desculpe, ocorreu um erro inesperado.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```tsx
// src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/diagnostico"
            element={
              <ErrorBoundary fallback={<div>Erro no questionário</div>}>
                <Questionnaire />
              </ErrorBoundary>
            }
          />
          <Route path="/relatorio" element={<Report />} />
          <Route path="/acesso-negado" element={<AccessDenied />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

### 8. ⚠️ Console.log em Produção
**Arquivos:** 4 arquivos com console statements
**Severidade:** BAIXA-MÉDIA
**Risco:** Exposição de dados, performance

**Arquivos afetados:**
- `src/components/questionnaire/ServiceInput.tsx` (linhas 122-144, 180)
- `src/pages/Questionnaire.tsx` (linhas 156, 161)
- `src/hooks/useAuth.ts` (linhas 33, 40-42, 68, 80, 89)
- `src/lib/supabase.ts` (linhas 11-12)

**Solução:**

Criar um logger condicional:
```typescript
// src/lib/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args); // Sempre loga erros
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};
```

Substituir todos os `console.log` por `logger.log`.

**Ou remover completamente:**
```bash
# Script para remover console.logs antes do build
npm install --save-dev terser-webpack-plugin

# vite.config.ts
export default defineConfig({
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

---

### 9. ⚠️ Hardcoded Magic Numbers
**Arquivos:** `src/pages/Report.tsx`, `src/data/constants.ts`
**Severidade:** BAIXA
**Risco:** Manutenibilidade, clareza

**Problemas:**
```typescript
// Report.tsx:43
const monthsOfBills = Math.floor(result.wasteYearly / 300); // ❌ 300?

// Report.tsx:42
const investmentReturn = result.wasteYearly + (result.wasteYearly * 0.11); // ❌ 0.11?
```

**Solução:**
```typescript
// src/data/constants.ts
export const FINANCIAL_CONSTANTS = {
  AVERAGE_MONTHLY_BILL: 300, // R$ média de conta de luz/água
  SELIC_ANNUAL_RATE: 0.11, // 11% ao ano (atualizar periodicamente)
  CDI_ANNUAL_RATE: 0.10, // 10% ao ano
} as const;

export const VALIDATION_LIMITS = {
  MAX_SERVICE_VALUE: 100000, // R$ 100.000,00
  MIN_SERVICE_VALUE: 0.01, // R$ 0,01
  MAX_CUSTOM_NAME_LENGTH: 60,
} as const;
```

```typescript
// Report.tsx
import { FINANCIAL_CONSTANTS } from '@/data/constants';

const monthsOfBills = Math.floor(
  result.wasteYearly / FINANCIAL_CONSTANTS.AVERAGE_MONTHLY_BILL
);
const investmentReturn =
  result.wasteYearly * (1 + FINANCIAL_CONSTANTS.SELIC_ANNUAL_RATE);
```

---

### 10. ⚠️ Missing Loading/Error States - Supabase
**Arquivo:** `src/pages/Questionnaire.tsx:149-162`
**Severidade:** MÉDIA
**Risco:** UX ruim, usuário não sabe se salvou

**Problema:**
```typescript
// ❌ ATUAL - FALHA SILENCIOSA
try {
  await supabase.from('diagnostics').insert({
    email: result.email,
    data: result,
  });
  console.log('✅ Diagnóstico salvo no Supabase');
} catch (error) {
  console.error('❌ Error saving diagnostic:', error);
  // ⚠️ Usuário não é notificado!
}
```

**Solução:**
```typescript
// ✅ CORRETO - COM FEEDBACK
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

const handleFinishQuestionnaire = async () => {
  setIsCalculating(true);
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allInputs = useDiagnosticStore.getState().serviceInputs;
  const customServices = useDiagnosticStore.getState().customServices;
  const result = calculateDiagnostic(allInputs, email, customServices);

  setResult(result);

  if (!isDevMode) {
    setSaveStatus('saving');
    try {
      const { error } = await supabase.from('diagnostics').insert({
        email: result.email,
        data: result,
      });

      if (error) throw error;

      setSaveStatus('saved');
    } catch (error) {
      console.error('❌ Error saving diagnostic:', error);
      setSaveStatus('error');

      // Mostrar toast ou notificação
      alert('Erro ao salvar diagnóstico. Você ainda pode visualizar os resultados.');
    }
  }
};

// No JSX, mostrar feedback
{saveStatus === 'saving' && (
  <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
    Salvando diagnóstico...
  </div>
)}
{saveStatus === 'error' && (
  <div className="fixed bottom-4 right-4 bg-rose-600 text-white px-4 py-2 rounded-lg">
    Erro ao salvar. Resultados mantidos localmente.
  </div>
)}
```

---

### 11. ⚠️ Missing Accessibility - ARIA Labels
**Arquivo:** Múltiplos componentes
**Severidade:** MÉDIA
**Risco:** Inacessível para screen readers

**Problemas:**
1. Botões sem `aria-label` quando apenas ícone
2. Inputs sem `aria-describedby` para erros
3. Modais sem `role="dialog"` e `aria-modal`
4. Navegação de categorias sem `aria-current`

**Soluções:**

```tsx
// CategorySelection.tsx - Badges de planos
<button
  type="button"
  onClick={() => handlePlanSelect(serviceId, plan.price)}
  aria-label={`Selecionar plano ${plan.label} por R$ ${plan.price}`}
  className="..."
>
  {plan.label} · R$ {plan.price}
</button>

// ServiceInput.tsx - Input de valor
<Input
  type="text"
  inputMode="numeric"
  placeholder={placeholderValue}
  value={displayValues[serviceId] ?? '0,00'}
  onChange={(e) => handleMoneyInputChange(serviceId, e.target.value)}
  aria-label={`Valor mensal para ${serviceName}`}
  aria-describedby={`${serviceId}-helper`}
  aria-invalid={input.monthlyValue === 0}
  className="..."
/>
<p id={`${serviceId}-helper`} className="sr-only">
  Digite o valor mensal que você paga por este serviço
</p>

// CategorySelection.tsx - Modal de custom service
{showAddCustom && (
  <Card
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-custom-title"
    className="..."
  >
    <h3 id="add-custom-title" className="...">
      Adicionar serviço
    </h3>
    {/* ... */}
  </Card>
)}

// CategoryHeader.tsx - Navegação de categorias
<button
  onClick={() => onCategoryClick?.(index)}
  aria-label={`Ir para categoria ${cat.name}`}
  aria-current={index === currentCategoryIndex ? 'step' : undefined}
  className="..."
>
  {cat.icon}
</button>
```

---

### 12. ⚠️ Native confirm() Dialog
**Arquivo:** `src/pages/Report.tsx:30-34`
**Severidade:** BAIXA
**Risco:** UX ruim, não customizável

**Problema:**
```typescript
// ❌ ATUAL - confirm() nativo
const handleRestart = () => {
  if (confirm('Tem certeza que deseja fazer um novo diagnóstico?')) {
    reset();
    navigate('/');
  }
};
```

**Solução:**
Criar componente de confirmação customizado:

```tsx
// src/components/ConfirmDialog.tsx
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  const colors = {
    danger: 'bg-rose-600 hover:bg-rose-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-600">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button className={colors[variant]} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

```tsx
// Report.tsx
const [showConfirm, setShowConfirm] = useState(false);

const handleRestart = () => {
  setShowConfirm(true);
};

const handleConfirmRestart = () => {
  reset();
  navigate('/');
};

// No JSX
{showConfirm && (
  <ConfirmDialog
    title="Refazer Diagnóstico?"
    message="Tem certeza que deseja fazer um novo diagnóstico? Seus dados atuais serão perdidos."
    confirmText="Sim, refazer"
    cancelText="Cancelar"
    variant="warning"
    onConfirm={handleConfirmRestart}
    onCancel={() => setShowConfirm(false)}
  />
)}
```

---

### 13. ⚠️ Mobile Responsiveness - Small Screens
**Arquivo:** Múltiplos componentes
**Severidade:** BAIXA-MÉDIA
**Risco:** UX ruim em dispositivos pequenos

**Problemas:**
1. Grid de 2 colunas em mobile pode ser apertado (CategorySelection.tsx)
2. Bento grid pode quebrar abaixo de 375px (Report.tsx)
3. Sticky footer pode sobrepor conteúdo

**Soluções:**

```tsx
// CategorySelection.tsx - Grid mais responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Ao invés de: grid-cols-2 md:grid-cols-3 */}
</div>

// Report.tsx - Bento grid mais seguro
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
  <motion.div className="sm:col-span-2 md:row-span-2">
    {/* Hero card */}
  </motion.div>
  <motion.div className="sm:col-span-1">
    {/* Investment card */}
  </motion.div>
  <motion.div className="sm:col-span-1">
    {/* Emergency card */}
  </motion.div>
</div>

// Adicionar padding bottom para sticky footer
<div className="space-y-4 pb-32 md:pb-28">
  {/* Conteúdo */}
</div>
```

**Testar em:**
- iPhone SE (375x667)
- Galaxy Fold (280x653 fechado)
- Modo landscape mobile

---

### 14. ⚠️ Color Contrast - WCAG Compliance
**Arquivo:** Múltiplos componentes
**Severidade:** MÉDIA
**Risco:** Inacessível para baixa visão

**Verificar:**
```tsx
// Possíveis problemas de contraste:
text-slate-500 on white // Ratio: 4.54:1 ✅ AA (texto pequeno ⚠️)
text-slate-400 on white // Ratio: 2.84:1 ❌ Falha AA
text-emerald-600 on emerald-50 // Verificar
text-rose-600 on rose-50 // Verificar
```

**Ferramenta de teste:**
```bash
# Instalar extensão no Chrome/Firefox
# "WCAG Color contrast checker"

# Ou usar online
https://webaim.org/resources/contrastchecker/
```

**Ajustes necessários:**
```tsx
// ❌ ANTES
<p className="text-sm text-slate-400">
  Serviço personalizado
</p>

// ✅ DEPOIS - AA compliant (4.5:1 para texto pequeno)
<p className="text-sm text-slate-600 dark:text-slate-300">
  Serviço personalizado
</p>
```

---

## 🔵 SUGESTÕES (Melhorias Futuras)

### 15. 💡 Bundle Size Optimization
**Impacto:** Performance, load time
**Prioridade:** MÉDIA

**Análise atual:**
```bash
# Rodar build analyzer
npm install --save-dev rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});
```

**Principais pacotes pesados:**
- `jspdf` + `jspdf-autotable`: ~500KB
- `framer-motion`: ~150KB
- `@supabase/supabase-js`: ~100KB

**Otimizações:**

```tsx
// 1. Lazy load PDF generation
const generatePDF = lazy(() => import('@/lib/pdf-generator'));

const handleDownloadPDF = async () => {
  const { generatePDF } = await import('@/lib/pdf-generator');
  generatePDF(result);
};

// 2. Code splitting por rota
const Report = lazy(() => import('./pages/Report'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));

// App.tsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/relatorio" element={<Report />} />
    <Route path="/diagnostico" element={<Questionnaire />} />
  </Routes>
</Suspense>

// 3. Considerar alternativas mais leves
// motion-one (30KB) ao invés de framer-motion (150KB)
import { animate } from 'motion';
```

---

### 16. 💡 State Management Optimization
**Impacto:** Performance, re-renders
**Prioridade:** BAIXA

**Problema:**
Zustand store único causa re-renders desnecessários.

**Solução:**
```typescript
// Usar selectors para evitar re-renders
// ❌ ANTES - Re-render em qualquer mudança
const { result, email, selectedServices } = useDiagnosticStore();

// ✅ DEPOIS - Re-render apenas se result mudar
const result = useDiagnosticStore((state) => state.result);
const email = useDiagnosticStore((state) => state.email);

// Ou dividir em múltiplos stores
// src/store/questionnaireStore.ts
export const useQuestionnaireStore = create<QuestionnaireStore>((set) => ({
  currentCategoryIndex: 0,
  selectedServices: {},
  customServices: [],
  // ...
}));

// src/store/resultStore.ts
export const useResultStore = create<ResultStore>((set) => ({
  result: null,
  email: '',
  // ...
}));
```

**Medir impacto:**
```tsx
// Instalar React DevTools Profiler
// Medir re-renders antes/depois
import { Profiler } from 'react';

<Profiler id="ServiceInput" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) rendered in ${actualDuration}ms`);
}}>
  <ServiceInput {...props} />
</Profiler>
```

---

### 17. 💡 Duplicate Code - Image Error Handling
**Impacto:** Manutenibilidade
**Prioridade:** BAIXA

**Problema:**
Lógica de fallback de imagem duplicada em 3 lugares:
- ServiceInput.tsx (linhas 214-226)
- CategorySelection.tsx (linhas 215-235)
- Report.tsx (linhas 293-305)

**Solução:**
```tsx
// src/hooks/useImageFallback.ts
import { useState, SyntheticEvent } from 'react';
import { buildAlternateLogoUrl, buildFallbackLogo } from '@/lib/utils';

export function useImageFallback(initialSrc: string, fallbackName: string) {
  const [src, setSrc] = useState(initialSrc);
  const [forceFallback, setForceFallback] = useState(!initialSrc);

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    // Try alternate URL first
    if (!img.dataset.altTried) {
      img.dataset.altTried = 'true';
      const altUrl = buildAlternateLogoUrl(initialSrc);
      if (altUrl) {
        setSrc(altUrl);
        return;
      }
    }

    // Fallback to generated logo
    const fallback = buildFallbackLogo(fallbackName);
    if (fallback && fallback !== src) {
      img.onerror = null;
      setSrc(fallback);
      return;
    }

    setForceFallback(true);
  };

  return { src, forceFallback, handleError };
}

// Uso:
const { src, forceFallback, handleError } = useImageFallback(
  service.logo,
  service.name
);

<img
  src={src}
  alt={service.name}
  onError={handleError}
  className="..."
/>
```

---

### 18. 💡 TypeScript - Stricter Types
**Impacto:** Type safety
**Prioridade:** BAIXA

**Melhorias possíveis:**

```typescript
// 1. Usar const assertions mais
export const FREQUENCY_OPTIONS = [
  { value: 'nunca', label: 'Nunca', icon: XCircle, color: 'rose' },
  // ...
] as const satisfies ReadonlyArray<{
  value: UsageFrequency;
  label: string;
  icon: LucideIcon;
  color: string;
}>;

// 2. Branded types para IDs
type ServiceId = string & { readonly __brand: 'ServiceId' };
type CategoryId = string & { readonly __brand: 'CategoryId' };

function createServiceId(id: string): ServiceId {
  return id as ServiceId;
}

// 3. Discriminated unions para estados
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DiagnosticResult }
  | { status: 'error'; error: Error };

// 4. Utility types para partial updates
type ServiceInputUpdate = Partial<Pick<ServiceInput, 'monthlyValue' | 'frequency'>>;
```

---

### 19. 💡 Performance Monitoring
**Impacto:** Observabilidade
**Prioridade:** BAIXA

**Implementar:**

```typescript
// src/lib/analytics.ts
export const analytics = {
  trackPageView: (path: string) => {
    // Google Analytics, Plausible, etc
  },

  trackEvent: (eventName: string, properties?: Record<string, unknown>) => {
    // Track custom events
  },

  trackError: (error: Error, context?: Record<string, unknown>) => {
    // Sentry, LogRocket, etc
    console.error('Error tracked:', error, context);
  },

  trackPerformance: (metricName: string, value: number) => {
    // Web Vitals, custom metrics
    if (import.meta.env.PROD) {
      // Send to analytics
    }
  },
};

// Uso:
useEffect(() => {
  analytics.trackPageView(window.location.pathname);
}, []);

// Medir tempo de cálculo
const start = performance.now();
const result = calculateDiagnostic(/* ... */);
const duration = performance.now() - start;
analytics.trackPerformance('diagnostic_calculation_time', duration);
```

---

## 📊 Priorização de Ações

### 🚨 URGENTE (Corrigir HOJE)
1. ✅ Memory leak em useCountUp (Issue #1)
2. ✅ XSS risk em custom service names (Issue #2)
3. ✅ Validation bug - botão Continuar (Issue #6)

### ⏰ ESTA SEMANA
4. ✅ Input validation - monetary values (Issue #3)
5. ✅ ID collision risk (Issue #4)
6. ✅ Error boundaries (Issue #7)
7. ✅ Race condition - token validation (Issue #5)

### 📅 ANTES DO LANÇAMENTO
8. ✅ Remover console.log (Issue #8)
9. ✅ Loading/error states Supabase (Issue #10)
10. ✅ Accessibility - ARIA labels (Issue #11)
11. ✅ Mobile responsiveness (Issue #13)
12. ✅ Color contrast WCAG (Issue #14)

### 🔮 BACKLOG (Pós-lançamento)
13. ✅ Bundle size optimization (Issue #15)
14. ✅ State management optimization (Issue #16)
15. ✅ Hardcoded magic numbers (Issue #9)
16. ✅ Custom confirm dialog (Issue #12)
17. ✅ Duplicate code extraction (Issue #17)
18. ✅ TypeScript stricter types (Issue #18)
19. ✅ Performance monitoring (Issue #19)

---

## 🎯 Checklist de Implementação

### Segurança
- [ ] Fix memory leak em useCountUp
- [ ] Implementar sanitização de inputs
- [ ] Validar limites de valores monetários
- [ ] Fix race condition em useAuth
- [ ] Usar crypto.randomUUID() para IDs

### Qualidade de Código
- [ ] Adicionar Error Boundaries
- [ ] Remover/condicionalizar console.logs
- [ ] Extrair magic numbers para constantes
- [ ] Implementar loading/error states
- [ ] Fix validação de formulário

### Acessibilidade
- [ ] Adicionar ARIA labels
- [ ] Testar com screen reader
- [ ] Verificar contraste de cores (WCAG AA)
- [ ] Adicionar focus management
- [ ] Testar navegação por teclado

### UX/Mobile
- [ ] Testar em iPhone SE (375px)
- [ ] Testar em Galaxy Fold (280px)
- [ ] Verificar sticky footers
- [ ] Trocar confirm() por modal customizado
- [ ] Adicionar feedback de ações (toasts)

### Performance
- [ ] Lazy load jspdf
- [ ] Code splitting por rota
- [ ] Usar selectors do Zustand
- [ ] Memoizar validações pesadas
- [ ] Analisar bundle size

---

## 📝 Notas Finais

### Pontos Positivos ✅
- TypeScript bem utilizado (sem `any`)
- Zustand bem estruturado
- Componentes bem organizados
- Boa separação de concerns
- Tailwind bem configurado

### Áreas de Atenção ⚠️
- Segurança de input precisa de atenção
- Acessibilidade pode melhorar muito
- Faltam error boundaries
- Mobile pode ter problemas em telas pequenas

### Recomendações Gerais
1. **Testes:** Implementar testes unitários (Vitest) e E2E (Playwright)
2. **CI/CD:** Rodar linter + type check + build em PR
3. **Monitoring:** Adicionar Sentry ou similar em produção
4. **Analytics:** Implementar tracking de eventos
5. **SEO:** Adicionar meta tags, Open Graph, etc.

---

**Gerado em:** 2026-01-09
**Revisão:** v1.0
**Próxima auditoria:** Após implementação dos fixes críticos
