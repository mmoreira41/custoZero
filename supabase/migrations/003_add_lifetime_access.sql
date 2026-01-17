-- ============================================================================
-- Migration: Adicionar suporte a Acesso Vitalício
-- ============================================================================
-- Data: 2026-01-16
-- Descrição: Adiciona coluna is_lifetime para distinguir planos pagos
-- ============================================================================

-- Adicionar coluna is_lifetime (default false = acesso temporário de 24h)
ALTER TABLE access_tokens
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT false;

-- Criar índice para busca eficiente por email + vitalício
-- Isso permite priorizar tokens vitalícios na busca
CREATE INDEX IF NOT EXISTS idx_access_tokens_email_lifetime
ON access_tokens(email, is_lifetime DESC);

-- Adicionar comentários às colunas
COMMENT ON COLUMN access_tokens.is_lifetime IS
  'Se true, o usuário tem acesso vitalício (plano R$ 47). Se false, acesso temporário.';

-- ============================================================================
-- NOTA: A coluna expires_at já existe na tabela (criada no webhook)
-- Para tokens vitalícios, expires_at será NULL
-- Para tokens temporários (R$ 7,90 renovação), expires_at = created_at + 24h
-- ============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Coluna is_lifetime adicionada com sucesso!';
  RAISE NOTICE '✅ Índice para busca prioritária criado!';
END $$;
