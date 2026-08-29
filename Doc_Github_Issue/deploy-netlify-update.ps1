# Script de redéploiement Netlify - ClaraVerse
# Ce script redéploie les mises à jour sur Netlify

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REDÉPLOIEMENT NETLIFY - CLARAVERSE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier que Netlify CLI est installé
Write-Host "[1/4] Vérification de Netlify CLI..." -ForegroundColor Yellow
$netlifyVersion = netlify --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Netlify CLI installé: $netlifyVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Netlify CLI non installé" -ForegroundColor Red
    Write-Host "Installez-le avec: npm install -g netlify-cli" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Vérifier l'authentification
Write-Host ""
Write-Host "[2/4] Vérification de l'authentification..." -ForegroundColor Yellow
$status = netlify status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Authentifié sur Netlify" -ForegroundColor Green
} else {
    Write-Host "✗ Non authentifié" -ForegroundColor Red
    Write-Host "Connectez-vous avec: netlify login" -ForegroundColor Yellow
    exit 1
}

# Étape 3: Build du projet
Write-Host ""
Write-Host "[3/4] Build du projet..." -ForegroundColor Yellow
Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build réussi" -ForegroundColor Green
} else {
    Write-Host "✗ Échec du build" -ForegroundColor Red
    exit 1
}

# Étape 4: Déploiement sur Netlify
Write-Host ""
Write-Host "[4/4] Déploiement sur Netlify..." -ForegroundColor Yellow
Write-Host "Upload des fichiers en cours..." -ForegroundColor Gray
netlify deploy --prod --dir=dist
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre site est maintenant en ligne:" -ForegroundColor Cyan
    Write-Host "https://prclaravi.netlify.app" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "✗ Échec du déploiement" -ForegroundColor Red
    Write-Host "Vérifiez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
    exit 1
}
