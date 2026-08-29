# Test Script: Warning Logging Completeness Property Test
# Task 28.6: Write property test for warning logging completeness
# Property 14: Warning Logging Completeness
# Validates: Requirements 3.6, 4.7, 8.5, 8.6

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Property Test: Warning Logging Completeness" -ForegroundColor Cyan
Write-Host "Task 28.6 - Requirements 3.6, 4.7, 8.5, 8.6" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to tests directory
$testsDir = "py_backend/Doc calcul notes annexes/Tests"
if (-not (Test-Path $testsDir)) {
    Write-Host "Error: Tests directory not found: $testsDir" -ForegroundColor Red
    exit 1
}

Set-Location $testsDir

Write-Host "Running property test for warning logging completeness..." -ForegroundColor Yellow
Write-Host ""

# Run the property test with verbose output and Hypothesis statistics
Write-Host "Command: pytest test_warning_logging_completeness.py -v --hypothesis-show-statistics" -ForegroundColor Gray
Write-Host ""

pytest test_warning_logging_completeness.py -v --hypothesis-show-statistics

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ All property tests PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Validated:" -ForegroundColor Green
    Write-Host "  ✓ IncoherentBalanceWarning logged completely (Req 3.6, 8.5)" -ForegroundColor Green
    Write-Host "  ✓ NegativeVNCWarning logged completely (Req 4.7, 8.5)" -ForegroundColor Green
    Write-Host "  ✓ AbnormalAccountBalanceWarning logged completely (Req 8.5, 8.6)" -ForegroundColor Green
    Write-Host "  ✓ MissingAccountWarning logged completely (Req 8.5, 8.6)" -ForegroundColor Green
    Write-Host "  ✓ LowCoherenceRateWarning logged completely (Req 8.5, 8.6)" -ForegroundColor Green
    Write-Host "  ✓ Multiple warnings all logged" -ForegroundColor Green
    Write-Host "  ✓ Log format consistency" -ForegroundColor Green
    Write-Host "  ✓ Context completeness" -ForegroundColor Green
    Write-Host "  ✓ No warning duplication" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task 28.6 COMPLETE ✓" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the test output above for details." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Return to original directory
Set-Location ../../..

exit $exitCode
