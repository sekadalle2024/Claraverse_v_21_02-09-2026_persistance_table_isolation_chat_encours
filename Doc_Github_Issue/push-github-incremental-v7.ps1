# Script de push incrémental pour GitHub - Version 7
Write-Host "=== PUSH INCREMENTAL GITHUB V7 ===" -ForegroundColor Cyan
Write-Host "Repository: Claverse_windows__v7_16-04-2026_V5-Export_CAC-V0-Public" -ForegroundColor Yellow

# Configuration Git pour gros fichiers
Write-Host "`nConfiguration Git..." -ForegroundColor Cyan
git config http.postBuffer 524288000
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"

Write-Host "Configuration terminee" -ForegroundColor Green

# Vérifier l'état
Write-Host "`nVerification de l'etat..." -ForegroundColor Cyan
git status --short

# Push avec retry
$maxRetries = 5
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "`nTentative $retryCount sur $maxRetries..." -ForegroundColor Yellow
    
    try {
        git push -u origin master 2>&1 | Tee-Object -Variable output
        
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "`nPUSH REUSSI!" -ForegroundColor Green
        } else {
            Write-Host "`nEchec, attente de 5 secondes..." -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Host "`nErreur: $_" -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}

if (-not $success) {
    Write-Host "`n=== ECHEC APRES $maxRetries TENTATIVES ===" -ForegroundColor Red
    Write-Host "`nSOLUTION ALTERNATIVE:" -ForegroundColor Yellow
    Write-Host "1. Utilisez GitHub Desktop" -ForegroundColor White
    Write-Host "2. Ou poussez manuellement par petits commits" -ForegroundColor White
} else {
    Write-Host "`n=== SAUVEGARDE REUSSIE ===" -ForegroundColor Green
}
