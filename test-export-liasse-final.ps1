# Test final - Export liasse corrige
# Date: 05 Avril 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST EXPORT LIASSE - CORRECTIONS APPLIQUEES" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verification environnement conda
Write-Host "1. Verification environnement conda..." -ForegroundColor Yellow
$condaEnv = conda env list | Select-String "claraverse_backend"
if ($condaEnv) {
    Write-Host "   OK Environnement claraverse_backend trouve" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Environnement claraverse_backend non trouve" -ForegroundColor Red
    exit 1
}

# Verification fichier template
Write-Host ""
Write-Host "2. Verification fichier template..." -ForegroundColor Yellow
if (Test-Path "py_backend/Liasse_officielle_revise.xlsx") {
    $fileSize = (Get-Item "py_backend/Liasse_officielle_revise.xlsx").Length / 1KB
    Write-Host "   OK Template trouve: Liasse_officielle_revise.xlsx ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Template non trouve: Liasse_officielle_revise.xlsx" -ForegroundColor Red
    exit 1
}

# Verification corrections dans export_liasse.py
Write-Host ""
Write-Host "3. Verification corrections dans export_liasse.py..." -ForegroundColor Yellow
$exportContent = Get-Content "py_backend/export_liasse.py" -Raw
if ($exportContent -match "def write_to_cell") {
    Write-Host "   OK Fonction write_to_cell() presente" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Fonction write_to_cell() manquante" -ForegroundColor Red
}

if ($exportContent -match "def convert_list_to_dict") {
    Write-Host "   OK Fonction convert_list_to_dict() presente" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Fonction convert_list_to_dict() manquante" -ForegroundColor Red
}

if ($exportContent -match "from openpyxl.cell.cell import MergedCell") {
    Write-Host "   OK Import MergedCell present" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Import MergedCell manquant" -ForegroundColor Red
}

# Test rapide avec diagnostic
Write-Host ""
Write-Host "4. Execution test de diagnostic..." -ForegroundColor Yellow
Write-Host "   Commande: conda run -n claraverse_backend python py_backend/diagnostic_export_liasse.py" -ForegroundColor Gray
Write-Host ""

conda run -n claraverse_backend python py_backend/diagnostic_export_liasse.py

# Verification fichier genere
Write-Host ""
Write-Host "5. Verification fichier test genere..." -ForegroundColor Yellow
if (Test-Path "py_backend/test_liasse_remplie.xlsx") {
    $fileSize = (Get-Item "py_backend/test_liasse_remplie.xlsx").Length / 1KB
    Write-Host "   OK Fichier test_liasse_remplie.xlsx cree ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
    
    # Ouvrir le fichier pour inspection manuelle
    Write-Host ""
    Write-Host "   Ouverture du fichier pour verification..." -ForegroundColor Cyan
    Start-Process "py_backend/test_liasse_remplie.xlsx"
    
    Write-Host ""
    Write-Host "   VERIFICATION MANUELLE REQUISE:" -ForegroundColor Yellow
    Write-Host "      1. Le fichier Excel s est ouvert" -ForegroundColor White
    Write-Host "      2. Verifier que les cellules contiennent des valeurs (123456.78)" -ForegroundColor White
    Write-Host "      3. Verifier les onglets: BILAN, ACTIF, PASSIF, RESULTAT" -ForegroundColor White
    Write-Host "      4. Verifier l onglet Controle de coherence" -ForegroundColor White
} else {
    Write-Host "   ERREUR Fichier test_liasse_remplie.xlsx non cree" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST TERMINE" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROCHAINES ETAPES:" -ForegroundColor Yellow
Write-Host "  1. Verifier manuellement le fichier test_liasse_remplie.xlsx" -ForegroundColor White
Write-Host "  2. Si les donnees sont presentes -> Test reussi" -ForegroundColor White
Write-Host "  3. Tester l export complet avec: cd py_backend puis python generer_etats_liasse.py" -ForegroundColor White
Write-Host "  4. Tester via le menu contextuel frontend" -ForegroundColor White
Write-Host ""
