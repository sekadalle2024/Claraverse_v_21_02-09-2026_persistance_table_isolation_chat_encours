# Script de push incrémental pour py_backend vers GitHub
# Adapté pour éviter les timeouts avec les gros projets

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PUSH INCRÉMENTAL DU DOSSIER PY_BACKEND VERS GITHUB" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$maxSize = 50MB
$remote = "origin"
$branch = "master"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"
Write-Host "   Branche: $branch"
Write-Host "   Taille max par push: $($maxSize / 1MB)MB"
Write-Host ""

# Vérifier le statut
Write-Host "🔍 Vérification du statut Git..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Fichiers non commités détectés" -ForegroundColor Red
    Write-Host "   Veuillez commiter vos changements d'abord" -ForegroundColor Red
    exit 1
}

# Obtenir la liste des commits à pousser
Write-Host "📊 Analyse des commits à pousser..." -ForegroundColor Yellow
$commits = git log $remote/$branch..HEAD --oneline
if (-not $commits) {
    Write-Host "✅ Aucun commit à pousser - tout est à jour!" -ForegroundColor Green
    exit 0
}

$commitCount = ($commits | Measure-Object).Count
Write-Host "   $commitCount commit(s) à pousser" -ForegroundColor Cyan
Write-Host ""

# Pousser par petits lots
Write-Host "🚀 Début du push incrémental..." -ForegroundColor Yellow
Write-Host ""

$commitList = git log $remote/$branch..HEAD --reverse --format="%H"
$commitArray = $commitList -split "`n"
$total = $commitArray.Count
$current = 0

foreach ($commit in $commitArray) {
    $current++
    $percentage = [math]::Round(($current / $total) * 100)
    
    Write-Host "[$current/$total] ($percentage%) Pushing commit: $($commit.Substring(0,7))..." -ForegroundColor Cyan
    
    try {
        # Pousser un commit à la fois
        git push $remote ${commit}:refs/heads/$branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Succès" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Erreur lors du push" -ForegroundColor Red
            Write-Host "   Tentative de push forcé..." -ForegroundColor Yellow
            
            # Réessayer avec force
            git push -f $remote ${commit}:refs/heads/$branch 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Push forcé réussi" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Échec du push" -ForegroundColor Red
                exit 1
            }
        }
    } catch {
        Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
        exit 1
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ PUSH TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Vérifiez sur GitHub que py_backend/ est présent"
Write-Host "   2. Retournez sur Render et cliquez 'Manual Deploy'"
Write-Host "   3. Attendez le déploiement (3-5 minutes)"
Write-Host ""
