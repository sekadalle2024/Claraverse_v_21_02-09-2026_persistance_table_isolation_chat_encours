# Script de test pour la Note 3B - Immobilisations Corporelles
# Date: 25 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 3B - IMMOBILISATIONS CORPORELLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"
if (-not (Test-Path $balanceFile)) {
    Write-Host "ERREUR: Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "Veuillez placer le fichier de balance à la racine du projet." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
Write-Host ""

# Activer l'environnement virtuel Python
Write-Host "Activation de l'environnement Python..." -ForegroundColor Yellow
& "py_backend\venv\Scripts\Activate.ps1"

# Exécuter le calculateur de la Note 3B
Write-Host ""
Write-Host "Exécution du calculateur Note 3B..." -ForegroundColor Yellow
Write-Host ""

python "py_backend\Doc calcul notes annexes\Scripts\calculer_note_3b.py" $balanceFile `
    --output-html "py_backend\Doc calcul notes annexes\Tests\note_3b_test.html" `
    --output-trace "py_backend\Doc calcul notes annexes\Tests\note_3b_trace.json"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ TEST RÉUSSI - NOTE 3B GÉNÉRÉE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Fichiers générés:" -ForegroundColor Cyan
    Write-Host "  - HTML: py_backend\Doc calcul notes annexes\Tests\note_3b_test.html" -ForegroundColor White
    Write-Host "  - Trace: py_backend\Doc calcul notes annexes\Tests\note_3b_trace.json" -ForegroundColor White
    Write-Host ""
    Write-Host "Vous pouvez ouvrir le fichier HTML dans votre navigateur pour visualiser la Note 3B." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ERREUR LORS DU CALCUL DE LA NOTE 3B" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez les messages d'erreur ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
