# Test Script for Graceful Degradation - Task 28.4
# Quick validation of graceful degradation implementation

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "GRACEFUL DEGRADATION TEST - Task 28.4" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

# Change to test directory
$testDir = "py_backend/Doc calcul notes annexes/Tests"
Write-Host "📂 Test directory: $testDir" -ForegroundColor Cyan
Write-Host ""

# Run the test
Write-Host "🧪 Running graceful degradation tests..." -ForegroundColor Cyan
Write-Host ""

try {
    python "$testDir/test_graceful_degradation.py"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ ALL TESTS PASSED" -ForegroundColor Green
        Write-Host ""
        Write-Host "Graceful degradation implementation validated:" -ForegroundColor Green
        Write-Host "  ✓ Missing accounts return zeros with warnings" -ForegroundColor Green
        Write-Host "  ✓ Missing N-2 exercise creates empty balance" -ForegroundColor Green
        Write-Host "  ✓ Processing continues with warnings" -ForegroundColor Green
        Write-Host "  ✓ Distinction between missing and zero balance" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
        Write-Host "Please review the output above for details" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "✗ ERROR RUNNING TESTS" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Quick Start: $testDir/QUICK_START_GRACEFUL_DEGRADATION.md" -ForegroundColor White
Write-Host "  - Completion: $testDir/00_TASK_28_4_COMPLETED_GRACEFUL_DEGRADATION.txt" -ForegroundColor White
Write-Host ""
