# ThesisNow Backend - Run Connector Tests (PowerShell)

Write-Host ""
Write-Host "🔬 Running Connector Tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if poetry or python available
$pythonCmd = $null

if (poetry --version 2>$null) {
    $pythonCmd = "poetry run python"
    Write-Host "✅ Using Poetry" -ForegroundColor Green
} elseif (python --version 2>$null) {
    $pythonCmd = "python"
    Write-Host "✅ Using Python" -ForegroundColor Green
} else {
    Write-Host "❌ Python or Poetry not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Running: $pythonCmd test_connectors_local.py" -ForegroundColor Yellow
Write-Host ""

# Run the test
Invoke-Expression "$pythonCmd test_connectors_local.py"

$exitCode = $LASTEXITCODE
Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✅ Tests completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Tests failed with exit code $exitCode" -ForegroundColor Red
}

exit $exitCode
