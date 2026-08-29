# Script PowerShell: test-coherence-validation-30-4.ps1
# Description: Exécute les tests de validation de cohérence pour la tâche 30.4
# Requirements: 10.1, 10.2, 10.3, 10.5, 10.6

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VALIDATION DE COHÉRENCE - TÂCHE 30.4" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Naviguer vers le dossier des tests
$testDir = "py_backend/Doc calcul notes annexes/Tests"
if (-not (Test-Path $testDir)) {
    Write-Host "✗ Dossier de tests non trouvé: $testDir" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Dossier de tests: $testDir" -ForegroundColor Yellow
Write-Host ""

# Exécuter le script de test
Write-Host "🚀 Lancement des tests de validation de cohérence..." -ForegroundColor Cyan
Write-Host ""

$testScript = Join-Path $testDir "test_coherence_validation_complete.py"

if (-not (Test-Path $testScript)) {
    Write-Host "✗ Script de test non trouvé: $testScript" -ForegroundColor Red
    exit 1
}

# Exécuter le test
python $testScript

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✓ VALIDATION RÉUSSIE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tous les tests de cohérence ont réussi:" -ForegroundColor Green
    Write-Host "  ✓ Taux de cohérence >= 95%" -ForegroundColor Green
    Write-Host "  ✓ Total immobilisations validé" -ForegroundColor Green
    Write-Host "  ✓ Dotations amortissements validées" -ForegroundColor Green
    Write-Host "  ✓ Continuité temporelle vérifiée" -ForegroundColor Green
    Write-Host "  ✓ Rapport HTML généré" -ForegroundColor Green
    Write-Host ""
    
    # Afficher le chemin du rapport
    $rapportPath = Join-Path $testDir "rapport_coherence_validation_30_4.html"
    if (Test-Path $rapportPath) {
        Write-Host "📄 Rapport de cohérence disponible:" -ForegroundColor Cyan
        Write-Host "   $rapportPath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Ouvrez le rapport dans votre navigateur pour voir les détails" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ VALIDATION ÉCHOUÉE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Certains tests ont échoué. Consultez les logs ci-dessus." -ForegroundColor Red
}

Write-Host ""
exit $exitCode
