#!/usr/bin/env pwsh
# Script de déploiement Railway - Utilise le projet existant
# Date: 16 Avril 2026

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Déploiement Railway - Projet existant" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Étape 1: Vérifier Railway CLI
Write-Host "[1/6] Vérification de Railway CLI..." -ForegroundColor Yellow

try {
    $version = railway --version 2>&1
    Write-Host "✅ Railway CLI: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI non installé" -ForegroundColor Red
    exit 1
}

# Étape 2: Vérifier la connexion
Write-Host "`n[2/6] Vérification de la connexion..." -ForegroundColor Yellow

$whoami = railway whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connecté: $whoami" -ForegroundColor Green
} else {
    Write-Host "❌ Non connecté" -ForegroundColor Red
    exit 1
}

# Étape 3: Lister les projets
Write-Host "`n[3/6] Projets Railway disponibles..." -ForegroundColor Yellow
railway list

# Étape 4: Lier au projet existant
Write-Host "`n[4/6] Liaison au projet 'pybackend'..." -ForegroundColor Yellow

Set-Location "py_backend"

Write-Host "Sélectionnez le projet 'pybackend' dans la liste..." -ForegroundColor Cyan
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la liaison" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Projet lié" -ForegroundColor Green

# Étape 5: Configurer les variables
Write-Host "`n[5/6] Configuration des variables..." -ForegroundColor Yellow

railway variables set "HOST=0.0.0.0" 2>&1 | Out-Null
railway variables set "PORT=5000" 2>&1 | Out-Null
railway variables set "PYTHONDONTWRITEBYTECODE=1" 2>&1 | Out-Null
railway variables set "PYTHONUNBUFFERED=1" 2>&1 | Out-Null

Write-Host "✅ Variables configurées" -ForegroundColor Green

# Étape 6: Déployer
Write-Host "`n[6/6] Déploiement..." -ForegroundColor Yellow
Write-Host "⏳ Cela peut prendre 3-5 minutes..." -ForegroundColor Cyan
Write-Host ""

railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Échec du déploiement" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "`n✅ Déploiement réussi !" -ForegroundColor Green

# Récupérer l'URL
Write-Host "`nRécupération de l'URL..." -ForegroundColor Yellow
railway domain

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ⚠️  ÉTAPES CRITIQUES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1. Dashboard: https://railway.app/project/a3855675-b57e-430b-8f3f-944367fad6a7" -ForegroundColor White
Write-Host "2. Settings → Sleep Settings → DÉSACTIVER 'App Sleeping'" -ForegroundColor Red
Write-Host "3. Settings → Networking → Generate Domain (si pas encore fait)" -ForegroundColor White
Write-Host "4. Mettre à jour src/services/claraApiService.ts avec la nouvelle URL" -ForegroundColor White

Write-Host "`n✅ Terminé !" -ForegroundColor Green

Set-Location ..
