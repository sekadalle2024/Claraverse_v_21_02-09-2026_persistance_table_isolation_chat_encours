# Script PowerShell pour tester la suppression des tests Capitaux propres FQ02, FQ03, FQ04
# E-revision - Programme de contrôle
# Date: 16 Mai 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST SUPPRESSION TESTS CAPITAUX PROPRES FQ02, FQ03, FQ04" -ForegroundColor Yellow
Write-Host "E-revision - Programme de controle" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Verification de Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python trouve: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que le script existe
$scriptPath = "Doc menu demarrer/Scripts/remove_capitaux_propres_tests_fq02_fq03_fq04_e_revision.py"
if (-not (Test-Path $scriptPath)) {
    Write-Host "Script non trouve: $scriptPath" -ForegroundColor Red
    exit 1
}
Write-Host "Script trouve: $scriptPath" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier cible existe
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (-not (Test-Path $targetFile)) {
    Write-Host "Fichier cible non trouve: $targetFile" -ForegroundColor Red
    exit 1
}
Write-Host "Fichier cible trouve: $targetFile" -ForegroundColor Green
Write-Host ""

# Créer une sauvegarde
$backupFile = "$targetFile.backup_capitaux_propres_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creation d'une sauvegarde..." -ForegroundColor Cyan
Copy-Item $targetFile $backupFile
Write-Host "Sauvegarde creee: $backupFile" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "Execution du script de suppression..." -ForegroundColor Cyan
Write-Host ""
python $scriptPath

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "SUPPRESSION REUSSIE" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "   1. Verifier les modifications dans: $targetFile" -ForegroundColor White
    Write-Host "   2. Tester l'application E-audit" -ForegroundColor White
    Write-Host "   3. Si OK, supprimer la sauvegarde: $backupFile" -ForegroundColor White
    Write-Host "   4. Commit les changements" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour restaurer la sauvegarde en cas de probleme:" -ForegroundColor Cyan
    Write-Host "   Copy-Item '$backupFile' '$targetFile' -Force" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "ECHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "Fichier restaure" -ForegroundColor Green
    exit 1
}
