#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour dupliquer les états de contrôle avec N et N-1
"""

# Lire le fichier HTML
with open('test_etats_controle_html.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver la section des contrôles (après les boutons de contrôle)
# et avant la synthèse finale

# Remplacer les titres des sections pour ajouter (Exercice N)
replacements_n = [
    ('📊 1. Statistiques de Couverture', '📊 1. Statistiques de Couverture (Exercice N)'),
    ('⚖️ 2. Équilibre du Bilan', '⚖️ 2. Équilibre du Bilan (Exercice N)'),
    ('💰 3. Cohérence Résultat (Bilan vs CR)', '💰 3. Cohérence Résultat (Exercice N)'),
    ('⚠️ 4. Comptes Non Intégrés', '⚠️ 4. Comptes Non Intégrés (Exercice N)'),
    ('🔄 5. Comptes avec Sens Inversé (par Classe)', '🔄 5. Comptes avec Sens Inversé (Exercice N)'),
    ('⚠️ 6. Comptes Créant un Déséquilibre', '⚠️ 6. Comptes Créant un Déséquilibre (Exercice N)'),
    ('💡 7. Hypothèse d\'Affectation du Résultat', '💡  7. Hypothèse d\'Affectation du Résultat (Exercice N)'),
    ('🚨 8. Comptes avec Sens Anormal par Nature', '🚨 8. Comptes avec Sens Anormal par Nature (Exercice N)'),
]

# Appliquer les remplacements
for old, new in replacements_n:
    content = content.replace(old, new)

# Trouver la position de la synthèse finale
synthese_pos = content.find('<!-- Synthèse Finale -->')

if synthese_pos == -1:
    print("❌ Erreur: Section Synthèse Finale non trouvée")
    exit(1)

# Extraire la partie des contrôles (entre les contrôles et la synthèse)
# Trouver le début des sections de contrôle
debut_controles = content.find('<!-- 1. Statistiques de Couverture -->')

if debut_controles == -1:
    print("❌ Erreur: Début des contrôles non trouvé")
    exit(1)

# Extraire les sections de contrôle
sections_controles = content[debut_controles:synthese_pos]

# Dupliquer les sections pour N-1
sections_n1 = sections_controles

# Remplacer les titres pour N-1
replacements_n1 = [
    ('📊 1. Statistiques de Couverture (Exercice N)', '📊 9. Statistiques de Couverture (Exercice N-1)'),
    ('⚖️ 2. Équilibre du Bilan (Exercice N)', '⚖️ 10. Équilibre du Bilan (Exercice N-1)'),
    ('💰 3. Cohérence Résultat (Exercice N)', '💰 11. Cohérence Résultat (Exercice N-1)'),
    ('⚠️ 4. Comptes Non Intégrés (Exercice N)', '⚠️ 12. Comptes Non Intégrés (Exercice N-1)'),
    ('🔄 5. Comptes avec Sens Inversé (Exercice N)', '🔄 13. Comptes avec Sens Inversé (Exercice N-1)'),
    ('⚠️ 6. Comptes Créant un Déséquilibre (Exercice N)', '⚠️ 14. Comptes Créant un Déséquilibre (Exercice N-1)'),
    ('💡 7. Hypothèse d\'Affectation du Résultat (Exercice N)', '💡 15. Hypothèse d\'Affectation du Résultat (Exercice N-1)'),
    ('🚨 8. Comptes avec Sens Anormal par Nature (Exercice N)', '🚨 16. Comptes avec Sens Anormal par Nature (Exercice N-1)'),
]

for old, new in replacements_n1:
    sections_n1 = sections_n1.replace(old, new)

# Reconstruire le contenu
nouveau_contenu = (
    content[:synthese_pos] +  # Tout jusqu'à la synthèse (avec les sections N)
    sections_n1 +  # Ajouter les sections N-1
    content[synthese_pos:]  # Synthèse finale et footer
)

# Mettre à jour les statistiques dans le header
nouveau_contenu = nouveau_contenu.replace(
    '<h3>8</h3>\n                    <p>États de Contrôle</p>',
    '<h3>16</h3>\n                    <p>États de Contrôle</p>'
)

# Écrire le nouveau fichier
with open('test_etats_controle_html.html', 'w', encoding='utf-8') as f:
    f.write(nouveau_contenu)

print("✅ Fichier dupliqué avec succès !")
print("📊 16 états de contrôle (8 pour N + 8 pour N-1)")
print("🎯 Fichier: test_etats_controle_html.html")
