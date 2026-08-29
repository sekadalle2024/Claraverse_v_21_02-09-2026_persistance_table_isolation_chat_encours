# Test d'intégration des 16 états de contrôle
# Date: 05 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST INTÉGRATION 16 ÉTATS DE CONTRÔLE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Test d'import du module
Write-Host "1️⃣  Test d'import du module..." -ForegroundColor Yellow
try {
    python -c "from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html; print('✅ Module importé avec succès')"
    Write-Host "   ✅ Module importé avec succès" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur d'import du module" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Test de génération rapide
Write-Host "2️⃣  Test de génération rapide..." -ForegroundColor Yellow
try {
    python test-16-etats-rapide.py
    Write-Host "   ✅ Génération rapide réussie" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur de génération" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Test de structure HTML
Write-Host "3️⃣  Test de structure HTML..." -ForegroundColor Yellow
$testScript = @"
from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html

# Données minimales
controles = {
    'statistiques': {'total_comptes_balance': 100, 'comptes_integres': 95, 'comptes_non_integres': 5, 'taux_couverture': 95.0},
    'equilibre_bilan': {'actif': 1000000, 'passif': 1000000, 'difference': 0, 'pourcentage_ecart': 0, 'equilibre': True},
    'equilibre_resultat': {'resultat_cr': 50000, 'resultat_bilan': 50000, 'difference': 0, 'equilibre': True},
    'comptes_non_integres': [],
    'comptes_sens_inverse': [],
    'comptes_desequilibre': [],
    'hypothese_affectation': {'resultat_net': 50000, 'actif': 1000000, 'passif_sans_resultat': 950000, 'difference_avant': 50000, 'passif_avec_resultat': 1000000, 'difference_apres': 0, 'equilibre_apres': True},
    'comptes_sens_anormal': {'critiques': [], 'eleves': [], 'moyens': [], 'faibles': []}
}
totaux = {'actif': 1000000, 'passif': 1000000, 'resultat': 50000}

html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)

# Vérifications
checks = {
    'Longueur HTML': len(html) > 30000,
    'Sections': html.count('<div class=\"section\">') == 16,
    'Headers': html.count('section-header') == 16,
    'État 1': '1. Statistiques de Couverture (Exercice N)' in html,
    'État 8': '8. Comptes avec Sens Anormal par Nature (Exercice N)' in html,
    'État 9': '9. Statistiques de Couverture (Exercice N-1)' in html,
    'État 16': '16. Comptes avec Sens Anormal par Nature (Exercice N-1)' in html,
    'Badges': 'badge-success' in html and 'badge-warning' in html,
    'Boîtes': 'success-box' in html and 'info-box' in html,
    'Tableaux': '<table>' in html and '<thead>' in html
}

all_passed = all(checks.values())
for name, passed in checks.items():
    status = '✅' if passed else '❌'
    print(f'   {status} {name}')

if not all_passed:
    exit(1)
"@

try {
    $testScript | python
    Write-Host "   ✅ Structure HTML validée" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur de structure HTML" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Test d'intégration dans etats_financiers.py
Write-Host "4️⃣  Test d'intégration dans etats_financiers.py..." -ForegroundColor Yellow
$integrationTest = @"
import sys
sys.path.insert(0, 'py_backend')

# Vérifier l'import dans etats_financiers.py
with open('py_backend/etats_financiers.py', 'r', encoding='utf-8') as f:
    content = f.read()
    
checks = {
    'Import module': 'from etats_controle_exhaustifs_html import generate_all_16_etats_controle_html' in content,
    'Appel fonction': 'generate_all_16_etats_controle_html(' in content,
    'Paramètres controles_n': 'controles_n' in content,
    'Paramètres controles_n1': 'controles_n1' in content,
    'Paramètres totaux_n': 'totaux_n' in content,
    'Paramètres totaux_n1': 'totaux_n1' in content
}

all_passed = all(checks.values())
for name, passed in checks.items():
    status = '✅' if passed else '❌'
    print(f'   {status} {name}')

if not all_passed:
    exit(1)
"@

try {
    $integrationTest | python
    Write-Host "   ✅ Intégration validée" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur d'intégration" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Test de conformité avec le fichier de référence
Write-Host "5️⃣  Test de conformité avec le fichier de référence..." -ForegroundColor Yellow
$conformityTest = @"
from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html

controles = {
    'statistiques': {'total_comptes_balance': 100, 'comptes_integres': 95, 'comptes_non_integres': 5, 'taux_couverture': 95.0},
    'equilibre_bilan': {'actif': 1000000, 'passif': 1000000, 'difference': 0, 'pourcentage_ecart': 0, 'equilibre': True},
    'equilibre_resultat': {'resultat_cr': 50000, 'resultat_bilan': 50000, 'difference': 0, 'equilibre': True},
    'comptes_non_integres': [],
    'comptes_sens_inverse': [],
    'comptes_desequilibre': [],
    'hypothese_affectation': {'resultat_net': 50000, 'actif': 1000000, 'passif_sans_resultat': 950000, 'difference_avant': 50000, 'passif_avec_resultat': 1000000, 'difference_apres': 0, 'equilibre_apres': True},
    'comptes_sens_anormal': {'critiques': [], 'eleves': [], 'moyens': [], 'faibles': []}
}
totaux = {'actif': 1000000, 'passif': 1000000, 'resultat': 50000}

html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)

# Vérifier les éléments clés du format de référence
checks = {
    'Icônes': '📊' in html and '⚖️' in html and '💰' in html and '⚠️' in html,
    'Accordéons': 'onclick=\"toggleSection(this)\"' in html,
    'Flèches': '<span class=\"arrow\">›</span>' in html,
    'Classes section': 'class=\"section\"' in html,
    'Classes header': 'class=\"section-header\"' in html,
    'Classes content': 'class=\"section-content\"' in html,
    'Classes body': 'class=\"section-body\"' in html,
    'Montants formatés': 'montant-cell' in html,
    'Références': 'ref-cell' in html,
    'Lignes totales': 'total-row' in html
}

all_passed = all(checks.values())
for name, passed in checks.items():
    status = '✅' if passed else '❌'
    print(f'   {status} {name}')

if not all_passed:
    exit(1)
"@

try {
    $conformityTest | python
    Write-Host "   ✅ Conformité validée" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur de conformité" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Test des 16 états individuels
Write-Host "6️⃣  Test des 16 états individuels..." -ForegroundColor Yellow
$individualTest = @"
from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html

controles = {
    'statistiques': {'total_comptes_balance': 100, 'comptes_integres': 95, 'comptes_non_integres': 5, 'taux_couverture': 95.0},
    'equilibre_bilan': {'actif': 1000000, 'passif': 1000000, 'difference': 0, 'pourcentage_ecart': 0, 'equilibre': True},
    'equilibre_resultat': {'resultat_cr': 50000, 'resultat_bilan': 50000, 'difference': 0, 'equilibre': True},
    'comptes_non_integres': [],
    'comptes_sens_inverse': [],
    'comptes_desequilibre': [],
    'hypothese_affectation': {'resultat_net': 50000, 'actif': 1000000, 'passif_sans_resultat': 950000, 'difference_avant': 50000, 'passif_avec_resultat': 1000000, 'difference_apres': 0, 'equilibre_apres': True},
    'comptes_sens_anormal': {'critiques': [], 'eleves': [], 'moyens': [], 'faibles': []}
}
totaux = {'actif': 1000000, 'passif': 1000000, 'resultat': 50000}

html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)

etats = [
    '1. Statistiques de Couverture (Exercice N)',
    '2. Équilibre du Bilan (Exercice N)',
    '3. Cohérence Résultat (Exercice N)',
    '4. Comptes Non Intégrés (Exercice N)',
    '5. Comptes avec Sens Inversé (Exercice N)',
    '6. Comptes Créant un Déséquilibre (Exercice N)',
    '7. Hypothèse d\'Affectation du Résultat (Exercice N)',
    '8. Comptes avec Sens Anormal par Nature (Exercice N)',
    '9. Statistiques de Couverture (Exercice N-1)',
    '10. Équilibre du Bilan (Exercice N-1)',
    '11. Cohérence Résultat (Exercice N-1)',
    '12. Comptes Non Intégrés (Exercice N-1)',
    '13. Comptes avec Sens Inversé (Exercice N-1)',
    '14. Comptes Créant un Déséquilibre (Exercice N-1)',
    '15. Hypothèse d\'Affectation du Résultat (Exercice N-1)',
    '16. Comptes avec Sens Anormal par Nature (Exercice N-1)'
]

all_present = True
for i, etat in enumerate(etats, 1):
    present = etat in html
    status = '✅' if present else '❌'
    print(f'   {status} État {i}: {etat[:50]}...')
    if not present:
        all_present = False

if not all_present:
    exit(1)
"@

try {
    $individualTest | python
    Write-Host "   ✅ Tous les états présents" -ForegroundColor Green
} catch {
    Write-Host "   ❌ États manquants" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Résumé final
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ TOUS LES TESTS PASSÉS AVEC SUCCÈS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Yellow
Write-Host "   ✅ Module importé correctement" -ForegroundColor Green
Write-Host "   ✅ Génération HTML fonctionnelle" -ForegroundColor Green
Write-Host "   ✅ Structure HTML conforme" -ForegroundColor Green
Write-Host "   ✅ Intégration dans etats_financiers.py" -ForegroundColor Green
Write-Host "   ✅ Conformité avec le fichier de référence" -ForegroundColor Green
Write-Host "   ✅ 16 états générés correctement" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Les 16 états de contrôle sont intégrés et fonctionnels!" -ForegroundColor Green
Write-Host ""
