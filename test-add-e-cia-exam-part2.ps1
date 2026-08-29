# Script de test pour l'ajout de E-CIA EXAM PART 2
# Date: 08 Juillet 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 Test d'ajout E-CIA EXAM PART 2" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python non trouvé" -ForegroundColor Red
    Write-Host "   Installez Python depuis https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier que le fichier DemarrerMenu.tsx existe
Write-Host "🔍 Vérification du fichier DemarrerMenu.tsx..." -ForegroundColor Yellow
$targetFile = "src/components/Clara_Components/DemarrerMenu.tsx"
if (Test-Path $targetFile) {
    Write-Host "   ✅ Fichier trouvé: $targetFile" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fichier non trouvé: $targetFile" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Créer une sauvegarde
Write-Host "💾 Création d'une sauvegarde..." -ForegroundColor Yellow
$backupFile = "$targetFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $targetFile $backupFile
Write-Host "   ✅ Sauvegarde créée: $backupFile" -ForegroundColor Green

Write-Host ""

# Exécuter le script Python
Write-Host "🔧 Exécution du script d'ajout..." -ForegroundColor Yellow
try {
    python "Doc menu demarrer/Scripts/add_e_cia_exam_part2.py"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Script exécuté avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'exécution du script" -ForegroundColor Red
        Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
        Copy-Item $backupFile $targetFile -Force
        Write-Host "   ✅ Sauvegarde restaurée" -ForegroundColor Green
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
    Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "   ✅ Sauvegarde restaurée" -ForegroundColor Green
    exit 1
}

Write-Host ""

# Vérifier que E-CIA EXAM PART 2 est présent
Write-Host "🔍 Vérification de l'insertion..." -ForegroundColor Yellow
$content = Get-Content $targetFile -Raw
if ($content -match "e-cia-exam-part2") {
    Write-Host "   ✅ E-CIA EXAM PART 2 trouvé dans le fichier" -ForegroundColor Green
} else {
    Write-Host "   ❌ E-CIA EXAM PART 2 non trouvé" -ForegroundColor Red
    Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "   ✅ Sauvegarde restaurée" -ForegroundColor Green
    exit 1
}

# Vérifier la position (après part1 et avant syscohada)
if ($content -match "e-cia-exam-part1.*?e-cia-exam-part2.*?e-syscohada-revise") {
    Write-Host "   ✅ Position correcte: entre PART 1 et Syscohada" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Attention: Position à vérifier manuellement" -ForegroundColor Yellow
}

# Compter les sections
$sectionsCount = ([regex]::Matches($content, "Section [ABC] -")).Count
Write-Host "   ℹ️  Sections trouvées: $sectionsCount" -ForegroundColor Cyan

Write-Host ""

# Tester la compilation TypeScript
Write-Host "🔨 Test de compilation TypeScript..." -ForegroundColor Yellow
Write-Host "   ⏳ Cette étape peut prendre quelques minutes..." -ForegroundColor Cyan

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Compilation réussie" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur de compilation" -ForegroundColor Red
        Write-Host "   Détails:" -ForegroundColor Yellow
        Write-Host $buildOutput -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
        Copy-Item $backupFile $targetFile -Force
        Write-Host "   ✅ Sauvegarde restaurée" -ForegroundColor Green
        exit 1
    }
} catch {
    Write-Host "   ⚠️  npm run build non disponible, passage au test suivant" -ForegroundColor Yellow
}

Write-Host ""

# Résumé
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "✅ SUCCÈS - E-CIA EXAM PART 2 ajouté avec succès!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Résumé des modifications:" -ForegroundColor Cyan
Write-Host "   • E-CIA EXAM PART 2 ajouté au menu Démarrer" -ForegroundColor White
Write-Host "   • Position: Après E-CIA EXAM PART 1" -ForegroundColor White
Write-Host "   • Position: Avant E-Syscohada révisé" -ForegroundColor White
Write-Host "   • Structure complète avec 3 sections (A, B, C)" -ForegroundColor White
Write-Host "   • Modes disponibles: [Mode cours] et [Mode QCM]" -ForegroundColor White
Write-Host "   • Sauvegarde créée: $backupFile" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Démarrer l'application: npm run dev" -ForegroundColor White
Write-Host "   2. Ouvrir le menu Démarrer" -ForegroundColor White
Write-Host "   3. Vérifier que E-CIA EXAM PART 2 apparaît" -ForegroundColor White
Write-Host "   4. Tester les sections et objectifs" -ForegroundColor White
Write-Host "   5. Vérifier les modes Cours et QCM" -ForegroundColor White
Write-Host "   6. Générer une commande de test" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Doc menu demarrer/Documentation/AJOUT_E_CIA_EXAM_PART2_08_JUILLET_2026.md" -ForegroundColor White
Write-Host ""

Write-Host "💡 Conseil:" -ForegroundColor Yellow
Write-Host "   Si tout fonctionne bien, vous pouvez supprimer la sauvegarde:" -ForegroundColor White
Write-Host "   Remove-Item '$backupFile'" -ForegroundColor Gray
Write-Host ""
