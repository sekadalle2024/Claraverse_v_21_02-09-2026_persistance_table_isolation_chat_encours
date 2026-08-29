# Quick test script for Notes 6 and 10
Write-Host "Testing Note 6 (Autres Créances)..." -ForegroundColor Cyan
python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_6.py"

Write-Host "`nTesting Note 10 (Résultat)..." -ForegroundColor Cyan
python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_10.py"

Write-Host "`nTests completed!" -ForegroundColor Green
