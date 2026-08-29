# Script de sauvegarde GitHub - Correction Timeout ClaraAPI
# Date: 15 avril 2026

Write-Host "Sauvegarde GitHub - Correction Timeout ClaraAPI" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verification du statut Git
Write-Host "1. Verification du statut Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Ajout des fichiers modifies..." -ForegroundColor Yellow

# Ajouter le fichier modifie
git add src/services/claraApiService.ts

# Ajouter la documentation
git add 00_LIRE_EN_PREMIER_TIMEOUT.txt
git add 00_INDEX_CORRECTION_TIMEOUT_15_AVRIL_2026.md
git add 00_SOLUTION_TIMEOUT_CLARAAPI_15_AVRIL_2026.txt
git add SYNTHESE_VISUELLE_TIMEOUT_15_AVRIL_2026.txt
git add QUICK_TEST_TIMEOUT_CLARAAPI.txt
git add COMMANDES_RAPIDES_TIMEOUT.txt
git add LISTE_FICHIERS_TIMEOUT_15_AVRIL_2026.md
git add COMMIT_MESSAGE_TIMEOUT_15_AVRIL_2026.txt
git add test-timeout-simple.ps1
git add 00_MISSION_ACCOMPLIE_TIMEOUT_15_AVRIL_2026.txt
git add 00_SYNTHESE_FINALE_TIMEOUT_15_AVRIL_2026.txt
git add push-timeout-github.ps1

Write-Host "   OK: Fichiers ajoutes" -ForegroundColor Green

Write-Host ""
Write-Host "3. Creation du commit..." -ForegroundColor Yellow

$commitMessage = @"
feat: Configuration timeout 3 minutes et notification systeme avec WhatsApp

- Timeout reduit de 10 minutes a 3 minutes
- Message de notification en francais
- Numero WhatsApp editeur: +225 05 44 13 07 98
- Tableau d'informations techniques

Fichier modifie:
- src/services/claraApiService.ts (lignes 330, 2078-2095)

Documentation complete creee (11 fichiers)
Tests automatises passes avec succes
"@

git commit -m $commitMessage

Write-Host "   OK: Commit cree" -ForegroundColor Green

Write-Host ""
Write-Host "4. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   Commande: git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Voulez-vous pusher maintenant? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    git push origin main
    Write-Host "   OK: Push effectue" -ForegroundColor Green
} else {
    Write-Host "   Push annule. Vous pouvez le faire manuellement avec:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Sauvegarde terminee" -ForegroundColor Green
Write-Host ""
