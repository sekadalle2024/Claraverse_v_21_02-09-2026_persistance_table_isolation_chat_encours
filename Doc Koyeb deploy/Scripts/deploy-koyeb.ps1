# Script de déploiement automatique sur Koyeb (PowerShell)
# Usage: .\deploy-koyeb.ps1 [environment]
# Environments: dev, staging, production

param(
    [Parameter(Position=0)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment = 'dev'
)

$ErrorActionPreference = "Stop"

# Configuration
$AppName = "clara-backend"
$ServiceName = "clara-service"
$BackendDir = "py_backend"

# Configuration selon l'environnement
switch ($Environment) {
    'dev' {
        $InstanceType = "nano"
        $MinScale = 1
        $MaxScale = 1
        $Region = "fra"
    }
    'staging' {
        $InstanceType = "small"
        $MinScale = 1
        $MaxScale = 2
        $Region = "fra"
    }
    'production' {
        $InstanceType = "medium"
        $MinScale = 2
        $MaxScale = 4
        $Region = "fra"
    }
}

Write-Host "🚀 Déploiement Clara Backend sur Koyeb" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Environnement: $Environment" -ForegroundColor Green
Write-Host "Instance: $InstanceType" -ForegroundColor Green
Write-Host "Scale: $MinScale-$MaxScale" -ForegroundColor Green
Write-Host "Région: $Region" -ForegroundColor Green
Write-Host ""

# Vérifier que Koyeb CLI est installé
try {
    $null = Get-Command koyeb -ErrorAction Stop
} catch {
    Write-Host "❌ Koyeb CLI n'est pas installé" -ForegroundColor Red
    Write-Host "Installation:" -ForegroundColor Yellow
    Write-Host "curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh"
    Write-Host "export PATH=`$HOME/.koyeb/bin:`$PATH"
    exit 1
}

# Vérifier l'authentification
Write-Host "🔐 Vérification de l'authentification..." -ForegroundColor Blue
try {
    $null = koyeb service list 2>&1
    Write-Host "✅ Authentifié" -ForegroundColor Green
} catch {
    Write-Host "❌ Non authentifié sur Koyeb" -ForegroundColor Red
    Write-Host "Exécutez: koyeb login" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Vérifier que le dossier backend existe
if (-not (Test-Path $BackendDir)) {
    Write-Host "❌ Le dossier $BackendDir n'existe pas" -ForegroundColor Red
    exit 1
}

# Vérifier les fichiers requis
Write-Host "📋 Vérification des fichiers..." -ForegroundColor Blue
$RequiredFiles = @(
    "$BackendDir/main.py",
    "$BackendDir/Dockerfile",
    "$BackendDir/requirements.txt"
)

foreach ($file in $RequiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Fichier manquant: $file" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ $file" -ForegroundColor Green
}
Write-Host ""

# Charger les variables d'environnement depuis .env si présent
$EnvArgs = @()
$EnvArgs += "--env", "HOST=0.0.0.0"
$EnvArgs += "--env", "PORT=5000"
$EnvArgs += "--env", "PYTHONUNBUFFERED=1"
$EnvArgs += "--env", "PYTHONDONTWRITEBYTECODE=1"

if (Test-Path ".env") {
    Write-Host "📦 Chargement des variables d'environnement depuis .env" -ForegroundColor Blue
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            
            # Ajouter les variables importantes aux arguments
            if ($key -in @('OPENAI_API_KEY', 'NEO4J_URI', 'NEO4J_USERNAME', 'NEO4J_PASSWORD')) {
                $EnvArgs += "--env", "$key=$value"
            }
        }
    }
    Write-Host "✅ Variables chargées" -ForegroundColor Green
    Write-Host ""
}

# Se positionner dans le dossier backend
Push-Location $BackendDir

# Déployer sur Koyeb
Write-Host "🚀 Déploiement en cours..." -ForegroundColor Blue
Write-Host ""

$DeployArgs = @(
    "deploy", ".",
    "$AppName/$ServiceName",
    "--archive-builder", "docker",
    "--archive-docker-dockerfile", "Dockerfile",
    "--type", "WEB",
    "--ports", "5000:http",
    "--routes", "/:5000",
    "--regions", $Region,
    "--instance-type", $InstanceType,
    "--min-scale", $MinScale,
    "--max-scale", $MaxScale
) + $EnvArgs

try {
    & koyeb @DeployArgs
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ Déploiement réussi !" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Commandes utiles :" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  # Vérifier le statut" -ForegroundColor Yellow
    Write-Host "  koyeb service get $AppName/$ServiceName"
    Write-Host ""
    Write-Host "  # Voir les logs" -ForegroundColor Yellow
    Write-Host "  koyeb service logs $AppName/$ServiceName"
    Write-Host ""
    Write-Host "  # Voir les logs de build" -ForegroundColor Yellow
    Write-Host "  koyeb service logs $AppName/$ServiceName --type build"
    Write-Host ""
    Write-Host "🌐 Votre API sera disponible à :" -ForegroundColor Blue
    Write-Host "  https://$AppName-[your-org].koyeb.app"
    Write-Host ""
    Write-Host "📚 Endpoints disponibles :" -ForegroundColor Blue
    Write-Host "  GET  /              - Root endpoint"
    Write-Host "  GET  /health        - Health check"
    Write-Host "  GET  /docs          - API documentation (Swagger)"
    Write-Host "  POST /notebooks     - Créer un notebook"
    Write-Host "  GET  /notebooks     - Lister les notebooks"
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "❌ Échec du déploiement" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez les logs avec :" -ForegroundColor Yellow
    Write-Host "  koyeb service logs $AppName/$ServiceName --type build"
    Pop-Location
    exit 1
}

Pop-Location
