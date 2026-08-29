# ============================================================================
# SCRIPT DE SAUVEGARDE CLARAVERSE V5 - 01 MAI 2026
# Repository: https://github.com/sekadalle2024/claraverse_back-up_V2.git
# ============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE CLARAVERSE V5 - 01 MAI 2026                        " -ForegroundColor Cyan
Write-Host "  Repository: claraverse_back-up_V2                             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/claraverse_back-up_V2.git"
$commitMessage = "Sauvegarde ClaraVerse V5 - 01 Mai 2026 - Mise a jour complete"

# ============================================================================
# ETAPE 1: VERIFICATION DE LA SECURITE DES CREDENTIALS
# ============================================================================

Write-Host "[1/5] Verification de la securite des credentials..." -ForegroundColor Yellow

# Verifier que les fichiers sensibles ne sont pas trackes
$credentialFiles = @(
    ".env.google-oauth.local",
    "Doc cross ref documentaire menu/00_CREDENTIALS_AVANCES_FOURNIS_28_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_CONFIGURATION_CREDENTIALS_GOOGLE_DRIVE_28_AVRIL_2026.txt"
)

$filesTracked = $false
foreach ($file in $credentialFiles) {
    if (Test-Path $file) {
        $isTracked = git ls-files $file 2>$null
        if ($isTracked) {
            Write-Host "  ATTENTION: $file est tracke!" -ForegroundColor Red
            git rm --cached $file 2>&1 | Out-Null
            $filesTracked = $true
        }
    }
}

if ($filesTracked) {
    Write-Host "  Fichiers sensibles retires du tracking" -ForegroundColor Green
} else {
    Write-Host "  Credentials securisees" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# ETAPE 2: CONFIGURATION GIT OPTIMALE
# ============================================================================

Write-Host "[2/5] Configuration Git optimale pour gros projet..." -ForegroundColor Yellow

git config http.postBuffer 1048576000
git config core.compression 0
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999

Write-Host "  Configuration appliquee" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ETAPE 3: CONFIGURATION DU REPOSITORY
# ============================================================================

Write-Host "[3/5] Configuration du repository distant..." -ForegroundColor Yellow

# Verifier le remote actuel
$currentRemote = git remote get-url origin 2>$null

if ($currentRemote) {
    Write-Host "  Remote actuel: $currentRemote" -ForegroundColor Gray
    if ($currentRemote -ne $repoUrl) {
        Write-Host "  Changement vers le nouveau repository..." -ForegroundColor Gray
        git remote set-url origin $repoUrl
    }
} else {
    Write-Host "  Ajout du remote origin..." -ForegroundColor Gray
    git remote add origin $repoUrl
}

# Verifier la configuration
$verifyRemote = git remote get-url origin
Write-Host "  Repository configure: $verifyRemote" -ForegroundColor Green

# Verifier la branche actuelle
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    $currentBranch = "master"
    Write-Host "  Creation de la branche master..." -ForegroundColor Gray
    git checkout -b master 2>&1 | Out-Null
}
Write-Host "  Branche: $currentBranch" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# ETAPE 4: PREPARATION ET COMMIT
# ============================================================================

Write-Host "[4/5] Preparation des fichiers pour le commit..." -ForegroundColor Yellow

# Ajouter tous les fichiers (le .gitignore gere les exclusions)
Write-Host "  Ajout des fichiers au staging..." -ForegroundColor Gray
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR lors de l'ajout des fichiers" -ForegroundColor Red
    exit 1
}

# Afficher le statut
$stagedFiles = (git diff --cached --name-only | Measure-Object).Count
Write-Host "  Fichiers a commiter: $stagedFiles" -ForegroundColor Gray

# Creer le commit
Write-Host "  Creation du commit..." -ForegroundColor Gray
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Commit cree avec succes" -ForegroundColor Green
} else {
    Write-Host "  Aucun changement a commiter" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# ETAPE 5: PUSH VERS GITHUB
# ============================================================================

Write-Host "[5/5] Push vers GitHub..." -ForegroundColor Yellow
Write-Host "  Repository: $repoUrl" -ForegroundColor Gray
Write-Host "  Branche: $currentBranch" -ForegroundColor Gray
Write-Host ""

# Calculer la taille approximative
$totalSize = (Get-ChildItem -Recurse -File -Exclude @("node_modules","*.log",".git") | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Taille estimee: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Gray

if ($totalSize -gt 100) {
    Write-Host "  Projet volumineux detecte - Le push peut prendre plusieurs minutes..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Demarrage du push..." -ForegroundColor Gray

# Push avec gestion des erreurs
$pushAttempts = 0
$maxAttempts = 3
$pushSuccess = $false

while ($pushAttempts -lt $maxAttempts -and -not $pushSuccess) {
    $pushAttempts++
    Write-Host "  Tentative $pushAttempts/$maxAttempts..." -ForegroundColor Gray
    
    git push -u origin $currentBranch 2>&1 | Tee-Object -Variable pushOutput
    
    if ($LASTEXITCODE -eq 0) {
        $pushSuccess = $true
        Write-Host ""
        Write-Host "  Push reussi!" -ForegroundColor Green
    } else {
        # Verifier si c'est un probleme de secret
        if ($pushOutput -match "secret") {
            Write-Host ""
            Write-Host "  ERREUR: GitHub a detecte un secret dans le push" -ForegroundColor Red
            Write-Host ""
            Write-Host "  SOLUTIONS:" -ForegroundColor Yellow
            Write-Host "  1. Ouvrir le lien dans le message d'erreur et cliquer 'Allow secret'" -ForegroundColor White
            Write-Host "  2. Verifier que les fichiers credentials sont bien dans .gitignore" -ForegroundColor White
            Write-Host ""
            Write-Host "  Voir: Doc cross ref documentaire menu/00_GESTION_CREDENTIALS_SECURISEE_29_AVRIL_2026.txt" -ForegroundColor Cyan
            Write-Host ""
            exit 1
        }
        
        if ($pushAttempts -lt $maxAttempts) {
            Write-Host "  Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $pushSuccess) {
    Write-Host ""
    Write-Host "  ERREUR: Push echoue apres $maxAttempts tentatives" -ForegroundColor Red
    Write-Host ""
    Write-Host "  SOLUTIONS POSSIBLES:" -ForegroundColor Yellow
    Write-Host "  1. Verifier votre connexion internet" -ForegroundColor White
    Write-Host "  2. Verifier vos credentials GitHub" -ForegroundColor White
    Write-Host "  3. Le projet depasse peut-etre la limite GitHub (100 MB par fichier)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Pour un projet > 100 MB, utilisez:" -ForegroundColor Yellow
    Write-Host "  .\push-commits-multiples-v5.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  SAUVEGARDE REUSSIE!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
Write-Host "Branche: $currentBranch" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant verifier votre repository sur GitHub:" -ForegroundColor White
Write-Host "https://github.com/sekadalle2024/claraverse_back-up_V2" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credentials securisees (non poussees sur GitHub)" -ForegroundColor Green
Write-Host ""
