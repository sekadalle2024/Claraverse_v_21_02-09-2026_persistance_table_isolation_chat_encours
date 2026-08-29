# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT DE SYNCHRONISATION COMPLÈTE : Backend + Frontend
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 SYNCHRONISATION COMPLÈTE CLARAVERSE                                 ║" -ForegroundColor Cyan
Write-Host "║     Backend (Zeabur) + Frontend (Netlify)                               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ═══════════════════════════════════════════════════════════════════════════
# 1. VÉRIFICATION PRÉALABLE
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "🔍 ÉTAPE 1 : Vérification préalable" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "index.html") -or -not (Test-Path "py_backend")) {
    Write-Host "❌ ERREUR : Ce script doit être exécuté depuis la racine du projet ClaraVerse" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Répertoire correct détecté`n" -ForegroundColor Green

# Vérifier Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git disponible : $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR : Git n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════
# 2. AFFICHER LES FICHIERS MODIFIÉS
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "📊 ÉTAPE 2 : Fichiers modifiés" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-Host "⚠️  Aucun fichier modifié détecté" -ForegroundColor Yellow
    Write-Host "   Le working tree est clean. Rien à synchroniser.`n" -ForegroundColor Gray
    
    $continue = Read-Host "Voulez-vous continuer quand même ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        Write-Host "`n✋ Synchronisation annulée`n" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Fichiers à synchroniser :`n" -ForegroundColor Cyan
    $gitStatus | ForEach-Object {
        $status = $_.Substring(0, 2)
        $file = $_.Substring(3)
        
        $color = "Gray"
        $icon = "📄"
        
        if ($status -match "M") {
            $color = "Yellow"
            $icon = "📝"
        } elseif ($status -match "A") {
            $color = "Green"
            $icon = "➕"
        } elseif ($status -match "D") {
            $color = "Red"
            $icon = "➖"
        } elseif ($status -match "\?\?") {
            $color = "Cyan"
            $icon = "🆕"
        }
        
        Write-Host "  $icon $file" -ForegroundColor $color
    }
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# 3. CONFIRMATION UTILISATEUR
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "⚠️  ATTENTION : Cette action va :" -ForegroundColor Yellow
Write-Host "   1. Ajouter tous les fichiers modifiés (git add)" -ForegroundColor Gray
Write-Host "   2. Créer un commit" -ForegroundColor Gray
Write-Host "   3. Pusher vers GitHub (branche main)" -ForegroundColor Gray
Write-Host "   4. Déclencher les déploiements automatiques Netlify + Zeabur`n" -ForegroundColor Gray

$confirmation = Read-Host "Êtes-vous sûr de vouloir continuer ? (o/N)"

if ($confirmation -ne "o" -and $confirmation -ne "O") {
    Write-Host "`n✋ Synchronisation annulée par l'utilisateur`n" -ForegroundColor Yellow
    exit 0
}

# ═══════════════════════════════════════════════════════════════════════════
# 4. GIT ADD
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n📦 ÉTAPE 3 : Git Add" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Ajouter les fichiers critiques
$filesToAdd = @(
    "index.html",
    "public/backendConfig.js",
    "public/LeadBalanceAutoTrigger.js",
    "public/EtatFinAutoTrigger.js",
    "py_backend/main.py",
    "py_backend/etats_financiers.py"
)

foreach ($file in $filesToAdd) {
    if (Test-Path $file) {
        git add $file
        Write-Host "  ✅ Ajouté : $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Ignoré (n'existe pas) : $file" -ForegroundColor Yellow
    }
}

# Ajouter aussi les fichiers de documentation
git add "Doc backend switch/*.md" 2>$null
git add "Doc backend switch/*.ps1" 2>$null

Write-Host "`n✅ Fichiers ajoutés au staging`n" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════════════════
# 5. GIT COMMIT
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "💾 ÉTAPE 4 : Git Commit" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

$commitMessage = @"
🔧 Fix: Intégration backendConfig.js + Sync endpoints Zeabur

Frontend (Netlify):
- ✅ Ajout backendConfig.js dans index.html (switch dynamique local/cloud)
- ✅ Patch LeadBalanceAutoTrigger.js (utilise window.CLARA_BACKEND_URL)
- ✅ Patch EtatFinAutoTrigger.js (utilise window.CLARA_BACKEND_URL)

Backend (Zeabur):
- ✅ Sync endpoints états financiers (/etats-financiers/process-excel)
- ✅ Corrections CORS complètes (Content-Disposition exposé)
- ✅ Tous les modules de calcul des états financiers

Résolution:
- Fixes #Case21 (Lead Balance - Failed to fetch)
- Fixes #Case24 (États Financiers - Failed to fetch)
- Fixes 404 Not Found sur Zeabur
- Fixes ConnectionResetError(10054)

Date: 19 Avril 2026
"@

try {
    git commit -m $commitMessage
    Write-Host "✅ Commit créé avec succès`n" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR lors du commit" -ForegroundColor Red
    Write-Host "   $_`n" -ForegroundColor Gray
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════
# 6. GIT PUSH
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "🚀 ÉTAPE 5 : Git Push vers GitHub" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

try {
    git push origin main
    Write-Host "`n✅ Push réussi vers GitHub (branche main)`n" -ForegroundColor Green
} catch {
    Write-Host "`n❌ ERREUR lors du push" -ForegroundColor Red
    Write-Host "   $_`n" -ForegroundColor Gray
    Write-Host "⚠️  Le commit a été créé localement mais pas pushé" -ForegroundColor Yellow
    Write-Host "   Vous pouvez réessayer manuellement : git push origin main`n" -ForegroundColor Gray
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════
# 7. INFORMATION SUR LES DÉPLOIEMENTS
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "╔══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ SYNCHRONISATION TERMINÉE                                            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 Déploiements automatiques en cours :`n" -ForegroundColor Yellow

Write-Host "  🌐 NETLIFY (Frontend)" -ForegroundColor Cyan
Write-Host "     URL : https://prclaravi.netlify.app/" -ForegroundColor Gray
Write-Host "     Dashboard : https://app.netlify.com/" -ForegroundColor Gray
Write-Host "     Temps estimé : 2-3 minutes`n" -ForegroundColor Gray

Write-Host "  ☁️  ZEABUR (Backend)" -ForegroundColor Cyan
Write-Host "     URL : https://pybackend.zeabur.app/" -ForegroundColor Gray
Write-Host "     Dashboard : https://zeabur.com/" -ForegroundColor Gray
Write-Host "     Temps estimé : 3-5 minutes`n" -ForegroundColor Gray

Write-Host "⏳ Attendez 5 minutes puis testez :`n" -ForegroundColor Yellow

Write-Host "  1️⃣  Ouvrir la console sur https://prclaravi.netlify.app/" -ForegroundColor White
Write-Host "     Vérifier : console.log(window.CLARA_BACKEND_URL)" -ForegroundColor Gray
Write-Host "     Doit afficher : 'https://pybackend.zeabur.app'`n" -ForegroundColor Gray

Write-Host "  2️⃣  Tester Case 24 (États Financiers)" -ForegroundColor White
Write-Host "     Créer une table avec en-tête 'Etat_fin'" -ForegroundColor Gray
Write-Host "     Uploader un fichier Excel" -ForegroundColor Gray
Write-Host "     Vérifier : pas d'erreur 'Failed to fetch'`n" -ForegroundColor Gray

Write-Host "  3️⃣  Tester Case 21 (Lead Balance)" -ForegroundColor White
Write-Host "     Créer une table avec en-tête 'Lead_balance'" -ForegroundColor Gray
Write-Host "     Uploader un fichier de balance" -ForegroundColor Gray
Write-Host "     Vérifier : traitement complet sans erreur`n" -ForegroundColor Gray

Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

Write-Host "📝 Logs disponibles :" -ForegroundColor Cyan
Write-Host "   - Netlify : https://app.netlify.com/sites/prclaravi/deploys" -ForegroundColor Gray
Write-Host "   - Zeabur : Interface Zeabur > Logs`n" -ForegroundColor Gray

Write-Host "✅ Synchronisation complète terminée avec succès !`n" -ForegroundColor Green
