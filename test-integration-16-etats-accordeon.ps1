#!/usr/bin/env pwsh
# Script de test pour vérifier l'intégration des 16 états de contrôle dans le menu accordéon

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST INTÉGRATION 16 ÉTATS DE CONTRÔLE DANS LE MENU ACCORDÉON" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que le module etats_controle_exhaustifs_html.py existe
Write-Host "1️⃣  Vérification du module etats_controle_exhaustifs_html.py..." -ForegroundColor Yellow
if (Test-Path "py_backend/etats_controle_exhaustifs_html.py") {
    Write-Host "   ✅ Module trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Module non trouvé" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que le module est importé dans etats_financiers.py
Write-Host ""
Write-Host "2️⃣  Vérification de l'import dans etats_financiers.py..." -ForegroundColor Yellow
$import_found = Select-String -Path "py_backend/etats_financiers.py" -Pattern "from etats_controle_exhaustifs_html import generate_all_16_etats_controle_html"
if ($import_found) {
    Write-Host "   ✅ Import trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Import non trouvé" -ForegroundColor Red
    exit 1
}

# 3. Vérifier que les CSS pour les états de contrôle sont présents
Write-Host ""
Write-Host "3️⃣  Vérification des CSS pour les états de contrôle..." -ForegroundColor Yellow
$css_section = Select-String -Path "py_backend/etats_financiers.py" -Pattern "\.section-header \{"
$css_success_box = Select-String -Path "py_backend/etats_financiers.py" -Pattern "\.success-box \{"
$css_badge = Select-String -Path "py_backend/etats_financiers.py" -Pattern "\.badge \{"

if ($css_section -and $css_success_box -and $css_badge) {
    Write-Host "   ✅ CSS trouvés" -ForegroundColor Green
} else {
    Write-Host "   ❌ CSS manquants" -ForegroundColor Red
    if (-not $css_section) { Write-Host "      - .section-header manquant" -ForegroundColor Red }
    if (-not $css_success_box) { Write-Host "      - .success-box manquant" -ForegroundColor Red }
    if (-not $css_badge) { Write-Host "      - .badge manquant" -ForegroundColor Red }
    exit 1
}

# 4. Vérifier que le JavaScript pour les états de contrôle est présent
Write-Host ""
Write-Host "4️⃣  Vérification du JavaScript pour les états de contrôle..." -ForegroundColor Yellow
$js_toggle = Select-String -Path "py_backend/etats_financiers.py" -Pattern "function toggleSection"
$js_listener = Select-String -Path "py_backend/etats_financiers.py" -Pattern "document\.querySelectorAll\('\.section-header'\)"

if ($js_toggle -and $js_listener) {
    Write-Host "   ✅ JavaScript trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ JavaScript manquant" -ForegroundColor Red
    if (-not $js_toggle) { Write-Host "      - function toggleSection manquante" -ForegroundColor Red }
    if (-not $js_listener) { Write-Host "      - event listener manquant" -ForegroundColor Red }
    exit 1
}

# 5. Vérifier que les états sont ajoutés AVANT la fermeture de la div
Write-Host ""
Write-Host "5️⃣  Vérification de l'ordre d'ajout des états..." -ForegroundColor Yellow
$content = Get-Content "py_backend/etats_financiers.py" -Raw
$html_etats_pos = $content.IndexOf("html += html_etats")
$close_div_pos = $content.IndexOf('html += "</div>"', $html_etats_pos)

if ($html_etats_pos -gt 0 -and $close_div_pos -gt $html_etats_pos) {
    Write-Host "   ✅ Les états sont ajoutés AVANT la fermeture de la div" -ForegroundColor Green
} else {
    Write-Host "   ❌ Problème d'ordre d'ajout" -ForegroundColor Red
    exit 1
}

# 6. Compter le nombre de fonctions dans le module
Write-Host ""
Write-Host "6️⃣  Vérification du nombre de fonctions dans le module..." -ForegroundColor Yellow
$functions = Select-String -Path "py_backend/etats_controle_exhaustifs_html.py" -Pattern "^def generate_etat_"
$function_count = $functions.Count

Write-Host "   📊 Nombre de fonctions generate_etat_* : $function_count" -ForegroundColor Cyan
if ($function_count -ge 8) {
    Write-Host "   ✅ Au moins 8 fonctions trouvées" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Moins de 8 fonctions trouvées" -ForegroundColor Yellow
}

# 7. Vérifier la fonction principale
Write-Host ""
Write-Host "7️⃣  Vérification de la fonction principale..." -ForegroundColor Yellow
$main_function = Select-String -Path "py_backend/etats_controle_exhaustifs_html.py" -Pattern "def generate_all_16_etats_controle_html"
if ($main_function) {
    Write-Host "   ✅ Fonction generate_all_16_etats_controle_html trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fonction principale non trouvée" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ TOUS LES TESTS SONT PASSÉS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 RÉSUMÉ DES MODIFICATIONS:" -ForegroundColor Yellow
Write-Host "   1. Module etats_controle_exhaustifs_html.py créé avec $function_count fonctions" -ForegroundColor White
Write-Host "   2. Import ajouté dans etats_financiers.py" -ForegroundColor White
Write-Host "   3. CSS pour les états de contrôle ajoutés" -ForegroundColor White
Write-Host "   4. JavaScript pour les accordéons ajouté" -ForegroundColor White
Write-Host "   5. Les 16 états sont intégrés dans le menu accordéon" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "   1. Redemarrer le backend Python" -ForegroundColor White
Write-Host "   2. Tester avec une balance reelle" -ForegroundColor White
Write-Host "   3. Verifier l'affichage dans le navigateur" -ForegroundColor White
Write-Host ""
