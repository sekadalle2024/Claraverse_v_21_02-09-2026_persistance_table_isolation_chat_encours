#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests BB02, BB03, BB04 de la section Ventes
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Ventes
"""

import re
import sys
from pathlib import Path

def remove_ventes_tests_bb02_bb03_bb04(file_path: str) -> bool:
    """
    Supprime les tests BB02, BB03, BB04 de la section Ventes du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - BB02: Feuilles maîtresses-CHIFFRE D'AFFAIRES (sans modes)
    - BB02: Travaux analytiques CA (avec tous les modes)
    - BB03: Revue du Contrôle interne (avec tous les modes)
    - BB04: Revue des techniques comptables (avec tous les modes)
    
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
        
        if 'cycle-ventes' not in content:
            print("❌ Erreur: Section cycle-ventes non trouvée")
            return False
        
        # Pattern pour supprimer le test BB02 - Feuilles maîtresses (SANS modes)
        pattern_bb02_feuilles = r',\s*\{\s*id:\s*[\'"]ventes-bb02[\'"]\s*,\s*reference:\s*[\'"]BB02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-CHIFFRE D\'AFFAIRES[\'"]\s*,\s*processus:\s*[\'"]VENTES[\'"]\s*,\s*command:\s*`[^`]+`\s*\}'
        
        # Pattern pour supprimer le test BB02 - Travaux analytiques CA (AVEC modes)
        pattern_bb02_travaux = r',\s*\{\s*id:\s*[\'"]ventes-bb02-travaux[\'"]\s*,\s*reference:\s*[\'"]BB02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques CA[\'"]\s*,\s*processus:\s*[\'"]VENTES[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[[^\]]*?\{[^\}]*?id:\s*[\'"]normal[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]papier-travail[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]demo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]avance[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]methodo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]guide-commandes[\'"][^\}]*?\}[^\]]*?\]\s*\}'
        
        # Pattern pour supprimer le test BB03 - Revue du Contrôle interne (AVEC modes)
        pattern_bb03 = r',\s*\{\s*id:\s*[\'"]ventes-bb03[\'"]\s*,\s*reference:\s*[\'"]BB03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]VENTES[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[[^\]]*?\{[^\}]*?id:\s*[\'"]normal[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]papier-travail[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]demo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]avance[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]methodo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]guide-commandes[\'"][^\}]*?\}[^\]]*?\]\s*\}'
        
        # Pattern pour supprimer le test BB04 - Revue des techniques comptables (AVEC modes)
        pattern_bb04 = r',\s*\{\s*id:\s*[\'"]ventes-bb04[\'"]\s*,\s*reference:\s*[\'"]BB04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]VENTES[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[[^\]]*?\{[^\}]*?id:\s*[\'"]normal[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]papier-travail[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]demo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]avance[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]methodo[\'"][^\}]*?\}[^\]]*?\{[^\}]*?id:\s*[\'"]guide-commandes[\'"][^\}]*?\}[^\]]*?\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_bb02_feuilles = len(re.findall(pattern_bb02_feuilles, content, re.DOTALL))
        count_bb02_travaux = len(re.findall(pattern_bb02_travaux, content, re.DOTALL))
        count_bb03 = len(re.findall(pattern_bb03, content, re.DOTALL))
        count_bb04 = len(re.findall(pattern_bb04, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - BB02 Feuilles maîtresses: {count_bb02_feuilles}")
        print(f"   - BB02 Travaux analytiques: {count_bb02_travaux}")
        print(f"   - BB03 Revue CI: {count_bb03}")
        print(f"   - BB04 Revue techniques: {count_bb04}")
        
        if count_bb02_feuilles == 0 and count_bb02_travaux == 0 and count_bb03 == 0 and count_bb04 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer BB02 - Feuilles maîtresses
        if count_bb02_feuilles > 0:
            modified_content = re.sub(pattern_bb02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test BB02 Feuilles maîtresses supprimé")
        
        # Supprimer BB02 - Travaux analytiques
        if count_bb02_travaux > 0:
            modified_content = re.sub(pattern_bb02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test BB02 Travaux analytiques supprimé")
        
        # Supprimer BB03
        if count_bb03 > 0:
            modified_content = re.sub(pattern_bb03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test BB03 Revue du Contrôle interne supprimé")
        
        # Supprimer BB04
        if count_bb04 > 0:
            modified_content = re.sub(pattern_bb04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test BB04 Revue des techniques comptables supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - BB02 Feuilles maîtresses-CHIFFRE D'AFFAIRES: Supprimé")
        print(f"   - BB02 Travaux analytiques CA: Supprimé (avec tous les modes)")
        print(f"   - BB03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - BB04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS BB02, BB03, BB04 - SECTION VENTES")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. BB02 - Feuilles maîtresses-CHIFFRE D'AFFAIRES (sans modes)")
    print(f"   2. BB02 - Travaux analytiques CA (avec tous les modes)")
    print(f"   3. BB03 - Revue du Contrôle interne (avec tous les modes)")
    print(f"   4. BB04 - Revue des techniques comptables (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_ventes_tests_bb02_bb03_bb04(str(file_path))
    
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
