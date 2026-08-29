# Script de push incrémental pour éviter les timeouts
Write-Host "Push incremental vers GitHub..." -ForegroundColor Yellow

# Configuration
$remote = "https://github.com/sekadalle2024/Claverse_windows__v7_16-04-2026_V5-Export_CAC-V0-Public.git"

# Vérifier si le repository distant existe
Write-Host "Verification du repository distant..." -ForegroundColor Cyan
git ls-remote $remote 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Le repository distant n'existe pas ou n'est pas accessible" -ForegroundColor Red
    Write-Host "Creez d'abord le repository sur GitHub:" -ForegroundColor Yellow
    Write-Host "  https://github.com/sekadalle2024/Claverse_windows__v7_16-04-2026_V5-Export_CAC-V0-Public" -ForegroundColor White
    exit 1
}

# Configurer le remote
Write-Host "Configuration du remote..." -ForegroundColor Cyan
git remote set-url origin $remote

# Augmenter les buffers et timeouts
Write-Host "Configuration Git pour gros fichiers..." -ForegroundColor Cyan
git config http.postBuffer 524288000
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999
git config pack.windowMemory 256m
git config pack.packSizeLimit 256m

# Push avec retry
$maxRetries = 5
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "`nTentative $retryCount sur $maxRetries..." -ForegroundColor Yellow
    
    git push -u origin master --verbose 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "`nSUCCES! Push reussi" -ForegroundColor Green
    } else {
        Write-Host "Echec. Attente de 10 secondes avant nouvelle tentative..." -ForegroundColor Red
        Start-Sleep -Seconds 10
    }
}

if (-not $success) {
    Write-Host "`nECHEC apres $maxRetries tentatives" -ForegroundColor Red
    Write-Host "`nSOLUTIONS ALTERNATIVES:" -ForegroundColor Yellow
    Write-Host "1. Utilisez GitHub Desktop pour pousser" -ForegroundColor White
    Write-Host "2. Compressez le projet et uploadez manuellement" -ForegroundColor White
    Write-Host "3. Utilisez Git LFS pour les gros fichiers" -ForegroundColor White
    exit 1
}
