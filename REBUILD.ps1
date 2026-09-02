# FORCE REBUILD COMPLET
Write-Host ""
Write-Host "=== FORCE REBUILD COMPLET ===" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Tuer Node
Write-Host "Etape 1/6: Arret processus Node..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 1

# Etape 2: Supprimer caches
Write-Host ""
Write-Host "Etape 2/6: Suppression caches..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "  dist supprime" -ForegroundColor Green
}

if (Test-Path ".vite") {
    Remove-Item -Path ".vite" -Recurse -Force
    Write-Host "  .vite supprime" -ForegroundColor Green
}

if (Test-Path "node_modules\.vite") {
    Remove-Item -Path "node_modules\.vite" -Recurse -Force
    Write-Host "  node_modules\.vite supprime" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "  node_modules\.cache supprime" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# Etape 3: Verifier source
Write-Host ""
Write-Host "Etape 3/6: Verification code source..." -ForegroundColor Yellow

$sourceContent = Get-Content "src\services\flowiseTableBridge.ts" -Raw

if ($sourceContent -match "DISABLED.*Skipping restoration") {
    Write-Host "  OK: Desactivation presente dans source" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Desactivation absente du source!" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Etape 4: Build normal (cache deja supprime)
Write-Host ""
Write-Host "Etape 4/6: Build (1-2 min)..." -ForegroundColor Yellow
npm run build

if (-not $?) {
    Write-Host "  Build echoue!" -ForegroundColor Red
    exit 1
}

Write-Host "  Build termine" -ForegroundColor Green
Start-Sleep -Seconds 1

# Etape 5: Verifier dist
Write-Host ""
Write-Host "Etape 5/6: Verification build compile..." -ForegroundColor Yellow

$distFiles = Get-ChildItem "dist\assets\*.js" -File
$foundDisable = $false

foreach ($file in $distFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "DISABLED.*Skipping restoration") {
        $foundDisable = $true
        Write-Host "  OK: Desactivation trouvee dans $($file.Name)" -ForegroundColor Green
        break
    }
}

if (-not $foundDisable) {
    Write-Host "  ERREUR: DESACTIVATION ABSENTE DU BUILD!" -ForegroundColor Red
    Write-Host "  Le build n'a pas pris en compte flowiseTableBridge.ts" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  SOLUTION: Desactiver dans index.html directement" -ForegroundColor Cyan
    exit 1
}

Start-Sleep -Seconds 1

# Etape 6: Lancer dev
Write-Host ""
Write-Host "Etape 6/6: Lancement serveur dev..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== REBUILD TERMINE ===" -ForegroundColor Green
Write-Host ""
Write-Host "ACTIONS:" -ForegroundColor Yellow
Write-Host "  1. Attendre Local: http://localhost:5173" -ForegroundColor Gray
Write-Host "  2. Ouvrir navigateur" -ForegroundColor Gray
Write-Host "  3. Cliquer Clean DB" -ForegroundColor Gray
Write-Host "  4. Generer 1 table" -ForegroundColor Gray
Write-Host "  5. Cliquer Contam (doit dire 0 tables autres sessions)" -ForegroundColor Gray
Write-Host ""

npm run dev
