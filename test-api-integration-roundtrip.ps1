# Test Script: API Integration Round-Trip Property Test
# Property 20: API Integration Round-Trip
# Requirements: 13.2, 13.3, 13.4

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Integration Round-Trip Property Test" -ForegroundColor Cyan
Write-Host "Property 20 - Requirements 13.2, 13.3, 13.4" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location py_backend

Write-Host "Running API Integration Round-Trip Tests..." -ForegroundColor Yellow
Write-Host ""

# Run the property tests
pytest "Doc calcul notes annexes/Tests/test_api_integration_roundtrip.py" -v --tb=short --hypothesis-show-statistics

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ All API Integration Tests PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Property 20 Validated:" -ForegroundColor Green
    Write-Host "  ✓ API receives balance files" -ForegroundColor Green
    Write-Host "  ✓ Calculations execute successfully" -ForegroundColor Green
    Write-Host "  ✓ JSON response structure is valid" -ForegroundColor Green
    Write-Host "  ✓ Data integrity maintained" -ForegroundColor Green
    Write-Host "  ✓ Error handling is graceful" -ForegroundColor Green
    Write-Host ""
    Write-Host "Requirements Validated:" -ForegroundColor Green
    Write-Host "  ✓ 13.2: API receives file and executes calculations" -ForegroundColor Green
    Write-Host "  ✓ 13.3: API returns JSON with all notes" -ForegroundColor Green
    Write-Host "  ✓ 13.4: Data format suitable for frontend display" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Review the output above for details" -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - API module not available (install FastAPI)" -ForegroundColor Yellow
    Write-Host "  - Demo balance file not found" -ForegroundColor Yellow
    Write-Host "  - Timeout errors (increase deadline)" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Return to original directory
Set-Location ..

exit $exitCode
