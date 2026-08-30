# ================================================================
# Script de Push ClaraVerse vers GitHub
# Version: V20 - 30 Août 2026 - Persistance Table Isolation Chat OK
# Repository: https://github.com/sekadalle2024/https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK.git
# ================================================================
# 
# CONTEXTE:
# - Projet > 140 MB nécessite commits multiples
# - Solution testée et validée pour projets > 100 MB
# - Chaque partie < 30 MB pour éviter les timeouts HTTP
#
# DOCUMENTATION:
# - Doc_Github_Issue/SOLUTION_PROJET_140MB_16_AVRIL_2026.md
# - push-claraverse-fixed.ps1
# ================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V20 - 30 Août 2026                             " -ForegroundColor Cyan
Write-Host "  Persistance Table + Isolation Chat OK                          " -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour projet > 140 MB               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# ======================== CONFIGURATION ========================
$repoUrl = "https://github.com/sekadalle2024/https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK.git"
$branche = "main"  # GitHub utilise 'main' par défaut maintenant
$commitPrefix = "Sauvegarde ClaraVerse V20 - 30 Août 2026 - Persistance Table Isolation Chat"

# ==================== FONCTION PUSH AVEC RETRY ===================
function Push-WithRetry {
    param(
        [string]$message,
        [int]$maxRetries = 3
    )
    
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  📤 Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        
        $pushOutput = git push origin $branche 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push réussi: $message" -ForegroundColor Green
            return $true
        }
        
        Write-Host "  ⚠️  Erreur: $pushOutput" -ForegroundColor Red
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⏳ Nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push échoué après $maxRetries tentatives" -ForegroundColor Red
    return $false
}

# =============== ÉTAPE 1: VÉRIFIER L'ÉTAT ACTUEL ================
Write-Host "📋 Étape 1/8: Vérification de l'état Git..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    $fileCount = ($gitStatus | Measure-Object).Count
    Write-Host "  📝 Fichiers modifiés détectés: $fileCount fichiers" -ForegroundColor White
} else {
    Write-Host "  ✅ Aucun fichier modifié (working tree clean)" -ForegroundColor Green
}

# ================ ÉTAPE 2: VÉRIFIER LA BRANCHE ==================
Write-Host ""
Write-Host "🌿 Étape 2/8: Vérification de la branche..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️  Changement de branche vers $branche..." -ForegroundColor Yellow
    $checkoutOutput = git checkout -b $branche 2>&1
    if ($LASTEXITCODE -ne 0) {
        $checkoutOutput = git checkout $branche 2>&1
    }
    Write-Host "  ✅ Branche $branche active" -ForegroundColor Green
} else {
    Write-Host "  ✅ Déjà sur la branche $branche" -ForegroundColor Green
}

# =========== ÉTAPE 3: CONFIGURATION GIT OPTIMALE ===============
Write-Host ""
Write-Host "⚙️  Étape 3/8: Configuration Git optimale pour gros projet..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
Write-Host "  ✅ Configuration appliquée" -ForegroundColor Green
Write-Host "     • Compression désactivée" -ForegroundColor DarkGray
Write-Host "     • Buffer HTTP: 1 GB" -ForegroundColor DarkGray
Write-Host "     • Timeouts désactivés" -ForegroundColor DarkGray
Write-Host "     • Pack optimisé pour gros fichiers" -ForegroundColor DarkGray

# ============ ÉTAPE 4: CONFIGURER LE REPOSITORY ================
Write-Host ""
Write-Host "🔗 Étape 4/8: Configuration du repository distant..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $repoUrl
    Write-Host "  ✅ Remote 'origin' mis à jour" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "  ✅ Remote 'origin' ajouté" -ForegroundColor Green
}

Write-Host ""
Write-Host "  📍 Repository cible:" -ForegroundColor Cyan
Write-Host "  $repoUrl" -ForegroundColor White

# ============ ÉTAPE 5: VÉRIFIER LA CONNEXION ===================
Write-Host ""
Write-Host "🔌 Étape 5/8: Vérification de la connexion au repository..." -ForegroundColor Yellow
$lsRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connexion au repository réussie" -ForegroundColor Green
    Write-Host "     Repository existe déjà sur GitHub" -ForegroundColor DarkGray
} else {
    Write-Host "  ⚠️  Repository non trouvé (sera créé au premier push)" -ForegroundColor Yellow
    Write-Host "     Message: $lsRemote" -ForegroundColor DarkGray
}

