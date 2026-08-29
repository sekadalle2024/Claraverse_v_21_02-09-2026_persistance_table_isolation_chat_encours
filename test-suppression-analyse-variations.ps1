# Script PowerShell pour tester la suppression de la section "Analyse des variations"
# E-revision - Revue analytique
# Date: 17 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "  SUPPRESSION SECTION 'ANALYSE DES VARIATIONS' - E-REVISION" -ForegroundColor Yellow
Write-Host "  Revue analytique" -ForegroundColor Yellow
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
Write-Host ""
Write-Host "🔍 Vérification du fichier cible..." -ForegroundColor Cyan
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (Test-Path $targetFile) {
    Write-Host "✅ Fichier trouvé: $targetFile" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}

# Vérifier que le script Python existe
Write-Host ""
Write-Host "🔍 Vérification du script Python..." -ForegroundColor Cyan
$scriptPath = "Doc menu demarrer/Scripts/remove_analyse_variations_e_revision.py"
if (Test-Path $scriptPath) {
    Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
} else {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

# Afficher les informations sur la suppression
Write-Host ""
Write-Host "📋 INFORMATIONS SUR LA SUPPRESSION" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""
Write-Host "Section à supprimer:" -ForegroundColor White
Write-Host "  • Analyse des variations" -ForegroundColor Cyan
Write-Host ""
Write-Host "Modes supprimés:" -ForegroundColor White
Write-Host "  1. Mode Normal" -ForegroundColor Cyan
Write-Host "  2. Mode Avancé" -ForegroundColor Cyan
Write-Host "  3. Mode Methodo revision" -ForegroundColor Cyan
Write-Host "  4. Mode Guide des commandes" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION: Cette action va modifier le fichier DemarrerMenu.tsx" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer? (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée par l'utilisateur" -ForegroundColor Red
    exit 0
}

# Créer une sauvegarde
Write-Host ""
Write-Host "💾 Création d'une sauvegarde..." -ForegroundColor Cyan
$backupFile = "$targetFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $targetFile $backupFile
Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green

# Exécuter le script Python
Write-Host ""
Write-Host "🚀 Exécution du script de suppression..." -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

python $scriptPath

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ SUPPRESSION RÉUSSIE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "  2. Tester l'application (npm run dev)" -ForegroundColor White
    Write-Host "  3. Vérifier que le menu E-revision fonctionne" -ForegroundColor White
    Write-Host "  4. Commit les changements si tout est OK" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Sauvegarde disponible: $backupFile" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ÉCHEC DE LA SUPPRESSION" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✅ Fichier restauré depuis: $backupFile" -ForegroundColor Green
    Write-Host ""
    exit 1
}

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""
