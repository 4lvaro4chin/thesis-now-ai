# ThesisNow Backend Setup Script (PowerShell)

Write-Host "🔧 ThesisNow Backend Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if poetry is installed
$poetryCheck = poetry --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Poetry not found. Install it with: pip install poetry" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies with Poetry..." -ForegroundColor Yellow
poetry install

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and fill in your credentials:"
Write-Host "   cp .env.example .env"
Write-Host ""
Write-Host "2. Add your OpenAI API key to .env (OPENAI_API_KEY)"
Write-Host "3. Add your Supabase URL and key to .env"
Write-Host ""
Write-Host "4. Start the server:"
Write-Host "   poetry run uvicorn main:app --reload --port 8000"
Write-Host ""
Write-Host "🌐 Backend will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API docs available at: http://localhost:8000/docs" -ForegroundColor Green
