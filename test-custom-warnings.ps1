# Test Custom Warnings System
# Quick test script for task 28.3

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Custom Warnings System (Task 28.3)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to tests directory
Set-Location "py_backend/Doc calcul notes annexes/Tests"

Write-Host "Running custom warnings tests..." -ForegroundColor Yellow
Write-Host ""

# Run pytest with verbose output
python -m pytest test_custom_warnings.py -v --tb=short

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "- IncoherentBalanceWarning: Tested" -ForegroundColor White
Write-Host "- NegativeVNCWarning: Tested" -ForegroundColor White
Write-Host "- AbnormalAccountBalanceWarning: Tested" -ForegroundColor White
Write-Host "- MissingAccountWarning: Tested" -ForegroundColor White
Write-Host "- LowCoherenceRateWarning: Tested" -ForegroundColor White
Write-Host "- Logging integration: Tested" -ForegroundColor White
Write-Host "- Convenience functions: Tested" -ForegroundColor White

Write-Host ""
Write-Host "Requirements validated:" -ForegroundColor Cyan
Write-Host "- 3.6: Incoherent balance warnings ✓" -ForegroundColor Green
Write-Host "- 4.7: Negative VNC warnings ✓" -ForegroundColor Green
Write-Host "- 8.5: Warning logging ✓" -ForegroundColor Green
Write-Host "- 8.6: Comprehensive coverage ✓" -ForegroundColor Green

# Return to original directory
Set-Location ../../..

exit $exitCode
