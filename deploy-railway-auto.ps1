#!/usr/bin/env pwsh
# Script automatisé de déploiement Railway pour Clara Backend
# Date: 16 Avril 2026

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Déploiement automatique Railway - Clara Backend" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Étape 1: Vérifier Railway CLI
Write-Host "`n[1/7] Vérification de Railway CLI..." -ForegroundColor Yellow

try {
    $version = railway --version 2>&1
    Write-Host "✅ Railway CLI installé: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI non installé" -ForegroundColor Red
    Write-Host "Installation: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Vérifier la connexion
Write-Host "`n[2/7] Vérification de la connexion Railway..." -ForegroundColor Yellow

$whoami = railway whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connecté: $whoami" -ForegroundColor Green
} else {
    Write-Host "⚠️  Non connecté, connexion en cours..." -ForegroundColor Yellow
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de la connexion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
}

# Étape 3: Se déplacer dans py_backend
Write-Host "`n[3/7] Navigation vers py_backend..." -ForegroundColor Yellow

if (Test-Path "py_backend") {
    Set-Location "py_backend"
    Write-Host "✅ Dans py_backend" -ForegroundColor Green
} elseif (Test-Path "Dockerfile") {
    Write-Host "✅ Déjà dans py_backend" -ForegroundColor Green
} else {
    Write-Host "❌ Répertoire py_backend introuvable" -ForegroundColor Red
    exit 1
}

# Étape 4: Vérifier les fichiers
Write-Host "`n[4/7] Vérification des fichiers..." -ForegroundColor Yellow

$files = @("Dockerfile", "requirements.txt", "main.py")
$ok = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file manquant" -ForegroundColor Red
        $ok = $false
    }
}

if (-not $ok) {
    Write-Host "❌ Fichiers manquants" -ForegroundColor Red
    exit 1
}

# Étape 5: Initialiser le projet
Write-Host "`n[5/7] Initialisation du projet Railway..." -ForegroundColor Yellow

if (-not (Test-Path "railway.json")) {
    Write-Host "Création d'un nouveau projet..." -ForegroundColor Cyan
    railway init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de l'initialisation" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Projet initialisé" -ForegroundColor Green
} else {
    Write-Host "✅ Projet déjà configuré" -ForegroundColor Green
}

# Étape 6: Configurer les variables
Write-Host "`n[6/7] Configuration des variables d'environnement..." -ForegroundColor Yellow

$vars = @{
    "HOST" = "0.0.0.0"
    "PORT" = "5000"
    "PYTHONDONTWRITEBYTECODE" = "1"
    "PYTHONUNBUFFERED" = "1"
}

foreach ($key in $vars.Keys) {
    Write-Host "  Configuring $key=$($vars[$key])..." -ForegroundColor Cyan
    railway variables set "$key=$($vars[$key])" 2>&1 | Out-Null
}
Write-Host "✅ Variables configurées" -ForegroundColor Green

# Étape 7: Déployer
Write-Host "`n[7/7] Déploiement sur Railway..." -ForegroundColor Yellow
Write-Host "⏳ Cela peut prendre 3-5 minutes..." -ForegroundColor Cyan
Write-Host ""

railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Échec du déploiement" -ForegroundColor Red
    Write-Host "Vérifiez les logs: railway logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Déploiement réussi !" -ForegroundColor Green

# Récupérer l'URL
Write-Host "`nRécupération de l'URL..." -ForegroundColor Yellow
$domain = railway domain 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ URL: https://$domain" -ForegroundColor Green
    
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ⚠️  ÉTAPE CRITIQUE - À FAIRE MAINTENANT" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "1. Ouvrir: https://railway.app/dashboard" -ForegroundColor White
    Write-Host "2. Sélectionner votre projet" -ForegroundColor White
    Write-Host "3. Settings → Sleep Settings" -ForegroundColor White
    Write-Host "4. DÉSACTIVER 'App Sleeping' (OFF)" -ForegroundColor Red
    Write-Host ""
    Write-Host "5. Mettre à jour le frontend:" -ForegroundColor White
    Write-Host "   Fichier: src/services/claraApiService.ts" -ForegroundColor Cyan
    Write-Host "   Remplacer: hkj0631c.rpcl.app" -ForegroundColor Yellow
    Write-Host "   Par: $domain" -ForegroundColor Green
    
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ Déploiement terminé !" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Récupérez l'URL manuellement: railway domain" -ForegroundColor Yellow
}

# Retour au répertoire racine
Set-Location ..
