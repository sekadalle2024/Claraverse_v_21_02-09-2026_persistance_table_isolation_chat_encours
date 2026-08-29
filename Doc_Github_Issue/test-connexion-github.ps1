# ============================================
# Script de Test de Connexion GitHub
# ClaraVerse V5
# ============================================

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST DE CONNEXION GITHUB - CLARAVERSE V5                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$repoUrl = "https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_21-03-2026_V5-Public-Public-Public.git"

# Test 1: Ping GitHub
Write-Host "1. Test de connexion à GitHub.com..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName github.com -Count 2 -Quiet
    if ($ping) {
        Write-Host "   ✅ GitHub.com est accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Impossible de joindre GitHub.com" -ForegroundColor Red
        Write-Host "   → Vérifiez votre connexion Internet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Test de ping échoué: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Vérifier l'accès au repository
Write-Host "2. Test d'accès au repository..." -ForegroundColor Yellow
Write-Host "   URL: $repoUrl" -ForegroundColor Cyan
try {
    $result = git ls-remote $repoUrl 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Repository accessible" -ForegroundColor Green
        Write-Host "   ℹ️  Branches disponibles:" -ForegroundColor Cyan
        $result | Select-Object -First 5 | ForEach-Object {
            Write-Host "      $_" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ Impossible d'accéder au repository" -ForegroundColor Red
        Write-Host "   → Vérifiez vos droits d'accès" -ForegroundColor Yellow
        Write-Host "   → Le repository existe-t-il sur GitHub ?" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Vérifier les identifiants Git
Write-Host "3. Vérification des identifiants Git..." -ForegroundColor Yellow
$userName = git config user.name
$userEmail = git config user.email

if ($userName -and $userEmail) {
    Write-Host "   ✅ Identifiants configurés" -ForegroundColor Green
    Write-Host "   ℹ️  Nom: $userName" -ForegroundColor Cyan
    Write-Host "   ℹ️  Email: $userEmail" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  Identifiants incomplets" -ForegroundColor Yellow
    if (-not $userName) {
        Write-Host "   → Configurez votre nom: git config --global user.name 'Votre Nom'" -ForegroundColor Yellow
    }
    if (-not $userEmail) {
        Write-Host "   → Configurez votre email: git config --global user.email 'votre@email.com'" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 4: Vérifier les credentials
Write-Host "4. Test d'authentification..." -ForegroundColor Yellow
try {
    $credHelper = git config credential.helper
    if ($credHelper) {
        Write-Host "   ℹ️  Credential helper: $credHelper" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Aucun credential helper configuré" -ForegroundColor Yellow
        Write-Host "   → Vous devrez peut-être entrer vos identifiants lors du push" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier les credentials" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: Simuler un fetch (sans modifier le repo local)
Write-Host "5. Test de fetch (simulation)..." -ForegroundColor Yellow
try {
    git fetch --dry-run origin 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Fetch réussi (simulation)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Fetch échoué - vérifiez vos droits" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Test de fetch non concluant" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Résumé et recommandations
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si tous les tests sont ✅, vous pouvez procéder à la sauvegarde:" -ForegroundColor White
Write-Host "   .\push-to-github-v5.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si des tests ont échoué ❌, consultez:" -ForegroundColor White
Write-Host "   GUIDE_SAUVEGARDE_GITHUB_V5.md (section Résolution de Problèmes)" -ForegroundColor Cyan
Write-Host ""

# Informations supplémentaires
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 CONSEILS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "• Si l'authentification échoue, vous aurez besoin d'un Personal Access Token" -ForegroundColor White
Write-Host "  Créez-en un sur: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Utilisez le token comme mot de passe lors du push" -ForegroundColor White
Write-Host ""
Write-Host "• Pour sauvegarder le token:" -ForegroundColor White
Write-Host "  git config --global credential.helper wincred" -ForegroundColor Cyan
Write-Host ""
