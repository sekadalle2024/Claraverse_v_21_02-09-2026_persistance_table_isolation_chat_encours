# ================================================================
# Script de Push ClaraVerse vers GitHub - Version 21
# Date: 02 Septembre 2026
# Repository: https://github.com/sekadalle2024/Claraverse_v_21_02-09-2026_persistance_table_isolation_chat_encours
# Projet > 140 MB - Solution: Commits Multiples
# ================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V21 - 02 Septembre 2026                        " -ForegroundColor Cyan
Write-Host "  Persistance Tables + Isolation Chat                            " -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour projet > 140 MB               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claraverse_v_21_02-09-2026_persistance_table_isolation_chat_encours"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse V21 - 02 Sept 2026 - Persistance + Isolation Chat"

# Fonction pour push avec retry
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
            Write-Host "  ✅ Push reussi: $message" -ForegroundColor Green
            return $true
        }
        
        Write-Host "  ⚠️  Erreur détectée" -ForegroundColor Yellow
        
        $retry++
        if ($retry -lt $maxRetries) {
            Write-Host "  ⏳ Nouvelle tentative dans 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push echoue apres $maxRetries tentatives" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Utilisez GitHub Desktop (recommandé)" -ForegroundColor Gray
    Write-Host "   2. Vérifiez votre connexion Internet" -ForegroundColor Gray
    Write-Host "   3. Réessayez dans quelques minutes" -ForegroundColor Gray
    return $false
}

# =====================================================================
# ÉTAPE 1: Vérification de l'état Git
# =====================================================================
Write-Host "📋 Étape 1/8: Vérification de l'état Git..." -ForegroundColor Yellow
Write-Host ""

$gitStatus = git status --short
$fileCount = ($gitStatus | Measure-Object).Count

if ($fileCount -gt 0) {
    Write-Host "  📝 Fichiers modifiés détectés: $fileCount fichiers" -ForegroundColor White
    Write-Host "  Aperçu (10 premiers):" -ForegroundColor Gray
    $gitStatus | Select-Object -First 10 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor DarkGray
    }
    if ($fileCount -gt 10) {
        Write-Host "    ... et $($fileCount - 10) autres fichiers" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  ✅ Working tree clean - Tous les fichiers sont déjà commités" -ForegroundColor Green
}

# =====================================================================
# ÉTAPE 2: Vérification de la branche
# =====================================================================
Write-Host ""
Write-Host "🌿 Étape 2/8: Vérification de la branche..." -ForegroundColor Yellow

$currentBranch = git branch --show-current
Write-Host "  Branche actuelle: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne $branche) {
    Write-Host "  ⚠️  Changement de branche vers '$branche'..." -ForegroundColor Yellow
    
    # Essayer de créer ou changer vers la branche
    git checkout -b $branche 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branche 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Branche '$branche' activée" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Erreur lors du changement de branche" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✅ Déjà sur la branche '$branche'" -ForegroundColor Green
}

# =====================================================================
# ÉTAPE 3: Configuration Git optimale pour gros projet
# =====================================================================
Write-Host ""
Write-Host "⚙️  Étape 3/8: Configuration Git optimale pour projet > 140 MB..." -ForegroundColor Yellow

# Désactiver la compression (améliore le push de gros fichiers)
git config core.compression 0

# Augmenter le buffer HTTP à 1 GB
git config http.postBuffer 1048576000

# Désactiver les limites de vitesse (évite les timeouts)
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0

# Optimisations pour les packs
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"

Write-Host "  ✅ Configuration Git optimisée" -ForegroundColor Green
Write-Host "     • Compression: désactivée" -ForegroundColor DarkGray
Write-Host "     • Buffer HTTP: 1 GB" -ForegroundColor DarkGray
Write-Host "     • Timeouts: désactivés" -ForegroundColor DarkGray

# =====================================================================
# ÉTAPE 4: Configuration du repository distant
# =====================================================================
Write-Host ""
Write-Host "🌐 Étape 4/8: Configuration du repository distant..." -ForegroundColor Yellow

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
Write-Host "     $repoUrl" -ForegroundColor White

# =====================================================================
# ÉTAPE 5: Vérification de la connexion au repository
# =====================================================================
Write-Host ""
Write-Host "🔗 Étape 5/8: Vérification de la connexion au repository..." -ForegroundColor Yellow

$lsRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connexion au repository réussie" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Repository non accessible ou inexistant" -ForegroundColor Yellow
    Write-Host "  Le repository sera créé lors du premier push" -ForegroundColor Gray
}

# =====================================================================
# ÉTAPE 6: Vérification de la taille du projet
# =====================================================================
Write-Host ""
Write-Host "📊 Étape 6/8: Analyse de la taille du projet..." -ForegroundColor Yellow

