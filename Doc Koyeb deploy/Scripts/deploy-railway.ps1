#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script automatisé de déploiement Railway pour Clara Backend

.DESCRIPTION
    Ce script automatise le déploiement du backend Python sur Railway via CLI.
    Il vérifie les prérequis, configure les variables d'environnement,
    et déploie le service.

.PARAMETER ProjectName
    Nom du projet Railway (défaut: clara-backend-production)

.PARAMETER SkipTests
    Sauter les tests post-déploiement

.EXAMPLE
    .\deploy-railway.ps1
    
.EXAMPLE
    .\deploy-railway.ps1 -ProjectName "mon-backend" -SkipTests

.NOTES
    Auteur: Clara Team
    Date: 16 Avril 2026
    Version: 1.0.0
#>

param(
    [string]$ProjectName = "clara-backend-production",
    [switch]$SkipTests
)

# Couleurs pour l'affichage
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Step {
    param([string]$Message)
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
    Write-Host "  $Message" -ForegroundColor $InfoColor
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-ErrorCustom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-WarningCustom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

# Vérifier que nous sommes dans le bon répertoire
Write-Step "Vérification de l'environnement"

$currentDir = Get-Location
Write-Info "Répertoire actuel: $currentDir"

# Vérifier si nous sommes dans py_backend ou à la racine
$backendDir = if (Test-Path "Dockerfile") {
    Get-Location
} elseif (Test-Path "py_backend/Dockerfile") {
    Join-Path $currentDir "py_backend"
} else {
    Write-ErrorCustom "Dockerfile introuvable. Assurez-vous d'être dans le répertoire du projet."
    exit 1
}

Write-Success "Répertoire backend trouvé: $backendDir"

# Se déplacer dans le répertoire backend
Set-Location $backendDir

# Vérifier les fichiers nécessaires
Write-Step "Vérification des fichiers nécessaires"

$requiredFiles = @("Dockerfile", "requirements.txt", "main.py")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file trouvé"
    } else {
        $missingFiles += $file
        Write-ErrorCustom "$file manquant"
    }
}

if ($missingFiles.Count -gt 0) {
    Write-ErrorCustom "Fichiers manquants: $($missingFiles -join ', ')"
    exit 1
}

# Vérifier que Railway CLI est installé
Write-Step "Vérification de Railway CLI"

try {
    $railwayVersion = railway --version 2>&1
    Write-Success "Railway CLI installé: $railwayVersion"
} catch {
    Write-ErrorCustom "Railway CLI n'est pas installé"
    Write-Info "Installation via npm: npm install -g @railway/cli"
    Write-Info "Ou via Scoop: scoop install railway"
    exit 1
}

# Vérifier la connexion Railway
Write-Step "Vérification de la connexion Railway"

try {
    $whoami = railway whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Connecté à Railway: $whoami"
    } else {
        Write-WarningCustom "Non connecté à Railway"
        Write-Info "Connexion en cours..."
        railway login
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorCustom "Échec de la connexion à Railway"
            exit 1
        }
        Write-Success "Connexion réussie"
    }
} catch {
    Write-ErrorCustom "Erreur lors de la vérification de la connexion"
    exit 1
}

# Initialiser le projet Railway si nécessaire
Write-Step "Initialisation du projet Railway"

$railwayJson = Join-Path $backendDir "railway.json"
if (-not (Test-Path $railwayJson)) {
    Write-Info "Aucun projet Railway détecté"
    Write-Info "Initialisation d'un nouveau projet: $ProjectName"
    
    railway init
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorCustom "Échec de l'initialisation du projet"
        exit 1
    }
    Write-Success "Projet initialisé"
} else {
    Write-Success "Projet Railway déjà configuré"
}

# Configurer les variables d'environnement
Write-Step "Configuration des variables d'environnement"

$envVars = @{
    "HOST" = "0.0.0.0"
    "PORT" = "5000"
    "PYTHONDONTWRITEBYTECODE" = "1"
    "PYTHONUNBUFFERED" = "1"
}

foreach ($key in $envVars.Keys) {
    Write-Info "Configuration de $key=$($envVars[$key])"
    railway variables set "$key=$($envVars[$key])"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$key configuré"
    } else {
        Write-WarningCustom "Échec de la configuration de $key (peut-être déjà défini)"
    }
}

