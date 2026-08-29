# Deploiement sur Netlify
Write-Host "Deploiement sur Netlify..." -ForegroundColor Cyan

if (Test-Path "dist") {
    Write-Host "Dossier dist trouve" -ForegroundColor Green
    
    $size = (Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Taille: $([math]::Round($size, 1)) MB" -ForegroundColor Yellow
    
    Write-Host "Upload en cours..." -ForegroundColor Yellow
    netlify deploy --prod --dir=dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "DEPLOIEMENT REUSSI !" -ForegroundColor Green
        Write-Host "Site: https://prclaravi.netlify.app" -ForegroundColor Cyan
    } else {
        Write-Host "Erreur lors du deploiement" -ForegroundColor Red
    }
} else {
    Write-Host "Dossier dist non trouve" -ForegroundColor Red
    Write-Host "Executez d'abord: npm run build" -ForegroundColor Yellow
}