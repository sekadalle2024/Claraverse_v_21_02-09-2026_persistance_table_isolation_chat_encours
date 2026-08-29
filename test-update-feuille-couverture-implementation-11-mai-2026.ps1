# Script PowerShell: Test mise à jour Feuille de couverture Implementation
# Date: 11 Mai 2026
# Objectif: Exécuter le script Python de mise à jour

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST - Feuille de couverture Implementation" -ForegroundColor Cyan
Write-Host "E-revision - PLANIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERREUR: Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "Python trouvé: $($pythonCmd.Source)" -ForegroundColor Green
Write-Host ""

# Chemin du script Python
$scriptPath = "Doc menu demarrer/Scripts/update_feuille_couverture_implementation_e_revision.py"

# Vérifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERREUR: Script Python non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}
Write-Host "Script Python trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "Exécution du script de mise à jour..." -ForegroundColor Yellow
Write-Host ""

python $scriptPath

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCÈS - Mise à jour terminée" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Relancer l'application: npm run dev" -ForegroundColor White
    Write-Host "2. Ouvrir le menu Démarrer" -ForegroundColor White
    Write-Host "3. Naviguer: E-revision > PLANIFICATION > Feuille de couverture Implementation" -ForegroundColor White
    Write-Host "4. Tester les modes Normal et Demo" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERREUR - La mise à jour a échoué" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consultez les messages d'erreur ci-dessus" -ForegroundColor Yellow
    Write-Host ""
}

exit $exitCode