# Déployer le backend
Write-Step "Déploiement du backend sur Railway"

Write-Info "Démarrage du déploiement..."
Write-Info "Cela peut prendre 3-5 minutes..."

railway up

if ($LASTEXITCODE -ne 0) {
    Write-ErrorCustom "Échec du déploiement"
    Write-Info "Vérifiez les logs: railway logs --deployment"
    exit 1
}

Write-Success "Déploiement réussi !"

# Récupérer l'URL du service
Write-Step "Récupération de l'URL du service"

$domain = railway domain 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "URL du service: $domain"
    Write-Info "Notez cette URL pour la configuration du frontend"
} else {
    Write-WarningCustom "Impossible de récupérer l'URL automatiquement"
    Write-Info "Récupérez l'URL manuellement: railway domain"
}

# Tests post-déploiement
if (-not $SkipTests) {
    Write-Step "Tests post-déploiement"
    
    # Test 1: Vérifier le statut
    Write-Info "Test 1: Vérification du statut du service"
    railway status
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Service actif"
    } else {
        Write-WarningCustom "Impossible de vérifier le statut"
    }
    
    # Test 2: Tester l'endpoint /health
    if ($domain) {
        Write-Info "Test 2: Test de l'endpoint /health"
        $healthUrl = "https://$domain/health"
        
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 30
            if ($response.StatusCode -eq 200) {
                Write-Success "Endpoint /health répond correctement"
            } else {
                Write-WarningCustom "Endpoint /health retourne: $($response.StatusCode)"
            }
        } catch {
            Write-WarningCustom "Impossible de tester /health: $_"
        }
    }
    
    # Test 3: Afficher les logs récents
    Write-Info "Test 3: Logs récents du service"
    railway logs --tail 20
}

# Rappel important
Write-Step "⚠️  ÉTAPE CRITIQUE - À FAIRE MANUELLEMENT"

Write-WarningCustom "VÉRIFICATION OBLIGATOIRE:"
Write-Info "1. Aller sur: https://railway.app/dashboard"
Write-Info "2. Sélectionner: $ProjectName"
Write-Info "3. Onglet: Settings"
Write-Info "4. Section: Sleep Settings"
Write-Info "5. VÉRIFIER que 'App Sleeping' est DÉSACTIVÉ (OFF)"
Write-Info ""
Write-WarningCustom "Cette étape garantit que votre backend reste actif 24/7 sans cold start"

# Mise à jour du frontend
Write-Step "Prochaine étape: Mise à jour du frontend"

Write-Info "Fichier à modifier: src/services/claraApiService.ts"
Write-Info ""
Write-Info "Remplacer:"
Write-Host "  https://hkj0631c.rpcl.app" -ForegroundColor Yellow
Write-Info "Par:"
Write-Host "  https://$domain" -ForegroundColor Green
Write-Info ""
Write-Info "Commande PowerShell pour remplacer automatiquement:"
Write-Host "  `$oldUrl = 'hkj0631c.rpcl.app'" -ForegroundColor Cyan
Write-Host "  `$newUrl = '$domain'" -ForegroundColor Cyan
Write-Host "  (Get-Content src/services/claraApiService.ts) -replace `$oldUrl, `$newUrl | Set-Content src/services/claraApiService.ts" -ForegroundColor Cyan

# Résumé final
Write-Step "✅ Déploiement terminé"

Write-Success "Backend déployé avec succès sur Railway"
Write-Info "URL du service: https://$domain"
Write-Info ""
Write-Info "Commandes utiles:"
Write-Host "  railway logs --follow" -ForegroundColor Cyan -NoNewline
Write-Host "  # Voir les logs en temps réel"
Write-Host "  railway status" -ForegroundColor Cyan -NoNewline
Write-Host "         # Vérifier le statut"
Write-Host "  railway open" -ForegroundColor Cyan -NoNewline
Write-Host "           # Ouvrir le dashboard"
Write-Host "  railway domain" -ForegroundColor Cyan -NoNewline
Write-Host "         # Voir l'URL"
Write-Info ""
Write-Success "Déploiement Railway terminé ! 🚀"

# Retourner au répertoire initial
Set-Location $currentDir
