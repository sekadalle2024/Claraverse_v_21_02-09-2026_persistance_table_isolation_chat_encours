# Déploiement immédiat sur Netlify
Write-Host "🚀 Déploiement sur Netlify..." -ForegroundColor Cyan

# Vérifier que le dossier dist existe
if (Test-Path "dist") {
    Write-Host "✓ Dossier dist trouvé" -ForegroundColor Green
    
    # Calculer la taille
    $size = (Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📦 Taille: $([math]::Round($size, 1)) MB" -ForegroundColor Yellow
    
    # Déployer
    Write-Host "📤 Upload en cours..." -ForegroundColor Yellow
    netlify deploy --prod --dir=dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
        Write-Host "🌐 Site: https://prclaravi.netlify.app" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Dossier dist non trouve" -ForegroundColor Red
    Write-Host "Executez d'abord: npm run build" -ForegroundColor Yellow
}