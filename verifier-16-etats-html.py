# -*- coding: utf-8 -*-
"""
Vérification du fichier HTML généré
"""

with open('C:/Users/LEADER/Desktop/test_etats_controle_html.html', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"📊 Nombre de sections: {content.count('<div class=\"section\">')}")
print(f"📄 Taille du fichier: {len(content):,} caractères")

etats = [
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

print("\n✅ Vérification des 16 états:")
for i, etat in enumerate(etats, 1):
    if etat in content:
        print(f"  ✅ État {i}: {etat}")
    else:
        print(f"  ❌ État {i}: {etat} - MANQUANT")

print("\n✅ Vérification terminée!")
