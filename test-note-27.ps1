# Script de test pour Note 27 - Dotations aux Provisions
# Usage: .\test-note-27.ps1

Write-Host "`n=== Test Note 27: Dotations aux Provisions ===`n" -ForegroundColor Cyan

# Vérifier que Python est installé
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Erreur: Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire du script
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts"
if (-not (Test-Path $scriptPath)) {
    Write-Host "Erreur: Le répertoire $scriptPath n'existe pas" -ForegroundColor Red
    exit 1
}

Set-Location $scriptPath

Write-Host "Test du calculateur Note 27...`n" -ForegroundColor Yellow

# Exécuter le script
try {
    python calculer_note_27.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Test réussi!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Test échoué (code: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n✗ Erreur lors de l'exécution: $_" -ForegroundColor Red
    exit 1
}

# Retour au répertoire initial
Set-Location -

Write-Host "`n=== Test terminé ===" -ForegroundColor Cyan