# ======= ÉTAPE 6: VÉRIFIER SI DÉJÀ INDEXÉ SUR AUTRE REPO =======
Write-Host ""
Write-Host "🔍 Étape 6/8: Vérification de l'indexation existante..." -ForegroundColor Yellow
$remoteUrl = git config --get remote.origin.url
if ($remoteUrl -and $remoteUrl -ne $repoUrl) {
    Write-Host "  ⚠️  Le projet est déjà indexé sur un autre repository:" -ForegroundColor Yellow
    Write-Host "     Ancien: $remoteUrl" -ForegroundColor DarkGray
    Write-Host "     Nouveau: $repoUrl" -ForegroundColor DarkGray
    Write-Host "  ✅ Remote origin mis à jour" -ForegroundColor Green
} else {
    Write-Host "  ✅ Configuration correcte" -ForegroundColor Green
}

# =============== ÉTAPE 7: VÉRIFIER LA TAILLE ===================
Write-Host ""
Write-Host "📊 Étape 7/8: Estimation de la taille du projet..." -ForegroundColor Yellow
$gitDir = Get-Item ".git" -Force -ErrorAction SilentlyContinue
if ($gitDir) {
    $gitSize = (Get-ChildItem ".git" -Recurse -Force | Measure-Object -Property Length -Sum).Sum
    $gitSizeMB = [math]::Round($gitSize / 1MB, 2)
    Write-Host "  📦 Taille du .git: $gitSizeMB MB" -ForegroundColor White
    
    if ($gitSizeMB -gt 100) {
        Write-Host "  ⚠️  Projet > 100 MB détecté" -ForegroundColor Yellow
        Write-Host "  ✅ Solution commits multiples sera utilisée" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ÉTAPE 8/8: DÉBUT DU PUSH EN 6 PARTIES                          " -ForegroundColor Cyan
Write-Host "  Chaque partie < 30 MB pour éviter les timeouts                 " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# ================= PARTIE 1: CODE SOURCE REACT ==================
Write-Host ""
Write-Host "📦 Partie 1/6: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour src/" -ForegroundColor Green
    if (-not (Push-WithRetry "Code Source React/TypeScript")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Solutions alternatives:" -ForegroundColor Yellow
        Write-Host "   1. GitHub Desktop (recommandé)" -ForegroundColor Gray
        Write-Host "   2. Attendre et réessayer (problème réseau temporaire)" -ForegroundColor Gray
        Write-Host "   3. SSH au lieu de HTTPS" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans src/" -ForegroundColor DarkGray
}

# ================= PARTIE 2: BACKEND PYTHON =====================
Write-Host ""
Write-Host "📦 Partie 2/6: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour py_backend/" -ForegroundColor Green
    if (-not (Push-WithRetry "Backend Python")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans py_backend/" -ForegroundColor DarkGray
}

# ================ PARTIE 3: FICHIERS PUBLICS ====================
Write-Host ""
Write-Host "📦 Partie 3/6: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour public/" -ForegroundColor Green
    if (-not (Push-WithRetry "Fichiers Publics")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans public/" -ForegroundColor DarkGray
}

# ============= PARTIE 4: DOCUMENTATION PRINCIPALE ===============
Write-Host ""
Write-Host "📦 Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc Systeme persistance chat/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour la documentation" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentation principale")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans la documentation principale" -ForegroundColor DarkGray
}

# ========== PARTIE 5: AUTRES DOCUMENTATIONS ET MD ===============
Write-Host ""
Write-Host "📦 Partie 5/6: Documentations diverses et fichiers MD/TXT..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentations diverses et fichiers MD/TXT" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour les documentations diverses" -ForegroundColor Green
    if (-not (Push-WithRetry "Documentations diverses")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans les documentations diverses" -ForegroundColor DarkGray
}

# =============== PARTIE 6: FICHIERS RESTANTS ====================
Write-Host ""
Write-Host "📦 Partie 6/6: Configuration et fichiers divers..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et fichiers divers" 2>&1
if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé pour les fichiers restants" -ForegroundColor Green
    if (-not (Push-WithRetry "Configuration et fichiers divers")) {
        Write-Host ""
        Write-Host "❌ ÉCHEC - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun fichier restant à commiter" -ForegroundColor DarkGray
}

# ==================== VÉRIFICATION FINALE =======================
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINÉ AVEC SUCCÈS                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Vérification finale..." -ForegroundColor Yellow
$finalStatus = git status
Write-Host "$finalStatus" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""
Write-Host "💡 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. ✅ Vérifier le repository sur GitHub" -ForegroundColor Gray
Write-Host "   2. ⚙️  Configurer la visibilité (public/privé)" -ForegroundColor Gray
Write-Host "   3. 📝 Ajouter une description au repository" -ForegroundColor Gray
Write-Host "   4. 📄 Vérifier le README.md" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Lien direct:" -ForegroundColor Cyan
Write-Host "   https://github.com/sekadalle2024/https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK" -ForegroundColor White
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "                    SCRIPT TERMINÉ                                " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
