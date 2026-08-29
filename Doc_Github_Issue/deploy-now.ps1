# Déploiement rapide sur Netlify
Write-Host "🚀 Déploiement sur Netlify en cours..." -ForegroundColor Cyan
Write-Host ""

# Le build est déjà fait, on déploie directement
Write-Host "📦 Déploiement du dossier dist/ vers Netlify..." -ForegroundColor Yellow
netlify deploy --prod --dir=dist --message="Mise à jour - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Votre site : https://prclaravi.netlify.app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
}
