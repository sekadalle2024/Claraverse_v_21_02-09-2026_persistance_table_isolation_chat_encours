# Script de Réinstallation CLI Koyeb et Déploiement Backend
# Date: 3 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RÉINSTALLATION CLI KOYEB ET DÉPLOIEMENT BACKEND PYTHON" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les étapes
function Write-Step {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Yellow
}

# Fonction pour afficher le succès
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# Fonction pour afficher les erreurs
function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Fonction pour afficher les infos
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# ═══════════════════════════════════════════════════════════
# ÉTAPE 1 : VÉRIFICATION DE L'ENVIRONNEMENT
# ═══════════════════════════════════════════════════════════

Write-Step "Étape 1/5 : Vérification de l'environnement"

# Vérifier si bash est disponible
$bashAvailable = Get-Command bash -ErrorAction SilentlyContinue
if (-not $bashAvailable) {
    Write-Error-Custom "Bash n'est pas disponible. Installation via Git Bash ou WSL recommandée."
    Write-Info "Vous pouvez installer Git Bash depuis: https://git-scm.com/downloads"
    $continue = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($continue -ne "o") {
        exit 1
    }
} else {
    Write-Success "Bash est disponible"
}

# Vérifier si curl est disponible
$curlAvailable = Get-Command curl -ErrorAction SilentlyContinue
if (-not $curlAvailable) {
    Write-Error-Custom "Curl n'est pas disponible"
} else {
    Write-Success "Curl est disponible"
}

# ═══════════════════════════════════════════════════════════
# ÉTAPE 2 : INSTALLATION DE LA CLI KOYEB
# ═══════════════════════════════════════════════════════════

Write-Step "Étape 2/5 : Installation de la CLI Koyeb"

# Vérifier si Koyeb CLI est déjà installée
$koyebInstalled = Get-Command koyeb -ErrorAction SilentlyContinue
if ($koyebInstalled) {
    Write-Info "CLI Koyeb déjà installée"
    $version = & koyeb version 2>&1
    Write-Info "Version: $version"
    
    $reinstall = Read-Host "Voulez-vous réinstaller? (o/n)"
    if ($reinstall -ne "o") {
        Write-Success "Utilisation de l'installation existante"
    } else {
        Write-Info "Réinstallation de la CLI Koyeb..."
        if (Test-Path "$HOME/.koyeb") {
            Remove-Item -Recurse -Force "$HOME/.koyeb"
        }
        $koyebInstalled = $null
    }
}

if (-not $koyebInstalled) {
    Write-Info "Installation de la CLI Koyeb via script..."
    
    try {
        # Télécharger et exécuter le script d'installation
        if ($bashAvailable) {
            bash -c "curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh"
            
            # Ajouter au PATH pour la session actuelle
            $env:PATH = "$HOME/.koyeb/bin;$env:PATH"
            
            Write-Success "CLI Koyeb installée avec succès"
            Write-Info "Emplacement: $HOME/.koyeb/bin/koyeb"
            
            # Vérifier l'installation
            $koyebCheck = Get-Command koyeb -ErrorAction SilentlyContinue
            if ($koyebCheck) {
                $version = & koyeb version 2>&1
                Write-Success "Version installée: $version"
            } else {
                Write-Error-Custom "La CLI Koyeb n'est pas accessible dans le PATH"
                Write-Info "Ajoutez manuellement au PATH: `$env:PATH = `"$HOME/.koyeb/bin;`$env:PATH`""
            }
        } else {
            Write-Error-Custom "Impossible d'installer sans bash"
            Write-Info "Installez manuellement depuis: https://github.com/koyeb/koyeb-cli/releases"
            exit 1
        }
    } catch {
        Write-Error-Custom "Erreur lors de l'installation: $_"
        exit 1
    }
}

# ═══════════════════════════════════════════════════════════
# ÉTAPE 3 : AUTHENTIFICATION KOYEB
# ═══════════════════════════════════════════════════════════

Write-Step "Étape 3/5 : Authentification Koyeb"

Write-Info "Vérification de l'authentification..."
$authCheck = & koyeb app list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Authentification requise"
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  AUTHENTIFICATION MANUELLE REQUISE                    ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  1. La commande suivante va ouvrir votre navigateur   ║" -ForegroundColor White
    Write-Host "║  2. Connectez-vous à votre compte Koyeb               ║" -ForegroundColor White
    Write-Host "║  3. Autorisez l'accès CLI                             ║" -ForegroundColor White
    Write-Host "║  4. Revenez à ce terminal                             ║" -ForegroundColor White
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $ready = Read-Host "Appuyez sur Entrée pour lancer l'authentification"
    
    & koyeb login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Authentification réussie"
    } else {
        Write-Error-Custom "Échec de l'authentification"
        exit 1
    }
} else {
    Write-Success "Déjà authentifié"
}

