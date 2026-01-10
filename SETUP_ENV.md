# ⚙️ Configuração do Ambiente (.env)

## 🎯 Status Atual

✅ **Edge Function deployada**: `validate-token` (ACTIVE, Version 2)
✅ **RLS habilitado**: `access_tokens` e `diagnostics`
✅ **Policies criadas**: Service role + Anon controlado
✅ **Front-end atualizado**: Usando secure client

## 📋 Próximo Passo: Configurar .env

### 1. Obter Credenciais do Supabase

Acesse seu projeto:
```
https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm/settings/api
```

Você vai encontrar:

- **Project URL**: `https://vwpcomebhlvdqmhdyohm.supabase.co`
- **Anon (public) key**: `eyJhbGc...` (string longa)

### 2. Atualizar o arquivo `.env`

Edite o arquivo `.env` na raiz do projeto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://vwpcomebhlvdqmhdyohm.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

⚠️ **IMPORTANTE**: Use apenas a **ANON KEY** (pública). Nunca coloque a **SERVICE ROLE KEY** no front-end!

### 3. Testar Edge Function (Opcional)

Teste a Edge Function via terminal antes de rodar a aplicação:

```bash
# Exportar ANON_KEY temporariamente
export SUPABASE_ANON_KEY='sua-anon-key-aqui'

# Executar script de teste
./test_edge_function.sh
```

Saída esperada:
```
✅ Teste 1 PASSOU (token inválido rejeitado)
✅ Teste 3 PASSOU (request sem token rejeitado)
✅ Edge Function está funcionando!
```

### 4. Rodar Aplicação

```bash
npm run dev
```

### 5. Testar em Dev Mode

Acesse no navegador:
```
http://localhost:5173/diagnostico?token=dev-test-123
```

**Comportamento esperado**:
1. ✅ Token `dev-test-123` é detectado como dev token
2. ✅ Validação é bypassada (não chama Edge Function)
3. ✅ Email é definido como `dev@example.com`
4. ✅ Questionário é acessível

**Logs no console**:
```
🔧 DEV MODE: Dev token detected, skipping validation
✅ Token validated via Edge Function (ou fallback)
```

### 6. Testar com Token Real (Produção)

Para testar com token real, você precisa:

1. Inserir um token válido na tabela `access_tokens`:

```sql
-- Via Supabase Dashboard > SQL Editor
INSERT INTO access_tokens (email, token, expires_at, used)
VALUES (
  'seu-email@example.com',
  'token-real-uuid-aqui',  -- Use um UUID real
  NOW() + INTERVAL '7 days',
  false
);
```

2. Acessar a aplicação com esse token:

```
http://localhost:5173/diagnostico?token=token-real-uuid-aqui
```

**Comportamento esperado**:
1. ✅ Token é validado via Edge Function
2. ✅ Edge Function marca token como `used = true`
3. ✅ Email do banco é retornado
4. ✅ Questionário é acessível
5. ❌ Segunda tentativa de usar o mesmo token deve falhar (já usado)

**Logs no console**:
```
🔐 Validating token via Edge Function...
✅ Token validated via Edge Function
```

**Logs da Edge Function** (via Dashboard):
```
Token validated successfully: token-real-uuid-aqui for seu-email@example.com
```

### 7. Verificar RLS Funcionando

Abra o console do navegador (F12) e tente acessar `access_tokens` diretamente:

```javascript
// Deve FALHAR (RLS bloqueando)
const { data, error } = await supabase
  .from('access_tokens')
  .select('*');

console.log(error);
// ❌ Esperado: "new row violates row-level security policy"
```

```javascript
// Deve FUNCIONAR (via Edge Function)
const { data } = await supabase.functions.invoke('validate-token', {
  body: { token: 'dev-test-123' }
});

console.log(data);
// ✅ Esperado: { valid: false, error: "Invalid token" }
// (Token dev não existe no banco, mas Edge Function responde)
```

## 🔍 Troubleshooting

### "Failed to validate token"

**Causa**: Edge Function não está acessível ou ANON_KEY incorreta.

**Solução**:
```bash
# Verificar se função está ACTIVE
supabase functions list

# Verificar ANON_KEY no .env
```

### "Token always invalid"

**Causa**: Token não existe no banco ou já foi usado.

**Solução**:
```sql
-- Verificar se token existe
SELECT * FROM access_tokens WHERE token = 'seu-token';

-- Verificar se não foi usado
SELECT token, used, expires_at
FROM access_tokens
WHERE token = 'seu-token';
```

### "RLS policy error"

**Causa**: Front-end tentando acessar tabela bloqueada diretamente.

**Solução**: Verificar se está usando `src/lib/supabase-secure.ts` ao invés de `src/lib/supabase.ts` direto.

### Dev mode não funciona

**Causa**: `.env` está configurado quando deveria estar vazio para dev mode.

**Solução**: Para dev mode local SEM Supabase:
```bash
# Deixe .env vazio
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 🎉 Checklist Final

- [ ] `.env` atualizado com URL e ANON_KEY
- [ ] `test_edge_function.sh` executado com sucesso
- [ ] `npm run dev` rodando sem erros
- [ ] Token `dev-test-123` funcionando em dev mode
- [ ] Tentativa de acessar `access_tokens` diretamente falha (RLS bloqueando)
- [ ] Edge Function respondendo corretamente
- [ ] Logs no console mostram validação via Edge Function

## 📚 Recursos

- **Dashboard do Projeto**: https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm
- **API Settings**: https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm/settings/api
- **Edge Functions**: https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm/functions
- **Database Editor**: https://supabase.com/dashboard/project/vwpcomebhlvdqmhdyohm/editor

---

**Criado em**: 2026-01-09
**Status**: ✅ Deploy completo, aguardando configuração do .env
