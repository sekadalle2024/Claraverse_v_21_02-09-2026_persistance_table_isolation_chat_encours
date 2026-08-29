# Script de push incrémental pour gros projets
# Solution pour erreur HTTP 408 (timeout)

Write-Host "=== PUSH INCREMENTAL CLARAVERSE V5 ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$newRepo = "https://github.com/sekadalle2024/Claraverse_windows_s_12_v0_31-03-2026_V5-Export_CAC-V0-Public.git"

Write-Host "SOLUTION: Augmenter les buffers Git pour gros projets" -ForegroundColor Yellow
Write-Host ""

# 1. Augmenter les buffers Git
Write-Host "1. Configuration des buffers Git..." -ForegroundColor Yellow
git config http.postBuffer 524288000
git config http.timeout 600
git config pack.windowMemory 256m
git config pack.packSizeLimit 256m
Write-Host "   Buffers configurés (500MB, timeout 10min)" -ForegroundColor Green
Write-Host ""

# 2. Vérifier le remote
Write-Host "2. Vérification du remote..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
if ($currentRemote -ne $newRepo) {
    Write-Host "   Changement du remote..." -ForegroundColor Yellow
    git remote set-url origin $newRepo
    Write-Host "   Remote configuré: $newRepo" -ForegroundColor Green
} else {
    Write-Host "   Remote déjà configuré correctement" -ForegroundColor Green
}
Write-Host ""

# 3. Push avec retry
Write-Host "3. Push vers GitHub (avec retry automatique)..." -ForegroundColor Yellow
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Cyan
Write-Host ""

$maxRetries = 3
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    if ($retryCount -gt 0) {
        Write-Host "   Tentative $($retryCount + 1)/$maxRetries..." -ForegroundColor Yellow
    }
    
    git push -u origin master --verbose
    
    if ($LASTEXITCODE -eq 0) {
        $success = $true
    } else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   Échec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

Write-Host ""
if ($success) {
    Write-Host "=== SAUVEGARDE REUSSIE ===" -ForegroundColor Green
    Write-Host "Votre projet a été sauvegardé sur:" -ForegroundColor Green
    Write-Host $newRepo -ForegroundColor Cyan
} else {
    Write-Host "=== PUSH ECHOUE APRES $maxRetries TENTATIVES ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTIONS ALTERNATIVES:" -ForegroundColor Yellow
    Write-Host "1. Vérifiez votre connexion internet" -ForegroundColor White
    Write-Host "2. Utilisez Git LFS pour les gros fichiers:" -ForegroundColor White
    Write-Host "   git lfs install" -ForegroundColor Cyan
    Write-Host "   git lfs track '*.xls' '*.xlsx' '*.pdf'" -ForegroundColor Cyan
    Write-Host "3. Utilisez GitHub Desktop (interface graphique)" -ForegroundColor White
    Write-Host "4. Compressez les fichiers volumineux" -ForegroundColor White
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
