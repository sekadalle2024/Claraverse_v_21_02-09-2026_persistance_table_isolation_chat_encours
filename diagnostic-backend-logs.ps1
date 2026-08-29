# Script pour diagnostiquer les logs du backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC LOGS BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Vérification des processus Python..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime

Write-Host ""
Write-Host "Pour voir les logs du backend:" -ForegroundColor Yellow
Write-Host "1. Ouvrir la console où le backend tourne" -ForegroundColor Gray
Write-Host "2. Chercher les messages d'erreur après l'import de la balance" -ForegroundColor Gray
Write-Host ""

Write-Host "Messages à chercher:" -ForegroundColor Yellow
Write-Host "  - 'ERROR'" -ForegroundColor Red
Write-Host "  - 'Exception'" -ForegroundColor Red
Write-Host "  - 'Traceback'" -ForegroundColor Red
Write-Host "  - 'failed'" -ForegroundColor Red
Write-Host ""

Write-Host "Si le backend n'affiche rien:" -ForegroundColor Yellow
Write-Host "  -> Le backend n'a peut-être pas été redémarré" -ForegroundColor Gray
Write-Host "  -> Arrêter et redémarrer: .\start-claraverse.ps1" -ForegroundColor Gray
Write-Host ""
