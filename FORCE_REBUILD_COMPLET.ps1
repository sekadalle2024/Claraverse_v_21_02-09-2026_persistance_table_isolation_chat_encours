# ═══════════════════════════════════════════════════════════════════════════
# 🔧 FORCE REBUILD COMPLET - Désactivation Restauration
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 FORCE REBUILD COMPLET - Désactivation Restauration" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Tuer tous les processus Node
Write-Host "🛑 Étape 1/6: Arrêt processus Node..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
if ($?) {
    Write-Host "   ✅ Node arrêté" -ForegroundColor Green
} else {
Write-Host "   i  Aucun processus Node actif" -ForegroundColor Gray
}
Start-Sleep -Seconds 1

# Étape 2: Supprimer TOUS les caches
Write-Host ""
Write-Host "🗑️  Étape 2/6: Suppression caches complets..." -ForegroundColor Yellow

$cachePaths = @(
    "dist",
    ".vite",
    "node_modules\.vite",
    "node_modules\.cache",
    ".cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Write-Host "   🗑️  Suppression: $path" -ForegroundColor Gray
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ $path supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ⏭️  $path n'existe pas" -ForegroundColor Gray
    }
}
Start-Sleep -Seconds 1

# Étape 3: Vérifier source contient désactivation
Write-Host ""
Write-Host "🔍 Étape 3/6: Vérification code source..." -ForegroundColor Yellow

$sourceFile = "src\services\flowiseTableBridge.ts"
$sourceContent = Get-Content $sourceFile -Raw

if ($sourceContent -match "🚫 \[DISABLED\] Skipping restoration") {
    Write-Host "   ✅ Désactivation PRÉSENTE dans source" -ForegroundColor Green
} else {
    Write-Host "   ❌ ERREUR: Désactivation ABSENTE du source!" -ForegroundColor Red
    Write-Host "   ⚠️  Vérifiez ligne 1382 de flowiseTableBridge.ts" -ForegroundColor Yellow
    exit 1
}
Start-Sleep -Seconds 1

# Étape 4: Build avec force
Write-Host ""
Write-Host "🔨 Étape 4/6: Build FORCÉ (peut prendre 1-2 min)..." -ForegroundColor Yellow
npm run build -- --force
if (-not $?) {
    Write-Host "   ❌ Build échoué!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Build terminé" -ForegroundColor Green
Start-Sleep -Seconds 1

# Étape 5: Vérifier dist contient désactivation
Write-Host ""
Write-Host "🔍 Étape 5/6: Vérification build compilé..." -ForegroundColor Yellow

$distFiles = Get-ChildItem "dist\assets\*.js" -File
$foundDisable = $false

foreach ($file in $distFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "DISABLED.*Skipping restoration") {
        $foundDisable = $true
        Write-Host "   ✅ Désactivation trouvée dans: $($file.Name)" -ForegroundColor Green
        break
    }
}

if (-not $foundDisable) {
    Write-Host "   ❌ DÉSACTIVATION ABSENTE DU BUILD!" -ForegroundColor Red
    Write-Host "   ⚠️  Le build n'a pas pris en compte flowiseTableBridge.ts" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   💡 Solutions:" -ForegroundColor Cyan
    Write-Host "      1. Vérifier imports de flowiseTableBridge.ts" -ForegroundColor Gray
    Write-Host "      2. Vérifier vite.config.ts exclut pas src/services" -ForegroundColor Gray
    exit 1
} else {
    Write-Host "   ✅ Build contient bien la désactivation" -ForegroundColor Green
}
Start-Sleep -Seconds 1

# Étape 6: Lancer serveur dev
Write-Host ""
Write-Host "🚀 Étape 6/6: Lancement serveur dev..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ REBUILD COMPLET TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "   1. Le serveur va démarrer automatiquement" -ForegroundColor Gray
Write-Host "   2. Attendre 'Local: http://localhost:5173'" -ForegroundColor Gray
Write-Host "   3. Ouvrir navigateur" -ForegroundColor Gray
Write-Host "   4. Cliquer '🗑️ Clean' pour nettoyer DB" -ForegroundColor Gray
Write-Host "   5. Générer 1 table et cliquer '🔬 Contam'" -ForegroundColor Gray
Write-Host "   6. Ouvrir 2ème chat et vérifier contamination" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 LOGS A SURVEILLER:" -ForegroundColor Cyan
Write-Host "   - [DISABLED] Skipping restoration -> Desactivation active" -ForegroundColor Gray
Write-Host "   - [React] SessionId: xxx -> Isolation active" -ForegroundColor Gray
Write-Host ""

npm run dev
