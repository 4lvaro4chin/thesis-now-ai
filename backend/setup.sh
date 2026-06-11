#!/bin/bash
# ThesisNow Backend Setup Script

set -e

echo "🔧 ThesisNow Backend Setup"
echo "=========================="

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry not found. Install it with: pip install poetry"
    exit 1
fi

echo "📦 Installing dependencies with Poetry..."
poetry install

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example to .env and fill in your credentials:"
echo "   cp .env.example .env"
echo "2. Add your OpenAI API key to .env (OPENAI_API_KEY)"
echo "3. Add your Supabase URL and key to .env"
echo "4. Start the server:"
echo "   poetry run uvicorn main:app --reload --port 8000"
echo ""
echo "🌐 Backend will be available at: http://localhost:8000"
echo "📚 API docs available at: http://localhost:8000/docs"
