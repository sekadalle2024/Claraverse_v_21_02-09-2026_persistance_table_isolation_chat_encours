#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger les numéros des sections N-1 dans test_etats_controle_html.html
Date: 04 Avril 2026
"""

def corriger_numeros_sections():
    """Corrige les numéros des sections N-1 (9-16)"""
    
    fichier = 'test_etats_controle_html.html'
    
    # Lire le contenu
    with open(fichier, 'r', encoding='utf-8') as f:
        contenu = f.read()
    
    # Corrections à effectuer pour les sections N-1
    corrections = [
        # Section 15 (actuellement marquée comme 7)
        ('<!-- 7. Hypothèse d\'Affectation du Résultat -->\n            <div class="section">\n                <div class="section-header" onclick="toggleSection(this)">\n                    <span>💡  7. Hypothèse d\'Affectation du Résultat (Exercice N)</span>',
         '<!-- 15. Hypothèse d\'Affectation du Résultat -->\n            <div class="section">\n                <div class="section-header" onclick="toggleSection(this)">\n                    <span>💡  15. Hypothèse d\'Affectation du Résultat (Exercice N-1)</span>',
         2),  # Remplacer la 2ème occurrence
    ]
    
    # Appliquer les corrections
    for ancien, nouveau, occurrence in corrections:
        # Compter les occurrences
        count = contenu.count(ancien)
        print(f"Trouvé {count} occurrence(s) de la section")
        
        if count >= occurrence:
            # Remplacer uniquement l'occurrence spécifiée
            parts = contenu.split(ancien)
            if len(parts) > occurrence:
                # Reconstruire en remplaçant seulement l'occurrence voulue
                contenu = ancien.join(parts[:occurrence]) + nouveau + ancien.join(parts[occurrence:])
                print(f"✅ Section 15 corrigée (occurrence {occurrence})")
            else:
                print(f"⚠️ Pas assez d'occurrences trouvées")
        else:
            print(f"⚠️ Occurrence {occurrence} non trouvée (seulement {count} occurrence(s))")
    
    # Écrire le fichier corrigé
    with open(fichier, 'w', encoding='utf-8') as f:
        f.write(contenu)
    
    print(f"\n✅ Fichier {fichier} corrigé avec succès")
    
    # Vérification
    with open(fichier, 'r', encoding='utf-8') as f:
        contenu_final = f.read()
    
    # Vérifier que toutes les sections N-1 sont correctement numérotées
    sections_n1 = [
        '9. Statistiques de Couverture (Exercice N-1)',
        '10. Équilibre du Bilan (Exercice N-1)',
        '11. Cohérence Résultat (Exercice N-1)',
        '12. Comptes Non Intégrés (Exercice N-1)',
        '13. Comptes avec Sens Inversé (Exercice N-1)',
        '14. Comptes Créant un Déséquilibre (Exercice N-1)',
        '15. Hypothèse d\'Affectation du Résultat (Exercice N-1)',
        '16. Comptes avec Sens Anormal par Nature (Exercice N-1)',
    ]
    
    print("\n📊 Vérification des sections N-1:")
    for section in sections_n1:
        if section in contenu_final:
            print(f"  ✅ {section}")
        else:
            print(f"  ❌ {section} - MANQUANTE")

if __name__ == '__main__':
    print("🔧 Correction des numéros de sections N-1")
    print("=" * 60)
    corriger_numeros_sections()
    print("=" * 60)
    print("✅ Correction terminée")