# ═══════════════════════════════════════════════════════════
# ÉTAPE 4 : VÉRIFICATION DU DÉPLOIEMENT EXISTANT
# ═══════════════════════════════════════════════════════════

Write-Step "Étape 4/5 : Vérification du déploiement existant"

Write-Info "Récupération des services..."
$services = & koyeb service list 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Services récupérés"
    Write-Host ""
    Write-Host $services
    Write-Host ""
} else {
    Write-Error-Custom "Impossible de récupérer les services"
}

# Vérifier si le service clara-backend existe
Write-Info "Vérification du service clara-backend/clara-service..."
$serviceInfo = & koyeb service get clara-backend/clara-service 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Service clara-backend/clara-service trouvé"
    Write-Host ""
    Write-Host $serviceInfo
    Write-Host ""
} else {
    Write-Info "Service clara-backend/clara-service non trouvé (sera créé)"
}

# ═══════════════════════════════════════════════════════════
# ÉTAPE 5 : DÉPLOIEMENT DU BACKEND
# ═══════════════════════════════════════════════════════════

Write-Step "Étape 5/5 : Déploiement du backend Python"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  OPTIONS DE DÉPLOIEMENT                                ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  1. Déploiement rapide (instance nano, gratuit)       ║" -ForegroundColor White
Write-Host "║  2. Déploiement standard (instance small)             ║" -ForegroundColor White
Write-Host "║  3. Déploiement production (instance medium)          ║" -ForegroundColor White
Write-Host "║  4. Annuler                                            ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Choisissez une option (1-4)"

switch ($choice) {
    "1" {
        $instanceType = "nano"
        $minScale = 1
        $maxScale = 1
        Write-Info "Déploiement avec instance nano (gratuit)"
    }
    "2" {
        $instanceType = "small"
        $minScale = 1
        $maxScale = 2
        Write-Info "Déploiement avec instance small"
    }
    "3" {
        $instanceType = "medium"
        $minScale = 2
        $maxScale = 4
        Write-Info "Déploiement avec instance medium (production)"
    }
    "4" {
        Write-Info "Déploiement annulé"
        exit 0
    }
    default {
        Write-Error-Custom "Option invalide"
        exit 1
    }
}

# Vérifier que le dossier py_backend existe
if (-not (Test-Path "py_backend")) {
    Write-Error-Custom "Le dossier py_backend n'existe pas"
    Write-Info "Assurez-vous d'exécuter ce script depuis la racine du projet"
    exit 1
}

Write-Info "Changement de répertoire vers py_backend..."
Set-Location py_backend

Write-Info "Lancement du déploiement..."
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  DÉPLOIEMENT EN COURS                                  ║" -ForegroundColor Yellow
Write-Host "║  Cela peut prendre 5-10 minutes...                     ║" -ForegroundColor Yellow
Write-Host "║  (Installation de spaCy et dépendances)                ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Construire la commande de déploiement
$deployCmd = "koyeb deploy . clara-backend/clara-service " +
             "--archive-builder docker " +
             "--archive-docker-dockerfile Dockerfile " +
             "--type WEB " +
             "--ports 5000:http " +
             "--routes /:5000 " +
             "--regions fra " +
             "--instance-type $instanceType " +
             "--min-scale $minScale " +
             "--max-scale $maxScale"

Write-Info "Commande: $deployCmd"
Write-Host ""

# Exécuter le déploiement
Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Success "Déploiement lancé avec succès!"
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  DÉPLOIEMENT RÉUSSI                                    ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Info "Vérification du statut du service..."
    Start-Sleep -Seconds 5
    & koyeb service get clara-backend/clara-service
    
    Write-Host ""
    Write-Info "Pour suivre les logs en temps réel:"
    Write-Host "  koyeb service logs clara-backend/clara-service --follow" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Pour voir les logs de build:"
    Write-Host "  koyeb service logs clara-backend/clara-service --type build" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Error-Custom "Échec du déploiement"
    Write-Info "Consultez les logs pour plus de détails:"
    Write-Host "  koyeb service logs clara-backend/clara-service --type build" -ForegroundColor Cyan
    exit 1
}

# Retour au répertoire racine
Set-Location ..

# ═══════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DE L'INSTALLATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Success "✓ CLI Koyeb installée"
Write-Success "✓ Authentification réussie"
Write-Success "✓ Backend déployé"
Write-Host ""
Write-Info "Prochaines étapes:"
Write-Host "  1. Attendre la fin du build (5-10 minutes)" -ForegroundColor White
Write-Host "  2. Vérifier le statut: koyeb service get clara-backend/clara-service" -ForegroundColor White
Write-Host "  3. Tester l'API: https://clara-backend-[your-org].koyeb.app/health" -ForegroundColor White
Write-Host ""
Write-Info "Documentation complète: GUIDE_REINSTALLATION_KOYEB_COMPLET_03_AVRIL_2026.md"
Write-Host ""
