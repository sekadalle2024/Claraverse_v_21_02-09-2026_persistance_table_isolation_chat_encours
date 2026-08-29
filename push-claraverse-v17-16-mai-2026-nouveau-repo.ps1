# Script de sauvegarde ClaraVerse V17 - 16 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_17_16-05-2026_V5_docker_zeabur_ok_switch_editeur-.git
# Solution pour projets > 140MB avec commits multiples

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Sauvegarde ClaraVerse V17 - 16 Mai 2026                       " -ForegroundColor Cyan
Write-Host "  Nouveau Repository GitHub                                     " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$nouveauRepo = "https://github.com/sekadalle2024/Claverse_windows__v_17_16-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = "main"
$dateVersion = "16 Mai 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push -u origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⚠️ Echec, nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    Write-Host "  Derniere erreur: $pushOutput" -ForegroundColor Red
    return $false
}

# Étape 1: Vérifier l'état actuel
Write-Host "1. Verification de l'etat Git..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    $fileCount = ($status | Measure-Object).Count
    Write-Host "  $fileCount fichiers modifies ou non suivis" -ForegroundColor White
} else {
    Write-Host "  ⚠️ Aucun fichier modifie" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Le projet est deja a jour. Rien a sauvegarder." -ForegroundColor Green
    exit 0
}

# Étape 2: Configuration Git optimale
Write-Host ""
Write-Host "2. Configuration Git optimale pour gros projet..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "  ✅ Configuration appliquee" -ForegroundColor Green

# Étape 3: Changer le repository distant
Write-Host ""
Write-Host "3. Configuration du nouveau repository..." -ForegroundColor Yellow
Write-Host "  Ancien: $(git remote get-url origin)" -ForegroundColor Gray
git remote set-url origin $nouveauRepo
Write-Host "  Nouveau: $nouveauRepo" -ForegroundColor Green

# Vérifier la connexion
Write-Host ""
Write-Host "4. Verification de la connexion au repository..." -ForegroundColor Yellow
$remoteCheck = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connexion reussie" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Attention: Impossible de verifier la connexion" -ForegroundColor Yellow
    Write-Host "  Le repository sera cree lors du premier push" -ForegroundColor Gray
}

# Vérifier la branche actuelle
Write-Host ""
Write-Host "5. Verification de la branche..." -ForegroundColor Yellow
$brancheActuelle = git branch --show-current
Write-Host "  Branche actuelle: $brancheActuelle" -ForegroundColor White

if ($brancheActuelle -ne $branche) {
    Write-Host "  Creation/basculement vers la branche $branche..." -ForegroundColor Yellow
    git checkout -b $branche 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Branche $branche prete" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN COMMITS MULTIPLES" -ForegroundColor Cyan
Write-Host "  (Solution pour projets > 140MB)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Commit 1: Fichiers de documentation de suppression (16 Mai 2026)
Write-Host ""
Write-Host "Partie 1/7: Documentation suppressions tests (16 Mai 2026)..." -ForegroundColor Cyan
git add "00_*SUPPRESSION*.txt" "00_*SUPPRESSION*.md" "*SUPPRESSION*.txt" "*SUPPRESSION*.md"
git add "Doc menu demarrer/Documentation/SUPPRESSION_*.md"
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 1: Documentation suppressions tests" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation suppressions")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 2: Scripts de suppression
Write-Host ""
Write-Host "Partie 2/7: Scripts de suppression tests..." -ForegroundColor Cyan
git add "Doc menu demarrer/Scripts/remove_*.py"
git add "test-suppression-*.ps1"
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 2: Scripts suppression tests" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Scripts suppression")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 3: Composant DemarrerMenu.tsx et backups
Write-Host ""
Write-Host "Partie 3/7: Composant DemarrerMenu et backups..." -ForegroundColor Cyan
git add "src/components/Clara_Components/DemarrerMenu.tsx"
git add "src/components/Clara_Components/DemarrerMenu.tsx.backup*"
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 3: DemarrerMenu.tsx et backups" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "DemarrerMenu")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 4: Backend Python
Write-Host ""
Write-Host "Partie 4/7: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 4: Backend Python" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter dans py_backend/" -ForegroundColor Yellow
}

# Commit 5: Scripts PowerShell de push
Write-Host ""
Write-Host "Partie 5/7: Scripts PowerShell..." -ForegroundColor Cyan
git add "push-claraverse-*.ps1"
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 5: Scripts PowerShell" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Scripts PowerShell")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 6: Autres fichiers de documentation
Write-Host ""
Write-Host "Partie 6/7: Autres fichiers de documentation..." -ForegroundColor Cyan
git add "00_*.txt" "00_*.md" "SYNTHESE_*.txt" "LISTE_*.md" "QUICK_START_*.txt" "COMMANDES_*.txt"
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 6: Documentation generale" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation generale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier a commiter" -ForegroundColor Yellow
}

# Commit 7: Tous les fichiers restants
Write-Host ""
Write-Host "Partie 7/7: Fichiers restants..." -ForegroundColor Cyan
git add .
$commitResult = git commit -m "Sauvegarde V17 - $dateVersion - Partie 7: Fichiers restants" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers restants")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⚠️ Aucun fichier restant a commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ SAUVEGARDE TERMINEE AVEC SUCCES                    " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $nouveauRepo" -ForegroundColor White
Write-Host ""
Write-Host "Branche: $branche" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Votre projet ClaraVerse V17 est maintenant sauvegarde sur GitHub!" -ForegroundColor Green
Write-Host ""
