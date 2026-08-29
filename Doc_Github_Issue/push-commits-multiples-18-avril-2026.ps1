# ============================================
# Script de push par commits multiples - 18 Avril 2026
# Pour projets > 140MB
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUSH PAR COMMITS MULTIPLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Git pour gros fichiers
Write-Host "[CONFIG] Configuration Git pour gros fichiers..." -ForegroundColor Yellow
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config core.compression 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Fonction pour ajouter et commiter par lots
function Push-InBatches {
    param(
        [int]$batchSize = 50
    )
    
    # Récupérer tous les fichiers non suivis
    $untrackedFiles = git ls-files --others --exclude-standard
    $modifiedFiles = git diff --name-only
    
    $allFiles = @()
    if ($untrackedFiles) { $allFiles += $untrackedFiles }
    if ($modifiedFiles) { $allFiles += $modifiedFiles }
    
    if ($allFiles.Count -eq 0) {
        Write-Host "Aucun fichier à commiter" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Total de fichiers à traiter: $($allFiles.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    $batches = [Math]::Ceiling($allFiles.Count / $batchSize)
    
    for ($i = 0; $i -lt $batches; $i++) {
        $start = $i * $batchSize
        $end = [Math]::Min(($i + 1) * $batchSize, $allFiles.Count)
        $batch = $allFiles[$start..($end-1)]
        
        Write-Host "[$($i+1)/$batches] Traitement du lot $($i+1)..." -ForegroundColor Yellow
        
        # Ajouter les fichiers du lot
        foreach ($file in $batch) {
            git add $file 2>$null
        }
        
        # Créer un commit pour ce lot
        $commitMsg = "Sauvegarde ClaraVerse V8 - Lot $($i+1)/$batches - 18 Avril 2026"
        git commit -m $commitMsg
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Commit créé pour le lot $($i+1)" -ForegroundColor Green
            
            # Push immédiat de ce commit
            Write-Host "  → Push du lot $($i+1)..." -ForegroundColor Cyan
            git push origin master
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Lot $($i+1) poussé avec succès" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Échec du push du lot $($i+1)" -ForegroundColor Red
                Write-Host "  Tentative de retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds 3
                git push origin master
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "  ✗ Échec définitif du lot $($i+1)" -ForegroundColor Red
                    return $false
                }
            }
        }
        
        Write-Host ""
        Start-Sleep -Seconds 2
    }
    
    return $true
}

# Exécution
Write-Host "[PUSH] Démarrage du push par lots..." -ForegroundColor Yellow
Write-Host ""

$success = Push-InBatches -batchSize 50

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($success) {
    Write-Host "✓ SAUVEGARDE TERMINÉE AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tous les fichiers ont été sauvegardés sur GitHub" -ForegroundColor White
} else {
    Write-Host "✗ ERREUR LORS DE LA SAUVEGARDE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez votre connexion et réessayez" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
