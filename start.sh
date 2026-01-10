#!/bin/bash

# Script de inicialização do Diagnóstico Financeiro Pessoal

echo "🚀 Iniciando Diagnóstico Financeiro Pessoal..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚙️  Criando arquivo .env..."
    cat > .env << EOF
# Supabase Configuration
# Deixe vazio para desenvolvimento sem backend, ou adicione suas credenciais
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
EOF
    echo "✅ Arquivo .env criado"
    echo ""
fi

echo "🌐 Iniciando servidor de desenvolvimento..."
echo ""
echo "➜ A aplicação vai abrir em: http://localhost:5173"
echo "➜ Se a porta estiver ocupada, será usada outra (5174, 5175, etc)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Landing page funcionará normalmente"
echo "   - Para funcionalidade completa, configure Supabase no .env"
echo "   - Leia QUICKSTART.md para mais detalhes"
echo ""
echo "📝 Pressione Ctrl+C para parar o servidor"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Iniciar servidor
npm run dev
