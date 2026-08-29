# Script de test pour la correction des modes Template

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CORRECTION MODES TEMPLATE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer une sauvegarde
Write-Host "1. Création d'une sauvegarde..." -ForegroundColor Yellow
$sourceFile = "src/components/Clara_Components/DemarrerMenu.tsx"
$backupFile = "src/components/Clara_Components/DemarrerMenu_backup_modes_$(Get-Date -Format 'yyyyMMdd_HHmmss').tsx"

if (Test-Path $sourceFile) {
    Copy-Item $sourceFile $backupFile
    Write-Host "   ✓ Sauvegarde créée: $backupFile" -ForegroundColor Green
} else {
    Write-Host "   ✗ Fichier source non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Exécuter le script Python
Write-Host "2. Correction des modes..." -ForegroundColor Yellow
Write-Host ""
python "Doc menu demarrer/Scripts/fix_template_modes.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SUCCÈS - Modes corrigés" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Modes ajoutés pour chaque template:" -ForegroundColor Cyan
    Write-Host "  • Mode Normal" -ForegroundColor White
    Write-Host "  • Mode Guide des commandes" -ForegroundColor White
    Write-Host ""
    Write-Host "Sauvegarde: $backupFile" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ÉCHEC" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restaurer: Copy-Item '$backupFile' '$sourceFile' -Force" -ForegroundColor Yellow
}

Write-Host ""
