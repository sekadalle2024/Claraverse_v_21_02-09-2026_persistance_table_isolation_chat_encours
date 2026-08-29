# Script de commit pour l'integration frontend ACTIF
# Date: 07 Avril 2026

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMMIT INTEGRATION ACTIF FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que nous sommes dans un repo git
if (-not (Test-Path ".git")) {
    Write-Host "ERREUR: Pas dans un repo git" -ForegroundColor Red
    exit 1
}

# Afficher le statut
Write-Host "Statut actuel:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Lister les fichiers modifies/crees
Write-Host "Fichiers a commiter:" -ForegroundColor Yellow
Write-Host ""
Write-Host "MODIFIES:" -ForegroundColor Green
Write-Host "  - public/menu.js" -ForegroundColor White
Write-Host ""
Write-Host "CREES:" -ForegroundColor Green
Write-Host "  - test-integration-actif-simple.ps1" -ForegroundColor White
Write-Host "  - START_HERE_SOLUTION_ACTIF.txt" -ForegroundColor White
Write-Host "  - 00_LIRE_MAINTENANT_SOLUTION_ACTIF_07_AVRIL_2026.txt" -ForegroundColor White
Write-Host "  - SYNTHESE_VISUELLE_SOLUTION_ACTIF_07_AVRIL_2026.md" -ForegroundColor White
Write-Host "  - 00_SOLUTION_INTEGRATION_ACTIF_FRONTEND_07_AVRIL_2026.txt" -ForegroundColor White
Write-Host "  - Doc_Etat_Fin/Doc Bilan Actif/00_INDEX_SOLUTION_COMPLETE_07_AVRIL_2026.md" -ForegroundColor White
Write-Host "  - 00_MISSION_ACCOMPLIE_INTEGRATION_FRONTEND_07_AVRIL_2026.txt" -ForegroundColor White
Write-Host "  - COMMIT_MESSAGE_INTEGRATION_ACTIF_FRONTEND.txt" -ForegroundColor White
Write-Host "  - commit-integration-actif-frontend.ps1" -ForegroundColor White
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous commiter ces fichiers? (o/n)"
if ($confirmation -ne "o") {
    Write-Host "Commit annule" -ForegroundColor Yellow
    exit 0
}

# Ajouter les fichiers
Write-Host ""
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add public/menu.js
git add test-integration-actif-simple.ps1
git add START_HERE_SOLUTION_ACTIF.txt
git add 00_LIRE_MAINTENANT_SOLUTION_ACTIF_07_AVRIL_2026.txt
git add SYNTHESE_VISUELLE_SOLUTION_ACTIF_07_AVRIL_2026.md
git add 00_SOLUTION_INTEGRATION_ACTIF_FRONTEND_07_AVRIL_2026.txt
git add "Doc_Etat_Fin/Doc Bilan Actif/00_INDEX_SOLUTION_COMPLETE_07_AVRIL_2026.md"
git add 00_MISSION_ACCOMPLIE_INTEGRATION_FRONTEND_07_AVRIL_2026.txt
git add COMMIT_MESSAGE_INTEGRATION_ACTIF_FRONTEND.txt
git add commit-integration-actif-frontend.ps1

# Lire le message de commit
$commitMessage = Get-Content "COMMIT_MESSAGE_INTEGRATION_ACTIF_FRONTEND.txt" -Raw

# Commiter
Write-Host ""
Write-Host "Commit en cours..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "COMMIT REUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "1. Verifier le commit: git log -1" -ForegroundColor White
    Write-Host "2. Pousser vers GitHub: git push" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERREUR LORS DU COMMIT" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}
