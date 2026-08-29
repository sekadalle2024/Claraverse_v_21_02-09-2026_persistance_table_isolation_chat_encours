# Script de configuration de l'environnement Python pour ClaraVerse
# À exécuter APRÈS l'installation de Miniconda

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration Python - ClaraVerse" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que conda est installé
Write-Host "Vérification de Conda..." -ForegroundColor Yellow
$condaExists = Get-Command conda -ErrorAction SilentlyContinue

if (-not $condaExists) {
    Write-Host "✗ Conda n'est pas installé ou n'est pas dans le PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez:" -ForegroundColor Yellow
    Write-Host "1. Installer Miniconda avec: .\install-miniconda.ps1" -ForegroundColor White
    Write-Host "2. Redémarrer votre terminal" -ForegroundColor White
    Write-Host "3. Exécuter: conda init" -ForegroundColor White
    Write-Host "4. Redémarrer à nouveau votre terminal" -ForegroundColor White
    Write-Host "5. Relancer ce script" -ForegroundColor White
    exit 1
}

Write-Host "✓ Conda est installé!" -ForegroundColor Green
conda --version
Write-Host ""

# Vérifier si l'environnement existe déjà
Write-Host "Vérification de l'environnement 'claraverse'..." -ForegroundColor Yellow
$envExists = conda env list | Select-String "claraverse"

if ($envExists) {
    Write-Host "⚠ L'environnement 'claraverse' existe déjà!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous le supprimer et le recréer? (o/n)"
    if ($response -eq "o") {
        Write-Host "Suppression de l'environnement existant..." -ForegroundColor Yellow
        conda env remove -n claraverse -y
        Write-Host "✓ Environnement supprimé!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "Utilisation de l'environnement existant..." -ForegroundColor Yellow
        Write-Host ""
    }
}

# Créer l'environnement si nécessaire
$envExists = conda env list | Select-String "claraverse"
if (-not $envExists) {
    Write-Host "Création de l'environnement 'claraverse' avec Python 3.11..." -ForegroundColor Yellow
    Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        conda create -n claraverse python=3.11 -y
        Write-Host "✓ Environnement créé avec succès!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "✗ Erreur lors de la création de l'environnement: $_" -ForegroundColor Red
        exit 1
    }
}

# Activer l'environnement et installer les dépendances
Write-Host "Installation des dépendances Python..." -ForegroundColor Yellow
Write-Host ""

# Vérifier que le fichier requirements.txt existe
if (-not (Test-Path "py_backend\requirements.txt")) {
    Write-Host "✗ Fichier py_backend\requirements.txt introuvable!" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le dossier racine de ClaraVerse." -ForegroundColor Yellow
    exit 1
}

Write-Host "Installation des packages avec conda..." -ForegroundColor Yellow
try {
    # Installer les packages scientifiques avec conda (plus rapide et stable)
    conda install -n claraverse pandas numpy openpyxl xlrd beautifulsoup4 -y
    Write-Host "✓ Packages conda installés!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠ Avertissement lors de l'installation conda: $_" -ForegroundColor Yellow
    Write-Host "Continuation avec pip..." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Installation des packages avec pip..." -ForegroundColor Yellow
Write-Host ""

# Créer un script temporaire pour activer conda et installer les packages
$tempScript = @"
call conda activate claraverse
cd py_backend
python -m pip install --upgrade pip
pip install -r requirements.txt
"@

$tempScriptPath = "$env:TEMP\install_claraverse_deps.bat"
$tempScript | Out-File -FilePath $tempScriptPath -Encoding ASCII

try {
    # Exécuter le script
    cmd /c $tempScriptPath
    Write-Host ""
    Write-Host "✓ Dépendances pip installées!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Erreur lors de l'installation pip: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez manuellement:" -ForegroundColor Yellow
    Write-Host "1. conda activate claraverse" -ForegroundColor White
    Write-Host "2. cd py_backend" -ForegroundColor White
    Write-Host "3. pip install -r requirements.txt" -ForegroundColor White
    exit 1
} finally {
    # Nettoyer le script temporaire
    Remove-Item $tempScriptPath -ErrorAction SilentlyContinue
}

# Vérifier l'installation
Write-Host "Vérification de l'installation..." -ForegroundColor Yellow
Write-Host ""

$verifyScript = @"
call conda activate claraverse
python -c "import pandas; import numpy; import fastapi; print('✓ Tous les modules principaux sont installés!')"
"@

$verifyScriptPath = "$env:TEMP\verify_claraverse.bat"
$verifyScript | Out-File -FilePath $verifyScriptPath -Encoding ASCII

try {
    cmd /c $verifyScriptPath
    Write-Host ""
} catch {
    Write-Host "⚠ Certains modules peuvent ne pas être installés correctement." -ForegroundColor Yellow
    Write-Host ""
} finally {
    Remove-Item $verifyScriptPath -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuration terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour utiliser l'environnement Python:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Activer l'environnement:" -ForegroundColor White
Write-Host "   conda activate claraverse" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Démarrer le backend:" -ForegroundColor White
Write-Host "   cd py_backend" -ForegroundColor Gray
Write-Host "   python main.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ou démarrer tout le projet:" -ForegroundColor White
Write-Host "   npm run dev:full" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour désactiver l'environnement:" -ForegroundColor White
Write-Host "   conda deactivate" -ForegroundColor Gray
Write-Host ""
