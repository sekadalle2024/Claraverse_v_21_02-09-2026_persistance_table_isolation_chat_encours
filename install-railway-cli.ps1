#!/usr/bin/env pwsh
# Script simplifié d'installation Railway CLI

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Installation Railway CLI" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Vérifier si Node.js est installé
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host "Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Railway CLI est déjà installé
Write-Host "`nVérification de Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Railway CLI déjà installé: $railwayVersion" -ForegroundColor Green
        $response = Read-Host "Voulez-vous réinstaller? (o/N)"
        if ($response -ne "o" -and $response -ne "O") {
            Write-Host "Installation annulée" -ForegroundColor Yellow
            exit 0
        }
    }
} catch {
    Write-Host "Railway CLI n'est pas installé" -ForegroundColor Yellow
}

# Installer Railway CLI
Write-Host "`nInstallation de Railway CLI via npm..." -ForegroundColor Yellow
Write-Host "Commande: npm install -g @railway/cli" -ForegroundColor Cyan

npm install -g @railway/cli

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Railway CLI installé avec succès!" -ForegroundColor Green
    
    # Vérifier l'installation
    $railwayVersion = railway --version 2>&1
    Write-Host "Version installée: $railwayVersion" -ForegroundColor Green
    
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Prochaines étapes" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "1. Se connecter à Railway:" -ForegroundColor Yellow
    Write-Host "   railway login" -ForegroundColor Cyan
    
    Write-Host "`n2. Naviguer vers le backend:" -ForegroundColor Yellow
    Write-Host "   cd py_backend" -ForegroundColor Cyan
    
    Write-Host "`n3. Initialiser le projet:" -ForegroundColor Yellow
    Write-Host "   railway init" -ForegroundColor Cyan
    
    Write-Host "`n4. Déployer:" -ForegroundColor Yellow
    Write-Host "   railway up" -ForegroundColor Cyan
    
    Write-Host "`n5. Récupérer l'URL:" -ForegroundColor Yellow
    Write-Host "   railway domain" -ForegroundColor Cyan
    
    Write-Host "`n⚠️  IMPORTANT: Après le déploiement" -ForegroundColor Red
    Write-Host "Vérifier que 'App Sleeping' est désactivé dans:" -ForegroundColor Yellow
    Write-Host "https://railway.app/dashboard → Settings → Sleep Settings → OFF" -ForegroundColor Cyan
    
} else {
    Write-Host "`n❌ Échec de l'installation" -ForegroundColor Red
    Write-Host "Vérifiez votre connexion internet et réessayez" -ForegroundColor Yellow
    exit 1
}
