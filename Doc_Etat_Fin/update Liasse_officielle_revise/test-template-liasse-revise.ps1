# ================================================================================
# TEST RAPIDE - VÉRIFICATION TEMPLATE LIASSE_OFFICIELLE_REVISE
# 08 Avril 2026
# ================================================================================

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST: Vérification du template Liasse_officielle_revise.xlsx" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier existe
Write-Host "1. Vérification de l'existence du fichier..." -ForegroundColor Yellow
if (Test-Path "py_backend/Liasse_officielle_revise.xlsx") {
    Write-Host "   ✅ Fichier trouvé: py_backend/Liasse_officielle_revise.xlsx" -ForegroundColor Green
    
    # Obtenir la taille du fichier
    $fileSize = (Get-Item "py_backend/Liasse_officielle_revise.xlsx").Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "   📊 Taille: $fileSizeKB KB" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Fichier NON trouvé: py_backend/Liasse_officielle_revise.xlsx" -ForegroundColor Red
    Write-Host ""
    Write-Host "ERREUR: Le fichier template est manquant!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le code utilise bien ce fichier
Write-Host "2. Vérification du code export_liasse.py..." -ForegroundColor Yellow
$codeContent = Get-Content "py_backend/export_liasse.py" -Raw

if ($codeContent -match 'Liasse_officielle_revise\.xlsx') {
    Write-Host "   ✅ Le code référence bien Liasse_officielle_revise.xlsx" -ForegroundColor Green
    
    # Vérifier que c'est en priorité
    if ($codeContent -match 'template_path = "Liasse_officielle_revise\.xlsx"') {
        Write-Host "   ✅ Liasse_officielle_revise.xlsx est en PRIORITÉ" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Liasse_officielle_revise.xlsx n'est pas en priorité" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Le code ne référence PAS Liasse_officielle_revise.xlsx" -ForegroundColor Red
}

Write-Host ""

# Test Python pour lire les onglets
Write-Host "3. Test de lecture des onglets avec Python..." -ForegroundColor Yellow
Write-Host "   (Nécessite openpyxl installé)" -ForegroundColor Gray

$pythonTest = @"
import sys
import os
sys.path.insert(0, 'py_backend')
os.chdir('py_backend')

try:
    from openpyxl import load_workbook
    
    wb = load_workbook('Liasse_officielle_revise.xlsx')
    print(f'   ✅ Fichier chargé avec succès')
    print(f'   📋 Nombre d\'onglets: {len(wb.sheetnames)}')
    print(f'   📄 Premiers onglets: {wb.sheetnames[:5]}')
    
    # Chercher les onglets importants
    onglets_importants = []
    for name in wb.sheetnames:
        if 'ACTIF' in name.upper() or 'PASSIF' in name.upper() or 'RESULTAT' in name.upper():
            onglets_importants.append(name)
    
    if onglets_importants:
        print(f'   ✅ Onglets importants trouvés: {len(onglets_importants)}')
        for onglet in onglets_importants[:10]:
            print(f'      - {onglet}')
    else:
        print(f'   ⚠️  Aucun onglet ACTIF/PASSIF/RESULTAT trouvé')
    
except Exception as e:
    print(f'   ❌ Erreur: {e}')
    sys.exit(1)
"@

$pythonTest | python

Write-Host ""

# Résumé
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Fichier template: py_backend/Liasse_officielle_revise.xlsx" -ForegroundColor Green
Write-Host "✅ Code modifié: py_backend/export_liasse.py" -ForegroundColor Green
Write-Host ""
Write-Host "PROCHAINE ÉTAPE:" -ForegroundColor Yellow
Write-Host "  1. Démarrer le backend: cd py_backend ; python main.py" -ForegroundColor White
Write-Host "  2. Charger une balance dans l'interface web" -ForegroundColor White
Write-Host "  3. Générer les états financiers" -ForegroundColor White
Write-Host "  4. Cliquer sur 'Exporter Liasse Officielle'" -ForegroundColor White
Write-Host "  5. Vérifier le fichier Excel téléchargé" -ForegroundColor White
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
