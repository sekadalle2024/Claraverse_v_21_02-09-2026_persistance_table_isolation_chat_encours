# ============================================
# Script de Vérification Pré-Sauvegarde
# ClaraVerse V5
# ============================================

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  VÉRIFICATION PRÉ-SAUVEGARDE CLARAVERSE V5               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Vérifier Git
Write-Host "1. Vérification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✅ Git installé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Git n'est pas installé ou non accessible" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 2. Vérifier qu'on est dans un repository Git
Write-Host "2. Vérification du repository Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Repository Git détecté" -ForegroundColor Green
} else {
    Write-Host "   ❌ Pas de repository Git trouvé (.git manquant)" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 3. Vérifier la connexion Internet
Write-Host "3. Vérification de la connexion Internet..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName github.com -Count 1 -Quiet
    if ($ping) {
        Write-Host "   ✅ Connexion Internet active" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Impossible de joindre GitHub" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "   ⚠️  Vérification de connexion échouée" -ForegroundColor Yellow
}

Write-Host ""

# 4. Vérifier l'état Git
Write-Host "4. État du repository..." -ForegroundColor Yellow
try {
    $status = git status --porcelain
    if ($status) {
        $fileCount = ($status | Measure-Object).Count
        Write-Host "   ℹ️  $fileCount fichier(s) modifié(s) à sauvegarder" -ForegroundColor Cyan
    } else {
        Write-Host "   ℹ️  Aucune modification détectée" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier l'état Git" -ForegroundColor Yellow
}

Write-Host ""

# 5. Vérifier le remote actuel
Write-Host "5. Repository distant actuel..." -ForegroundColor Yellow
try {
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "   ℹ️  Remote actuel: $remote" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Aucun remote configuré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de récupérer le remote" -ForegroundColor Yellow
}

Write-Host ""

# 6. Vérifier la branche
Write-Host "6. Branche actuelle..." -ForegroundColor Yellow
try {
    $branch = git branch --show-current
    if ($branch) {
        Write-Host "   ℹ️  Branche: $branch" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Impossible de déterminer la branche" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification de la branche" -ForegroundColor Yellow
}

Write-Host ""

# 7. Vérifier la configuration Git
Write-Host "7. Configuration Git..." -ForegroundColor Yellow
try {
    $userName = git config user.name
    $userEmail = git config user.email
    
    if ($userName) {
        Write-Host "   ℹ️  Nom: $userName" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Nom d'utilisateur Git non configuré" -ForegroundColor Yellow
    }
    
    if ($userEmail) {
        Write-Host "   ℹ️  Email: $userEmail" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Email Git non configuré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier la configuration Git" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Résumé
Write-Host ""
if ($allGood) {
    Write-Host "✅ TOUT EST PRÊT POUR LA SAUVEGARDE !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant exécuter:" -ForegroundColor White
    Write-Host "   .\push-to-github-v5.ps1" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  ATTENTION: Certaines vérifications ont échoué" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Veuillez corriger les problèmes avant de continuer." -ForegroundColor White
    Write-Host "Consultez GUIDE_SAUVEGARDE_GITHUB_V5.md pour plus d'aide." -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Informations du repository cible
Write-Host "📦 Repository cible:" -ForegroundColor Cyan
Write-Host "   https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git" -ForegroundColor White
Write-Host ""
