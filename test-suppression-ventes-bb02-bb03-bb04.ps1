# Script de test pour la suppression des tests BB02, BB03, BB04 - Section Ventes E-revision
# Date: 16 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST SUPPRESSION TESTS BB02, BB03, BB04 - SECTION VENTES E-REVISION" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le fichier DemarrerMenu.tsx existe
Write-Host "Vérification du fichier DemarrerMenu.tsx..." -ForegroundColor Cyan
$demarrerMenuPath = "src/components/Clara_Components/DemarrerMenu.tsx"
if (Test-Path $demarrerMenuPath) {
    Write-Host "✅ Fichier trouvé: $demarrerMenuPath" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier non trouvé: $demarrerMenuPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le script Python existe
Write-Host "Vérification du script Python..." -ForegroundColor Cyan
$scriptPath = "Doc menu demarrer/Scripts/remove_ventes_tests_bb02_bb03_bb04_e_revision.py"
if (Test-Path $scriptPath) {
    Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
} else {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Compter les occurrences AVANT suppression
Write-Host "Analyse du fichier AVANT suppression..." -ForegroundColor Cyan
$content = Get-Content $demarrerMenuPath -Raw

$countBB02Feuilles = ([regex]::Matches($content, "ventes-bb02[^-]")).Count
$countBB02Travaux = ([regex]::Matches($content, "ventes-bb02-travaux")).Count
$countBB03 = ([regex]::Matches($content, "ventes-bb03")).Count
$countBB04 = ([regex]::Matches($content, "ventes-bb04")).Count

Write-Host "📊 Tests trouvés AVANT suppression:" -ForegroundColor Yellow
Write-Host "   - ventes-bb02 (Feuilles maîtresses): $countBB02Feuilles" -ForegroundColor White
Write-Host "   - ventes-bb02-travaux (Travaux analytiques): $countBB02Travaux" -ForegroundColor White
Write-Host "   - ventes-bb03 (Revue CI): $countBB03" -ForegroundColor White
Write-Host "   - ventes-bb04 (Revue techniques): $countBB04" -ForegroundColor White

Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION: Cette opération va modifier le fichier DemarrerMenu.tsx" -ForegroundColor Yellow
Write-Host "   Les tests BB02, BB03, BB04 de la section Ventes seront supprimés" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Opération annulée par l'utilisateur" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Créer une sauvegarde
Write-Host "Création d'une sauvegarde..." -ForegroundColor Cyan
$backupPath = "$demarrerMenuPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $demarrerMenuPath $backupPath
Write-Host "✅ Sauvegarde créée: $backupPath" -ForegroundColor Green

Write-Host ""

# Exécuter le script Python
Write-Host "Exécution du script de suppression..." -ForegroundColor Cyan
Write-Host ""
python $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script exécuté avec succès" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution du script" -ForegroundColor Red
    Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupPath $demarrerMenuPath -Force
    Write-Host "   ✅ Fichier restauré" -ForegroundColor Green
    exit 1
}

Write-Host ""

# Vérifier les résultats APRÈS suppression
Write-Host "Vérification des résultats APRÈS suppression..." -ForegroundColor Cyan
$contentAfter = Get-Content $demarrerMenuPath -Raw

$countBB02FeuillesAfter = ([regex]::Matches($contentAfter, "ventes-bb02[^-]")).Count
$countBB02TravauxAfter = ([regex]::Matches($contentAfter, "ventes-bb02-travaux")).Count
$countBB03After = ([regex]::Matches($contentAfter, "ventes-bb03")).Count
$countBB04After = ([regex]::Matches($contentAfter, "ventes-bb04")).Count

Write-Host "📊 Tests trouvés APRÈS suppression:" -ForegroundColor Yellow
Write-Host "   - ventes-bb02 (Feuilles maîtresses): $countBB02FeuillesAfter" -ForegroundColor White
Write-Host "   - ventes-bb02-travaux (Travaux analytiques): $countBB02TravauxAfter" -ForegroundColor White
Write-Host "   - ventes-bb03 (Revue CI): $countBB03After" -ForegroundColor White
Write-Host "   - ventes-bb04 (Revue techniques): $countBB04After" -ForegroundColor White

Write-Host ""

# Vérifier que les suppressions ont bien eu lieu
$success = $true

if ($countBB02FeuillesAfter -ne 0) {
    Write-Host "❌ ERREUR: ventes-bb02 (Feuilles maîtresses) n'a pas été supprimé" -ForegroundColor Red
    $success = $false
}

if ($countBB02TravauxAfter -ne 0) {
    Write-Host "❌ ERREUR: ventes-bb02-travaux n'a pas été supprimé" -ForegroundColor Red
    $success = $false
}

if ($countBB03After -ne 0) {
    Write-Host "❌ ERREUR: ventes-bb03 n'a pas été supprimé" -ForegroundColor Red
    $success = $false
}

if ($countBB04After -ne 0) {
    Write-Host "❌ ERREUR: ventes-bb04 n'a pas été supprimé" -ForegroundColor Red
    $success = $false
}

if ($success) {
    Write-Host "✅ TOUS LES TESTS ONT ÉTÉ SUPPRIMÉS AVEC SUCCÈS" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "   2. Tester l'application" -ForegroundColor White
    Write-Host "   3. Commit les changements" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Sauvegarde disponible: $backupPath" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ ÉCHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupPath $demarrerMenuPath -Force
    Write-Host "   ✅ Fichier restauré" -ForegroundColor Green
    exit 1
}

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST TERMINÉ" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
