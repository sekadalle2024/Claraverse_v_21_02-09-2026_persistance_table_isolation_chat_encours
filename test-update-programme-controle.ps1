#!/usr/bin/env pwsh
# Script PowerShell pour mettre à jour le Programme de contrôle des comptes
# Date: 31 Mars 2026

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  MISE À JOUR PROGRAMME DE CONTRÔLE DES COMPTES - E-REVISION" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "   Veuillez installer Python depuis https://www.python.org/" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version 2>&1
Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier DemarrerMenu.tsx existe
Write-Host "🔍 Vérification du fichier DemarrerMenu.tsx..." -ForegroundColor Yellow
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (-not (Test-Path $targetFile)) {
    Write-Host "❌ Fichier non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichier trouvé" -ForegroundColor Green
Write-Host ""

# Créer une sauvegarde
Write-Host "💾 Création d'une sauvegarde..." -ForegroundColor Yellow
$backupFile = "$targetFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $targetFile $backupFile
Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "🚀 Exécution du script de mise à jour..." -ForegroundColor Yellow
Write-Host ""
$scriptPath = "Doc menu demarrer/Scripts/update_programme_controle_cycles.py"

python $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  ✅ MISE À JOUR RÉUSSIE" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier la compilation:" -ForegroundColor White
    Write-Host "      npm run build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Tester l'interface:" -ForegroundColor White
    Write-Host "      - Ouvrir E-revision" -ForegroundColor Gray
    Write-Host "      - Aller à 'Programme de contrôle des comptes'" -ForegroundColor Gray
    Write-Host "      - Vérifier les 8 cycles opérationnels" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Restaurer si nécessaire:" -ForegroundColor White
    Write-Host "      Copy-Item '$backupFile' '$targetFile' -Force" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Red
    Write-Host "  ❌ ÉCHEC DE LA MISE À JOUR" -ForegroundColor Red
    Write-Host "======================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✅ Fichier restauré" -ForegroundColor Green
    Write-Host ""
    exit 1
}
