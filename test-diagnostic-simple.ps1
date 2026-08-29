# Script PowerShell simplifié pour tester l'export de la liasse
# Date: 06 Avril 2026

Write-Host "=" -ForegroundColor Cyan
Write-Host "TEST DIAGNOSTIC SIMPLE - EXPORT LIASSE" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-Host "Erreur: Le dossier py_backend n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

Write-Host "Exécution du diagnostic..." -ForegroundColor Yellow
Write-Host ""

# Aller dans le dossier py_backend
cd py_backend

# Exécuter le script de diagnostic avec Python (sans conda)
python diagnostic_export_liasse_complet.py

# Retourner à la racine
cd ..

Write-Host ""
Write-Host "=" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC TERMINÉ" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier de test a été créé
if (Test-Path "py_backend/test_export_diagnostic.xlsx") {
    Write-Host "Fichier de test créé: py_backend/test_export_diagnostic.xlsx" -ForegroundColor Green
    Write-Host "Vous pouvez l'ouvrir pour vérifier les valeurs écrites" -ForegroundColor Green
} else {
    Write-Host "Aucun fichier de test créé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
