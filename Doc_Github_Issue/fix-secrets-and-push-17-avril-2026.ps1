# ================================================================
# Script de Correction des Secrets et Push - 17 Avril 2026
# ================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   CORRECTION SECRETS GOOGLE OAUTH - 17 AVRIL 2026" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Supprimer les fichiers contenant des secrets
Write-Host "Suppression des fichiers contenant des secrets..." -ForegroundColor Yellow

$secretFiles = @(
    "Doc cross ref documentaire menu/00_CREDENTIALS_OAUTH_GOOGLE.txt"
)

foreach ($file in $secretFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Supprime: $file" -ForegroundColor Gray
    }
}

Write-Host "Fichiers sensibles supprimes" -ForegroundColor Green
Write-Host ""

# Ajouter au .gitignore
Write-Host "Mise a jour du .gitignore..." -ForegroundColor Yellow
$gitignoreAdd = @"

# Fichiers sensibles a exclure
*CREDENTIALS*
*credentials*
*OAuth*
*oauth*
*.env
.env.*
"@

Add-Content -Path ".gitignore" -Value $gitignoreAdd -ErrorAction SilentlyContinue
Write-Host ".gitignore mis a jour" -ForegroundColor Green
Write-Host ""

# Ajouter les changements
Write-Host "Ajout des changements..." -ForegroundColor Yellow
git add .
Write-Host "Changements ajoutes" -ForegroundColor Green
Write-Host ""

# Créer un nouveau commit
Write-Host "Creation du commit..." -ForegroundColor Yellow
git commit -m "Suppression des secrets OAuth pour securite"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Aucun changement a commiter" -ForegroundColor Yellow
}
Write-Host ""

# Push vers GitHub
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   PUSH VERS GITHUB" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$currentBranch = git branch --show-current
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
        Write-Host "https://github.com/sekadalle2024/Claverse_windows__v8_17-04-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor White
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
Write-Host "1. Autoriser les secrets sur GitHub (liens fournis par GitHub)" -ForegroundColor White
Write-Host "2. Utiliser GitHub Desktop" -ForegroundColor White
Write-Host "3. Contacter le support GitHub" -ForegroundColor White
Write-Host ""

exit 1
