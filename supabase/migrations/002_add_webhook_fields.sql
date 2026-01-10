-- ============================================================================
-- Migration: Adicionar campos do webhook Kiwify
-- ============================================================================
-- Data: 2026-01-10
-- Descrição: Adiciona campos order_id e customer_name à tabela access_tokens
-- ============================================================================

-- Adicionar colunas order_id e customer_name
ALTER TABLE access_tokens
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Criar índice para busca por order_id (evitar duplicação de pedidos)
CREATE INDEX IF NOT EXISTS idx_access_tokens_order_id
ON access_tokens(order_id);

-- Adicionar comentários às novas colunas
COMMENT ON COLUMN access_tokens.order_id IS
  'ID do pedido no Kiwify (usado para evitar duplicação de webhooks)';

COMMENT ON COLUMN access_tokens.customer_name IS
  'Nome do cliente que comprou o acesso (para personalização de email)';
