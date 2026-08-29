# ============================================================================
# Script de Sauvegarde Backend Python - Version Simplifiee
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n=== Sauvegarde Backend Python ===" -ForegroundColor Cyan

$targetRepo = "https://github.com/sekadalle2024/Back-end-python-V3_23_04_2026-.git"
$backendDir = "py_backend"

# Navigation vers le dossier backend
if (Test-Path $backendDir) {
    Set-Location $backendDir
    Write-Host "OK - Navigation vers py_backend" -ForegroundColor Green
} elseif ((Get-Location).Path.EndsWith($backendDir)) {
    Write-Host "OK - Deja dans py_backend" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Dossier py_backend non trouve" -ForegroundColor Red
    exit 1
}

# Verifier les fichiers critiques
$files = @("main.py", "endpoint_editeur.py", "requirements.txt")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK - Fichier: $file" -ForegroundColor Green
    }
}

# Preparation Git
Write-Host "`n=== Preparation Git ===" -ForegroundColor Cyan

$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor White

# Ajouter les modifications
git add .
git status --short

# Message de commit
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMessage = "Sauvegarde Backend V3 - $date"

# Configuration du remote
Write-Host "`n=== Configuration Remote ===" -ForegroundColor Cyan

$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin $targetRepo
    Write-Host "Remote mis a jour" -ForegroundColor Green
} else {
    git remote add origin $targetRepo
    Write-Host "Remote ajoute" -ForegroundColor Green
}

# Resume
Write-Host "`n=== Resume ===" -ForegroundColor Yellow
Write-Host "Repertoire local: $(Get-Location)" -ForegroundColor White
Write-Host "Repository distant: $targetRepo" -ForegroundColor White
Write-Host "Message: $commitMessage" -ForegroundColor White
Write-Host "Force Push: OUI" -ForegroundColor Red

$confirmation = Read-Host "`nLancer la sauvegarde? (o/N)"
if ($confirmation -ne "o") {
    Write-Host "Operation annulee." -ForegroundColor Yellow
    Set-Location ..
    exit 0
}

# Execution
Write-Host "`n=== Execution ===" -ForegroundColor Cyan

try {
    Write-Host "Creation du commit..." -ForegroundColor Cyan
    git commit -m "$commitMessage" --allow-empty
    
    Write-Host "Envoi vers GitHub (Force Push)..." -ForegroundColor Cyan
    git push -u origin master --force
    
    Write-Host "`nSAUVEGARDE REUSSIE !" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
}

# Retour au dossier parent
Set-Location ..
Write-Host "Retour au repertoire racine." -ForegroundColor Cyan
Write-Host "Termine." -ForegroundColor Green
