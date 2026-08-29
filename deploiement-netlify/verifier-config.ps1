# Script de vérification de la configuration Netlify - ClaraVerse
# Ce script vérifie que tout est correctement configuré pour le déploiement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION CONFIGURATION NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Fonction pour marquer une erreur
function Mark-Error {
    param([string]$ErrorMessage)
    Write-Host "  ERREUR: $ErrorMessage" -ForegroundColor Red
    $script:allGood = $false
}

# Fonction pour marquer un succès
function Mark-Success {
    param([string]$SuccessMessage)
    Write-Host "  OK: $SuccessMessage" -ForegroundColor Green
}

# Fonction pour marquer un avertissement
function Mark-Warning {
    param([string]$WarningMessage)
    Write-Host "  ATTENTION: $WarningMessage" -ForegroundColor Yellow
}

Write-Host "1. VERIFICATION DES OUTILS" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan

# Vérifier Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Mark-Success "Node.js installe - Version: $nodeVersion"
} else {
    Mark-Error "Node.js non installe"
}

# Vérifier npm
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Mark-Success "npm installe - Version: $npmVersion"
} else {
    Mark-Error "npm non installe"
}

# Vérifier Netlify CLI
$netlifyVersion = netlify --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Mark-Success "Netlify CLI installe - Version: $netlifyVersion"
} else {
    Mark-Error "Netlify CLI non installe. Executez: npm install -g netlify-cli"
}

Write-Host ""
Write-Host "2. VERIFICATION DE L'AUTHENTIFICATION" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan

# Vérifier l'authentification Netlify
$statusOutput = netlify status 2>&1
if ($LASTEXITCODE -eq 0) {
    Mark-Success "Authentifie sur Netlify"
    
    # Extraire les informations du statut
    $statusLines = $statusOutput -split "`n"
    foreach ($line in $statusLines) {
        if ($line -match "Email:\s*(.+)") {
            Write-Host "    Email: $($matches[1])" -ForegroundColor Gray
        }
        if ($line -match "Current project:\s*(.+)") {
            Write-Host "    Projet: $($matches[1])" -ForegroundColor Gray
        }
        if ($line -match "Project URL:\s*(.+)") {
            Write-Host "    URL: $($matches[1])" -ForegroundColor Gray
        }
    }
} else {
    Mark-Error "Non authentifie sur Netlify. Executez: netlify login"
}

Write-Host ""
Write-Host "3. VERIFICATION DES FICHIERS DE CONFIGURATION" -ForegroundColor Cyan
Write-Host "----------------------------------------------" -ForegroundColor Cyan

# Vérifier package.json
if (Test-Path "../package.json") {
    Mark-Success "package.json trouve"
    
    # Vérifier le script de build
    $packageContent = Get-Content "../package.json" -Raw | ConvertFrom-Json
    if ($packageContent.scripts.build) {
        Mark-Success "Script de build configure: $($packageContent.scripts.build)"
    } else {
        Mark-Error "Script de build manquant dans package.json"
    }
} else {
    Mark-Error "package.json non trouve"
}

# Vérifier netlify.toml
if (Test-Path "../netlify.toml") {
    Mark-Success "netlify.toml trouve"
    
    # Lire le contenu pour vérifier la configuration
    $netlifyConfig = Get-Content "../netlify.toml" -Raw
    if ($netlifyConfig -match 'command\s*=\s*"([^"]+)"') {
        Write-Host "    Commande de build: $($matches[1])" -ForegroundColor Gray
    }
    if ($netlifyConfig -match 'publish\s*=\s*"([^"]+)"') {
        Write-Host "    Dossier de publication: $($matches[1])" -ForegroundColor Gray
    }
} else {
    Mark-Warning "netlify.toml non trouve (optionnel mais recommande)"
}

# Vérifier .netlify-ignore
if (Test-Path "../.netlify-ignore") {
    Mark-Success ".netlify-ignore trouve"
} else {
    Mark-Warning ".netlify-ignore non trouve (optionnel)"
}

Write-Host ""
Write-Host "4. VERIFICATION DE L'ENVIRONNEMENT" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Vérifier node_modules
if (Test-Path "../node_modules") {
    Mark-Success "node_modules trouve"
} else {
    Mark-Warning "node_modules non trouve. Executez: npm install"
}

# Vérifier si un build existe
if (Test-Path "../dist") {
    $distSize = (Get-ChildItem -Path "../dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Mark-Success "Dossier dist existe - Taille: $([math]::Round($distSize, 1)) MB"
} else {
    Mark-Warning "Dossier dist non trouve. Executez: npm run build"
}

Write-Host ""
Write-Host "5. VERIFICATION DE LA CONNECTIVITE" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Test de connectivité vers Netlify
try {
    $response = Invoke-WebRequest -Uri "https://api.netlify.com/api/v1/sites" -Method HEAD -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Mark-Success "Connectivite vers Netlify API"
    } else {
        Mark-Warning "Reponse inattendue de l'API Netlify"
    }
} catch {
    Mark-Error "Impossible de contacter l'API Netlify. Verifiez votre connexion internet"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  CONFIGURATION COMPLETE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tout est pret pour le deploiement !" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes disponibles:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1          - Deploiement complet" -ForegroundColor White
    Write-Host "  .\deploy-rapide.ps1   - Deploiement rapide" -ForegroundColor White
    Write-Host "  .\build-only.ps1      - Build uniquement" -ForegroundColor White
} else {
    Write-Host "  PROBLEMES DETECTES !" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Corrigez les erreurs ci-dessus avant de deployer." -ForegroundColor Yellow
    Write-Host "Consultez MEMO_PROBLEMES_SOLUTIONS.md pour les solutions." -ForegroundColor Yellow
}