# ============================================================================
# Script de Push ClaraVerse V5 - 28 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_28-04-2026_V5_docker_zeabur_ok_switch_editeur-.git
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   SAUVEGARDE CLARAVERSE V5 - 28 AVRIL 2026" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$targetRepo = "https://github.com/sekadalle2024/Claverse_windows__v_14_28-04-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$maxRetries = 3
$retryDelay = 5

# Fonction de push avec retry
function Push-WithRetry {
    param(
        [string]$branch,
        [int]$maxRetries,
        [int]$retryDelay
    )
    
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        $retryCount++
        Write-Host "  Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
        
        git push -u origin $branch 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "  ✅ Push reussi!" -ForegroundColor Green
        } else {
            if ($retryCount -lt $maxRetries) {
                Write-Host "  ⚠️ Echec. Nouvelle tentative dans $retryDelay secondes..." -ForegroundColor Red
                Start-Sleep -Seconds $retryDelay
            }
        }
    }
    
    return $success
}

# Étape 1: Vérification initiale
Write-Host "Etape 1: Verification de l'etat Git..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

$modifiedFiles = git status --short | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Fichiers modifies: $modifiedFiles" -ForegroundColor Cyan
Write-Host ""

# Étape 2: Configuration Git optimale
Write-Host "Etape 2: Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "✅ Configuration appliquee" -ForegroundColor Green
Write-Host ""

# Étape 3: Changement du repository distant
Write-Host "Etape 3: Configuration du repository distant..." -ForegroundColor Yellow
Write-Host "Repository cible:" -ForegroundColor Cyan
Write-Host "  $targetRepo" -ForegroundColor White

$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -ne $targetRepo) {
    git remote set-url origin $targetRepo
    Write-Host "✅ Remote mis a jour" -ForegroundColor Green
} else {
    Write-Host "✅ Remote deja configure" -ForegroundColor Green
}

Write-Host ""
Write-Host "Verification du remote:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Étape 4: Ajout de tous les fichiers
Write-Host "Etape 4: Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✅ Fichiers ajoutes" -ForegroundColor Green
Write-Host ""

# Étape 5: Création du commit
Write-Host "Etape 5: Creation du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V5 - 28 Avril 2026 - Workflow XRef + Corrections"
git commit -m "$commitMessage"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit cree avec succes" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aucun changement a commiter ou erreur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verification de l'etat:" -ForegroundColor Yellow
    git status
    exit 0
}
Write-Host ""

# Étape 6: Push vers GitHub
Write-Host "Etape 6: Push vers GitHub..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Cyan
Write-Host ""

$success = Push-WithRetry -branch $currentBranch -maxRetries $maxRetries -retryDelay $retryDelay

# Résultat final
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
if ($success) {
    Write-Host "           ✅ SAUVEGARDE REUSSIE" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verification finale..." -ForegroundColor Yellow
    git status
    Write-Host ""
    Write-Host "🎉 Votre projet est maintenant sauvegarde sur GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository:" -ForegroundColor Cyan
    Write-Host "  $targetRepo" -ForegroundColor White
    Write-Host ""
    Write-Host "Branche: $currentBranch" -ForegroundColor Cyan
} else {
    Write-Host "           ❌ SAUVEGARDE ECHOUEE" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Le projet est trop volumineux pour un push simple." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTION: Utiliser le script de commits multiples" -ForegroundColor Cyan
    Write-Host "  .\push-commits-multiples-v5.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Ce script divisera automatiquement votre projet en 6 parties" -ForegroundColor Yellow
    Write-Host "pour eviter les timeouts." -ForegroundColor Yellow
}
Write-Host ""
