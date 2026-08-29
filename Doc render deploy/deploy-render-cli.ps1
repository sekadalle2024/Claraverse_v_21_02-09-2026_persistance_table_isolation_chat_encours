# Script de déploiement Render CLI
# Date: 16 avril 2026

Write-Host "🚀 Déploiement Clara Backend sur Render (Plan Hobby)" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier si Render CLI est installé
Write-Host "`n📦 Vérification de Render CLI..." -ForegroundColor Yellow
$renderInstalled = Get-Command render -ErrorAction SilentlyContinue

if (-not $renderInstalled) {
    Write-Host "❌ Render CLI n'est pas installé" -ForegroundColor Red
    Write-Host "`n💡 Installation via npm:" -ForegroundColor Yellow
    Write-Host "   npm install -g render-cli" -ForegroundColor White
    Write-Host "`nOu téléchargez depuis: https://render.com/docs/cli" -ForegroundColor White
    exit 1
}

Write-Host "✅ Render CLI installé" -ForegroundColor Green
render --version

# Vérifier l'authentification
Write-Host "`n🔑 Vérification de l'authentification..." -ForegroundColor Yellow
$authCheck = render whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non authentifié sur Render" -ForegroundColor Red
    Write-Host "`n💡 Connectez-vous avec:" -ForegroundColor Yellow
    Write-Host "   render login" -ForegroundColor White
    exit 1
}

Write-Host "✅ Authentifié: $authCheck" -ForegroundColor Green

# Vérifier que render.yaml existe
Write-Host "`n📄 Vérification de render.yaml..." -ForegroundColor Yellow
if (-not (Test-Path "render.yaml")) {
    Write-Host "❌ render.yaml introuvable à la racine du projet" -ForegroundColor Red
    exit 1
}
Write-Host "✅ render.yaml trouvé" -ForegroundColor Green

# Vérifier requirements.txt
Write-Host "`n📄 Vérification de requirements.txt..." -ForegroundColor Yellow
if (-not (Test-Path "py_backend/requirements.txt")) {
    Write-Host "❌ py_backend/requirements.txt introuvable" -ForegroundColor Red
    exit 1
}
Write-Host "✅ requirements.txt trouvé" -ForegroundColor Green

# Afficher le contenu de render.yaml
Write-Host "`n📋 Configuration render.yaml:" -ForegroundColor Cyan
Get-Content "render.yaml" | Write-Host -ForegroundColor White

# Demander confirmation
Write-Host "`n⚠️  ATTENTION: Le plan Starter coûte ~$7/mois" -ForegroundColor Yellow
Write-Host "   Vous pouvez changer pour le plan Free (avec cold start) après le déploiement" -ForegroundColor Yellow
$confirmation = Read-Host "`nContinuer le déploiement? (o/n)"

if ($confirmation -ne "o" -and $confirmation -ne "O") {
    Write-Host "`n❌ Déploiement annulé" -ForegroundColor Red
    exit 0
}

# Vérifier si le service existe déjà
Write-Host "`n🔍 Vérification du service existant..." -ForegroundColor Yellow
$serviceExists = render services list 2>&1 | Select-String "clara-backend-hobby"

if ($serviceExists) {
    Write-Host "✅ Service 'clara-backend-hobby' existe déjà" -ForegroundColor Green
    Write-Host "`n🔄 Redéploiement du service..." -ForegroundColor Cyan
    
    render deploy --service clara-backend-hobby
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Redéploiement réussi!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erreur lors du redéploiement" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Service 'clara-backend-hobby' n'existe pas encore" -ForegroundColor Yellow
    Write-Host "`n🆕 Création du service..." -ForegroundColor Cyan
    
    # Créer le service (interactif)
    Write-Host "`n💡 Suivez les instructions pour créer le service:" -ForegroundColor Yellow
    Write-Host "   1. Choisissez 'Web Service'" -ForegroundColor White
    Write-Host "   2. Connectez votre repository GitHub" -ForegroundColor White
    Write-Host "   3. Sélectionnez la branche 'main'" -ForegroundColor White
    Write-Host "   4. Confirmez la configuration" -ForegroundColor White
    
    render services create
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Service créé avec succès!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erreur lors de la création du service" -ForegroundColor Red
        exit 1
    }
}

# Afficher les logs
Write-Host "`n📊 Logs du déploiement (Ctrl+C pour arrêter):" -ForegroundColor Cyan
Write-Host "=" * 60
render logs --tail

Write-Host "`n✅ Script terminé!" -ForegroundColor Green
Write-Host "`n💡 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   render services list          # Lister les services" -ForegroundColor White
Write-Host "   render logs --tail            # Voir les logs en temps réel" -ForegroundColor White
Write-Host "   render services get clara-backend-hobby  # Détails du service" -ForegroundColor White
Write-Host "   render deploy                 # Redéployer" -ForegroundColor White
