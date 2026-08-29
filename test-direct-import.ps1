################################################################################
# TEST DIRECT DE L'IMPORT D'UNE BALANCE
# Ce script teste directement l'import sans passer par le frontend
################################################################################

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🔍 TEST DIRECT DE L'IMPORT D'UNE BALANCE" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script va tester l'import d'une balance directement en Python" -ForegroundColor Yellow
Write-Host "pour identifier rapidement l'erreur 'failed to fetch'." -ForegroundColor Yellow
Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "py_backend\P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "❌ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✅ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
Write-Host ""

# Exécuter le test
Write-Host "Exécution du test..." -ForegroundColor Yellow
Write-Host ""

cd py_backend
conda run -n claraverse_backend python test_direct_import.py
$exitCode = $LASTEXITCODE
cd ..

Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "✅ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le traitement de la balance fonctionne correctement." -ForegroundColor Green
    Write-Host "L'erreur 'failed to fetch' vient probablement d'un autre module." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "PROCHAINE ÉTAPE:" -ForegroundColor Cyan
    Write-Host "Collecter les logs du backend lors de l'import via le frontend:" -ForegroundColor White
    Write-Host ""
    Write-Host "  1. Ouvrir une nouvelle fenêtre PowerShell" -ForegroundColor White
    Write-Host "  2. Exécuter:" -ForegroundColor White
    Write-Host "     `$jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json" -ForegroundColor Gray
    Write-Host "     Receive-Job -Id `$jobs.Backend -Keep | Select-Object -Last 100" -ForegroundColor Gray
    Write-Host "  3. Importer la balance dans le navigateur" -ForegroundColor White
    Write-Host "  4. Observer les logs d'erreur" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "❌ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "L'erreur ci-dessus montre le problème exact." -ForegroundColor Yellow
    Write-Host "Fournir le message d'erreur complet pour correction." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
