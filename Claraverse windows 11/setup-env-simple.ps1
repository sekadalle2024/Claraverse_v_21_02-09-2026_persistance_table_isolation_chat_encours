# Configuration environnement Python ClaraVerse

Write-Host "`n=== Configuration Python ===" -ForegroundColor Cyan

Write-Host "`nCréation de l'environnement 'claraverse'..." -ForegroundColor Yellow
conda create -n claraverse python=3.11 -y

Write-Host "`nInstallation des packages conda..." -ForegroundColor Yellow
conda install -n claraverse pandas numpy openpyxl xlrd beautifulsoup4 -y

Write-Host "`nInstallation des packages pip..." -ForegroundColor Yellow
conda run -n claraverse pip install -r py_backend/requirements.txt

Write-Host "`n=== Configuration terminée! ===" -ForegroundColor Green
Write-Host "`nPour démarrer le projet:" -ForegroundColor Cyan
Write-Host "  conda activate claraverse" -ForegroundColor White
Write-Host "  npm run dev:full`n" -ForegroundColor White
