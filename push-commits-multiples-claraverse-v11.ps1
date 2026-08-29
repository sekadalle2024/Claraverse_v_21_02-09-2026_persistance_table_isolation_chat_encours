# Script de Push en Commits Multiples pour ClaraVerse V11 (2.2 GB)
# Divise le projet en parties pour éviter les timeouts HTTP

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PUSH CLARAVERSE V11 - COMMITS MULTIPLES (2.2 GB)             ║" -ForegroundColor Cyan
Write-Host "║  Repository: Claverse_windows__v_11_20-04-2026_V5_docker_zeabur║" -ForegroundColor Cyan
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

# Fonction pour pousser avec retry
function Push-WithRetry {
    param(
        [string]$PartName,
        [int]$PartNumber,
        [int]$TotalParts
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Partie $PartNumber/$TotalParts: $PartName" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    $maxRetries = 3
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        $retryCount++
        Write-Host "Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
        
        $output = git push -u origin master 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "✓ Push réussi: $PartName" -ForegroundColor Green
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
        Write-Host "Erreur: $output" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Vérifier le commit existant
Write-Host "Vérification du commit existant..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "Dernier commit: $lastCommit" -ForegroundColor Cyan
Write-Host ""

# Pousser vers GitHub
Write-Host "Début du push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

Push-WithRetry "ClaraVerse V11 - 20-04-2026" 1 1

# Vérification finale
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
