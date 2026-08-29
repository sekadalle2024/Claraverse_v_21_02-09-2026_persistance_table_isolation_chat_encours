# Script de Configuration Environnement Backend Claraverse
# Version: 1.0.0

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION ENVIRONNEMENT BACKEND CLARAVERSE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ENV_NAME = "claraverse_backend"
$BACKEND_DIR = "py_backend"

# Verifier conda
Write-Host "Verification de conda..." -NoNewline
try {
    $condaVersion = & conda --version 2>&1
    Write-Host " OK $condaVersion" -ForegroundColor Green
} catch {
    Write-Host " ERREUR conda non trouve!" -ForegroundColor Red
    Write-Host "Installez Miniconda depuis https://docs.conda.io/en/latest/miniconda.html" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verifier si l'environnement existe deja
Write-Host "Verification de l'environnement '$ENV_NAME'..." -NoNewline
$envExists = conda env list | Select-String -Pattern $ENV_NAME -Quiet

if ($envExists) {
    Write-Host " Existe deja" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous le recrer? (o/N)"
    
    if ($response -eq "o" -or $response -eq "O") {
        Write-Host "Suppression de l'environnement existant..." -ForegroundColor Yellow
        conda env remove -n $ENV_NAME -y
        Write-Host "Environnement supprime" -ForegroundColor Green
    } else {
        Write-Host "Utilisation de l'environnement existant" -ForegroundColor Green
        Write-Host ""
        Write-Host "Installation des dependances..." -ForegroundColor Yellow
        conda activate $ENV_NAME
        pip install -r $BACKEND_DIR/requirements.txt
        Write-Host ""
        Write-Host "Dependances installees!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Pour activer l'environnement:" -ForegroundColor Cyan
        Write-Host "conda activate $ENV_NAME" -ForegroundColor White
        exit 0
    }
}

Write-Host ""

# Creer l'environnement
Write-Host "Creation de l'environnement conda '$ENV_NAME'..." -ForegroundColor Yellow
Write-Host "Python 3.11 sera installe" -ForegroundColor Gray
Write-Host ""

conda create -n $ENV_NAME python=3.11 -y

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de la creation de l'environnement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Environnement cree avec succes!" -ForegroundColor Green
Write-Host ""

# Activer et installer les dependances
Write-Host "Installation des dependances depuis requirements.txt..." -ForegroundColor Yellow
Write-Host ""

# Note: L'activation dans un script PowerShell necessite une approche speciale
$activateScript = @"
conda activate $ENV_NAME
pip install -r $BACKEND_DIR/requirements.txt
"@

# Executer dans un nouveau processus conda
$result = conda run -n $ENV_NAME pip install -r $BACKEND_DIR/requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de l'installation des dependances" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION TERMINEE AVEC SUCCES!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Environnement: $ENV_NAME" -ForegroundColor Green
Write-Host "Python: 3.11" -ForegroundColor Green
Write-Host "Dependances: Installees" -ForegroundColor Green
Write-Host ""

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "COMMANDES UTILES" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Activer l'environnement:" -ForegroundColor Yellow
Write-Host "conda activate $ENV_NAME" -ForegroundColor White
Write-Host ""

Write-Host "Demarrer le backend:" -ForegroundColor Yellow
Write-Host "cd $BACKEND_DIR" -ForegroundColor White
Write-Host "python main.py" -ForegroundColor White
Write-Host ""

Write-Host "Desactiver l'environnement:" -ForegroundColor Yellow
Write-Host "conda deactivate" -ForegroundColor White
Write-Host ""

Write-Host "Supprimer l'environnement:" -ForegroundColor Yellow
Write-Host "conda env remove -n $ENV_NAME" -ForegroundColor White
Write-Host ""

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "PROCHAINES ETAPES" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Utiliser le nouveau script de demarrage:" -ForegroundColor White
Write-Host "   .\start-claraverse-conda.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Ou demarrer manuellement:" -ForegroundColor White
Write-Host "   conda activate $ENV_NAME" -ForegroundColor Cyan
Write-Host "   cd $BACKEND_DIR" -ForegroundColor Cyan
Write-Host "   python main.py" -ForegroundColor Cyan
Write-Host ""
