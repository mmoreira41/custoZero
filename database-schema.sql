-- ============================================================================
-- Database Schema for Diagnóstico Financeiro Pessoal
-- ============================================================================
-- Versão: 2.0
-- Data: 2026-01-08
-- Melhorias: RLS desabilitado, constraints adicionados, triggers e views
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Access Tokens Table
-- Armazena tokens de acesso gerados após pagamento via Kiwify
CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT expires_in_future
    CHECK (expires_at > created_at)
);

-- Diagnostics Table
-- Armazena resultados completos dos diagnósticos
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  data JSONB NOT NULL, -- armazena todo DiagnosticResult
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT data_not_empty
    CHECK (jsonb_typeof(data) = 'object' AND data != '{}'::jsonb)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Índices para access_tokens
CREATE INDEX idx_access_tokens_token ON access_tokens(token);
CREATE INDEX idx_access_tokens_email ON access_tokens(email);
CREATE INDEX idx_access_tokens_expires_at ON access_tokens(expires_at);
CREATE INDEX idx_access_tokens_used ON access_tokens(used) WHERE NOT used;

-- Índices para diagnostics
CREATE INDEX idx_diagnostics_email ON diagnostics(email);
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Desabilitar RLS para ambas as tabelas
-- Motivo: Acesso controlado via service_role key na Edge Function
-- Não estamos usando autenticação Supabase (auth.jwt())
ALTER TABLE access_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Função para setar expiração automática (24h)
-- Trigger executado antes de INSERT em access_tokens
CREATE OR REPLACE FUNCTION set_token_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Função para limpar dados antigos
-- Executar via cron job diário: SELECT * FROM cleanup_expired_tokens();
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS TABLE (
  tokens_deleted INTEGER,
  diagnostics_deleted INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  tokens_count INTEGER;
  diagnostics_count INTEGER;
BEGIN
  -- Deletar tokens expirados há mais de 7 dias
  DELETE FROM access_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS tokens_count = ROW_COUNT;

  -- Deletar diagnósticos com mais de 30 dias (LGPD compliance)
  DELETE FROM diagnostics
  WHERE created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS diagnostics_count = ROW_COUNT;

  RETURN QUERY SELECT tokens_count, diagnostics_count;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_set_token_expiration
  BEFORE INSERT ON access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_token_expiration();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View para monitorar tokens ativos
CREATE OR REPLACE VIEW active_tokens_summary AS
SELECT
  COUNT(*) FILTER (WHERE NOT used AND expires_at > NOW()) AS active_tokens,
  COUNT(*) FILTER (WHERE used) AS used_tokens,
  COUNT(*) FILTER (WHERE expires_at < NOW()) AS expired_tokens,
  COUNT(DISTINCT email) AS unique_users
FROM access_tokens;

-- View para diagnósticos recentes
CREATE OR REPLACE VIEW recent_diagnostics AS
SELECT
  id,
  email,
  data->>'totalYearly' AS total_yearly,
  data->>'wasteYearly' AS waste_yearly,
  created_at
FROM diagnostics
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Tabelas
COMMENT ON TABLE access_tokens IS
  'Tokens de acesso gerados após pagamento via Kiwify. Expiram em 24h.';
COMMENT ON TABLE diagnostics IS
  'Resultados completos dos diagnósticos financeiros. Deletados após 30 dias (LGPD).';

-- Colunas access_tokens
COMMENT ON COLUMN access_tokens.token IS
  'Token UUID único para acesso ao diagnóstico (one-time use)';
COMMENT ON COLUMN access_tokens.email IS
  'Email do usuário que comprou o acesso';
COMMENT ON COLUMN access_tokens.used IS
  'Flag indicando se o token já foi utilizado (one-time use)';
COMMENT ON COLUMN access_tokens.expires_at IS
  'Data/hora de expiração do token (24h após criação por padrão)';

-- Colunas diagnostics
COMMENT ON COLUMN diagnostics.data IS
  'JSON completo com o resultado do diagnóstico (tipo DiagnosticResult)';

-- Funções
COMMENT ON FUNCTION cleanup_expired_tokens() IS
  'Limpa tokens expirados (7+ dias) e diagnósticos antigos (30+ dias).
   Executar via cron job diário: SELECT * FROM cleanup_expired_tokens();';

COMMENT ON FUNCTION set_token_expiration() IS
  'Trigger function: seta expires_at para 24h após created_at se não fornecido';

-- Views
COMMENT ON VIEW active_tokens_summary IS
  'Resumo em tempo real de tokens ativos, usados e expirados';

COMMENT ON VIEW recent_diagnostics IS
  'Diagnósticos dos últimos 7 dias com métricas principais extraídas do JSONB';

-- ============================================================================
-- SETUP COMPLETO
-- ============================================================================
--
-- Para configurar o banco de dados:
-- 1. Copie todo este arquivo
-- 2. No Supabase Dashboard, vá em "SQL Editor"
-- 3. Cole e execute
-- 4. Verifique as tabelas em "Table Editor"
--
-- Para configurar cron job de limpeza:
-- 1. No Supabase Dashboard, vá em "Database" > "Cron Jobs"
-- 2. Crie um job diário:
--    SELECT * FROM cleanup_expired_tokens();
-- 3. Schedule: 0 3 * * * (todo dia às 3h da manhã)
--
-- Para monitorar tokens:
-- SELECT * FROM active_tokens_summary;
--
-- Para ver diagnósticos recentes:
-- SELECT * FROM recent_diagnostics;
-- ============================================================================
