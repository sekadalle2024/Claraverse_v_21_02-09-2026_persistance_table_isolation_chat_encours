# Script PowerShell pour tester la suppression des tests Personnel
# E-revision - Programme de contrôle
# Date: 16 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST SUPPRESSION TESTS PERSONNEL - E-REVISION" -ForegroundColor Yellow
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

$pythonVersion = python --version
Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier DemarrerMenu.tsx existe
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
Write-Host "🔍 Vérification du fichier cible..." -ForegroundColor Cyan
if (-not (Test-Path $targetFile)) {
    Write-Host "❌ Fichier non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichier trouvé: $targetFile" -ForegroundColor Green
Write-Host ""

# Créer une sauvegarde
$backupFile = "$targetFile.backup_personnel_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "💾 Création d'une sauvegarde..." -ForegroundColor Cyan
Copy-Item $targetFile $backupFile
Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
$scriptPath = "Doc menu demarrer/Scripts/remove_personnel_tests_nn02_nn03_nn04_fp02_fp03_fp04_fp145_e_revision.py"
Write-Host "🚀 Exécution du script de suppression..." -ForegroundColor Cyan
Write-Host ""

python $scriptPath

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host "✅ SUPPRESSION RÉUSSIE" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Fichiers créés:" -ForegroundColor Cyan
    Write-Host "   - Sauvegarde: $backupFile" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier les modifications dans DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "   2. Tester l'application (npm run dev)" -ForegroundColor White
    Write-Host "   3. Si OK, commit les changements" -ForegroundColor White
    Write-Host "   4. Si problème, restaurer: Copy-Item '$backupFile' '$targetFile'" -ForegroundColor White
} else {
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host "❌ ÉCHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✅ Fichier restauré" -ForegroundColor Green
}

Write-Host ""
exit $exitCode
