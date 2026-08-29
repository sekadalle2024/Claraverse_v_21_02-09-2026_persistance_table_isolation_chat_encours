# -*- coding: utf-8 -*-
"""
Test d'intégration des 16 états de contrôle
Date: 05 Avril 2026
"""

import sys
sys.path.insert(0, 'py_backend')

print("═" * 70)
print("   TEST INTÉGRATION 16 ÉTATS DE CONTRÔLE")
print("═" * 70)
print()

# 1. Test d'import du module
print("1️⃣  Test d'import du module...")
try:
    from etats_controle_exhaustifs_html import generate_all_16_etats_controle_html
    print("   ✅ Module importé avec succès")
except Exception as e:
    print(f"   ❌ Erreur d'import: {e}")
    sys.exit(1)
print()

# 2. Test de génération rapide
print("2️⃣  Test de génération rapide...")
try:
    controles = {
        'statistiques': {
            'total_comptes_balance': 100,
            'comptes_integres': 95,
            'comptes_non_integres': 5,
            'taux_couverture': 95.0
        },
        'equilibre_bilan': {
            'actif': 1000000,
            'passif': 1000000,
            'difference': 0,
            'pourcentage_ecart': 0,
            'equilibre': True
        },
        'equilibre_resultat': {
            'resultat_cr': 50000,
            'resultat_bilan': 50000,
            'difference': 0,
            'equilibre': True
        },
        'comptes_non_integres': [],
        'comptes_sens_inverse': [],
        'comptes_desequilibre': [],
        'hypothese_affectation': {
            'resultat_net': 50000,
            'actif': 1000000,
            'passif_sans_resultat': 950000,
            'difference_avant': 50000,
            'passif_avec_resultat': 1000000,
            'difference_apres': 0,
            'equilibre_apres': True
        },
        'comptes_sens_anormal': {
            'critiques': [],
            'eleves': [],
            'moyens': [],
            'faibles': []
        }
    }
    totaux = {'actif': 1000000, 'passif': 1000000, 'resultat': 50000}
    
    html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)
    print(f"   ✅ HTML généré: {len(html)} caractères")
except Exception as e:
    print(f"   ❌ Erreur de génération: {e}")
    sys.exit(1)
print()

# 3. Test de structure HTML
print("3️⃣  Test de structure HTML...")
checks = {
    'Longueur HTML': len(html) > 30000,
    'Sections': html.count('<div class="section">') == 16,
    'Headers': html.count('section-header') == 16,
    'État 1': '1. Statistiques de Couverture (Exercice N)' in html,
    'État 8': '8. Comptes avec Sens Anormal par Nature (Exercice N)' in html,
    'État 9': '9. Statistiques de Couverture (Exercice N-1)' in html,
    'État 16': '16. Comptes avec Sens Anormal par Nature (Exercice N-1)' in html,
    'Badges': 'badge-success' in html and 'badge-warning' in html,
    'Boîtes': 'success-box' in html and 'info-box' in html,
    'Tableaux': '<table>' in html and '<thead>' in html
}

all_passed = True
for name, passed in checks.items():
    status = '✅' if passed else '❌'
    print(f'   {status} {name}')
    if not passed:
        all_passed = False

if not all_passed:
    sys.exit(1)
print()

# 4. Test d'intégration dans etats_financiers.py
print("4️⃣  Test d'intégration dans etats_financiers.py...")
try:
    with open('py_backend/etats_financiers.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    integration_checks = {
        'Import module': 'from etats_controle_exhaustifs_html import generate_all_16_etats_controle_html' in content,
        'Appel fonction': 'generate_all_16_etats_controle_html(' in content,
        'Paramètres controles_n': 'controles_n' in content,
        'Paramètres controles_n1': 'controles_n1' in content,
        'Paramètres totaux_n': 'totaux_n' in content,
        'Paramètres totaux_n1': 'totaux_n1' in content
    }
    
    all_passed = True
    for name, passed in integration_checks.items():
        status = '✅' if passed else '❌'
        print(f'   {status} {name}')
        if not passed:
            all_passed = False
    
    if not all_passed:
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    sys.exit(1)
print()

# 5. Test de conformité avec le fichier de référence
print("5️⃣  Test de conformité avec le fichier de référence...")
conformity_checks = {
    'Icônes': '📊' in html and '⚖️' in html and '💰' in html and '⚠️' in html,
    'Accordéons': 'onclick="toggleSection(this)"' in html,
    'Flèches': '<span class="arrow">›</span>' in html,
    'Classes section': 'class="section"' in html,
    'Classes header': 'class="section-header"' in html,
    'Classes content': 'class="section-content"' in html,
    'Classes body': 'class="section-body"' in html,
    'Montants formatés': 'montant-cell' in html,
    'Lignes totales': 'total-row' in html
}

all_passed = True
for name, passed in conformity_checks.items():
    status = '✅' if passed else '❌'
    print(f'   {status} {name}')
    if not passed:
        all_passed = False

if not all_passed:
    sys.exit(1)
print()

# 6. Test des 16 états individuels
print("6️⃣  Test des 16 états individuels...")
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
    etat_short = etat[:50] + '...' if len(etat) > 50 else etat
    print(f'   {status} État {i}: {etat_short}')
    if not present:
        all_present = False

if not all_present:
    sys.exit(1)
print()

# Résumé final
print("═" * 70)
print("   ✅ TOUS LES TESTS PASSÉS AVEC SUCCÈS")
print("═" * 70)
print()
print("📊 Résumé:")
print("   ✅ Module importé correctement")
print("   ✅ Génération HTML fonctionnelle")
print("   ✅ Structure HTML conforme")
print("   ✅ Intégration dans etats_financiers.py")
print("   ✅ Conformité avec le fichier de référence")
print("   ✅ 16 états générés correctement")
print()
print("🎉 Les 16 états de contrôle sont intégrés et fonctionnels!")
print()
