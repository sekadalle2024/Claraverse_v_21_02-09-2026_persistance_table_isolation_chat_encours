# Installation simple de Miniconda

Write-Host "`n=== Installation Miniconda ===" -ForegroundColor Cyan

$url = "https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe"
$installer = "$env:TEMP\Miniconda3-installer.exe"

Write-Host "`nTéléchargement de Miniconda..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing

Write-Host "Téléchargement terminé!" -ForegroundColor Green
Write-Host "`nLancement de l'installation..." -ForegroundColor Yellow
Write-Host "IMPORTANT: Cochez 'Add Miniconda3 to PATH'" -ForegroundColor Red

Start-Process -FilePath $installer -Wait

Write-Host "`nInstallation terminée!" -ForegroundColor Green
Write-Host "`nPROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host "1. Fermez ce terminal" -ForegroundColor White
Write-Host "2. Ouvrez un nouveau terminal" -ForegroundColor White
Write-Host "3. Exécutez: conda init" -ForegroundColor White
Write-Host "4. Fermez et rouvrez le terminal" -ForegroundColor White
Write-Host "5. Exécutez: .\setup-python-env.ps1`n" -ForegroundColor White
