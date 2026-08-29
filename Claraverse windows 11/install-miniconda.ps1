# Script d'installation automatique de Miniconda pour Windows
# ClaraVerse - Installation Backend Python

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation de Miniconda pour ClaraVerse" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si conda est déjà installé
Write-Host "Vérification de l'installation existante de Conda..." -ForegroundColor Yellow
$condaExists = Get-Command conda -ErrorAction SilentlyContinue

if ($condaExists) {
    Write-Host "✓ Conda est déjà installé!" -ForegroundColor Green
    conda --version
    Write-Host ""
    $response = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($response -ne "o") {
        Write-Host "Installation annulée." -ForegroundColor Yellow
        exit
    }
}

# Définir les chemins
$minicondaUrl = "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe"
$installerPath = "$env:TEMP\Miniconda3-latest-Windows-x86_64.exe"
$installPath = "$env:USERPROFILE\miniconda3"

Write-Host "Téléchargement de Miniconda..." -ForegroundColor Yellow
Write-Host "URL: $minicondaUrl" -ForegroundColor Gray
Write-Host "Destination: $installerPath" -ForegroundColor Gray
Write-Host ""

try {
    # Télécharger Miniconda
    Invoke-WebRequest -Uri $minicondaUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✓ Téléchargement terminé!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Erreur lors du téléchargement: $_" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier existe
if (-not (Test-Path $installerPath)) {
    Write-Host "✗ Le fichier d'installation n'a pas été téléchargé correctement." -ForegroundColor Red
    exit 1
}

Write-Host "Installation de Miniconda..." -ForegroundColor Yellow
Write-Host "Chemin d'installation: $installPath" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: L'installation va démarrer." -ForegroundColor Cyan
Write-Host "Pendant l'installation:" -ForegroundColor Cyan
Write-Host "  1. Acceptez les termes de la licence" -ForegroundColor White
Write-Host "  2. Choisissez 'Just Me' (recommandé)" -ForegroundColor White
Write-Host "  3. Gardez le chemin d'installation par défaut" -ForegroundColor White
Write-Host "  4. COCHEZ 'Add Miniconda3 to my PATH environment variable'" -ForegroundColor Yellow
Write-Host "  5. COCHEZ 'Register Miniconda3 as my default Python'" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Appuyez sur Entrée pour continuer..."

try {
    # Lancer l'installation en mode silencieux
    Write-Host "Lancement de l'installation silencieuse..." -ForegroundColor Yellow
    $arguments = "/InstallationType=JustMe /RegisterPython=1 /AddToPath=1 /S /D=$installPath"
    Start-Process -FilePath $installerPath -ArgumentList $arguments -Wait -NoNewWindow
    
    Write-Host "✓ Installation terminée!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Erreur lors de l'installation: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez l'installation manuelle:" -ForegroundColor Yellow
    Write-Host "1. Ouvrez: $installerPath" -ForegroundColor White
    Write-Host "2. Suivez l'assistant d'installation" -ForegroundColor White
    exit 1
}

# Nettoyer le fichier d'installation
Write-Host "Nettoyage..." -ForegroundColor Yellow
Remove-Item $installerPath -ErrorAction SilentlyContinue

# Ajouter Conda au PATH pour cette session
$env:Path += ";$installPath;$installPath\Scripts;$installPath\condabin"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation terminée avec succès!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. FERMEZ ce terminal et ouvrez-en un nouveau" -ForegroundColor Yellow
Write-Host "2. Vérifiez l'installation avec: conda --version" -ForegroundColor White
Write-Host "3. Initialisez conda avec: conda init" -ForegroundColor White
Write-Host "4. Créez l'environnement ClaraVerse:" -ForegroundColor White
Write-Host "   conda create -n claraverse python=3.11 -y" -ForegroundColor Gray
Write-Host "5. Activez l'environnement:" -ForegroundColor White
Write-Host "   conda activate claraverse" -ForegroundColor Gray
Write-Host "6. Installez les dépendances:" -ForegroundColor White
Write-Host "   cd py_backend" -ForegroundColor Gray
Write-Host "   pip install -r requirements.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour plus d'informations, consultez: GUIDE_MISE_A_JOUR_DEPENDANCES.md" -ForegroundColor Cyan
Write-Host ""
