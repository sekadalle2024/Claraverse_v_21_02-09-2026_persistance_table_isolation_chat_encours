#!/usr/bin/env pwsh
# Script de vérification rapide de l'intégration des 16 états de contrôle

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICATION RAPIDE - INTEGRATION 16 ETATS DE CONTROLE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$errors = 0

# 1. Vérifier le module
Write-Host "1. Module etats_controle_exhaustifs_html.py..." -NoNewline
if (Test-Path "py_backend/etats_controle_exhaustifs_html.py") {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MANQUANT" -ForegroundColor Red
    $errors++
}

# 2. Vérifier l'import
Write-Host "2. Import dans etats_financiers.py..." -NoNewline
$import = Select-String -Path "py_backend/etats_financiers.py" -Pattern "from etats_controle_exhaustifs_html import" -Quiet
if ($import) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MANQUANT" -ForegroundColor Red
    $errors++
}

# 3. Vérifier le CSS
Write-Host "3. CSS pour les sections accordeon..." -NoNewline
$css = Select-String -Path "py_backend/etats_financiers.py" -Pattern "\.section-header \{" -Quiet
if ($css) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MANQUANT" -ForegroundColor Red
    $errors++
}

# 4. Vérifier le JavaScript
Write-Host "4. JavaScript pour les accordeons..." -NoNewline
$js = Select-String -Path "py_backend/etats_financiers.py" -Pattern "function toggleSection" -Quiet
if ($js) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MANQUANT" -ForegroundColor Red
    $errors++
}

# 5. Vérifier l'ordre d'ajout
Write-Host "5. Ordre d'ajout correct..." -NoNewline
$content = Get-Content "py_backend/etats_financiers.py" -Raw
$html_etats_pos = $content.IndexOf("html += html_etats")
$close_div_pos = $content.IndexOf('html += "</div>"', $html_etats_pos)
if ($html_etats_pos -gt 0 -and $close_div_pos -gt $html_etats_pos) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " INCORRECT" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "  VERIFICATION REUSSIE - Aucune erreur detectee" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  VERIFICATION ECHOUEE - $errors erreur(s) detectee(s)" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Consultez la documentation pour corriger les erreurs:" -ForegroundColor Yellow
    Write-Host "  Doc_Menu_Accordeon_16_Controles/Documentation/05_GUIDE_MAINTENANCE.md" -ForegroundColor White
    exit 1
}
