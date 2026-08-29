# Script PowerShell pour tester la suppression des tests CC02, CC03, CC04 de la section Stock
# E-revision - Programme de contrôle
# Date: 16 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "SUPPRESSION DES TESTS CC02, CC03, CC04 - SECTION STOCK" -ForegroundColor Yellow
Write-Host "E-revision - Programme de contrôle" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier DemarrerMenu.tsx existe
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (-not (Test-Path $targetFile)) {
    Write-Host "❌ Fichier non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichier cible trouvé: $targetFile" -ForegroundColor Green

# Vérifier que le script Python existe
$scriptPath = "Doc menu demarrer/Scripts/remove_stock_tests_cc02_cc03_cc04_e_revision.py"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script Python non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Script Python trouvé: $scriptPath" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Tests à supprimer:" -ForegroundColor Cyan
Write-Host "   1. CC02 - Feuilles maîtresses-STOCKS (avec tous les modes)" -ForegroundColor White
Write-Host "   2. CC02 - Travaux analytiques -Stocks (avec tous les modes)" -ForegroundColor White
Write-Host "   3. CC03 - Revue du Contrôle interne (avec tous les modes)" -ForegroundColor White
Write-Host "   4. CC04 - Revue des techniques comptables (avec tous les modes)" -ForegroundColor White
Write-Host ""

# Demander confirmation
Write-Host "⚠️  Cette opération va modifier le fichier DemarrerMenu.tsx" -ForegroundColor Yellow
Write-Host "   Une sauvegarde sera créée automatiquement" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Opération annulée par l'utilisateur" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Exécution du script Python..." -ForegroundColor Cyan
Write-Host ""

# Exécuter le script Python
python $scriptPath

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host "✅ SUPPRESSION TERMINÉE AVEC SUCCÈS" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "   2. Tester l'application (npm run dev)" -ForegroundColor White
    Write-Host "   3. Commit les changements si tout fonctionne" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Commandes de vérification:" -ForegroundColor Cyan
    Write-Host "   # Vérifier que les tests ont été supprimés" -ForegroundColor Gray
    Write-Host "   Select-String -Path '$targetFile' -Pattern 'stocks-cc02|stocks-cc03|stocks-cc04'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   # Compter les occurrences restantes (devrait être 0)" -ForegroundColor Gray
    Write-Host "   (Select-String -Path '$targetFile' -Pattern 'stocks-cc0[234]').Count" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host "❌ ÉCHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Vérifiez les messages d'erreur ci-dessus" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
