Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE CLARAVERSE - 18 AVRIL 2026" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration Git pour gros fichiers
Write-Host "[CONFIG] Configuration Git..." -ForegroundColor Yellow
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config core.compression 0
Write-Host ""

# Ajouter tous les fichiers
Write-Host "[1/4] Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "[2/4] Création du commit..." -ForegroundColor Yellow
git commit -m "Sauvegarde ClaraVerse V8 - 18 Avril 2026"
Write-Host ""

# Vérifier le statut
Write-Host "[3/4] Statut actuel..." -ForegroundColor Yellow
git status
Write-Host ""

# Push vers GitHub
Write-Host "[4/4] Push vers GitHub..." -ForegroundColor Yellow
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✓ SAUVEGARDE RÉUSSIE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Utilisez le script alternatif:" -ForegroundColor Yellow
    Write-Host ".\push-commits-multiples-18-avril-2026.ps1" -ForegroundColor White
}
