# Script de vérification et installation des dépendances Python
# Pour Claraverse - 26 Mars 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   VÉRIFICATION DÉPENDANCES PYTHON - CLARAVERSE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si conda est installé
Write-Host "🔍 Vérification de Conda..." -ForegroundColor Yellow
try {
    $condaVersion = conda --version 2>&1
    Write-Host "✅ Conda installé: $condaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Conda n'est pas installé!" -ForegroundColor Red
    Write-Host "   Installez Miniconda depuis: https://docs.conda.io/en/latest/miniconda.html" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier si l'environnement claraverse_backend existe
Write-Host "🔍 Vérification de l'environnement claraverse_backend..." -ForegroundColor Yellow
$envExists = conda env list | Select-String "claraverse_backend"

if ($envExists) {
    Write-Host "✅ Environnement claraverse_backend trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Environnement claraverse_backend non trouvé!" -ForegroundColor Red
    Write-Host "   Création de l'environnement..." -ForegroundColor Yellow
    conda create -n claraverse_backend python=3.11 -y
    Write-Host "✅ Environnement créé" -ForegroundColor Green
}

Write-Host ""

# Activer l'environnement et vérifier les packages
Write-Host "🔍 Vérification des packages installés..." -ForegroundColor Yellow
Write-Host ""

# Liste des packages requis
$requiredPackages = @(
    "fastapi",
    "uvicorn",
    "python-multipart",
    "PyPDF2",
    "python-docx",
    "pydantic",
    "python-dotenv",
    "pandas",
    "numpy",
    "openpyxl",
    "xlrd",
    "beautifulsoup4"
)

Write-Host "Packages requis:" -ForegroundColor Cyan
$requiredPackages | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Vérifier chaque package
Write-Host "Vérification de l'installation..." -ForegroundColor Yellow
$missingPackages = @()

foreach ($package in $requiredPackages) {
    $installed = conda run -n claraverse_backend python -c "import $($package.Replace('-', '_'))" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $package" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $package (manquant)" -ForegroundColor Red
        $missingPackages += $package
    }
}

Write-Host ""

# Installer les packages manquants
if ($missingPackages.Count -gt 0) {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   INSTALLATION DES PACKAGES MANQUANTS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Packages à installer:" -ForegroundColor Yellow
    $missingPackages | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    Write-Host ""
    
    Write-Host "Installation via pip dans l'environnement claraverse_backend..." -ForegroundColor Yellow
    Write-Host ""
    
    # Installer depuis requirements.txt
    conda run -n claraverse_backend pip install -r py_backend/requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Installation réussie!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Essayez manuellement:" -ForegroundColor Yellow
        Write-Host "   conda activate claraverse_backend" -ForegroundColor White
        Write-Host "   pip install -r py_backend/requirements.txt" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "✅ Tous les packages requis sont installés!" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   VÉRIFICATION FINALE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier python-docx spécifiquement (pour l'export Word)
Write-Host "🔍 Vérification spécifique de python-docx..." -ForegroundColor Yellow
$docxVersion = conda run -n claraverse_backend python -c "import docx; print(docx.__version__)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ python-docx version: $docxVersion" -ForegroundColor Green
} else {
    Write-Host "❌ python-docx non installé correctement" -ForegroundColor Red
    Write-Host "   Installation manuelle..." -ForegroundColor Yellow
    conda run -n claraverse_backend pip install python-docx
}

Write-Host ""

# Vérifier FastAPI
Write-Host "🔍 Vérification de FastAPI..." -ForegroundColor Yellow
$fastapiVersion = conda run -n claraverse_backend python -c "import fastapi; print(fastapi.__version__)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FastAPI version: $fastapiVersion" -ForegroundColor Green
} else {
    Write-Host "❌ FastAPI non installé correctement" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RÉSUMÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($missingPackages.Count -eq 0) {
    Write-Host "✅ Toutes les dépendances sont installées" -ForegroundColor Green
    Write-Host "✅ Le backend est prêt à démarrer" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour démarrer le backend:" -ForegroundColor Yellow
    Write-Host "  .\start-claraverse-conda.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️ Certaines dépendances étaient manquantes" -ForegroundColor Yellow
    Write-Host "✅ Installation effectuée" -ForegroundColor Green
    Write-Host ""
    Write-Host "Redémarrez le backend:" -ForegroundColor Yellow
    Write-Host "  .\stop-claraverse.ps1" -ForegroundColor White
    Write-Host "  .\start-claraverse-conda.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
