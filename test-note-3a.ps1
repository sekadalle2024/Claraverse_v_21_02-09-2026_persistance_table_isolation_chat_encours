# Script de test rapide pour la Note 3A
# 08 Avril 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST NOTE 3A - IMMOBILISATIONS INCORPORELLES" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier backend
Set-Location py_backend

Write-Host "Execution du script de calcul..." -ForegroundColor Yellow
python calculer_note_3a.py

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "RESULTAT" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green

if (Test-Path "test_note_3a.html") {
    Write-Host "Fichier HTML genere avec succes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ouverture du fichier HTML..." -ForegroundColor Yellow
    Start-Process "test_note_3a.html"
} else {
    Write-Host "Erreur: Fichier HTML non genere" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "FIN DU TEST" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# Retour au dossier racine
Set-Location ..
