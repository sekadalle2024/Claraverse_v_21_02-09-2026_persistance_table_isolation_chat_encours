# Vérification rapide de l'installation ClaraVerse

Write-Host "`n=== Vérification ClaraVerse ===" -ForegroundColor Cyan

# Node.js
Write-Host "`nNode.js: " -NoNewline
node --version

# npm
Write-Host "npm: " -NoNewline
npm --version

# Python
Write-Host "Python: " -NoNewline
python --version

# Conda
Write-Host "Conda: " -NoNewline
conda --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "NON INSTALLÉ" -ForegroundColor Red
}

# node_modules
Write-Host "`nnode_modules: " -NoNewline
if (Test-Path "node_modules") {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "MANQUANT" -ForegroundColor Red
}

Write-Host "`n================================`n" -ForegroundColor Cyan
