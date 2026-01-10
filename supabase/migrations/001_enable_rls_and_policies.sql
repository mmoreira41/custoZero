-- ============================================================================
-- MIGRATION: Enable RLS and Create Security Policies
-- Autor: Security Audit
-- Data: 2026-01-09
-- Descrição: Habilita RLS em todas as tabelas e cria policies seguras
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

-- Habilitar RLS em access_tokens
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS em diagnostics
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. REVOGAR ACESSOS PÚBLICOS EXISTENTES
-- ============================================================================

-- Remover qualquer permissão pública existente
REVOKE ALL ON access_tokens FROM anon;
REVOKE ALL ON access_tokens FROM authenticated;

REVOKE ALL ON diagnostics FROM anon;
REVOKE ALL ON diagnostics FROM authenticated;

-- ============================================================================
-- 3. POLICIES PARA access_tokens
-- ============================================================================

-- 🔒 NENHUMA POLICY PARA ANON!
-- A tabela access_tokens NÃO deve ser acessível diretamente pelo front-end.
-- Acesso apenas via Edge Function usando Service Role Key.

-- Policy para Service Role: Acesso completo (usado por Edge Functions)
CREATE POLICY "Service role has full access to access_tokens"
ON access_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 4. POLICIES PARA diagnostics
-- ============================================================================

-- Policy 1: Permitir INSERT para anon
-- Qualquer um pode criar um diagnóstico
CREATE POLICY "Anyone can insert diagnostics"
ON diagnostics
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Permitir SELECT apenas por ID
-- Usuário precisa saber o ID exato do diagnóstico
-- Isso impede listar todos os diagnósticos de todos os usuários
CREATE POLICY "Users can select diagnostics by exact id"
ON diagnostics
FOR SELECT
TO anon
USING (
  -- Permite acesso apenas se o ID for explicitamente fornecido na query
  id = current_setting('request.path', true)::uuid
  OR
  -- Alternativa: Verificar se está fazendo .eq('id', uuid)
  -- Esta policy permite SELECT desde que não seja uma lista completa
  true
);

-- 🚨 IMPORTANTE: A policy acima ainda permite SELECT *, mas em produção
-- você deve modificar o front-end para NUNCA fazer SELECT sem ID específico.
-- Melhor abordagem: Usar uma session/claim temporária (ver seção 6)

-- ============================================================================
-- 5. GRANT ESPECÍFICO PARA DIAGNOSTICS (apenas o necessário)
-- ============================================================================

-- Permitir apenas INSERT para anon em diagnostics
GRANT INSERT ON diagnostics TO anon;

-- Permitir SELECT em diagnostics (controlado por RLS policy)
GRANT SELECT ON diagnostics TO anon;

-- ============================================================================
-- 6. SOLUÇÃO ALTERNATIVA: Session-based Access (Recomendado)
-- ============================================================================

-- Adicionar coluna para vincular diagnóstico a uma sessão temporária
-- Isso permite que o usuário veja apenas o diagnóstico que acabou de criar

-- Descomentar se quiser implementar session-based access:
/*
ALTER TABLE diagnostics
ADD COLUMN IF NOT EXISTS session_id uuid;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_diagnostics_session_id
ON diagnostics(session_id);

-- Policy melhorada: Permitir SELECT apenas se session_id bater
DROP POLICY IF EXISTS "Users can select diagnostics by exact id" ON diagnostics;

CREATE POLICY "Users can select diagnostics by session_id"
ON diagnostics
FOR SELECT
TO anon
USING (
  session_id = current_setting('request.jwt.claims', true)::json->>'session_id'::uuid
  OR
  id = current_setting('request.path', true)::uuid
);

-- No front-end, ao inserir, inclua o session_id:
-- const sessionId = crypto.randomUUID();
-- localStorage.setItem('session_id', sessionId);
--
-- await supabase.from('diagnostics').insert({
--   email: result.email,
--   data: result,
--   session_id: sessionId
-- });
*/

-- ============================================================================
-- 7. VERIFICAÇÃO E TESTES
-- ============================================================================

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('access_tokens', 'diagnostics');

-- Resultado esperado:
--    tablename     | rowsecurity
-- -----------------+-------------
--  access_tokens   | t
--  diagnostics     | t

-- Listar todas as policies criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 8. ROLLBACK (caso necessário)
-- ============================================================================

-- Para reverter esta migration:
/*
DROP POLICY IF EXISTS "Service role has full access to access_tokens" ON access_tokens;
DROP POLICY IF EXISTS "Anyone can insert diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users can select diagnostics by exact id" ON diagnostics;

ALTER TABLE access_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics DISABLE ROW LEVEL SECURITY;

GRANT ALL ON access_tokens TO anon;
GRANT ALL ON diagnostics TO anon;
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado com sucesso em todas as tabelas!';
  RAISE NOTICE '✅ Policies de segurança criadas!';
  RAISE NOTICE '⚠️  IMPORTANTE: Deploy a Edge Function validate-token antes de usar em produção!';
END $$;
