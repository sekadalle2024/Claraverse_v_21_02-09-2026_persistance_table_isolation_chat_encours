# ================================================================
# Script de Push ClaraVerse vers GitHub
# Version: Wide Screen 18 - 27 Août 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_18_27-08-2026_Wide_sceren.git
# ================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse Wide Screen V18 - 27 Août 2026                " -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour projet > 140 MB              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_18_27-08-2026_Wide_sceren.git"
$branche = "main"  # GitHub utilise 'main' par défaut maintenant
$commitPrefix = "Sauvegarde ClaraVerse Wide Screen V18 - 27 Août 2026"

# Fonction pour push avec retry
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        Write-Host "  Erreur: $pushOutput" -ForegroundColor Red
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⏳ Nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# Étape 1: Vérifier l'état actuel
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "  📝 Fichiers modifies detectes: $($gitStatus.Count) fichiers" -ForegroundColor White
} else {
    Write-Host "  ✅ Aucun fichier modifie" -ForegroundColor Green
}

# Étape 2: Vérifier la branche
Write-Host ""
Write-Host "2. Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️  Changement de branche vers $branche..." -ForegroundColor Yellow
    git checkout -b $branche 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branche 2>&1 | Out-Null
    }
}

# Étape 3: Configuration Git optimale
Write-Host ""
Write-Host "3. Configuration Git optimale pour gros projet..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "  ✅ Configuration appliquee" -ForegroundColor Green

# Étape 4: Configurer le remote
Write-Host ""
Write-Host "4. Configuration du repository distant..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $repoUrl
    Write-Host "  ✅ Remote 'origin' mis a jour" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "  ✅ Remote 'origin' ajoute" -ForegroundColor Green
}

Write-Host ""
Write-Host "  Repository cible:" -ForegroundColor Cyan
Write-Host "  $repoUrl" -ForegroundColor White

# Étape 5: Vérifier la connexion
Write-Host ""
Write-Host "5. Vérification de la connexion au repository..." -ForegroundColor Yellow
$lsRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connexion au repository reussie" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Attention: $lsRemote" -ForegroundColor Yellow
    Write-Host "  Le repository sera cree lors du premier push" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DEBUT DU PUSH EN 6 PARTIES                                      " -ForegroundColor Cyan
Write-Host "  Chaque partie < 30 MB pour eviter les timeouts                  " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Partie 1: Code Source React/TypeScript
Write-Host ""
Write-Host "📦 Partie 1/6: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Solution alternative: Utilisez GitHub Desktop" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans src/" -ForegroundColor Gray
}

# Partie 2: Backend Python
Write-Host ""
Write-Host "📦 Partie 2/6: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans py_backend/" -ForegroundColor Gray
}

# Partie 3: Fichiers Publics
Write-Host ""
Write-Host "📦 Partie 3/6: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans public/" -ForegroundColor Gray
}

# Partie 4: Documentation principale
Write-Host ""
Write-Host "📦 Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans la documentation principale" -ForegroundColor Gray
}

# Partie 5: Autres documentations et fichiers markdown
Write-Host ""
Write-Host "📦 Partie 5/6: Documentations diverses..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentations diverses" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentations diverses")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans les documentations diverses" -ForegroundColor Gray
}

# Partie 6: Fichiers restants
Write-Host ""
Write-Host "📦 Partie 6/6: Configuration et fichiers divers..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et fichiers divers" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit cree" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration et fichiers divers")) {
        Write-Host ""
        Write-Host "❌ ECHEC - Arret du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun fichier restant" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINE AVEC SUCCES                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""
Write-Host "🌐 Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "💡 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Verifier le repository sur GitHub" -ForegroundColor Gray
Write-Host "   2. Configurer la visibilite (public/prive)" -ForegroundColor Gray
Write-Host "   3. Ajouter un README si necessaire" -ForegroundColor Gray
Write-Host ""
