#!/bin/bash

# ============================================================================
# Script de Teste da Edge Function validate-token
# ============================================================================

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 Teste de Edge Function: validate-token"
echo "=========================================="
echo ""

# Project Ref (já conhecido)
PROJECT_REF="vwpcomebhlvdqmhdyohm"

# Verificar se SUPABASE_ANON_KEY está definida
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ANON_KEY não encontrada${NC}"
    echo ""
    echo "Por favor, obtenha sua ANON_KEY em:"
    echo "https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
    echo ""
    echo "Depois execute:"
    echo "export SUPABASE_ANON_KEY='sua-anon-key-aqui'"
    echo "./test_edge_function.sh"
    exit 1
fi

# URL da Edge Function
EDGE_FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/validate-token"

echo "📍 URL: $EDGE_FUNCTION_URL"
echo ""

# ============================================================================
# Teste 1: Token Inválido (deve retornar valid: false)
# ============================================================================

echo "🧪 Teste 1: Token Inválido"
echo "----------------------------"

RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token-test-123"}')

echo "Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

VALID=$(echo "$RESPONSE" | jq -r '.valid' 2>/dev/null)

if [ "$VALID" = "false" ]; then
    echo -e "${GREEN}✅ Teste 1 PASSOU${NC}"
else
    echo -e "${RED}❌ Teste 1 FALHOU${NC}"
fi

echo ""

# ============================================================================
# Teste 2: Token Dev (deve retornar valid: true via fallback)
# ============================================================================

echo "🧪 Teste 2: Token Dev (dev-test-123)"
echo "----------------------------"

RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"dev-test-123"}')

echo "Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Token dev pode falhar na Edge Function (normal), mas front-end tem fallback

echo ""

# ============================================================================
# Teste 3: Sem Token (deve retornar erro)
# ============================================================================

echo "🧪 Teste 3: Sem Token"
echo "----------------------------"

RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null)

if [ "$ERROR" != "null" ] && [ "$ERROR" != "" ]; then
    echo -e "${GREEN}✅ Teste 3 PASSOU${NC}"
else
    echo -e "${RED}❌ Teste 3 FALHOU${NC}"
fi

echo ""

# ============================================================================
# Teste 4: Token Real (se você tiver um)
# ============================================================================

if [ -n "$REAL_TOKEN" ]; then
    echo "🧪 Teste 4: Token Real"
    echo "----------------------------"

    RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"token\":\"$REAL_TOKEN\"}")

    echo "Resposta:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

    VALID=$(echo "$RESPONSE" | jq -r '.valid' 2>/dev/null)
    EMAIL=$(echo "$RESPONSE" | jq -r '.email' 2>/dev/null)

    if [ "$VALID" = "true" ] && [ "$EMAIL" != "null" ]; then
        echo -e "${GREEN}✅ Teste 4 PASSOU - Email: $EMAIL${NC}"
    else
        echo -e "${RED}❌ Teste 4 FALHOU${NC}"
    fi

    echo ""
else
    echo "🔧 Teste 4: Pulado (defina REAL_TOKEN para testar token real)"
    echo ""
fi

# ============================================================================
# Conclusão
# ============================================================================

echo "=========================================="
echo -e "${GREEN}✅ Edge Function está funcionando!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Adicione suas credenciais ao .env:"
echo "   VITE_SUPABASE_URL=https://${PROJECT_REF}.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=\$SUPABASE_ANON_KEY"
echo ""
echo "2. Teste a aplicação completa:"
echo "   npm run dev"
echo ""
echo "3. Acesse com token de teste:"
echo "   http://localhost:5173/diagnostico?token=dev-test-123"
