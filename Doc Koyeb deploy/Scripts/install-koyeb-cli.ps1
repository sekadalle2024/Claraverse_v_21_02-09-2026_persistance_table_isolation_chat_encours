# Script d'installation de Koyeb CLI pour Windows (PowerShell)
# Alternative : utilise Docker ou téléchargement direct

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Installation de Koyeb CLI pour Windows               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Koyeb CLI est déjà installé
try {
    $version = koyeb version 2>&1 | Select-Object -First 1
    Write-Host "✅ Koyeb CLI est déjà installé : $version" -ForegroundColor Green
    Write-Host ""
    $response = Read-Host "Voulez-vous réinstaller ? (o/N)"
    if ($response -notmatch '^[Oo]$') {
        Write-Host "Installation annulée." -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "Koyeb CLI n'est pas installé. Installation en cours..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "MÉTHODES D'INSTALLATION DISPONIBLES" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Via Git Bash (Recommande)" -ForegroundColor Yellow
Write-Host "   - Utilise le script d'installation officiel"
Write-Host "   - Installation dans ~/.koyeb/bin"
Write-Host ""
Write-Host "2. Via Docker" -ForegroundColor Yellow
Write-Host "   - Necessite Docker Desktop"
Write-Host "   - Utilise un container"
Write-Host ""
Write-Host "3. Telechargement manuel" -ForegroundColor Yellow
Write-Host "   - Depuis GitHub Releases"
Write-Host "   - Installation manuelle"
Write-Host ""

$choice = Read-Host "Choisissez une méthode (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Installation via Git Bash..." -ForegroundColor Cyan
        Write-Host ""
        
        # Vérifier si Git Bash est installé
        $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
        if (Test-Path $gitBashPath) {
            Write-Host "✅ Git Bash trouvé" -ForegroundColor Green
            Write-Host ""
            Write-Host "Exécution du script d'installation..." -ForegroundColor Yellow
            Write-Host ""
            
            # Exécuter le script d'installation via Git Bash
            & $gitBashPath -c "./install-koyeb-cli.sh"
            
        } else {
            Write-Host "❌ Git Bash n'est pas installé" -ForegroundColor Red
            Write-Host ""
            Write-Host "Installez Git pour Windows depuis : https://git-scm.com/download/win" -ForegroundColor Yellow
            Write-Host "Puis relancez ce script." -ForegroundColor Yellow
            exit 1
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Installation via Docker..." -ForegroundColor Cyan
        Write-Host ""
        
        # Vérifier si Docker est installé
        try {
            $dockerVersion = docker --version
            Write-Host "✅ Docker trouvé : $dockerVersion" -ForegroundColor Green
            Write-Host ""
            
            Write-Host "Téléchargement de l'image Koyeb CLI..." -ForegroundColor Yellow
            docker pull koyeb/koyeb-cli:latest
            
            Write-Host ""
            Write-Host "✅ Image Docker téléchargée avec succès !" -ForegroundColor Green
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
            Write-Host "UTILISATION AVEC DOCKER" -ForegroundColor Blue
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
            Write-Host ""
            Write-Host "Pour utiliser Koyeb CLI avec Docker, utilisez :" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  docker run --rm -it koyeb/koyeb-cli:latest [commande]" -ForegroundColor Green
            Write-Host ""
            Write-Host "Exemples :" -ForegroundColor Yellow
            Write-Host "  docker run --rm -it koyeb/koyeb-cli:latest version" -ForegroundColor Cyan
            Write-Host "  docker run --rm -it koyeb/koyeb-cli:latest login" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Note : Cette méthode nécessite de préfixer toutes les commandes avec Docker" -ForegroundColor Yellow
            Write-Host ""
            
        } catch {
            Write-Host "❌ Docker n'est pas installé ou n'est pas démarré" -ForegroundColor Red
            Write-Host ""
            Write-Host "Installez Docker Desktop depuis : https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Téléchargement manuel..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Visitez : https://github.com/koyeb/koyeb-cli/releases" -ForegroundColor Yellow
        Write-Host "2. Téléchargez la dernière version pour Windows" -ForegroundColor Yellow
        Write-Host "3. Extrayez l'archive" -ForegroundColor Yellow
        Write-Host "4. Ajoutez le dossier au PATH système" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Consultez INSTALLATION_KOYEB_WINDOWS.md pour plus de détails" -ForegroundColor Cyan
        Write-Host ""
        
        # Ouvrir le navigateur
        $response = Read-Host "Voulez-vous ouvrir la page GitHub ? (o/N)"
        if ($response -match '^[Oo]$') {
            Start-Process "https://github.com/koyeb/koyeb-cli/releases"
        }
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "PROCHAINES ÉTAPES" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Ouvrir un nouveau terminal (pour recharger le PATH)" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Se connecter à Koyeb :" -ForegroundColor Yellow
Write-Host "   koyeb login" -ForegroundColor Green
Write-Host ""
Write-Host "3. Vérifier que tout est prêt :" -ForegroundColor Yellow
Write-Host "   .\check-koyeb-ready.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "4. Déployer le backend :" -ForegroundColor Yellow
Write-Host "   .\deploy-koyeb.ps1 dev" -ForegroundColor Green
Write-Host ""
Write-Host "Pour plus d'aide, consultez :" -ForegroundColor Cyan
Write-Host "  - INSTALLATION_KOYEB_WINDOWS.md" -ForegroundColor White
Write-Host "  - GUIDE_DEPLOIEMENT_KOYEB.md" -ForegroundColor White
Write-Host ""
