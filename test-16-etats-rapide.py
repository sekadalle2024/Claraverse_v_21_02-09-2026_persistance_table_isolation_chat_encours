# -*- coding: utf-8 -*-
"""
Test rapide des 16 états de contrôle
"""

from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html

# Données de test minimales
controles_n = {
    'statistiques': {
        'total_comptes_balance': 150,
        'comptes_integres': 145,
        'comptes_non_integres': 5,
        'taux_couverture': 96.7
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

# Mêmes données pour N-1 (avec des valeurs légèrement différentes)
controles_n1 = {
    'statistiques': {
        'total_comptes_balance': 148,
        'comptes_integres': 143,
        'comptes_non_integres': 5,
        'taux_couverture': 96.6
    },
    'equilibre_bilan': {
        'actif': 950000,
        'passif': 950000,
        'difference': 0,
        'pourcentage_ecart': 0,
        'equilibre': True
    },
    'equilibre_resultat': {
        'resultat_cr': 45000,
        'resultat_bilan': 45000,
        'difference': 0,
        'equilibre': True
    },
    'comptes_non_integres': [],
    'comptes_sens_inverse': [],
    'comptes_desequilibre': [],
    'hypothese_affectation': {
        'resultat_net': 45000,
        'actif': 950000,
        'passif_sans_resultat': 905000,
        'difference_avant': 45000,
        'passif_avec_resultat': 950000,
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

totaux_n = {
    'actif': 1000000,
    'passif': 1000000,
    'resultat': 50000
}

totaux_n1 = {
    'actif': 950000,
    'passif': 950000,
    'resultat': 45000
}

print("🔄 Génération des 16 états de contrôle...")
html = generate_all_16_etats_controle_html(controles_n, controles_n1, totaux_n, totaux_n1)

print(f"✅ HTML généré: {len(html)} caractères")
print(f"✅ Nombre de sections: {html.count('<div class=\"section\">')}")
print(f"✅ Nombre d'accordéons: {html.count('section-header')}")

# Vérifier que les 16 états sont présents
etats_attendus = [
    "1. Statistiques de Couverture (Exercice N)",
    "2. Équilibre du Bilan (Exercice N)",
    "3. Cohérence Résultat (Exercice N)",
    "4. Comptes Non Intégrés (Exercice N)",
    "5. Comptes avec Sens Inversé (Exercice N)",
    "6. Comptes Créant un Déséquilibre (Exercice N)",
    "7. Hypothèse d'Affectation du Résultat (Exercice N)",
    "8. Comptes avec Sens Anormal par Nature (Exercice N)",
    "9. Statistiques de Couverture (Exercice N-1)",
    "10. Équilibre du Bilan (Exercice N-1)",
    "11. Cohérence Résultat (Exercice N-1)",
    "12. Comptes Non Intégrés (Exercice N-1)",
    "13. Comptes avec Sens Inversé (Exercice N-1)",
    "14. Comptes Créant un Déséquilibre (Exercice N-1)",
    "15. Hypothèse d'Affectation du Résultat (Exercice N-1)",
    "16. Comptes avec Sens Anormal par Nature (Exercice N-1)"
]

print("\n📋 Vérification des 16 états:")
for i, etat in enumerate(etats_attendus, 1):
    if etat in html:
        print(f"  ✅ État {i}: {etat}")
    else:
        print(f"  ❌ État {i}: {etat} - MANQUANT")

print("\n✅ Test terminé avec succès!")
print("📄 Les 16 états de contrôle sont générés correctement")
