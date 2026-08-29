# Script PowerShell pour tester le traitement parallèle optionnel
# Task 29.3 - Parallel Processing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST - Traitement Parallèle Optionnel" -ForegroundColor Cyan
Write-Host "Task 29.3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que pytest est installé
Write-Host "Vérification de pytest..." -ForegroundColor Yellow
try {
    $pytestVersion = pytest --version 2>&1
    Write-Host "✓ pytest trouvé: $pytestVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pytest n'est pas installé" -ForegroundColor Red
    Write-Host "Installation de pytest..." -ForegroundColor Yellow
    pip install pytest
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Exécution des Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Naviguer vers le dossier des tests
$testDir = "py_backend/Doc calcul notes annexes/Tests"
if (Test-Path $testDir) {
    Set-Location $testDir
    Write-Host "✓ Dossier de tests trouvé: $testDir" -ForegroundColor Green
} else {
    Write-Host "✗ Dossier de tests non trouvé: $testDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Exécution de test_parallel_processing.py..." -ForegroundColor Yellow
Write-Host ""

# Exécuter les tests avec pytest
pytest test_parallel_processing.py -v -s --tb=short

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ Tous les tests sont passés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le traitement parallèle optionnel fonctionne correctement:" -ForegroundColor Green
    Write-Host "  - Groupes de notes indépendantes identifiés" -ForegroundColor Green
    Write-Host "  - Calcul parallèle avec multiprocessing" -ForegroundColor Green
    Write-Host "  - Vérification de la mémoire disponible" -ForegroundColor Green
    Write-Host "  - Fallback automatique vers le mode séquentiel" -ForegroundColor Green
    Write-Host "  - Gestion des erreurs et timeouts" -ForegroundColor Green
    Write-Host ""
    Write-Host "Requirements validés: 12.6, 12.7" -ForegroundColor Green
} else {
    Write-Host "✗ Certains tests ont échoué" -ForegroundColor Red
    Write-Host "Consultez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Documentation disponible:" -ForegroundColor Cyan
Write-Host "  - QUICK_START_PARALLEL_PROCESSING.md" -ForegroundColor White
Write-Host "  - TASK_29_3_PARALLEL_PROCESSING_SUMMARY.md" -ForegroundColor White
Write-Host ""

# Retourner au dossier racine
Set-Location ../../../..

exit $exitCode
