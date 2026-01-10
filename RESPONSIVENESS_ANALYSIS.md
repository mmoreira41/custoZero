# 📱 Análise de Responsividade - custoZero

**Data:** 2026-01-09
**Breakpoints Críticos:**
- 📱 Galaxy Fold: 280px (fechado)
- 📱 iPhone SE: 375px
- 📱 iPhone 12/13: 390px
- 📱 Landscape mobile: 667px x 375px

---

## 🔍 Problemas Identificados

### 1. 🚨 CRÍTICO - CategorySelection Grid
**Arquivo:** `src/components/questionnaire/CategorySelection.tsx:74`
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

**Problema:**
- Grid de 2 colunas em 280px = 130px por card (muito apertado!)
- Cards de serviço têm padding 6 (24px) + avatar 80px + texto
- Total: ~130px por card, mas conteúdo precisa de ~150px

**Solução:**
```tsx
<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
```

---

### 2. 🚨 CRÍTICO - ServiceInput Cards Layout
**Arquivo:** `src/components/questionnaire/ServiceInput.tsx:204`
```tsx
<div className="flex flex-col lg:flex-row lg:items-center gap-6">
```

**Problema:**
- Gap de 24px (gap-6) muito grande em mobile
- Logo 64px-80px pode ser muito grande para 280px de largura
- Input e badges podem quebrar mal

**Solução:**
- Reduzir gap em mobile
- Logo menor em telas pequenas
- Stack vertical sempre em mobile

---

### 3. 🚨 CRÍTICO - Report Bento Grid
**Arquivo:** `src/pages/Report.tsx:124`
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
  <motion.div className="md:col-span-2 md:row-span-2">
```

**Problema:**
- Hero card ocupa 2x2 em desktop mas 1x1 em mobile
- Conteúdo interno pode ficar apertado
- Badges de alternativas podem quebrar feio

**Solução:**
- Ajustar padding interno em mobile
- Flex-wrap melhor para badges
- Min-height condicional

---

### 4. ⚠️ ALERTA - Sticky Footer Overlap
**Arquivo:** `src/components/questionnaire/ServiceInput.tsx:349`
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t p-4 shadow-lg">
```

**E também:** `src/components/questionnaire/CategorySelection.tsx:177`
```tsx
<div className="sticky bottom-0 bg-background border-t border-border shadow-lg">
```

**Problema:**
- Padding bottom de 32 (pb-32) pode não ser suficiente
- Footer pode sobrepor último card
- Em landscape mobile, footer ocupa proporção maior da tela

**Solução:**
- Aumentar pb para pb-36 ou pb-40 em mobile
- Safe area insets para iOS
- Reduzir altura do footer em mobile

---

### 5. ⚠️ ALERTA - Modal Custom Service
**Arquivo:** `src/components/questionnaire/CategorySelection.tsx:109`
```tsx
<Card className="col-span-2 md:col-span-1 p-5 border border-emerald-200 shadow-md bg-white">
```

**Problema:**
- col-span-2 significa 100% da largura em grid de 2 colunas
- Ótimo! Mas padding pode ser menor em 280px
- Botões lado a lado podem ficar apertados

**Solução:**
- Padding responsivo: p-4 sm:p-5
- Botões em coluna em telas muito pequenas

---

### 6. ⚠️ ALERTA - Tipografia Landing
**Arquivo:** `src/pages/Landing.tsx:54`
```tsx
<h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
  Você sabe quanto dinheiro perde todo mês?
</h1>
```

**Problema:**
- text-5xl (48px) pode quebrar mal em 280px
- Tracking-tight pode fazer palavras longas quebrarem
- "dinheiro" pode ficar sozinho em uma linha

**Solução:**
- Reduzir para text-4xl em telas muito pequenas
- Ajustar line-height

---

### 7. ⚠️ ALERTA - Report Cards Spacing
**Arquivo:** `src/pages/Report.tsx:260`
```tsx
<div className="flex items-center justify-between p-4 rounded-lg">
```

**Problema:**
- Botão "Cancelar Agora" some em mobile (hidden sm:flex)
- Bom! Mas pode adicionar ação alternativa
- Logo 48px + nome + valores pode ficar apertado

**Solução:**
- Já está ok, mas pode melhorar stack em 280px
- Logo menor em telas muito pequenas

---

### 8. 🔵 SUGESTÃO - Frequency Buttons
**Arquivo:** `src/components/questionnaire/ServiceInput.tsx:295`
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
```

**Problema:**
- Grid 2x2 em mobile pode deixar botões pequenos
- Texto "Raramente" pode quebrar
- Ícone + texto vertical ocupa muito espaço

**Solução:**
- Reduzir padding interno
- Font menor em mobile
- Considerar scroll horizontal como alternativa

---

### 9. 🔵 SUGESTÃO - Report Hero Animation
**Arquivo:** `src/pages/Report.tsx:88-94`
```tsx
<motion.div animate={{ scale: [1, 1.05, 1] }}>
  <p className="text-5xl md:text-7xl font-bold text-rose-600 tracking-tight">
    {formatCurrency(animatedWasteYearly)}
  </p>
</motion.div>
```

**Problema:**
- text-5xl (48px) pode ficar grande demais em 280px
- Número longo como R$ 99.999,99 pode quebrar

**Solução:**
- text-4xl em xs, text-5xl em sm+
- Considerar truncate ou scale font size

---

## 🎯 Priorização de Fixes

### 🚨 URGENTE (Podem quebrar a experiência)
1. ✅ CategorySelection Grid (1 coluna em xs)
2. ✅ ServiceInput Cards Layout
3. ✅ Report Bento Grid
4. ✅ Sticky Footer Overlap

### ⏰ IMPORTANTE (Melhoram muito a UX)
5. ✅ Modal Custom Service responsivo
6. ✅ Tipografia Landing ajustada
7. ✅ Frequency Buttons otimizados

### 🔮 POLIMENTO (Nice to have)
8. ✅ Report Cards melhorados
9. ✅ Hero Animation ajustada
10. ✅ Safe area insets iOS

---

## 📐 Novo Sistema de Breakpoints

Adicionar ao `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '375px',     // iPhone SE+
        'xxs': '320px',    // Muito pequeno
        // sm: '640px' (já existe)
        // md: '768px' (já existe)
        // lg: '1024px' (já existe)
      }
    }
  }
}
```

---

## ✅ Checklist de Testes

### Dispositivos Críticos
- [ ] iPhone SE (375x667) - Portrait
- [ ] iPhone SE (667x375) - Landscape
- [ ] Galaxy Fold (280x653) - Fechado
- [ ] Galaxy Fold (653x280) - Fechado Landscape
- [ ] iPhone 12 (390x844) - Portrait
- [ ] iPad Mini (768x1024) - Portrait

### Cenários de Teste
- [ ] Adicionar serviço personalizado com nome longo
- [ ] Preencher valor muito alto (R$ 99.999,99)
- [ ] Selecionar todos os 4 botões de frequência
- [ ] Scroll até o final da lista de serviços
- [ ] Verificar footer não sobrepõe conteúdo
- [ ] Abrir modal custom service
- [ ] Visualizar relatório com muitos serviços
- [ ] Testar todas as páginas em landscape

### Navegadores
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Chrome DevTools (responsividade)
- [ ] Firefox DevTools

---

**Próximo passo:** Implementar os fixes na ordem de prioridade.
