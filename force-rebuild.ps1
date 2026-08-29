# Script pour forcer la recompilation complete de l'application

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "FORCE REBUILD - Recompilation complete de l'application" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Arreter l'application
Write-Host "Etape 1: Arret de l'application..." -ForegroundColor Yellow
.\stop-claraverse.ps1
Write-Host ""

# Etape 2: Supprimer les caches
Write-Host "Etape 2: Suppression des caches..." -ForegroundColor Yellow

if (Test-Path "node_modules\.vite") {
    Write-Host "   Suppression du cache Vite..." -NoNewline
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
}

if (Test-Path "dist") {
    Write-Host "   Suppression du dossier dist..." -NoNewline
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
}

if (Test-Path ".vite") {
    Write-Host "   Suppression du cache .vite..." -NoNewline
    Remove-Item -Recurse -Force ".vite" -ErrorAction SilentlyContinue
    Write-Host " OK" -ForegroundColor Green
}

Write-Host ""

# Etape 3: Redemarrer
Write-Host "Etape 3: Redemarrage de l'application..." -ForegroundColor Yellow
Write-Host ""
.\start-claraverse.ps1

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "REBUILD TERMINE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Videz le cache de votre navigateur!" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Chrome/Edge: Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "   Puis rafraichissez avec: Ctrl + F5" -ForegroundColor White
Write-Host ""
Write-Host "Ou utilisez une fenetre de navigation privee:" -ForegroundColor Yellow
Write-Host "   Ctrl + Shift + N" -ForegroundColor White
Write-Host ""
