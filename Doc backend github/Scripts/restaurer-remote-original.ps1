# Script de restauration du remote original
# À utiliser si le script de push a été interrompu
# Date: 19 avril 2026

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║           RESTAURATION REMOTE ORIGINAL                         ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier le remote actuel
Write-Host "1. Vérification du remote actuel..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "   Remote actuel: $currentRemote" -ForegroundColor Cyan
Write-Host ""

# 2. Déterminer si restauration nécessaire
if ($currentRemote -match "Back-end-python") {
    Write-Host "   ⚠ Remote pointe vers le repository backend" -ForegroundColor Yellow
    Write-Host "   Restauration nécessaire" -ForegroundColor Yellow
    Write-Host ""
    
    # 3. Demander confirmation
    Write-Host "Voulez-vous restaurer le remote vers le repository principal?" -ForegroundColor Cyan
    Write-Host "Repository principal: Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public" -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "Continuer? (o/n)"
    
    if ($response -eq "o" -or $response -eq "O") {
        # 4. Restaurer le remote
        Write-Host ""
        Write-Host "2. Restauration du remote..." -ForegroundColor Yellow
        
        $originalRemote = "https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git"
        git remote set-url origin $originalRemote
        
        # 5. Vérifier la restauration
        Write-Host ""
        Write-Host "3. Vérification..." -ForegroundColor Yellow
        $newRemote = git remote get-url origin
        Write-Host "   Nouveau remote: $newRemote" -ForegroundColor Cyan
        Write-Host ""
        
        if ($newRemote -eq $originalRemote) {
            Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║                                                                ║" -ForegroundColor Green
            Write-Host "║                ✓ RESTAURATION RÉUSSIE                         ║" -ForegroundColor Green
            Write-Host "║                                                                ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Write-Host "Le remote a été restauré vers le repository principal" -ForegroundColor Green
        } else {
            Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
            Write-Host "║                                                                ║" -ForegroundColor Red
            Write-Host "║                ✗ ERREUR DE RESTAURATION                       ║" -ForegroundColor Red
            Write-Host "║                                                                ║" -ForegroundColor Red
            Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
            Write-Host ""
            Write-Host "Le remote n'a pas été restauré correctement" -ForegroundColor Red
            Write-Host "Vérifiez manuellement avec: git remote -v" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "Restauration annulée" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "   ✓ Remote déjà configuré sur le repository principal" -ForegroundColor Green
    Write-Host "   Aucune restauration nécessaire" -ForegroundColor Green
}

# 6. Afficher l'état final
Write-Host ""
Write-Host "État final du remote:" -ForegroundColor Cyan
git remote -v
Write-Host ""
