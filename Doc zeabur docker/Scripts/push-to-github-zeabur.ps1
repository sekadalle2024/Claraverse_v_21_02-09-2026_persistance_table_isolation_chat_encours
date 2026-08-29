# ============================================
# Script: Push vers GitHub pour Zeabur
# Description: Prépare et push les fichiers Docker vers GitHub
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PUSH VERS GITHUB POUR DÉPLOIEMENT ZEABUR             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# ÉTAPE 1: Vérification des fichiers requis
# ============================================
Write-Host "▶ Vérification des fichiers requis" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

$requiredFiles = @(
    "docker-compose.yml",
    "Dockerfile.frontend",
    "py_backend/Dockerfile",
    "public/backendConfig.js"
)

$allFilesPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file : MANQUANT" -ForegroundColor Red
        $allFilesPresent = $false
    }
}

if (-not $allFilesPresent) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants!" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: .\Doc zeabur docker\Scripts\create-docker-compose.ps1" -ForegroundColor Yellow
    exit 1
}

# ============================================
# ÉTAPE 2: Vérification Git
# ============================================
Write-Host ""
Write-Host "▶ Vérification Git" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "  ✓ Git installé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Git n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier qu'on est dans un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "  ❌ Ce n'est pas un repository Git" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Repository Git détecté" -ForegroundColor Green

# Vérifier la branche actuelle
$currentBranch = git branch --show-current
Write-Host "  ✓ Branche actuelle: $currentBranch" -ForegroundColor Green

# ============================================
# ÉTAPE 3: Afficher les modifications
# ============================================
Write-Host ""
Write-Host "▶ Fichiers modifiés" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

$gitStatus = git status --short
if ($gitStatus) {
    $gitStatus | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "  Aucune modification détectée" -ForegroundColor Yellow
}

# ============================================
# ÉTAPE 4: Confirmation
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                    CONFIRMATION                            ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "Fichiers qui seront commités:" -ForegroundColor Cyan
Write-Host "  • docker-compose.yml" -ForegroundColor White
Write-Host "  • Dockerfile.frontend" -ForegroundColor White
Write-Host "  • py_backend/Dockerfile" -ForegroundColor White
Write-Host "  • public/backendConfig.js" -ForegroundColor White
Write-Host ""
Write-Host "Branche: $currentBranch" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Continuer avec le push vers GitHub? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

# ============================================
# ÉTAPE 5: Git Add
# ============================================
Write-Host ""
Write-Host "▶ Ajout des fichiers" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

try {
    git add docker-compose.yml
    Write-Host "  ✓ docker-compose.yml" -ForegroundColor Green
    
    git add Dockerfile.frontend
    Write-Host "  ✓ Dockerfile.frontend" -ForegroundColor Green
    
    git add py_backend/Dockerfile
    Write-Host "  ✓ py_backend/Dockerfile" -ForegroundColor Green
    
    git add public/backendConfig.js
    Write-Host "  ✓ public/backendConfig.js" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur lors de l'ajout des fichiers: $_" -ForegroundColor Red
    exit 1
}

# ============================================
# ÉTAPE 6: Git Commit
# ============================================
Write-Host ""
Write-Host "▶ Création du commit" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

$commitMessage = @"
fix: Correction build frontend Zeabur (npm + SDK)

Corrections appliquées:
1. npm ci → npm install --production=false
   - Résolution erreur package-lock.json incompatible
   - npm install plus tolérant et fonctionne toujours

2. Ajout COPY sdk/ dans Dockerfile.frontend
   - Résolution erreur "Could not resolve ../../sdk/src/ClaraFlowRunner"
   - SDK nécessaire pour AgentRunnerSDK.tsx et AgentRunner.tsx

Fichiers modifiés:
- Dockerfile.frontend: 2 corrections appliquées

Déploiement:
- Frontend: https://prclaravi.zeabur.app (prêt après redéploiement)
- Backend: https://pybackend.zeabur.app (déjà fonctionnel ✅)
"@

try {
    git commit -m $commitMessage
    Write-Host "  ✓ Commit créé avec succès" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Aucune modification à commiter ou erreur: $_" -ForegroundColor Yellow
}

# ============================================
# ÉTAPE 7: Git Push
# ============================================
Write-Host ""
Write-Host "▶ Push vers GitHub" -ForegroundColor Yellow
Write-Host ("─" * 60) -ForegroundColor DarkGray

try {
    git push origin $currentBranch
    Write-Host "  ✓ Push réussi vers origin/$currentBranch" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur lors du push: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez:" -ForegroundColor Yellow
    Write-Host "  • Que vous êtes connecté à GitHub" -ForegroundColor White
    Write-Host "  • Que vous avez les droits d'écriture sur le repository" -ForegroundColor White
    Write-Host "  • Votre connexion internet" -ForegroundColor White
    exit 1
}

# ============================================
# RÉSUMÉ
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ SUCCÈS                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Fichiers pushés vers GitHub avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Aller sur https://zeabur.com/dashboard" -ForegroundColor White
Write-Host "2. Créer un nouveau projet: 'claraverse-production'" -ForegroundColor White
Write-Host "3. Ajouter le service Backend:" -ForegroundColor White
Write-Host "   • Git Repository → Votre repo" -ForegroundColor Gray
Write-Host "   • Build Method: Docker Compose" -ForegroundColor Gray
Write-Host "   • Service: backend" -ForegroundColor Gray
Write-Host "   • Port: 8080" -ForegroundColor Gray
Write-Host "   • Domain: pybackend.zeabur.app" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Ajouter le service Frontend:" -ForegroundColor White
Write-Host "   • Git Repository → Votre repo" -ForegroundColor Gray
Write-Host "   • Build Method: Docker Compose" -ForegroundColor Gray
Write-Host "   • Service: frontend" -ForegroundColor Gray
Write-Host "   • Port: 80" -ForegroundColor Gray
Write-Host "   • Domain: prclaravi.zeabur.app" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Cliquer 'Deploy' sur chaque service" -ForegroundColor White
Write-Host "6. Attendre le build (10-15 minutes)" -ForegroundColor White
Write-Host "7. Tester: https://prclaravi.zeabur.app" -ForegroundColor White
Write-Host ""
Write-Host "Documentation complète:" -ForegroundColor Cyan
Write-Host "  .\Doc zeabur docker\03_GUIDE_DEPLOIEMENT_ZEABUR_SANS_BUILD_LOCAL.md" -ForegroundColor Gray
Write-Host ""
