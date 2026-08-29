# Script pour pousser runtime.txt vers le repository backend
# Date: 17 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH RUNTIME.TXT VERS REPO BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier qu'on est a la racine du projet
if (-not (Test-Path "py_backend")) {
    Write-Host "ERREUR: Dossier py_backend/ non trouve!" -ForegroundColor Red
    Write-Host "Veuillez executer ce script depuis la racine du projet." -ForegroundColor Yellow
    exit 1
}

# Naviguer vers py_backend
Write-Host "1. Navigation vers py_backend/..." -ForegroundColor Yellow
Set-Location py_backend

# Verifier que runtime.txt existe
if (-not (Test-Path "runtime.txt")) {
    Write-Host "ERREUR: runtime.txt non trouve dans py_backend/!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "   OK runtime.txt trouve" -ForegroundColor Green

# Verifier le contenu de runtime.txt
$runtimeContent = Get-Content "runtime.txt" -Raw
Write-Host "   Contenu: $runtimeContent" -ForegroundColor Cyan

# Verifier le repository Git
Write-Host ""
Write-Host "2. Verification du repository Git..." -ForegroundColor Yellow
$gitRemote = git remote get-url origin 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Pas de repository Git configure!" -ForegroundColor Red
    Write-Host "Veuillez configurer le remote vers le repo backend:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git" -ForegroundColor Cyan
    Set-Location ..
    exit 1
}

Write-Host "   Repository: $gitRemote" -ForegroundColor Cyan

# Verifier que c'est bien le repo backend
if ($gitRemote -notlike "*Back-end-python*") {
    Write-Host ""
    Write-Host "ATTENTION: Le repository ne semble pas etre le backend!" -ForegroundColor Yellow
    Write-Host "Repository actuel: $gitRemote" -ForegroundColor Cyan
    Write-Host "Repository attendu: Back-end-python-V0_03_03_2026" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Voulez-vous continuer quand meme? (o/n)"
    if ($continue -ne "o") {
        Set-Location ..
        exit 0
    }
}

# Verifier le statut Git
Write-Host ""
Write-Host "3. Statut Git..." -ForegroundColor Yellow
git status --short

# Ajouter les fichiers
Write-Host ""
Write-Host "4. Ajout des fichiers a Git..." -ForegroundColor Yellow
git add runtime.txt requirements_render.txt

Write-Host "   OK Fichiers ajoutes" -ForegroundColor Green

# Creer le commit
Write-Host ""
Write-Host "5. Creation du commit..." -ForegroundColor Yellow
$commitMessage = "Fix: Add runtime.txt for Python 3.11.9 and update pydantic to 2.6.4"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Note: Aucun changement a commiter (fichiers deja a jour)" -ForegroundColor Yellow
}
else {
    Write-Host "   OK Commit cree" -ForegroundColor Green
}

# Pousser vers GitHub
Write-Host ""
Write-Host "6. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   Branche: master" -ForegroundColor Cyan

git push origin master

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR lors du push!" -ForegroundColor Red
    Write-Host "Verifiez vos credentials GitHub." -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OK PUSH REUSSI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Retour a la racine
Set-Location ..

# Instructions suivantes
Write-Host "PROCHAINES ETAPES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verifier sur GitHub que runtime.txt est visible:" -ForegroundColor Yellow
Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Render va detecter le push automatiquement (5-10 min)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Verifier les logs Render:" -ForegroundColor Yellow
Write-Host "   - Doit afficher: 'Using Python version 3.11.9'" -ForegroundColor Cyan
Write-Host "   - Doit installer: pydantic 2.6.4 et pydantic-core 2.16.3" -ForegroundColor Cyan
Write-Host "   - Build doit reussir sans erreur Rust" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Si le build ne demarre pas automatiquement:" -ForegroundColor Yellow
Write-Host "   - Aller sur le dashboard Render" -ForegroundColor Cyan
Write-Host "   - Cliquer sur 'Manual Deploy' > 'Deploy latest commit'" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
