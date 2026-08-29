# Script de démarrage du Backend ClaraVerse

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║               DÉMARRAGE BACKEND - CLARAVERSE                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

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

Write-Host "🚀 Démarrage du serveur backend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 URL Backend : http://localhost:8000" -ForegroundColor Green
Write-Host "📍 API Docs    : http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Pour arrêter le serveur, appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Démarrer le serveur backend
Set-Location py_backend
python main.py
