# ✅ Erro React Corrigido: setState Durante Render

## 🐛 Erro Original

```
Cannot update a component (`Questionnaire`) while rendering a different component (`Questionnaire`).
To locate the bad setState() call inside `Questionnaire`, follow the stack trace.
```

**Causa**: Código estava chamando `setState()` diretamente durante o render do componente.

## ❌ Código Problemático (ANTES)

**Questionnaire.tsx:74-77**
```typescript
// Se não autenticado, o hook já redirecionou
if (!isValid) {
  return null;
}

// ❌ PROBLEMA: setState durante render!
if (email && !useDiagnosticStore.getState().email) {
  setEmail(email); // 🚨 Isso causa o erro!
}
```

**Por que é um problema?**
- React está renderizando o componente `Questionnaire`
- Durante o render, você chama `setEmail()` (que atualiza o Zustand store)
- Isso dispara uma re-renderização
- React detecta update de estado durante render → ERRO

## ✅ Código Correto (AGORA)

**Questionnaire.tsx:57-62**
```typescript
// ✅ SOLUÇÃO: useEffect (assíncrono, fora do render)
useEffect(() => {
  if (email && !useDiagnosticStore.getState().email) {
    setEmail(email);
  }
}, [email, setEmail]);
```

**Por que funciona?**
- `useEffect` executa **DEPOIS** do render
- Não bloqueia o ciclo de renderização
- Update de estado acontece de forma assíncrona
- React não detecta conflito

## 📊 Comparação

| Aspecto | setState durante render | useEffect |
|---------|------------------------|-----------|
| Timing | Síncrono (durante render) | Assíncrono (após render) |
| Erro React | ✅ Sim | ❌ Não |
| Causa re-render | Durante render atual | Próximo ciclo |
| Performance | Ruim (pode causar loops) | Boa (controlada) |

## 🧪 Como Testar

1. **Limpar cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
2. Acessar: `http://localhost:5173/diagnostico?token=dev-test-123`
3. Abrir console (F12)

**Console ANTES (com erro)**:
```
🔧 DEV MODE: Validação de token desabilitada
💡 Token: dev-test-123
📧 Email: dev@example.com (mock)
🔧 DEV MODE: Validação de token desabilitada
💡 Token: dev-test-123
📧 Email: dev@example.com (mock)
❌ Cannot update a component (`Questionnaire`) while rendering...
```

**Console AGORA (sem erro)**:
```
🔧 DEV MODE: Validação de token desabilitada
💡 Token: dev-test-123
📧 Email: dev@example.com (mock)
✅ (sem erros!)
```

## 🔄 Fluxo de Execução

### ANTES (Problemático)
```
1. React renderiza Questionnaire
2. Durante render, lê: if (!isValid) return null
3. Durante render, executa: setEmail(email) 🚨
4. Zustand store atualiza
5. Store dispara re-render
6. React: "Erro! Você não pode fazer isso!"
```

### AGORA (Correto)
```
1. React renderiza Questionnaire
2. Durante render, registra useEffect
3. Render completa ✅
4. React executa useEffect (após render)
5. useEffect chama: setEmail(email)
6. Zustand store atualiza
7. Store dispara re-render (próximo ciclo)
8. React: "Tudo certo! ✅"
```

## 📋 Mudanças no Código

### Arquivo: `src/pages/Questionnaire.tsx`

**Linha 2**: Adicionado `useEffect` ao import
```typescript
// ANTES
import { useState } from 'react';

// AGORA
import { useState, useEffect } from 'react';
```

**Linhas 57-62**: Movido setState para useEffect
```typescript
// ANTES (linhas 74-77)
if (email && !useDiagnosticStore.getState().email) {
  setEmail(email);
}

// AGORA (linhas 57-62)
useEffect(() => {
  if (email && !useDiagnosticStore.getState().email) {
    setEmail(email);
  }
}, [email, setEmail]);
```

## ⚠️ Outros Lugares Onde Isso Pode Acontecer

**Padrão RUIM (evite)**:
```typescript
function Component({ user }) {
  // ❌ setState durante render
  if (user) {
    setCurrentUser(user);
  }

  return <div>...</div>;
}
```

**Padrão BOM (use)**:
```typescript
function Component({ user }) {
  // ✅ setState no useEffect
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  return <div>...</div>;
}
```

## 🎓 Regra de Ouro do React

> **Nunca chame setState ou dispatch durante o render.**
>
> Use sempre:
> - `useEffect` para side effects
> - Event handlers (onClick, onChange, etc.)
> - Callbacks assíncronos

## 📚 Referências

- [React Docs: You should not call setState during render](https://react.dev/link/setstate-in-render)
- [React Hooks: useEffect](https://react.dev/reference/react/useEffect)
- [Understanding React Render Phase](https://react.dev/learn/render-and-commit)

---

**Corrigido em**: 2026-01-09
**Arquivo**: `src/pages/Questionnaire.tsx`
**Status**: ✅ Erro resolvido, aplicação funcionando
