# PowerShell Script: Run API Endpoint Integration Tests
# Task: 22.4 Write integration test for API endpoint
# Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "API ENDPOINT INTEGRATION TESTS" -ForegroundColor Cyan
Write-Host "Task 22.4: Write integration test for API endpoint" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Change to py_backend directory
$originalLocation = Get-Location
Set-Location -Path "py_backend"

Write-Host "Running integration tests for API endpoint..." -ForegroundColor Yellow
Write-Host ""

# Run the integration tests
pytest "Doc calcul notes annexes/Tests/test_api_endpoint_integration.py" -v --tb=short

$testResult = $LASTEXITCODE

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan

if ($testResult -eq 0) {
    Write-Host "✓ ALL INTEGRATION TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test Coverage:" -ForegroundColor Green
    Write-Host "  ✓ File upload and response format (Req 13.1, 13.2, 13.3)" -ForegroundColor Green
    Write-Host "  ✓ Error handling for invalid files (Req 13.5, 13.6)" -ForegroundColor Green
    Write-Host "  ✓ Response time and performance (Req 13.2, 13.4)" -ForegroundColor Green
    Write-Host "  ✓ Health check endpoint" -ForegroundColor Green
    Write-Host "  ✓ Complete workflow integration" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check that api_notes_annexes.py is available" -ForegroundColor Yellow
    Write-Host "  2. Verify all dependencies are installed: pip install -r requirements.txt" -ForegroundColor Yellow
    Write-Host "  3. Check that the demo balance file exists (optional)" -ForegroundColor Yellow
    Write-Host "  4. Review test output above for specific failures" -ForegroundColor Yellow
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Return to original location
Set-Location -Path $originalLocation

# Exit with test result code
exit $testResult
