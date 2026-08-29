#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: remove_modele_implementation_e_revision.py
Date: 11 Mai 2026
Objectif: Supprimer la ligne [Modele] des modes Normal et Demo
          de l'étape Implementation dans E-revision > PLANIFICATION
"""

import re
from pathlib import Path

def remove_modele_implementation():
    """
    Supprime la ligne [Modele] des modes Normal et Demo de Implementation
    """
    
    file_path = Path('src/components/Clara_Components/DemarrerMenu.tsx')
    
    if not file_path.exists():
        print(f"❌ Erreur: Le fichier {file_path} n'existe pas")
        return False
    
    # Lire le contenu du fichier
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pour le mode Normal de Implementation
    # On cherche la ligne [Modele] et on la supprime
    pattern_normal = r"""(\{
                id: 'normal',
                label: 'Normal',
                command: `\[Command\] = Etape de mission
\[Processus\] = rapprochements bancaires
\[test\] : DD155
\[Etape précédente\] = Design du contrôle interne
\[Etape de mission\] = Implementation du contrôle interne
)\[Modele\] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
(\[Integration\] = Implementation_modelisation
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
)\[Modele\] : Objectif de contrôle, Travaux a effectuer, Resultat, Tableau de test , Document de test, Echantillon, Conclusion
(\[Integration\] = Implementation_modelisation
\[Demo\] = Activate
\[Nb de lignes\] = 25`)"""

    # Remplacement pour Normal (supprime la ligne [Modele])
    replacement_normal = r"""\1\2"""
    
    # Remplacement pour Demo (supprime la ligne [Modele])
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
    print("   - Mode Normal: Supprimé [Modele]")
    print("   - Mode Demo: Supprimé [Modele]")
    print(f"\n📁 Fichier modifié: {file_path}")
    
    return True

if __name__ == "__main__":
    print("=" * 70)
    print("SUPPRESSION [MODELE] - E-REVISION IMPLEMENTATION")
    print("=" * 70)
    print()
    
    success = remove_modele_implementation()
    
    if success:
        print("\n✅ Script exécuté avec succès!")
    else:
        print("\n❌ Le script a rencontré une erreur")
