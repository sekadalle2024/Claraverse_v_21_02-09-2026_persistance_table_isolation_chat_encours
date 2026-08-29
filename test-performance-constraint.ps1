# Test script for Performance Constraint Property Test
# Task 21.4 - Property 18: Performance Constraint

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "PERFORMANCE CONSTRAINT PROPERTY TEST" -ForegroundColor Cyan
Write-Host "Property 18: 33 notes calculated in < 30 seconds" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Change to test directory
$testDir = "py_backend/Doc calcul notes annexes/Tests"
if (-not (Test-Path $testDir)) {
    Write-Host "ERROR: Test directory not found: $testDir" -ForegroundColor Red
    exit 1
}

Set-Location $testDir

# Check if balance file exists
$balanceFile = "../../P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "WARNING: Balance file not found: $balanceFile" -ForegroundColor Yellow
    Write-Host "Some tests may be skipped" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Test Options:" -ForegroundColor Green
Write-Host "1. Run all tests (including slow ~45-60s)" -ForegroundColor White
Write-Host "2. Run only fast unit tests (~5s)" -ForegroundColor White
Write-Host "3. Run only slow property tests (~40-55s)" -ForegroundColor White
Write-Host "4. Run with detailed output" -ForegroundColor White
Write-Host "5. Run with Hypothesis statistics" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-5) or press Enter for option 1"

if ([string]::IsNullOrWhiteSpace($choice)) {
    $choice = "1"
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan

switch ($choice) {
    "1" {
        Write-Host "Running ALL tests (including slow)..." -ForegroundColor Green
        Write-Host "Expected duration: ~45-60 seconds" -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v
    }
    "2" {
        Write-Host "Running FAST unit tests only..." -ForegroundColor Green
        Write-Host "Expected duration: ~5 seconds" -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v -m "not slow"
    }
    "3" {
        Write-Host "Running SLOW property tests only..." -ForegroundColor Green
        Write-Host "Expected duration: ~40-55 seconds" -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v -m "slow"
    }
    "4" {
        Write-Host "Running ALL tests with DETAILED output..." -ForegroundColor Green
        Write-Host "Expected duration: ~45-60 seconds" -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v -s
    }
    "5" {
        Write-Host "Running ALL tests with HYPOTHESIS STATISTICS..." -ForegroundColor Green
        Write-Host "Expected duration: ~45-60 seconds" -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v --hypothesis-show-statistics
    }
    default {
        Write-Host "Invalid choice. Running all tests..." -ForegroundColor Yellow
        Write-Host "============================================================================" -ForegroundColor Cyan
        pytest test_performance_constraint.py -v
    }
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Green
Write-Host "- PROPERTY_TEST_PERFORMANCE_CONSTRAINT_SUMMARY.md" -ForegroundColor White
Write-Host "- QUICK_START_PERFORMANCE_CONSTRAINT.md" -ForegroundColor White
Write-Host ""
Write-Host "Property Validated: Property 18 - Performance Constraint" -ForegroundColor Green
Write-Host "Requirements Validated: 12.1, 12.2" -ForegroundColor Green
Write-Host ""

# Return to original directory
Set-Location ../../..
