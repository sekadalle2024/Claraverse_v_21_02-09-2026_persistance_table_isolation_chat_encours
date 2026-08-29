# Integration Test Runner for All 33 Notes Calculation
# =====================================================
# This script runs the complete integration test for all 33 SYSCOHADA notes annexes
# 
# Requirements Validated:
# - 12.1: Performance < 30 seconds
# - 10.5: Coherence rate >= 95%
# - 10.6: Coherence validation

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "INTEGRATION TEST: All 33 Notes Calculation" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location py_backend

Write-Host "[1/4] Checking Python environment..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python environment OK" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Checking required packages..." -ForegroundColor Yellow
$packages = @("pytest", "pandas", "openpyxl", "hypothesis")
foreach ($package in $packages) {
    python -c "import $package" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Package '$package' not found. Installing..." -ForegroundColor Yellow
        pip install $package
    }
}
Write-Host "✓ All required packages installed" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Checking balance file..." -ForegroundColor Yellow
if (Test-Path "P000 -BALANCE DEMO N_N-1_N-2.xlsx") {
    Write-Host "✓ Balance file found" -ForegroundColor Green
} else {
    Write-Host "✗ Balance file not found: P000 -BALANCE DEMO N_N-1_N-2.xlsx" -ForegroundColor Red
    Write-Host "  Please ensure the demo balance file is in the py_backend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[4/4] Running integration tests..." -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Run the integration test
pytest "Doc calcul notes annexes/Tests/test_all_33_notes_integration.py" -v -s --tb=short

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ ALL INTEGRATION TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  ✓ Performance constraint validated (< 30 seconds)" -ForegroundColor Green
    Write-Host "  ✓ Coherence rate validated (>= 95%)" -ForegroundColor Green
    Write-Host "  ✓ All 33 notes calculated successfully" -ForegroundColor Green
    Write-Host "  ✓ Inter-note coherence validated" -ForegroundColor Green
} else {
    Write-Host "✗ INTEGRATION TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the test output above for details" -ForegroundColor Yellow
}

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Return to original directory
Set-Location ..

exit $exitCode
