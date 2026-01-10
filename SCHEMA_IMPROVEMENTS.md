# 🔒 Melhorias do Schema do Banco de Dados

Este documento explica todas as melhorias implementadas no schema do Supabase baseado em best practices de segurança, performance e conformidade com LGPD.

## 📋 Sumário

- [Problemas Corrigidos](#problemas-corrigidos)
- [Melhorias de Segurança](#melhorias-de-segurança)
- [Melhorias de Performance](#melhorias-de-performance)
- [Compliance LGPD](#compliance-lgpd)
- [Monitoramento](#monitoramento)

---

## 🚨 Problemas Corrigidos

### 1. RLS (Row Level Security) Desabilitado

**Problema Anterior:**
```sql
-- ❌ PROBLEMA: Bloqueava acesso legítimo
CREATE POLICY "Allow read own tokens" ON access_tokens
  FOR SELECT
  USING (used = false AND expires_at > NOW());
```

**Por que era um problema:**
- Sistema não usa autenticação Supabase (`auth.jwt()`)
- Edge Function usa `service_role` key que ignora RLS
- Policies bloqueavam acesso desnecessariamente

**Solução Implementada:**
```sql
-- ✅ SOLUÇÃO: Desabilitar RLS
ALTER TABLE access_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics DISABLE ROW LEVEL SECURITY;
```

**Justificativa:**
- Acesso controlado via `service_role` key na Edge Function
- Frontend nunca acessa diretamente estas tabelas
- Segurança garantida pela arquitetura, não por RLS

---

## 🔒 Melhorias de Segurança

### 1. Validação de Email

**Implementação:**
```sql
CONSTRAINT valid_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

**Benefícios:**
- Previne inserção de emails inválidos
- Validação no nível do banco (não confia apenas no frontend)
- Regex padrão RFC 5322 simplificado

### 2. Validação de Data de Expiração

**Implementação:**
```sql
CONSTRAINT expires_in_future
  CHECK (expires_at > created_at)
```

**Benefícios:**
- Impossível criar token já expirado
- Previne bugs de lógica de negócio

### 3. Validação de Dados JSON

**Implementação:**
```sql
CONSTRAINT data_not_empty
  CHECK (jsonb_typeof(data) = 'object' AND data != '{}'::jsonb)
```

**Benefícios:**
- Garante que diagnósticos sempre têm dados
- Previne inserção de objetos vazios

---

## ⚡ Melhorias de Performance

### 1. Índices Adicionais

**Novo índice parcial:**
```sql
CREATE INDEX idx_access_tokens_used
ON access_tokens(used)
WHERE NOT used;
```

**Benefícios:**
- Índice menor (apenas tokens não usados)
- Queries de validação mais rápidas
- Menos espaço em disco

**Índice ordenado:**
```sql
CREATE INDEX idx_diagnostics_created_at
ON diagnostics(created_at DESC);
```

**Benefícios:**
- Queries de "diagnósticos recentes" instantâneas
- Suporta paginação eficiente

### 2. Trigger de Auto-Expiração

**Implementação:**
```sql
CREATE TRIGGER trg_set_token_expiration
  BEFORE INSERT ON access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_token_expiration();
```

**Benefícios:**
- Edge Function não precisa calcular `expires_at`
- Consistência: sempre 24h após `created_at`
- Menos código na aplicação

---

## 📊 Compliance LGPD

### 1. Deleção Automática de Dados

**Função Melhorada:**
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS TABLE (
  tokens_deleted INTEGER,
  diagnostics_deleted INTEGER
)
```

**O que deleta:**
- Tokens expirados há **mais de 7 dias**
- Diagnósticos com **mais de 30 dias**

**Justificativa LGPD:**
- **Art. 15**: Direito ao esquecimento
- **Art. 16**: Minimização de dados
- **Art. 40**: Retenção limitada ao necessário

### 2. Configuração do Cron Job

**No Supabase Dashboard:**
```
Database > Cron Jobs > Create new

Nome: cleanup_expired_data
Schedule: 0 3 * * * (3h da manhã todo dia)
SQL: SELECT * FROM cleanup_expired_tokens();
```

**Logs:**
```sql
-- Ver quantos registros foram deletados
SELECT * FROM cleanup_expired_tokens();

-- Resultado esperado:
-- tokens_deleted | diagnostics_deleted
-- --------------+--------------------
--            15 |                  3
```

---

## 📈 Monitoramento

### 1. View: Active Tokens Summary

**Query:**
```sql
SELECT * FROM active_tokens_summary;
```

**Resultado:**
```
active_tokens | used_tokens | expired_tokens | unique_users
-------------+-------------+----------------+-------------
          12 |         145 |             23 |          95
```

**Uso:**
- Dashboard de administração
- Alertas de uso incomum
- Métricas de conversão

### 2. View: Recent Diagnostics

**Query:**
```sql
SELECT * FROM recent_diagnostics;
```

**Resultado:**
```
id                  | email              | total_yearly | waste_yearly | created_at
--------------------+--------------------+--------------+--------------+------------
uuid-123...         | user@example.com   | 12450.00     | 3200.50      | 2026-01-07
uuid-456...         | other@example.com  | 8900.00      | 1500.00      | 2026-01-06
```

**Uso:**
- Análise de padrões de uso
- Identificação de outliers
- Suporte ao cliente

---

## 🔍 Queries Úteis

### Verificar Saúde do Sistema

```sql
-- 1. Tokens ativos vs expirados
SELECT * FROM active_tokens_summary;

-- 2. Taxa de conversão (tokens usados vs criados)
SELECT
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE used) / COUNT(*),
    2
  ) AS conversion_rate
FROM access_tokens;

-- 3. Diagnósticos por dia (últimos 7 dias)
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS diagnostics_count,
  AVG((data->>'totalYearly')::numeric) AS avg_yearly_spend
FROM diagnostics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 4. Top 5 usuários por gasto total
SELECT
  email,
  (data->>'totalYearly')::numeric AS total_yearly,
  (data->>'wasteYearly')::numeric AS waste_yearly,
  created_at
FROM diagnostics
ORDER BY (data->>'totalYearly')::numeric DESC
LIMIT 5;
```

### Manutenção Manual

```sql
-- Executar limpeza manualmente (sem cron)
SELECT * FROM cleanup_expired_tokens();

-- Ver tokens que vão expirar nas próximas 24h
SELECT
  email,
  expires_at,
  NOW() - created_at AS age
FROM access_tokens
WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
  AND NOT used;

-- Invalidar token manualmente (emergência)
UPDATE access_tokens
SET used = true
WHERE token = 'uuid-do-token-aqui';
```

---

## 🚀 Próximos Passos

### Após Deploy do Schema

1. **Verificar criação:**
   ```sql
   -- Deve retornar 2 tabelas
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('access_tokens', 'diagnostics');
   ```

2. **Verificar triggers:**
   ```sql
   -- Deve retornar trg_set_token_expiration
   SELECT trigger_name FROM information_schema.triggers
   WHERE event_object_table = 'access_tokens';
   ```

3. **Verificar views:**
   ```sql
   -- Deve retornar 2 views
   SELECT viewname FROM pg_views
   WHERE schemaname = 'public';
   ```

4. **Testar inserção:**
   ```sql
   -- Inserir token de teste
   INSERT INTO access_tokens (email)
   VALUES ('test@example.com')
   RETURNING *;

   -- Verificar se expires_at foi setado automaticamente
   ```

### Monitoramento Contínuo

- Configurar alertas no Supabase para tabelas grandes (>100MB)
- Revisar logs do cron job semanalmente
- Monitorar `active_tokens_summary` diariamente
- Fazer backup manual antes de mudanças no schema

---

## 📚 Referências

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [PostgreSQL pg_cron](https://github.com/citusdata/pg_cron)

---

**Última atualização:** 08/01/2026
**Versão do Schema:** 2.0
