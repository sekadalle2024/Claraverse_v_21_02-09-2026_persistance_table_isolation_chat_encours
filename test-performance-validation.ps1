# Performance Validation Test Script - Task 30.3
# Tests complete calculation performance against < 30 seconds constraint

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PERFORMANCE VALIDATION TEST - Task 30.3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if balance file exists
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"
if (-not (Test-Path $balanceFile)) {
    Write-Host "ERROR: Balance file not found: $balanceFile" -ForegroundColor Red
    Write-Host "Please ensure the balance file is in the root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Balance file found: $balanceFile" -ForegroundColor Green
Write-Host ""

# Run performance validation test
Write-Host "Running performance validation test..." -ForegroundColor Cyan
Write-Host ""

python "py_backend/Doc calcul notes annexes/Tests/test_performance_validation.py"

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "PERFORMANCE VALIDATION: PASS" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The system meets all performance requirements:" -ForegroundColor Green
    Write-Host "  - Execution time < 30 seconds" -ForegroundColor Green
    Write-Host "  - Memory usage acceptable" -ForegroundColor Green
    Write-Host "  - All calculations successful" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "PERFORMANCE VALIDATION: REVIEW NEEDED" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Review the test output above for details." -ForegroundColor Yellow
}

Write-Host ""
exit $exitCode
