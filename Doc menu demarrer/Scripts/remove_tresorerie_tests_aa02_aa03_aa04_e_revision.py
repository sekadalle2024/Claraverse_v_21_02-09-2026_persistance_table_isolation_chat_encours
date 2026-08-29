#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests AA02, AA03, AA04 de la section Trésorerie
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Trésorerie
"""

import re
import sys
from pathlib import Path

def remove_tresorerie_tests_aa02_aa03_aa04(file_path: str) -> bool:
    """
    Supprime les tests AA02, AA03, AA04 de la section Trésorerie du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - AA02: Feuilles maîtresses-TRESORERIE (avec tous les modes)
    - AA02: Travaux analytiques caisse (avec tous les modes)
    - AA03: Revue du Contrôle interne (avec tous les modes)
    - AA04: Revue des techniques comptables (avec tous les modes)
    
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
        
        if 'tresorerie' not in content.lower():
            print("❌ Erreur: Section Trésorerie non trouvée")
            return False
        
        # Pattern pour supprimer le test AA02 - Feuilles maîtresses (AVEC modes)
        # Ce pattern capture tout le bloc depuis { jusqu'à la fermeture des modes ]
        pattern_aa02_feuilles = r',\s*\{\s*id:\s*[\'"]tresorerie-aa02[\'"]\s*,\s*reference:\s*[\'"]AA02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-TRESORERIE[\'"]\s*,\s*processus:\s*[\'"]Trésorerie[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test AA02 - Travaux analytiques caisse (AVEC modes)
        pattern_aa02_travaux = r',\s*\{\s*id:\s*[\'"]tresorerie-aa02-travaux[\'"]\s*,\s*reference:\s*[\'"]AA02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques caisse[\'"]\s*,\s*processus:\s*[\'"]Trésorerie[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test AA03 - Revue du Contrôle interne (AVEC modes)
        pattern_aa03 = r',\s*\{\s*id:\s*[\'"]tresorerie-aa03[\'"]\s*,\s*reference:\s*[\'"]AA03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]Trésorerie[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test AA04 - Revue des techniques comptables (AVEC modes)
        pattern_aa04 = r',\s*\{\s*id:\s*[\'"]tresorerie-aa04[\'"]\s*,\s*reference:\s*[\'"]AA04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]Trésorerie[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_aa02_feuilles = len(re.findall(pattern_aa02_feuilles, content, re.DOTALL))
        count_aa02_travaux = len(re.findall(pattern_aa02_travaux, content, re.DOTALL))
        count_aa03 = len(re.findall(pattern_aa03, content, re.DOTALL))
        count_aa04 = len(re.findall(pattern_aa04, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - AA02 Feuilles maîtresses: {count_aa02_feuilles}")
        print(f"   - AA02 Travaux analytiques caisse: {count_aa02_travaux}")
        print(f"   - AA03 Revue CI: {count_aa03}")
        print(f"   - AA04 Revue techniques: {count_aa04}")
        
        if count_aa02_feuilles == 0 and count_aa02_travaux == 0 and count_aa03 == 0 and count_aa04 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer AA02 - Feuilles maîtresses
        if count_aa02_feuilles > 0:
            modified_content = re.sub(pattern_aa02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test AA02 Feuilles maîtresses supprimé")
        
        # Supprimer AA02 - Travaux analytiques caisse
        if count_aa02_travaux > 0:
            modified_content = re.sub(pattern_aa02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test AA02 Travaux analytiques caisse supprimé")
        
        # Supprimer AA03
        if count_aa03 > 0:
            modified_content = re.sub(pattern_aa03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test AA03 Revue du Contrôle interne supprimé")
        
        # Supprimer AA04
        if count_aa04 > 0:
            modified_content = re.sub(pattern_aa04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test AA04 Revue des techniques comptables supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - AA02 Feuilles maîtresses-TRESORERIE: Supprimé (avec tous les modes)")
        print(f"   - AA02 Travaux analytiques caisse: Supprimé (avec tous les modes)")
        print(f"   - AA03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - AA04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS AA02, AA03, AA04 - SECTION TRÉSORERIE")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. AA02 - Feuilles maîtresses-TRESORERIE (avec tous les modes)")
    print(f"   2. AA02 - Travaux analytiques caisse (avec tous les modes)")
    print(f"   3. AA03 - Revue du Contrôle interne (avec tous les modes)")
    print(f"   4. AA04 - Revue des techniques comptables (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_tresorerie_tests_aa02_aa03_aa04(str(file_path))
    
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
