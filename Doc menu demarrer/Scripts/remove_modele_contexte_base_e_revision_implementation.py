#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: remove_modele_contexte_base_e_revision_implementation.py
Date: 11 Mai 2026
Objectif: Supprimer les lignes [Modele], [Contexte de base] et leurs contenus
          des modes Normal et Demo de l'étape Implementation dans E-revision > PLANIFICATION
"""

import re
from pathlib import Path

def remove_modele_contexte_base_implementation():
    """
    Supprime les lignes suivantes des modes Normal et Demo de Implementation:
    - [Modele]
    - [Contexte de base]
    - Description de [Contexte de base]
    - Contenu de [Contexte de base]
    """
    
    file_path = Path('src/components/Clara_Components/DemarrerMenu.tsx')
    
    if not file_path.exists():
        print(f"❌ Erreur: Le fichier {file_path} n'existe pas")
        return False
    
    # Lire le contenu du fichier
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pour trouver la section Implementation dans E-revision > PLANIFICATION
    # On cherche spécifiquement les modes Normal et Demo
    
    # Pattern pour le mode Normal de Implementation
    pattern_normal = r"""(\{
                id: 'normal',
                label: 'Normal',
                command: `\[Command\] = Etape de mission
\[Processus\] = rapprochements bancaires
\[test\] : DD155
\[Etape précédente\] = Design du contrôle interne
\[Etape de mission\] = Implementation du contrôle interne
)\[Contexte de base\]
Description de \[Contexte de base\]
\[Contexte de base\] contient les resultat des test sur le Design\. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de \[Contexte de base\]
\{ "Etape mission - Design": \[ \{ "table 1": \{ "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" \} \}, \{ "table 2": \[ \{ "no": 1, "Sous processus": "Organisation et Séparation des tâches", "Objectif de contrôle": "Garantir l'indépendance de la fonction de rapprochement bancaire\.", "Taches cle": "Définition des rôles", "Questionnaire identification risque": "La personne effectuant le rapprochement est-elle indépendante de la tenue de la caisse et de l'émission des paiements \?", "Assertion": "Séparation des exercices", "Dispositif de maitrises des risques du client": "Le comptable fournisseurs effectue les paiements et réalise également le rapprochement bancaire sur le logiciel Sage\.", "Contrôle cle attendus": "Le Responsable Administratif et Financier s'assure que l'agent en charge du rapprochement n'a pas accès aux moyens de paiement ni aux écritures de caisse\.", "references documentaire": "Fiches de poste, Matrice des droits d'accès SI", "Anomalies": "Cumul de fonctions incompatible créant un risque de dissimulation de fraude\.", "Conclusion": "Non-Satisfaisant" \} \] \} \] \}
(\[Modele\] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
\[Integration\] = Implementation_modelisation
\[Nb de lignes\] = 25`)"""

    # Pattern pour le mode Demo de Implementation
    pattern_demo = r"""(\{
                id: 'demo',
                label: 'Demo',
                command: `\[Command\] = Etape de mission
\[Processus\] = rapprochements bancaires
\[test\] : DD155
\[Etape précédente\] = Design du contrôle interne
\[Etape de mission\] = Implementation du contrôle interne
)\[Contexte de base\]
Description de \[Contexte de base\]
\[Contexte de base\] contient les resultat des test sur le Design\. Notre objectif est de faire des test pour confirmer ou infirmer l implementation des controle cle selon les resultats des test de design
Contenu de \[Contexte de base\]
\{ "Etape mission - Design": \[ \{ "table 1": \{ "Etape": "Programme de travail / Questionnaire de Contrôle Interne", "Normes": "Norme 2240 - Programme de travail de la mission", "Reference": "PRG-TRESO-002", "Methode": "Méthode des assertions par les objectifs de contrôle" \} \}, \{ "table 2": \[ \{ "no": 1, "Sous processus": "Organisation et Séparation des tâches", "Objectif de contrôle": "Garantir l'indépendance de la fonction de rapprochement bancaire\.", "Taches cle": "Définition des rôles", "Questionnaire identification risque": "La personne effectuant le rapprochement est-elle indépendante de la tenue de la caisse et de l'émission des paiements \?", "Assertion": "Séparation des exercices", "Dispositif de maitrises des risques du client": "Le comptable fournisseurs effectue les paiements et réalise également le rapprochement bancaire sur le logiciel Sage\.", "Contrôle cle attendus": "Le Responsable Administratif et Financier s'assure que l'agent en charge du rapprochement n'a pas accès aux moyens de paiement ni aux écritures de caisse\.", "references documentaire": "Fiches de poste, Matrice des droits d'accès SI", "Anomalies": "Cumul de fonctions incompatible créant un risque de dissimulation de fraude\.", "Conclusion": "Non-Satisfaisant" \} \] \} \] \}
(\[Modele\] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
\[Integration\] = Implementation_modelisation
\[Demo\] = Activate
\[Nb de lignes\] = 25`)"""

    # Remplacement pour Normal
    replacement_normal = r"""\1\2"""
    
    # Remplacement pour Demo
    replacement_demo = r"""\1\2"""
    
    # Appliquer les remplacements
    content_modified = re.sub(pattern_normal, replacement_normal, content, flags=re.DOTALL)
    content_modified = re.sub(pattern_demo, replacement_demo, content_modified, flags=re.DOTALL)
    
    # Vérifier si des modifications ont été effectuées
    if content == content_modified:
        print("⚠️  Aucune modification effectuée - Les patterns n'ont pas été trouvés")
        return False
    
    # Sauvegarder le fichier modifié
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content_modified)
    
    print("✅ Suppression réussie!")
    print("\n📋 Résumé des modifications:")
    print("   - Mode Normal: Supprimé [Modele], [Contexte de base] et leurs contenus")
    print("   - Mode Demo: Supprimé [Modele], [Contexte de base] et leurs contenus")
    print(f"\n📁 Fichier modifié: {file_path}")
    
    return True

if __name__ == "__main__":
    print("=" * 70)
    print("SUPPRESSION [MODELE] ET [CONTEXTE DE BASE] - E-REVISION IMPLEMENTATION")
    print("=" * 70)
    print()
    
    success = remove_modele_contexte_base_implementation()
    
    if success:
        print("\n✅ Script exécuté avec succès!")
    else:
        print("\n❌ Le script a rencontré une erreur")
