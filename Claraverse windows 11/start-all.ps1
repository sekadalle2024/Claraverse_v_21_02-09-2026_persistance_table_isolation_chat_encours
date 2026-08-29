# Script de démarrage Frontend + Backend ClaraVerse

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          DÉMARRAGE COMPLET - CLARAVERSE                       ║" -ForegroundColor Green
Write-Host "║          Frontend + Backend                                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Vérifier que l'environnement virtuel existe
if (-not (Test-Path "venv_claraverse\Scripts\Activate.ps1")) {
    Write-Host "✗ Environnement virtuel non trouvé!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez d'abord créer l'environnement avec:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv_claraverse" -ForegroundColor White
    Write-Host "  .\venv_claraverse\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  cd py_backend" -ForegroundColor White
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Activation de l'environnement virtuel Python..." -ForegroundColor Green
& .\venv_claraverse\Scripts\Activate.ps1

Write-Host "🚀 Démarrage des serveurs..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 API Docs : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Pour arrêter les serveurs, appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Green

# Démarrer frontend et backend ensemble
npm run dev:full
