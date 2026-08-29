#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests DD02, DD04, DD03 de la section Immobilisations
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 17 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Immobilisations
"""

import re
import sys
from pathlib import Path

def remove_immobilisations_tests_dd02_dd04_dd03(file_path: str) -> bool:
    """
    Supprime les tests DD02, DD04, DD03 de la section Immobilisations du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - DD02: Travaux analytiques -Immo (avec tous les modes)
    - DD02: Feuilles maîtresses-IMMOBILISATIONS (avec tous les modes)
    - DD04: Revue des techniques comptables (avec tous les modes)
    - DD03: Revue du Contrôle interne (avec tous les modes)
    
    Args:
        file_path: Chemin vers le fichier DemarrerMenu.tsx
        
    Returns:
        bool: True si la modification a réussi, False sinon
    """
    try:
        # Lire le fichier
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier que nous sommes dans la bonne section
        if 'e-revision' not in content.lower():
            print("❌ Erreur: Section E-revision non trouvée dans le fichier")
            return False
        
        if 'immobilisations' not in content.lower():
            print("❌ Erreur: Section Immobilisations non trouvée")
            return False
        
        # Pattern pour supprimer le test DD02 - Travaux analytiques -Immo (AVEC modes)
        pattern_dd02_travaux = r',\s*\{\s*id:\s*[\'"]immobilisations-dd02-travaux-analytiques[\'"]\s*,\s*reference:\s*[\'"]DD02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Immo[\'"]\s*,\s*processus:\s*[\'"]IMMOBILISATIONS[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test DD02 - Feuilles maîtresses (AVEC modes)
        pattern_dd02_feuilles = r',\s*\{\s*id:\s*[\'"]immobilisations-dd02[\'"]\s*,\s*reference:\s*[\'"]DD02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-IMMOBILISATIONS[\'"]\s*,\s*processus:\s*[\'"]IMMOBILISATIONS[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test DD04 - Revue des techniques comptables (AVEC modes)
        pattern_dd04 = r',\s*\{\s*id:\s*[\'"]immobilisations-dd04[\'"]\s*,\s*reference:\s*[\'"]DD04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]IMMOBILISATIONS[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test DD03 - Revue du Contrôle interne (AVEC modes)
        pattern_dd03 = r',\s*\{\s*id:\s*[\'"]immobilisations-dd03[\'"]\s*,\s*reference:\s*[\'"]DD03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]IMMOBILISATIONS[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_dd02_travaux = len(re.findall(pattern_dd02_travaux, content, re.DOTALL))
        count_dd02_feuilles = len(re.findall(pattern_dd02_feuilles, content, re.DOTALL))
        count_dd04 = len(re.findall(pattern_dd04, content, re.DOTALL))
        count_dd03 = len(re.findall(pattern_dd03, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - DD02 Travaux analytiques -Immo: {count_dd02_travaux}")
        print(f"   - DD02 Feuilles maîtresses: {count_dd02_feuilles}")
        print(f"   - DD04 Revue techniques: {count_dd04}")
        print(f"   - DD03 Revue CI: {count_dd03}")
        
        if count_dd02_travaux == 0 and count_dd02_feuilles == 0 and count_dd04 == 0 and count_dd03 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer DD02 - Travaux analytiques -Immo
        if count_dd02_travaux > 0:
            modified_content = re.sub(pattern_dd02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test DD02 Travaux analytiques -Immo supprimé")
        
        # Supprimer DD02 - Feuilles maîtresses
        if count_dd02_feuilles > 0:
            modified_content = re.sub(pattern_dd02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test DD02 Feuilles maîtresses-IMMOBILISATIONS supprimé")
        
        # Supprimer DD04
        if count_dd04 > 0:
            modified_content = re.sub(pattern_dd04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test DD04 Revue des techniques comptables supprimé")
        
        # Supprimer DD03
        if count_dd03 > 0:
            modified_content = re.sub(pattern_dd03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test DD03 Revue du Contrôle interne supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - DD02 Travaux analytiques -Immo: Supprimé (avec tous les modes)")
        print(f"   - DD02 Feuilles maîtresses-IMMOBILISATIONS: Supprimé (avec tous les modes)")
        print(f"   - DD04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        print(f"   - DD03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS DD02, DD04, DD03 - SECTION IMMOBILISATIONS")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. DD02 - Travaux analytiques -Immo (avec tous les modes)")
    print(f"   2. DD02 - Feuilles maîtresses-IMMOBILISATIONS (avec tous les modes)")
    print(f"   3. DD04 - Revue des techniques comptables (avec tous les modes)")
    print(f"   4. DD03 - Revue du Contrôle interne (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_immobilisations_tests_dd02_dd04_dd03(str(file_path))
    
    if success:
        print("\n" + "=" * 80)
        print("✅ SUPPRESSION TERMINÉE AVEC SUCCÈS")
        print("=" * 80)
        print("\n📋 Prochaines étapes:")
        print("   1. Vérifier le fichier DemarrerMenu.tsx")
        print("   2. Tester l'application")
        print("   3. Commit les changements")
        sys.exit(0)
    else:
        print("\n" + "=" * 80)
        print("❌ ÉCHEC DE LA SUPPRESSION")
        print("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
