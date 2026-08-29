#!/usr/bin/env pwsh
# Test script for Note 5 calculator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 5 - CRÉANCES CLIENTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run the calculator
Write-Host "Running calculer_note_5.py..." -ForegroundColor Yellow
python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_5.py" `
    "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls" `
    --output-html "py_backend/Doc calcul notes annexes/Tests/test_note_5.html" `
    --output-trace "py_backend/Doc calcul notes annexes/Tests/trace_note_5.json"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "  - HTML: py_backend/Doc calcul notes annexes/Tests/test_note_5.html" -ForegroundColor White
Write-Host "  - Trace: py_backend/Doc calcul notes annexes/Tests/trace_note_5.json" -ForegroundColor White
