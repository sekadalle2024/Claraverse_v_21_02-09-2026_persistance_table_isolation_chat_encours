# Test script for Trace_Manager integration in orchestrator
# Task 21.3 - Integrate Trace_Manager into orchestrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TRACE_MANAGER INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to test directory
$testDir = "py_backend\Doc calcul notes annexes\Tests"
Set-Location $testDir

Write-Host "Running integration tests..." -ForegroundColor Yellow
Write-Host ""

# Run pytest
python test_trace_integration.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Trace files generated:" -ForegroundColor Cyan
    Get-ChildItem -Filter "trace_note_*.json" | ForEach-Object {
        Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "View trace content:" -ForegroundColor Yellow
    Write-Host "  cat trace_note_3a.json | python -m json.tool" -ForegroundColor Gray
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  cat ../Logs/calcul_notes_annexes.log" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ TESTS FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}

# Return to root
Set-Location ../../..
