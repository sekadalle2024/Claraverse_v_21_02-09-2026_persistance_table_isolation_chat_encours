# Script de test pour l'ajout de la section Template dans la Bibliothèque

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST AJOUT SECTION TEMPLATE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est disponible
Write-Host "1. Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Python non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Créer une sauvegarde du fichier
Write-Host "2. Création d'une sauvegarde..." -ForegroundColor Yellow
$sourceFile = "src/components/Clara_Components/DemarrerMenu.tsx"
$backupFile = "src/components/Clara_Components/DemarrerMenu_backup_template_$(Get-Date -Format 'yyyyMMdd_HHmmss').tsx"

if (Test-Path $sourceFile) {
    Copy-Item $sourceFile $backupFile
    Write-Host "   ✓ Sauvegarde créée: $backupFile" -ForegroundColor Green
} else {
    Write-Host "   ✗ Fichier source non trouvé: $sourceFile" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Exécuter le script Python
Write-Host "3. Exécution du script d'ajout..." -ForegroundColor Yellow
Write-Host ""
python "Doc menu demarrer/Scripts/add_template_bibliotheque.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SUCCÈS - Section Template ajoutée" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Templates ajoutés dans la Bibliothèque:" -ForegroundColor Cyan
    Write-Host "  1. Template table unicolonne et ligne" -ForegroundColor White
    Write-Host "  2. Template table simple" -ForegroundColor White
    Write-Host "  3. Template table etape de mission" -ForegroundColor White
    Write-Host "  4. Template table feuille couverture et test audit" -ForegroundColor White
    Write-Host "  5. Template table Frap" -ForegroundColor White
    Write-Host "  6. Template table synthèses des frap" -ForegroundColor White
    Write-Host "  7. Template table rapport provisoire" -ForegroundColor White
    Write-Host "  8. Template table rapport final" -ForegroundColor White
    Write-Host "  9. Template table suivi des recos" -ForegroundColor White
    Write-Host ""
    Write-Host "Sauvegarde disponible: $backupFile" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ÉCHEC - Erreur lors de l'ajout" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "La sauvegarde est disponible: $backupFile" -ForegroundColor Yellow
    Write-Host "Pour restaurer: Copy-Item '$backupFile' '$sourceFile' -Force" -ForegroundColor Yellow
}

Write-Host ""