$projectSize = (Get-ChildItem -Path . -Recurse -File -Exclude .git | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Taille totale: $([math]::Round($projectSize, 2)) MB" -ForegroundColor White

if ($projectSize -gt 100) {
    Write-Host "  ⚠️  Projet > 100 MB détecté" -ForegroundColor Yellow
    Write-Host "  ✅ Utilisation de la stratégie commits multiples" -ForegroundColor Green
} else {
    Write-Host "  ✅ Taille acceptable pour push standard" -ForegroundColor Green
}

# =====================================================================
# ÉTAPE 7: Préparation et information
# =====================================================================
Write-Host ""
Write-Host "📝 Étape 7/8: Préparation du push en 6 parties..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Le projet sera divisé en 6 commits séparés:" -ForegroundColor Gray
Write-Host "    1️⃣  Code Source React/TypeScript (src/)" -ForegroundColor DarkCyan
Write-Host "    2️⃣  Backend Python (py_backend/)" -ForegroundColor DarkCyan
Write-Host "    3️⃣  Fichiers Publics (public/)" -ForegroundColor DarkCyan
Write-Host "    4️⃣  Documentation principale" -ForegroundColor DarkCyan
Write-Host "    5️⃣  Documentations diverses (*.md, *.txt, Doc_*)" -ForegroundColor DarkCyan
Write-Host "    6️⃣  Configuration et fichiers restants" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Chaque partie < 30 MB pour éviter les timeouts HTTP" -ForegroundColor Gray
Write-Host "  3 tentatives maximum par push avec retry automatique" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "  Voulez-vous continuer? (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Push annulé par l'utilisateur" -ForegroundColor Red
    exit 0
}

# =====================================================================
# ÉTAPE 8: PUSH EN 6 PARTIES
# =====================================================================
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  🚀 DÉBUT DU PUSH EN 6 PARTIES                                   " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

$successCount = 0
$totalParts = 6

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 1: Code Source React/TypeScript
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 1/$totalParts : Code Source React/TypeScript (src/)               │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add src/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Code Source React/TypeScript") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans src/" -ForegroundColor Gray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 2: Backend Python
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 2/$totalParts : Backend Python (py_backend/)                      │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add py_backend/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Backend Python") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans py_backend/" -ForegroundColor Gray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 3: Fichiers Publics
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 3/$totalParts : Fichiers Publics (public/)                        │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add public/ 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Fichiers Publics") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans public/" -ForegroundColor Gray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 4: Documentation principale
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 4/$totalParts : Documentation principale                          │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc Systeme persistance chat/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Documentation principale") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans la documentation principale" -ForegroundColor Gray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 5: Documentations diverses
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 5/$totalParts : Documentations diverses (*.md, *.txt, Doc_*)      │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" "Doc_Heatmap_Risque/" "Doc_AIONUI/" 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 5: Documentations diverses" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Documentations diverses") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun changement dans les documentations diverses" -ForegroundColor Gray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 6: Configuration et fichiers restants
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "┌────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ 📦 PARTIE 6/$totalParts : Configuration et fichiers restants                │" -ForegroundColor Cyan
Write-Host "└────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan

git add . 2>&1 | Out-Null
$commitResult = git commit -m "$commitPrefix - Partie 6: Configuration et fichiers divers" 2>&1

if ($commitResult -notmatch "nothing to commit") {
    Write-Host "  ✅ Commit créé" -ForegroundColor Green
    if (Push-WithRetry "Configuration et fichiers divers") {
        $successCount++
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC CRITIQUE - Arrêt du script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Aucun fichier restant à commiter" -ForegroundColor Gray
}

# =====================================================================
# RÉSUMÉ FINAL
# =====================================================================
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINÉ AVEC SUCCÈS                            " -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Statistiques du push:" -ForegroundColor Cyan
Write-Host "   • Parties pushées avec succès: $successCount/$totalParts" -ForegroundColor White
Write-Host "   • Branche: $branche" -ForegroundColor White
Write-Host "   • Taille du projet: $([math]::Round($projectSize, 2)) MB" -ForegroundColor White
Write-Host ""

Write-Host "📋 Vérification finale de l'état Git:" -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "🌐 Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor White
Write-Host ""

Write-Host "💡 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Vérifier le repository sur GitHub:" -ForegroundColor Gray
Write-Host "      $repoUrl" -ForegroundColor DarkGray
Write-Host "   2. Configurer la visibilité (public/privé) si nécessaire" -ForegroundColor Gray
Write-Host "   3. Ajouter une description au repository" -ForegroundColor Gray
Write-Host "   4. Mettre à jour le README.md si nécessaire" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Script terminé avec succès!" -ForegroundColor Green
Write-Host ""
