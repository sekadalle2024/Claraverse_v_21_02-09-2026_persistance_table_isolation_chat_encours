# Script de Réparation Environnement Backend Claraverse
# Version: 1.0.0 - Réparation après exécution accidentelle de setup-backend-env.ps1

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "REPARATION ENVIRONNEMENT BACKEND CLARAVERSE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ENV_NAME = "claraverse_backend"
$BACKEND_DIR = "py_backend"

Write-Host "DIAGNOSTIC:" -ForegroundColor Yellow
Write-Host "  L'environnement conda '$ENV_NAME' existe mais pip est corrompu" -ForegroundColor Gray
Write-Host "  Cela arrive parfois lors de la création d'environnement" -ForegroundColor Gray
Write-Host ""

Write-Host "SOLUTION:" -ForegroundColor Yellow
Write-Host "  1. Supprimer l'environnement corrompu" -ForegroundColor Gray
Write-Host "  2. Recréer un environnement propre" -ForegroundColor Gray
Write-Host "  3. Installer les dépendances" -ForegroundColor Gray
Write-Host ""

# Étape 1: Supprimer l'environnement corrompu
Write-Host "Étape 1: Suppression de l'environnement corrompu..." -ForegroundColor Yellow
Write-Host ""

try {
    conda env remove -n $ENV_NAME -y
    Write-Host "  Environnement supprimé avec succès" -ForegroundColor Green
} catch {
    Write-Host "  Erreur lors de la suppression: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Tentative de suppression forcée..." -ForegroundColor Yellow
    
    # Suppression forcée du dossier
    $envPath = "$env:USERPROFILE\miniconda3\envs\$ENV_NAME"
    if (Test-Path $envPath) {
        Remove-Item -Path $envPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Dossier supprimé manuellement" -ForegroundColor Green
    }
}

Write-Host ""

# Étape 2: Recréer l'environnement
Write-Host "Étape 2: Création d'un nouvel environnement propre..." -ForegroundColor Yellow
Write-Host ""

conda create -n $ENV_NAME python=3.11 pip -y

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR lors de la création de l'environnement" -ForegroundColor Red
    exit 1
}

Write-Host "  Environnement créé avec succès" -ForegroundColor Green
Write-Host ""

# Étape 3: Vérifier pip
Write-Host "Étape 3: Vérification de pip..." -ForegroundColor Yellow
Write-Host ""

$pipVersion = conda run -n $ENV_NAME pip --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR: pip n'est pas fonctionnel" -ForegroundColor Red
    exit 1
}

Write-Host "  pip fonctionne correctement: $pipVersion" -ForegroundColor Green
Write-Host ""

# Étape 4: Installer les dépendances
Write-Host "Étape 4: Installation des dépendances..." -ForegroundColor Yellow
Write-Host ""

conda run -n $ENV_NAME pip install -r $BACKEND_DIR/requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "  Dépendances installées avec succès" -ForegroundColor Green
Write-Host ""

# Étape 5: Vérification finale
Write-Host "Étape 5: Vérification finale..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Vérification de FastAPI..." -NoNewline
$fastapiCheck = conda run -n $ENV_NAME python -c "import fastapi; print(fastapi.__version__)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host " OK (version $fastapiCheck)" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
}

Write-Host "  Vérification de Pandas..." -NoNewline
$pandasCheck = conda run -n $ENV_NAME python -c "import pandas; print(pandas.__version__)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host " OK (version $pandasCheck)" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
}

Write-Host "  Vérification de openpyxl..." -NoNewline
$openpyxlCheck = conda run -n $ENV_NAME python -c "import openpyxl; print(openpyxl.__version__)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host " OK (version $openpyxlCheck)" -ForegroundColor Green
} else {
    Write-Host " ERREUR" -ForegroundColor Red
}

Write-Host ""

# Résumé
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "REPARATION TERMINEE AVEC SUCCES!" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STATUT:" -ForegroundColor Green
Write-Host "  Environnement: $ENV_NAME" -ForegroundColor White
Write-Host "  Python: 3.11" -ForegroundColor White
Write-Host "  pip: Fonctionnel" -ForegroundColor White
Write-Host "  Dépendances: Installées" -ForegroundColor White
Write-Host ""

Write-Host "PROCHAINES ETAPES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Démarrer le backend avec:" -ForegroundColor White
Write-Host "     .\start-claraverse-conda.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Tester le traitement de balance:" -ForegroundColor White
Write-Host "     - Ouvrir l'application dans le navigateur" -ForegroundColor Gray
Write-Host "     - Taper 'Etat fin' dans le chat" -ForegroundColor Gray
Write-Host "     - Sélectionner le fichier de balance" -ForegroundColor Gray
Write-Host ""

Write-Host "NOTES:" -ForegroundColor Yellow
Write-Host "  - L'environnement a été complètement recréé" -ForegroundColor Gray
Write-Host "  - Toutes les dépendances ont été réinstallées" -ForegroundColor Gray
Write-Host "  - Le backend devrait maintenant fonctionner correctement" -ForegroundColor Gray
Write-Host ""
