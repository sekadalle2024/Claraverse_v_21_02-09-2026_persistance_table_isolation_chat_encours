# PowerShell Script to Run All 33 Notes Integration Test Suite
# Task 27.3 - Integration Test Suite

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL 33 NOTES INTEGRATION TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Python is available
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not found in PATH" -ForegroundColor Red
    Write-Host "Please install Python or activate your virtual environment" -ForegroundColor Yellow
    exit 1
}

Write-Host "Python Version:" -ForegroundColor Green
python --version

# Navigate to test directory
$testScript = "py_backend/Doc calcul notes annexes/Tests/test_all_notes.py"

if (-not (Test-Path $testScript)) {
    Write-Host "`nERROR: Test script not found: $testScript" -ForegroundColor Red
    exit 1
}

Write-Host "`nRunning integration test suite..." -ForegroundColor Yellow
Write-Host "This will execute all 33 note calculators sequentially`n" -ForegroundColor Yellow

# Run the test suite
python $testScript

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "ALL TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Check the HTML report in:" -ForegroundColor Cyan
    Write-Host "py_backend/Doc calcul notes annexes/Tests/test_all_notes_output/`n" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    Write-Host "Check the HTML report for details:" -ForegroundColor Yellow
    Write-Host "py_backend/Doc calcul notes annexes/Tests/test_all_notes_output/`n" -ForegroundColor Yellow
}

exit $exitCode
