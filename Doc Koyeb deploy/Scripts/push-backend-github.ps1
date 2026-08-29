# Script pour pousser le backend Python sur GitHub
# Repository: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PUSH BACKEND PYTHON VERS GITHUB                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$REPO_URL = "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"
$BACKEND_DIR = "py_backend"

# Vérifier que le dossier backend existe
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "❌ Le dossier $BACKEND_DIR n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Dossier backend trouvé : $BACKEND_DIR" -ForegroundColor Green
Write-Host ""

# Se positionner dans le dossier backend
Push-Location $BACKEND_DIR

try {
    # Étape 1 : Initialiser Git si nécessaire
    Write-Host "Étape 1 : Initialisation Git..." -ForegroundColor Yellow
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "✅ Repository Git initialisé" -ForegroundColor Green
    } else {
        Write-Host "✅ Repository Git déjà initialisé" -ForegroundColor Green
    }
    Write-Host ""

    # Étape 2 : Ajouter tous les fichiers
    Write-Host "Étape 2 : Ajout des fichiers..." -ForegroundColor Yellow
    git add .
    Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
    Write-Host ""

    # Étape 3 : Créer un commit
    Write-Host "Étape 3 : Création du commit..." -ForegroundColor Yellow
    $commitMessage = "Backend Python Clara - Version 0.1.0 - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
    git commit -m $commitMessage
    Write-Host "✅ Commit créé : $commitMessage" -ForegroundColor Green
    Write-Host ""

    # Étape 4 : Configurer le remote
    Write-Host "Étape 4 : Configuration du repository distant..." -ForegroundColor Yellow
    
    # Vérifier si le remote existe déjà
    $remoteExists = git remote | Select-String -Pattern "origin" -Quiet
    
    if ($remoteExists) {
        Write-Host "Remote 'origin' existe déjà, mise à jour de l'URL..." -ForegroundColor Yellow
        git remote set-url origin $REPO_URL
    } else {
        Write-Host "Ajout du remote 'origin'..." -ForegroundColor Yellow
        git remote add origin $REPO_URL
    }
    
    Write-Host "✅ Remote configuré : $REPO_URL" -ForegroundColor Green
    Write-Host ""

    # Étape 5 : Vérifier la connexion
    Write-Host "Étape 5 : Vérification du remote..." -ForegroundColor Yellow
    git remote -v
    Write-Host "✅ Remote vérifié" -ForegroundColor Green
    Write-Host ""

    # Étape 6 : Vérifier la branche
    Write-Host "Étape 6 : Vérification de la branche..." -ForegroundColor Yellow
    $currentBranch = git branch --show-current
    
    if (-not $currentBranch) {
        Write-Host "Création de la branche 'main'..." -ForegroundColor Yellow
        git branch -M main
        $currentBranch = "main"
    }
    
    Write-Host "✅ Branche actuelle : $currentBranch" -ForegroundColor Green
    Write-Host ""

    # Étape 7 : Push vers GitHub
    Write-Host "Étape 7 : Push vers GitHub..." -ForegroundColor Yellow
    Write-Host "Repository : $REPO_URL" -ForegroundColor Cyan
    Write-Host "Branche : $currentBranch" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "Voulez-vous continuer ? (o/N)"
    if ($response -match '^[Oo]$') {
        git push -u origin $currentBranch
        Write-Host ""
        Write-Host "✅ Push réussi !" -ForegroundColor Green
    } else {
        Write-Host "❌ Push annulé" -ForegroundColor Yellow
        Pop-Location
        exit 0
    }

    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              BACKEND PYTHON PUSH AVEC SUCCÈS !               ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository GitHub :" -ForegroundColor Cyan
    Write-Host $REPO_URL -ForegroundColor White
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "1. Vérifier sur GitHub que les fichiers sont bien là" -ForegroundColor White
    Write-Host "2. Aller sur https://app.koyeb.com" -ForegroundColor White
    Write-Host "3. Créer un service et connecter ce repository" -ForegroundColor White
    Write-Host "4. Configurer :" -ForegroundColor White
    Write-Host "   - Builder: Dockerfile" -ForegroundColor Gray
    Write-Host "   - Port: 5000" -ForegroundColor Gray
    Write-Host "   - Instance: Nano" -ForegroundColor Gray
    Write-Host "5. Déployer !" -ForegroundColor White
    Write-Host ""

}
catch {
    Write-Host ""
    Write-Host "Erreur : $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifiez :" -ForegroundColor Yellow
    Write-Host "- Que vous etes connecte a GitHub" -ForegroundColor White
    Write-Host "- Que le repository existe sur GitHub" -ForegroundColor White
    Write-Host "- Que vous avez les droits d'acces" -ForegroundColor White
    Write-Host ""
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}
