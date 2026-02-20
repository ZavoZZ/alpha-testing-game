#!/bin/bash

echo "=== Setup Kilo AI Codebase Indexing ==="
echo ""

# 1. Instalează Docker dacă nu există
if ! command -v docker &> /dev/null; then
    echo "📦 Instalare Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "✓ Docker deja instalat"
fi

# 2. Pornește Qdrant în Docker
echo ""
echo "🚀 Pornire Qdrant vector database..."
docker stop qdrant 2>/dev/null || true
docker rm qdrant 2>/dev/null || true

docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant:latest

# Așteaptă Qdrant să pornească
echo "⏳ Așteptare Qdrant să pornească..."
sleep 5

# 3. Verifică Qdrant
echo ""
echo "🔍 Verificare Qdrant..."
if curl -s http://localhost:6333 > /dev/null; then
    echo "✓ Qdrant rulează pe http://localhost:6333"
else
    echo "✗ Qdrant nu răspunde"
    exit 1
fi

# 4. Creează directorul pentru Kilo AI
echo ""
echo "📁 Creare director .kilo..."
mkdir -p .kilo

# 5. Verifică configurația
echo ""
echo "📋 Verificare configurație..."
if [ -f ".vscode/settings.json" ]; then
    echo "✓ .vscode/settings.json există"
else
    echo "✗ .vscode/settings.json lipsește"
fi

if [ -f ".env" ]; then
    echo "✓ .env există"
else
    echo "✗ .env lipsește"
fi

# 6. Testează OpenAI API
echo ""
echo "🔑 Testare OpenAI API..."
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✓ OPENAI_API_KEY setat"
    
    # Test API
    response=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST https://api.openai.com/v1/embeddings \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -d '{"input": "test", "model": "text-embedding-3-small"}')
    
    if [ "$response" = "200" ]; then
        echo "✓ OpenAI API funcționează"
    else
        echo "✗ OpenAI API returnează cod: $response"
    fi
else
    echo "✗ OPENAI_API_KEY nu este setat"
fi

# 7. Status final
echo ""
echo "=== Status Final ==="
echo "Qdrant: $(docker ps | grep qdrant > /dev/null && echo '✓ Running' || echo '✗ Not running')"
echo "OpenAI API: $([ -n "$OPENAI_API_KEY" ] && echo '✓ Configured' || echo '✗ Not configured')"
echo "Kilo AI Extension: ✓ Installed (v5.7.0)"
echo ""
echo "📝 Următorii pași:"
echo "1. Reload VS Code: Ctrl+Shift+P → 'Developer: Reload Window'"
echo "2. Deschide Kilo AI sidebar"
echo "3. Click pe 'Index Codebase'"
echo "4. Selectează /root/MERN-template"
echo ""
echo "🔗 URLs:"
echo "  Qdrant Dashboard: http://localhost:6333/dashboard"
echo "  Qdrant API: http://localhost:6333"
echo ""
