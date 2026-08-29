# ============================================================================
# Script de Sauvegarde ClaraVerse V15 - 24 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_24-04-2026_V5_docker_zeabur_ok_switch_editeur-.git
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   SAUVEGARDE CLARAVERSE V15 - 24 AVRIL 2026" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier l'état Git
Write-Host "Etape 1: Verification de l'etat Git..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Étape 2: Configuration Git optimale
Write-Host "Etape 2: Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
Write-Host "Configuration appliquee" -ForegroundColor Green
Write-Host ""

# Étape 3: Vérifier le repository distant actuel
Write-Host "Etape 3: Verification du repository distant..." -ForegroundColor Yellow
$currentRemote = git remote get-url origin
Write-Host "Repository actuel: $currentRemote" -ForegroundColor Cyan

$targetRepo = "https://github.com/sekadalle2024/Claverse_windows__v_14_24-04-2026_V5_docker_zeabur_ok_switch_editeur-.git"
Write-Host "Repository cible: $targetRepo" -ForegroundColor Cyan

if ($currentRemote -ne $targetRepo) {
    Write-Host ""
    Write-Host "ATTENTION: Le repository distant est different!" -ForegroundColor Red
    Write-Host "Voulez-vous changer le repository distant? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "Changement du repository distant..." -ForegroundColor Yellow
        git remote set-url origin $targetRepo
        Write-Host "Repository distant mis a jour" -ForegroundColor Green
    } else {
        Write-Host "Conservation du repository actuel" -ForegroundColor Yellow
    }
}
Write-Host ""

# Étape 4: Vérifier la connexion au repository
Write-Host "Etape 4: Verification de la connexion au repository..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# Étape 5: Vérifier la branche
Write-Host "Etape 5: Verification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Étape 6: Ajouter tous les fichiers
Write-Host "Etape 6: Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .
Write-Host "Fichiers ajoutes" -ForegroundColor Green
Write-Host ""

# Étape 7: Créer le commit
Write-Host "Etape 7: Creation du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V15 - 24 Avril 2026 - Integration Schema Calcul Papier Travail"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit cree avec succes" -ForegroundColor Green
} else {
    Write-Host "Aucun changement a commiter ou erreur" -ForegroundColor Yellow
}
Write-Host ""

# Étape 8: Push avec retry
Write-Host "Etape 8: Push vers GitHub..." -ForegroundColor Yellow
$maxRetries = 3
$retryCount = 0
$pushSuccess = $false

while ($retryCount -lt $maxRetries -and -not $pushSuccess) {
    $retryCount++
    Write-Host "Tentative $retryCount/$maxRetries..." -ForegroundColor Cyan
    
    git push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
        Write-Host "Push reussi!" -ForegroundColor Green
    } else {
        if ($retryCount -lt $maxRetries) {
            Write-Host "Echec. Nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "Echec apres $maxRetries tentatives" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Étape 9: Vérification finale
Write-Host "Etape 9: Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""

# Résumé
Write-Host "============================================================================" -ForegroundColor Cyan
if ($pushSuccess) {
    Write-Host "   SAUVEGARDE REUSSIE!" -ForegroundColor Green
} else {
    Write-Host "   SAUVEGARDE ECHOUEE - Voir les erreurs ci-dessus" -ForegroundColor Red
}
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host $targetRepo -ForegroundColor White
Write-Host ""
