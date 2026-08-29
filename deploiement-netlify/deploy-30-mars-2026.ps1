# Script de deploiement specifique - 30 Mars 2026
# Deploiement des mises a jour accumulees depuis le 25 mars

$Message = @"
Mise a jour 30 Mars 2026:
- Mode QCM E-CIA Exam
- Modes E-Controle
- Lead Balance E-Revision
- Corrections export CAC
- Solution hybride agent RAG
- Notifications Router
- Corrections Case 25
"@

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT 30 MARS 2026" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mises a jour incluses:" -ForegroundColor Yellow
Write-Host $Message -ForegroundColor White
Write-Host ""
Write-Host "Lancement du deploiement complet..." -ForegroundColor Green
Write-Host ""

# Appeler le script de deploiement principal
.\deploy.ps1 -Message "Mise a jour 30 Mars 2026 - Multiples ameliorations"
