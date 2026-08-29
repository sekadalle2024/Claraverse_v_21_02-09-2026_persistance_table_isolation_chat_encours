# Script de test pour Property 19: Calculation Caching
# Task 21.5: Write property test for calculation caching

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Property Test: Calculation Caching" -ForegroundColor Cyan
Write-Host "Task 21.5 - Property 19" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
$testFile = "py_backend/Doc calcul notes annexes/Tests/test_calculation_caching.py"
if (-not (Test-Path $testFile)) {
    Write-Host "Erreur: Fichier de test non trouve: $testFile" -ForegroundColor Red
    Write-Host "Assurez-vous d'executer ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "Fichier de test trouve: $testFile" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "Avertissement: Fichier de balance non trouve: $balanceFile" -ForegroundColor Yellow
    Write-Host "Certains tests pourraient etre ignores" -ForegroundColor Yellow
    Write-Host ""
}

# Activer l'environnement virtuel si disponible
if (Test-Path "py_backend/venv/Scripts/Activate.ps1") {
    Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Cyan
    & "py_backend/venv/Scripts/Activate.ps1"
    Write-Host "Environnement virtuel active" -ForegroundColor Green
    Write-Host ""
}

# Changer vers le dossier des tests
Set-Location "py_backend/Doc calcul notes annexes/Tests"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Execution des tests de caching" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Exécuter les tests avec pytest
Write-Host "Commande: pytest test_calculation_caching.py -v" -ForegroundColor Yellow
Write-Host ""

pytest test_calculation_caching.py -v --tb=short

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resultats des tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "SUCCES: Tous les tests sont passes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Property 19 validee:" -ForegroundColor Green
    Write-Host "  - Les balances sont chargees une seule fois" -ForegroundColor Green
    Write-Host "  - Le cache est utilise efficacement" -ForegroundColor Green
    Write-Host "  - Gain de performance >= 20%" -ForegroundColor Green
    Write-Host "  - Coherence maintenue" -ForegroundColor Green
    Write-Host "  - Pas de duplication memoire" -ForegroundColor Green
    Write-Host ""
    Write-Host "Requirement 12.4 valide!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "  1. Marquer Task 21.5 comme complete" -ForegroundColor White
    Write-Host "  2. (Optionnel) Task 21.6: Integration test 33 notes" -ForegroundColor White
    Write-Host "  3. Task 22: API Flask endpoint" -ForegroundColor White
} else {
    Write-Host "ECHEC: Certains tests ont echoue" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions recommandees:" -ForegroundColor Yellow
    Write-Host "  1. Verifier l'implementation du cache dans calcul_notes_annexes_main.py" -ForegroundColor White
    Write-Host "  2. Verifier que charger_balances() utilise self.balances" -ForegroundColor White
    Write-Host "  3. Verifier que les calculateurs utilisent le cache" -ForegroundColor White
    Write-Host "  4. Consulter PROPERTY_TEST_CALCULATION_CACHING_SUMMARY.md" -ForegroundColor White
}

Write-Host ""
Write-Host "Documentation disponible:" -ForegroundColor Cyan
Write-Host "  - QUICK_START_CALCULATION_CACHING.md" -ForegroundColor White
Write-Host "  - PROPERTY_TEST_CALCULATION_CACHING_SUMMARY.md" -ForegroundColor White
Write-Host ""

# Retourner au dossier racine
Set-Location ../../..

exit $exitCode
