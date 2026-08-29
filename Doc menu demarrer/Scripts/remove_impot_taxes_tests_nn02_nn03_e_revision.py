#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests NN02, NN03 de la section impôt et taxes
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables impôt et taxes
"""

import re
import sys
from pathlib import Path

def remove_impot_taxes_tests_nn02_nn03(file_path: str) -> bool:
    """
    Supprime les tests NN02, NN03 de la section impôt et taxes du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - NN03: Revue du Contrôle interne (avec tous les modes)
    - NN02: Revue analytique Dettes Fiscales (avec tous les modes)
    - NN02: Feuilles maîtresses-DETTES FISCAL& SOCIAL (avec tous les modes)
    
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
        
        if 'impôt' not in content.lower() and 'impot' not in content.lower():
            print("❌ Erreur: Section impôt et taxes non trouvée")
            return False
        
        # Pattern pour supprimer le test NN03 - Revue du Contrôle interne impôt et taxes (AVEC modes)
        pattern_nn03 = r',\s*\{\s*id:\s*[\'"]impots-nn03[\'"]\s*,\s*reference:\s*[\'"]NN03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]impôt et taxes[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test NN02 - Revue analytique Dettes Fiscales (AVEC modes)
        pattern_nn02_revue = r',\s*\{\s*id:\s*[\'"]impots-nn02-revue[\'"]\s*,\s*reference:\s*[\'"]NN02[\'"]\s*,\s*label:\s*[\'"]Revue analytique Dettes Fiscales[\'"]\s*,\s*processus:\s*[\'"]impôt et taxes[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test NN02 - Feuilles maîtresses (AVEC modes)
        pattern_nn02_feuilles = r',\s*\{\s*id:\s*[\'"]impots-nn02[\'"]\s*,\s*reference:\s*[\'"]NN02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-DETTES FISCAL& SOCIAL[\'"]\s*,\s*processus:\s*[\'"]impôt et taxes[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_nn03 = len(re.findall(pattern_nn03, content, re.DOTALL))
        count_nn02_revue = len(re.findall(pattern_nn02_revue, content, re.DOTALL))
        count_nn02_feuilles = len(re.findall(pattern_nn02_feuilles, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - NN03 Revue du Contrôle interne: {count_nn03}")
        print(f"   - NN02 Revue analytique Dettes Fiscales: {count_nn02_revue}")
        print(f"   - NN02 Feuilles maîtresses: {count_nn02_feuilles}")
        
        if count_nn03 == 0 and count_nn02_revue == 0 and count_nn02_feuilles == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer NN03
        if count_nn03 > 0:
            modified_content = re.sub(pattern_nn03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test NN03 Revue du Contrôle interne supprimé")
        
        # Supprimer NN02 - Revue analytique
        if count_nn02_revue > 0:
            modified_content = re.sub(pattern_nn02_revue, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test NN02 Revue analytique Dettes Fiscales supprimé")
        
        # Supprimer NN02 - Feuilles maîtresses
        if count_nn02_feuilles > 0:
            modified_content = re.sub(pattern_nn02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test NN02 Feuilles maîtresses supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - NN03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - NN02 Revue analytique Dettes Fiscales: Supprimé (avec tous les modes)")
        print(f"   - NN02 Feuilles maîtresses-DETTES FISCAL& SOCIAL: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS NN02, NN03 - SECTION IMPÔT ET TAXES")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. NN03 - Revue du Contrôle interne (avec tous les modes)")
    print(f"   2. NN02 - Revue analytique Dettes Fiscales (avec tous les modes)")
    print(f"   3. NN02 - Feuilles maîtresses-DETTES FISCAL& SOCIAL (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_impot_taxes_tests_nn02_nn03(str(file_path))
    
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
