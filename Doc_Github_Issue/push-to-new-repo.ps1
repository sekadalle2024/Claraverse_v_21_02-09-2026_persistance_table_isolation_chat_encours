# Script de sauvegarde vers le nouveau repository GitHub
# ClaraVerse V5 - 28 Mars 2026

Write-Host "=== Sauvegarde ClaraVerse vers GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Configuration Git pour gros fichiers
Write-Host "Configuration Git pour gros transferts..." -ForegroundColor Yellow
git config http.postBuffer 524288000
git config http.timeout 600
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"

Write-Host "Configuration terminée." -ForegroundColor Green
Write-Host ""

# Vérification du repository distant
Write-Host "Repository distant configuré:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Tentative de push
Write-Host "Tentative de push vers GitHub..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Cyan
Write-Host ""

git push -u origin master --progress

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCÈS ===" -ForegroundColor Green
    Write-Host "Votre projet a été sauvegardé sur GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL du repository:" -ForegroundColor Cyan
    Write-Host "https://github.com/sekadalle2024/Claraverse_windows_s_11_v0_28-03-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "=== ERREUR ===" -ForegroundColor Red
    Write-Host "Le push a échoué. Essayez les solutions alternatives:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTION 1: Utiliser GitHub Desktop" -ForegroundColor Cyan
    Write-Host "1. Ouvrez GitHub Desktop" -ForegroundColor White
    Write-Host "2. File > Add Local Repository" -ForegroundColor White
    Write-Host "3. Sélectionnez ce dossier: H:\ClaraVerse" -ForegroundColor White
    Write-Host "4. Cliquez sur 'Publish repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "SOLUTION 2: Push manuel par SSH" -ForegroundColor Cyan
    Write-Host "1. Configurez une clé SSH sur GitHub" -ForegroundColor White
    Write-Host "2. Changez l'URL: git remote set-url origin git@github.com:sekadalle2024/Claraverse_windows_s_11_v0_28-03-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor White
    Write-Host "3. Relancez: git push -u origin master" -ForegroundColor White
}
