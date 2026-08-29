# Script de push du fix runtime.txt pour Render
# Date: 17 Avril 2026

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PUSH FIX RUNTIME.TXT POUR RENDER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier que runtime.txt existe à la racine
Write-Host "1. Vérification de runtime.txt à la racine..." -ForegroundColor Yellow
if (Test-Path "runtime.txt") {
    Write-Host "   ✓ runtime.txt existe à la racine" -ForegroundColor Green
    Get-Content "runtime.txt"
} else {
    Write-Host "   ✗ runtime.txt n'existe pas à la racine" -ForegroundColor Red
    Write-Host "   Création de runtime.txt..." -ForegroundColor Yellow
    "python-3.11.9" | Out-File -FilePath "runtime.txt" -Encoding utf8 -NoNewline
    Write-Host "   ✓ runtime.txt créé" -ForegroundColor Green
}

Write-Host ""

# Étape 2: Vérifier requirements_render.txt
Write-Host "2. Vérification de requirements_render.txt..." -ForegroundColor Yellow
if (Test-Path "py_backend/requirements_render.txt") {
    Write-Host "   ✓ requirements_render.txt existe" -ForegroundColor Green
    $content = Get-Content "py_backend/requirements_render.txt" | Select-String "pydantic"
    Write-Host "   Versions pydantic:" -ForegroundColor Cyan
    $content | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
} else {
    Write-Host "   ✗ requirements_render.txt n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 3: Ajouter les fichiers à git
Write-Host "3. Ajout des fichiers à git..." -ForegroundColor Yellow
git add runtime.txt
git add py_backend/requirements_render.txt

$status = git status --short
if ($status) {
    Write-Host "   Fichiers modifiés:" -ForegroundColor Cyan
    Write-Host $status -ForegroundColor White
} else {
    Write-Host "   ✓ Aucun changement à commiter" -ForegroundColor Green
}

Write-Host ""

# Étape 4: Créer le commit
Write-Host "4. Création du commit..." -ForegroundColor Yellow
$commitMsg = "Fix: Add runtime.txt at root for Render Python version detection"

git commit -m $commitMsg

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "   ℹ Aucun changement à commiter ou commit déjà existant" -ForegroundColor Yellow
}

Write-Host ""

# Étape 5: Push vers GitHub
Write-Host "5. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   Branche: master" -ForegroundColor Cyan
Write-Host ""

git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✓ PUSH RÉUSSI!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Render va détecter le push automatiquement" -ForegroundColor White
    Write-Host "2. Le build va utiliser Python 3.11.9 (depuis runtime.txt)" -ForegroundColor White
    Write-Host "3. Pydantic 2.6.4 sera installé avec wheels pré-compilés" -ForegroundColor White
    Write-Host "4. Attendre 5-10 minutes pour le redéploiement" -ForegroundColor White
    Write-Host ""
    Write-Host "Vérifier les logs sur: https://dashboard.render.com" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ✗ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifier:" -ForegroundColor Yellow
    Write-Host "1. Connexion internet" -ForegroundColor White
    Write-Host "2. Authentification GitHub" -ForegroundColor White
    Write-Host "3. Permissions sur le repository" -ForegroundColor White
    exit 1
}
