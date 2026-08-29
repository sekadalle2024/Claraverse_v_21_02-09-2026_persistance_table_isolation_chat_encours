# Installation Koyeb CLI pour Windows

$ErrorActionPreference = "Stop"

Write-Host "=== INSTALLATION KOYEB CLI POUR WINDOWS ===" -ForegroundColor Cyan
Write-Host ""

# Verifier si deja installe
try {
    $version = koyeb version 2>&1 | Select-Object -First 1
    Write-Host "Koyeb CLI est deja installe : $version" -ForegroundColor Green
    Write-Host ""
    $response = Read-Host "Voulez-vous reinstaller ? (o/N)"
    if ($response -notmatch '^[Oo]$') {
        exit 0
    }
} catch {
    Write-Host "Koyeb CLI n'est pas installe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "METHODES D'INSTALLATION :" -ForegroundColor Yellow
Write-Host "1. Via Git Bash (Recommande)"
Write-Host "2. Via Docker"
Write-Host "3. Telechargement manuel"
Write-Host ""

$choice = Read-Host "Choisissez (1/2/3)"

if ($choice -eq "1") {
    $gitBash = "C:\Program Files\Git\bin\bash.exe"
    if (Test-Path $gitBash) {
        Write-Host ""
        Write-Host "Installation via Git Bash..." -ForegroundColor Cyan
        & $gitBash -c "./install-koyeb-cli.sh"
    } else {
        Write-Host "Git Bash non trouve" -ForegroundColor Red
        Write-Host "Installez Git : https://git-scm.com/download/win"
    }
}
elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Installation via Docker..." -ForegroundColor Cyan
    docker pull koyeb/koyeb-cli:latest
    Write-Host ""
    Write-Host "Utilisation : docker run --rm -it koyeb/koyeb-cli:latest [commande]"
}
else {
    Write-Host ""
    Write-Host "Telechargement manuel :" -ForegroundColor Yellow
    Write-Host "https://github.com/koyeb/koyeb-cli/releases"
    Start-Process "https://github.com/koyeb/koyeb-cli/releases"
}

Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host "1. koyeb login"
Write-Host "2. .\check-koyeb-ready.ps1"
Write-Host "3. .\deploy-koyeb.ps1 dev"
Write-Host ""
