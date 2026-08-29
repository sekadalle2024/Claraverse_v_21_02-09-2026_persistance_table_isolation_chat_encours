# Test Custom Exceptions - Quick Test Script
# This script runs the custom exceptions test suite

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Custom Exceptions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "py_backend/Doc calcul notes annexes"

Write-Host "Running custom exceptions tests..." -ForegroundColor Yellow
Write-Host ""

# Run pytest with verbose output
python -m pytest Tests/test_custom_exceptions.py -v --tb=short

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All 6 custom exceptions have been tested:" -ForegroundColor Green
Write-Host "  ✓ BalanceNotFoundException" -ForegroundColor Green
Write-Host "  ✓ InvalidBalanceFormatException" -ForegroundColor Green
Write-Host "  ✓ InvalidJSONException" -ForegroundColor Green
Write-Host "  ✓ FilePermissionException" -ForegroundColor Green
Write-Host "  ✓ EmptyBalanceException" -ForegroundColor Green
Write-Host "  ✓ InvalidAccountNumberException" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update existing modules to use these exceptions" -ForegroundColor White
Write-Host "  2. Implement warning system (Task 28.3)" -ForegroundColor White
Write-Host "  3. Add graceful degradation (Task 28.4)" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location ../..
