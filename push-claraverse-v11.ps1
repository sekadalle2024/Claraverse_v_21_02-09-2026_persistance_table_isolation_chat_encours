# Script de Push pour ClaraVerse V11 (2.2 GB)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PUSH CLARAVERSE V11 - 20-04-2026 - DOCKER ZEABUR             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale
Write-Host "Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Vérifier l'état Git
Write-Host "Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "⚠ Fichiers non commités détectés" -ForegroundColor Yellow
    Write-Host "Ajout et commit..." -ForegroundColor Yellow
    git add .
    git commit -m "Sauvegarde ClaraVerse V11 - 20-04-2026 - Docker Zeabur"
}
Write-Host "✓ État Git vérifié" -ForegroundColor Green
Write-Host ""

# Vérifier le commit existant
Write-Host "Vérification du commit existant..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "Dernier commit: $lastCommit" -ForegroundColor Cyan
Write-Host ""

# Pousser vers GitHub avec retry
Write-Host "Début du push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

$maxRetries = 3
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries -and -not $success) {
    $retryCount++
    Write-Host "Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
    
    $output = git push -u origin master 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✓ Push réussi!" -ForegroundColor Green
        $success = $true
    } else {
        Write-Host "✗ Erreur lors du push (code: $exitCode)" -ForegroundColor Red
        if ($retryCount -lt $maxRetries) {
            Write-Host "Attente de 10 secondes avant nouvelle tentative..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

if (-not $success) {
    Write-Host "✗ ÉCHEC après $maxRetries tentatives" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  PUSH TERMINÉ AVEC SUCCÈS                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_11_20-04-2026_V5_docker_zeabur.git" -ForegroundColor Green
Write-Host ""

Write-Host "✓ Sauvegarde réussie!" -ForegroundColor Green
