# Script pour corriger le deploiement Render
# Probleme: requirements_render.txt manquant dans le repo GitHub

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  CORRECTION DEPLOIEMENT RENDER - REQUIREMENTS_RENDER.TXT" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Verifier que le fichier existe localement
Write-Host "Etape 1: Verification du fichier local..." -ForegroundColor Yellow
$localFile = "../py_backend/requirements_render.txt"

if (Test-Path $localFile) {
    Write-Host "   OK Fichier trouve: $localFile" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Fichier non trouve: $localFile" -ForegroundColor Red
    Write-Host "   Le fichier doit exister avant de continuer" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Etape 2: Creer un dossier temporaire pour le repo backend
Write-Host "Etape 2: Preparation du repository backend..." -ForegroundColor Yellow
$tempDir = "temp_backend_repo"

if (Test-Path $tempDir) {
    Write-Host "   Suppression de l'ancien dossier temporaire..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir
}

Write-Host "   Clonage du repository backend..." -ForegroundColor Cyan
git clone https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git $tempDir

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR lors du clonage" -ForegroundColor Red
    exit 1
}
Write-Host "   OK Repository clone" -ForegroundColor Green
Write-Host ""

# Etape 3: Copier requirements_render.txt a la racine du repo backend
Write-Host "Etape 3: Copie de requirements_render.txt..." -ForegroundColor Yellow
Copy-Item $localFile "$tempDir/requirements_render.txt" -Force
Write-Host "   OK Fichier copie a la racine du repo backend" -ForegroundColor Green
Write-Host ""

# Etape 4: Commit et push
Write-Host "Etape 4: Commit et push vers GitHub..." -ForegroundColor Yellow
Push-Location $tempDir

git add requirements_render.txt
git commit -m "fix: Add requirements_render.txt at root for Render deployment"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ATTENTION Aucun changement a commiter (fichier deja present?)" -ForegroundColor Yellow
} else {
    Write-Host "   OK Commit cree" -ForegroundColor Green
}

Write-Host "   Push vers GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR lors du push" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "   OK Push reussi!" -ForegroundColor Green
Write-Host ""

# Retour au dossier principal
Pop-Location

# Etape 5: Nettoyage
Write-Host "Etape 5: Nettoyage..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir
Write-Host "   OK Dossier temporaire supprime" -ForegroundColor Green
Write-Host ""

Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  OK CORRECTION TERMINEE AVEC SUCCES!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes sur Render.com:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Aller sur: https://dashboard.render.com" -ForegroundColor Cyan
Write-Host "   2. Selectionner votre service 'clara-backend-production'" -ForegroundColor Cyan
Write-Host "   3. Cliquer sur 'Manual Deploy' puis 'Deploy latest commit'" -ForegroundColor Cyan
Write-Host "   4. Attendre 3-5 minutes pour le deploiement" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifier les logs de build:" -ForegroundColor Yellow
Write-Host "   - Vous devriez voir: 'pip install -r requirements_render.txt'" -ForegroundColor White
Write-Host "   - Plus d'erreur 'No such file or directory'" -ForegroundColor White
Write-Host ""
Write-Host "OK Le build devrait maintenant reussir!" -ForegroundColor Green
Write-Host ""
