# Script PowerShell pour executer la suppression des tests AA02, AA03, AA04 - Tresorerie
# E-revision - Programme de controle
# Date: 16 Mai 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "SUPPRESSION DES TESTS AA02, AA03, AA04 - SECTION TRESORERIE" -ForegroundColor Yellow
Write-Host "E-revision - Programme de controle" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que Python est installe
Write-Host "Verification de Python..." -ForegroundColor Cyan
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "Erreur: Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Python trouve: $($pythonCmd.Source)" -ForegroundColor Green
Write-Host ""

# Verifier que le script Python existe
$scriptPath = "Doc menu demarrer/Scripts/remove_tresorerie_tests_aa02_aa03_aa04_e_revision.py"
if (-not (Test-Path $scriptPath)) {
    Write-Host "Erreur: Script Python non trouve: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Script Python trouve: $scriptPath" -ForegroundColor Green
Write-Host ""

# Verifier que le fichier cible existe
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (-not (Test-Path $targetFile)) {
    Write-Host "Erreur: Fichier cible non trouve: $targetFile" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier cible trouve: $targetFile" -ForegroundColor Green
Write-Host ""

# Creer une sauvegarde
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = "$targetFile.backup_tresorerie_$timestamp"
Write-Host "Creation d'une sauvegarde..." -ForegroundColor Cyan
Copy-Item $targetFile $backupFile
Write-Host "Sauvegarde creee: $backupFile" -ForegroundColor Green
Write-Host ""

# Executer le script Python
Write-Host "Execution du script de suppression..." -ForegroundColor Cyan
Write-Host ""
python $scriptPath

# Verifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "SUPPRESSION REUSSIE" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Fichiers crees/modifies:" -ForegroundColor Cyan
    Write-Host "  - $targetFile (modifie)" -ForegroundColor White
    Write-Host "  - $backupFile (sauvegarde)" -ForegroundColor White
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "  1. Verifier les modifications dans DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "  2. Tester l'application" -ForegroundColor White
    Write-Host "  3. Si OK, commit les changements" -ForegroundColor White
    Write-Host "  4. Si probleme, restaurer depuis la sauvegarde" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "ECHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour restaurer la sauvegarde:" -ForegroundColor Yellow
    Write-Host "  Fichier de sauvegarde: $backupFile" -ForegroundColor White
    exit 1
}
