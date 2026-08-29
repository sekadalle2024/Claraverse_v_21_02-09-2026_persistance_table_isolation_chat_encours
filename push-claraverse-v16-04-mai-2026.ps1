# ============================================================================
# Script de Push ClaraVerse V16 - 04 Mai 2026
# Repository: Claverse_windows__v_16_04-05-2026_V5_docker_zeabur_ok_switch_editeur-
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   PUSH CLARAVERSE V16 - 04 MAI 2026" -ForegroundColor Cyan
Write-Host "   Repository: Claverse_windows__v_16_04-05-2026_V5_docker_zeabur_ok_switch_editeur-" -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan

# Fonction pour afficher les messages
function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "`n>>> $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "X $Message" -ForegroundColor Red
}

# ============================================================================
# ETAPE 1: Verification de l'etat Git
# ============================================================================

Write-Step "ETAPE 1: Verification de l'etat Git" "Cyan"

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Fichiers modifies detectes:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Success "Aucun fichier modifie"
}

# Verifier la branche actuelle
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

# Verifier le remote
Write-Host "`nRepository distant:" -ForegroundColor Cyan
git remote -v | Select-String "push"

# ============================================================================
# ETAPE 2: Configuration Git Optimale
# ============================================================================

Write-Step "ETAPE 2: Configuration Git pour gros projets" "Cyan"

git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0

Write-Success "Configuration Git optimisee"

# ============================================================================
# ETAPE 3: Ajout des fichiers
# ============================================================================

Write-Step "ETAPE 3: Ajout des fichiers modifies" "Cyan"

# Ajouter tous les fichiers
git add .

$addedFiles = git diff --cached --name-only
if ($addedFiles) {
    $fileCount = ($addedFiles | Measure-Object).Count
    Write-Success "Fichiers ajoutes: $fileCount fichiers"
} else {
    Write-Host "Aucun fichier a ajouter" -ForegroundColor Yellow
}

# ============================================================================
# ETAPE 4: Creation du commit
# ============================================================================

Write-Step "ETAPE 4: Creation du commit" "Cyan"

$commitMessage = "Sauvegarde ClaraVerse V16 - 04 Mai 2026

- Mise a jour complete du projet
- Corrections et ameliorations
- Documentation mise a jour
- Configuration Docker et Zeabur
- Switch editeur integre"

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Success "Commit cree avec succes"
} else {
    Write-Host "Aucun changement a commiter ou erreur" -ForegroundColor Yellow
}

# ============================================================================
# ETAPE 5: Push avec Retry
# ============================================================================

Write-Step "ETAPE 5: Push vers GitHub (avec retry automatique)" "Cyan"

$maxRetries = 3
$retryDelay = 5
$pushSuccess = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "`nTentative $i/$maxRetries..." -ForegroundColor Yellow
    
    git push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Push reussi !"
        $pushSuccess = $true
        break
    } else {
        Write-Error "Echec de la tentative $i"
        if ($i -lt $maxRetries) {
            Write-Host "Nouvelle tentative dans $retryDelay secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds $retryDelay
        }
    }
}

# ============================================================================
# ETAPE 6: Verification finale
# ============================================================================

Write-Step "ETAPE 6: Verification finale" "Cyan"

if ($pushSuccess) {
    Write-Host "`n============================================================================" -ForegroundColor Green
    Write-Host "           PUSH TERMINE AVEC SUCCES" -ForegroundColor Green
    Write-Host "============================================================================`n" -ForegroundColor Green
    
    Write-Host "Etat final:" -ForegroundColor Cyan
    git status
    
    Write-Host "`nRepository GitHub:" -ForegroundColor Cyan
    Write-Host "https://github.com/sekadalle2024/Claverse_windows__v_16_04-05-2026_V5_docker_zeabur_ok_switch_editeur-.git" -ForegroundColor Blue
    
} else {
    Write-Host "`n============================================================================" -ForegroundColor Red
    Write-Host "           ECHEC DU PUSH" -ForegroundColor Red
    Write-Host "============================================================================`n" -ForegroundColor Red
    
    Write-Host "Le push a echoue apres $maxRetries tentatives." -ForegroundColor Red
    Write-Host "`nSolutions alternatives:" -ForegroundColor Yellow
    Write-Host "1. Utiliser le script de commits multiples: push-commits-multiples-v16.ps1" -ForegroundColor White
    Write-Host "2. Utiliser GitHub Desktop" -ForegroundColor White
    Write-Host "3. Verifier votre connexion Internet" -ForegroundColor White
    
    exit 1
}
