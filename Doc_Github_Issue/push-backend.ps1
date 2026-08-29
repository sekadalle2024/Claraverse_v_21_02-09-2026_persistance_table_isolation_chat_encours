# Push Backend Python vers GitHub

Write-Host "=== PUSH BACKEND PYTHON VERS GITHUB ===" -ForegroundColor Cyan
Write-Host ""

$REPO_URL = "https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git"

# Se positionner dans py_backend
Set-Location py_backend

# Initialiser Git
Write-Host "1. Initialisation Git..." -ForegroundColor Yellow
git init

# Ajouter fichiers
Write-Host "2. Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "3. Creation du commit..." -ForegroundColor Yellow
git commit -m "Backend Python Clara - Version 0.1.0"

# Configurer remote
Write-Host "4. Configuration du remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $REPO_URL

# Verifier
Write-Host "5. Verification..." -ForegroundColor Yellow
git remote -v

# Renommer branche en main
Write-Host "6. Configuration branche main..." -ForegroundColor Yellow
git branch -M main

# Push
Write-Host "7. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "Repository: $REPO_URL" -ForegroundColor Cyan
Write-Host ""
$response = Read-Host "Continuer ? (o/N)"

if ($response -match '^[Oo]$') {
    git push -u origin main
    Write-Host ""
    Write-Host "=== SUCCES ===" -ForegroundColor Green
    Write-Host "Repository: $REPO_URL" -ForegroundColor White
} else {
    Write-Host "Annule" -ForegroundColor Yellow
}

# Retour
Set-Location ..
