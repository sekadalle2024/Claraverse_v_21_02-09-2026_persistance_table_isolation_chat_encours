Write-Host "Deploiement direct sur Netlify..." -ForegroundColor Cyan
Write-Host "Cela peut prendre 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

# Deploiement direct
netlify deploy --prod --dir=dist

Write-Host ""
Write-Host "Deploiement termine !" -ForegroundColor Green
Write-Host "Verifiez votre site: https://prclaravi.netlify.app" -ForegroundColor Cyan