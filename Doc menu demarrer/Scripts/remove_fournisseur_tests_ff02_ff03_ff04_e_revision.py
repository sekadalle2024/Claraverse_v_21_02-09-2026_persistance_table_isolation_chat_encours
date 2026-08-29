#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests FF02, FF03, FF04 de la section Fournisseur
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Fournisseur
"""

import re
import sys
from pathlib import Path

def remove_fournisseur_tests_ff02_ff03_ff04(file_path: str) -> bool:
    """
    Supprime les tests FF02, FF03, FF04 de la section Fournisseur du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - FF02: Travaux analytiques -Fournis (avec tous les modes)
    - FF02: Feuilles maîtresses-FOURNISSEURS (avec tous les modes)
    - FF03: Revue du Contrôle interne (avec tous les modes)
    - FF04: Revue des techniques comptables (avec tous les modes)
    
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
        
        if 'fournisseur' not in content.lower():
            print("❌ Erreur: Section Fournisseur non trouvée")
            return False
        
        # Pattern pour supprimer le test FF02 - Feuilles maîtresses (AVEC modes)
        pattern_ff02_feuilles = r',\s*\{\s*id:\s*[\'"]fournisseurs-ff02[\'"]\s*,\s*reference:\s*[\'"]FF02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-FOURNISSEURS[\'"]\s*,\s*processus:\s*[\'"]fournisseur[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FF02 - Travaux analytiques -Fournisseurs (AVEC modes)
        pattern_ff02_travaux = r',\s*\{\s*id:\s*[\'"]fournisseurs-ff02-travaux[\'"]\s*,\s*reference:\s*[\'"]FF02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Fournisseurs[\'"]\s*,\s*processus:\s*[\'"]fournisseur[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FF03 - Revue du Contrôle interne (AVEC modes)
        pattern_ff03 = r',\s*\{\s*id:\s*[\'"]fournisseurs-ff03[\'"]\s*,\s*reference:\s*[\'"]FF03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]fournisseur[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FF04 - Revue des techniques comptables (AVEC modes)
        pattern_ff04 = r',\s*\{\s*id:\s*[\'"]fournisseurs-ff04[\'"]\s*,\s*reference:\s*[\'"]FF04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]fournisseur[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_ff02_feuilles = len(re.findall(pattern_ff02_feuilles, content, re.DOTALL))
        count_ff02_travaux = len(re.findall(pattern_ff02_travaux, content, re.DOTALL))
        count_ff03 = len(re.findall(pattern_ff03, content, re.DOTALL))
        count_ff04 = len(re.findall(pattern_ff04, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - FF02 Feuilles maîtresses-FOURNISSEURS: {count_ff02_feuilles}")
        print(f"   - FF02 Travaux analytiques -Fournisseurs: {count_ff02_travaux}")
        print(f"   - FF03 Revue CI: {count_ff03}")
        print(f"   - FF04 Revue techniques: {count_ff04}")
        
        if count_ff02_feuilles == 0 and count_ff02_travaux == 0 and count_ff03 == 0 and count_ff04 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer FF02 - Feuilles maîtresses
        if count_ff02_feuilles > 0:
            modified_content = re.sub(pattern_ff02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FF02 Feuilles maîtresses-FOURNISSEURS supprimé")
        
        # Supprimer FF02 - Travaux analytiques -Fournisseurs
        if count_ff02_travaux > 0:
            modified_content = re.sub(pattern_ff02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FF02 Travaux analytiques -Fournisseurs supprimé")
        
        # Supprimer FF03
        if count_ff03 > 0:
            modified_content = re.sub(pattern_ff03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FF03 Revue du Contrôle interne supprimé")
        
        # Supprimer FF04
        if count_ff04 > 0:
            modified_content = re.sub(pattern_ff04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FF04 Revue des techniques comptables supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - FF02 Feuilles maîtresses-FOURNISSEURS: Supprimé (avec tous les modes)")
        print(f"   - FF02 Travaux analytiques -Fournisseurs: Supprimé (avec tous les modes)")
        print(f"   - FF03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - FF04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS FF02, FF03, FF04 - SECTION FOURNISSEUR")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. FF02 - Feuilles maîtresses-FOURNISSEURS (avec tous les modes)")
    print(f"   2. FF02 - Travaux analytiques -Fournisseurs (avec tous les modes)")
    print(f"   3. FF03 - Revue du Contrôle interne (avec tous les modes)")
    print(f"   4. FF04 - Revue des techniques comptables (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_fournisseur_tests_ff02_ff03_ff04(str(file_path))
    
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
