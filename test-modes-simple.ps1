#!/usr/bin/env pwsh
# Test simple des modes Document et Database

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST RAPIDE - MODES DOCUMENT ET DATABASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$filepath = "src/components/Clara_Components/DemarrerMenu.tsx"

if (-not (Test-Path $filepath)) {
    Write-Host "❌ Fichier non trouvé : $filepath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Fichier trouvé" -ForegroundColor Green
Write-Host ""

# Compter les modes
$documentCount = (Select-String -Path $filepath -Pattern "label: 'Mode Document'").Count
$databaseCount = (Select-String -Path $filepath -Pattern "label: 'Mode Database'").Count
$routerDocCount = (Select-String -Path $filepath -Pattern "\[Router\] = Document").Count
$routerDbCount = (Select-String -Path $filepath -Pattern "\[Router\] = Database").Count

Write-Host "RÉSULTATS :" -ForegroundColor Yellow
Write-Host "  Modes 'Mode Document'      : $documentCount" -ForegroundColor White
Write-Host "  Modes 'Mode Database'      : $databaseCount" -ForegroundColor White
Write-Host "  Variables [Router] = Document  : $routerDocCount" -ForegroundColor White
Write-Host "  Variables [Router] = Database  : $routerDbCount" -ForegroundColor White
Write-Host ""

if (($documentCount -eq 5) -and ($databaseCount -eq 5)) {
    Write-Host "✓ SUCCÈS : Tous les modes ont été ajoutés correctement !" -ForegroundColor Green
} else {
    Write-Host "⚠ ATTENTION : Nombre de modes inattendu" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
