# Script de test pour la suppression des tests NN02, NN03 - Section impôt et taxes
# E-revision - Programme de contrôle
# Date: 16 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST SUPPRESSION TESTS NN02, NN03 - SECTION IMPÔT ET TAXES" -ForegroundColor Yellow
Write-Host "E-revision - Programme de contrôle" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Cyan
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python trouvé: $($pythonCmd.Source)" -ForegroundColor Green
Write-Host ""

# Vérifier que le script Python existe
$scriptPath = "Doc menu demarrer/Scripts/remove_impot_taxes_tests_nn02_nn03_e_revision.py"
Write-Host "🔍 Vérification du script Python..." -ForegroundColor Cyan
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier DemarrerMenu.tsx existe
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
Write-Host "🔍 Vérification du fichier cible..." -ForegroundColor Cyan
if (-not (Test-Path $targetFile)) {
    Write-Host "❌ Fichier cible non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichier cible trouvé: $targetFile" -ForegroundColor Green
Write-Host ""

# Créer une sauvegarde
$backupFile = "$targetFile.backup_impot_taxes_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "💾 Création d'une sauvegarde..." -ForegroundColor Cyan
Copy-Item $targetFile $backupFile
Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "🚀 Exécution du script de suppression..." -ForegroundColor Cyan
Write-Host ""
python $scriptPath

# Vérifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host "✅ SUPPRESSION RÉUSSIE" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Fichiers créés/modifiés:" -ForegroundColor Cyan
    Write-Host "   - $targetFile (modifié)" -ForegroundColor White
    Write-Host "   - $backupFile (sauvegarde)" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier les modifications dans DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "   2. Tester l'application" -ForegroundColor White
    Write-Host "   3. Si OK, supprimer la sauvegarde: Remove-Item '$backupFile'" -ForegroundColor White
    Write-Host "   4. Si problème, restaurer: Copy-Item '$backupFile' '$targetFile' -Force" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host "❌ ÉCHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✅ Fichier restauré" -ForegroundColor Green
    exit 1
}
