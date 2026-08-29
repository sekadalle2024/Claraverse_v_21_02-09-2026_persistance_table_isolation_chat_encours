# ================================================================
# Script de Push SANS node_modules - 17 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public.git
# ================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   PUSH CLARAVERSE SANS NODE_MODULES - 17 AVRIL 2026" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter tous les processus Git
Write-Host "Arret des processus Git en cours..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*git*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Supprimer le fichier de verrouillage
Write-Host "Suppression du fichier de verrouillage..." -ForegroundColor Yellow
Remove-Item -Path ".git/index.lock" -Force -ErrorAction SilentlyContinue
Write-Host "Nettoyage termine" -ForegroundColor Green
Write-Host ""

# Configuration Git optimale
Write-Host "Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config core.autocrlf false
Write-Host "Configuration terminee" -ForegroundColor Green
Write-Host ""

# Ajouter node_modules et .netlify au .gitignore
Write-Host "Mise a jour du .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"

# Dossiers a exclure du push
node_modules/
.netlify/
deploiement-netlify/.netlify/
backend.zip
tests-html/
"@

Add-Content -Path ".gitignore" -Value $gitignoreContent -ErrorAction SilentlyContinue
Write-Host ".gitignore mis a jour" -ForegroundColor Green
Write-Host ""

# Supprimer ces dossiers de l'index Git
Write-Host "Suppression de node_modules et .netlify de l'index Git..." -ForegroundColor Yellow
git rm -r --cached node_modules/ 2>$null
git rm -r --cached .netlify/ 2>$null
git rm -r --cached deploiement-netlify/.netlify/ 2>$null
git rm -r --cached backend.zip 2>$null
git rm -r --cached tests-html/ 2>$null
Write-Host "Nettoyage de l'index termine" -ForegroundColor Green
Write-Host ""

# Configurer le repository distant
Write-Host "Configuration du repository distant..." -ForegroundColor Yellow
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public.git"

$remoteCheck = git remote -v 2>&1
if ($remoteCheck -match "origin") {
    git remote set-url origin $repoUrl
} else {
    git remote add origin $repoUrl
}

Write-Host "Repository configure: $repoUrl" -ForegroundColor Green
Write-Host ""

# Vérifier la branche
$currentBranch = git branch --show-current
if ([string]::IsNullOrEmpty($currentBranch)) {
    $currentBranch = "master"
    git checkout -b $currentBranch
}
Write-Host "Branche: $currentBranch" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "Fichiers ajoutes" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "Creation du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V8 - 17 Avril 2026 (sans node_modules)"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Aucun changement a commiter ou commit deja existant" -ForegroundColor Yellow
    Write-Host ""
}
Write-Host ""

# Push avec retry
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   PUSH VERS GITHUB" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$maxRetries = 3
for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "Tentative $i/$maxRetries..." -ForegroundColor Yellow
    
    git push -u origin $currentBranch 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "           PUSH REUSSI" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Verification finale..." -ForegroundColor Yellow
        git status
        Write-Host ""
        
        Write-Host "Repository GitHub:" -ForegroundColor Cyan
        Write-Host $repoUrl -ForegroundColor White
        Write-Host ""
        
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "  SAUVEGARDE CLARAVERSE TERMINEE AVEC SUCCES" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        
        exit 0
    }
    
    if ($i -lt $maxRetries) {
        Write-Host "Echec, nouvelle tentative dans 5 secondes..." -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Red
Write-Host "  ERREUR: Push echoue apres $maxRetries tentatives" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Solutions alternatives:" -ForegroundColor Yellow
Write-Host "1. Verifier votre connexion Internet" -ForegroundColor White
Write-Host "2. Utiliser GitHub Desktop (recommande)" -ForegroundColor White
Write-Host "3. Relancer ce script" -ForegroundColor White
Write-Host ""

exit 1
