# Script de test de detection de la table X-Ref
# Date: 28 avril 2026

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  TEST DETECTION TABLE X-REF DOCUMENTAIRE" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$testFile = "test-detection-xref-table.html"

if (Test-Path $testFile) {
    Write-Host "OK Fichier de test trouve: $testFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ouverture dans le navigateur..." -ForegroundColor Cyan
    Start-Process $testFile
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host "  INSTRUCTIONS" -ForegroundColor Yellow
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Le fichier de test s'ouvre dans votre navigateur" -ForegroundColor White
    Write-Host "2. Les tests s'executent automatiquement" -ForegroundColor White
    Write-Host "3. Verifiez les resultats affiches" -ForegroundColor White
    Write-Host ""
    Write-Host "BOUTONS DISPONIBLES:" -ForegroundColor Yellow
    Write-Host "  Tester Detection      - Verifie la structure de la table" -ForegroundColor White
    Write-Host "  Tester Index Colonnes - Affiche les index des colonnes" -ForegroundColor White
    Write-Host "  Tester Donnees Ligne  - Extrait les donnees de chaque ligne" -ForegroundColor White
    Write-Host "  Effacer Resultats     - Nettoie l'affichage" -ForegroundColor White
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Cyan
} else {
    Write-Host "ERREUR Fichier de test non trouve: $testFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez creer le fichier de test d'abord." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
