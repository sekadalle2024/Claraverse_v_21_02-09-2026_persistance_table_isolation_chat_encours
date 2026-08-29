#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests Personnel de la section PROGRAMME DE CONTRÔLE
dans E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Personnel

Tests à supprimer:
- NN04: Revue des techniques comptables personnel
- NN03: Revue du Contrôle interne personnel
- FP04: Revue des techniques comptables personnel
- FP03: Revue du Contrôle interne personnel
- FP02: Travaux analytiques -Personnel
- FP02: Feuilles maîtresses-PERSONNEL
- FP145: Travaux analytiques salaire
- NN02: Travaux analytiques -Prov Risk
- NN02: Feuilles maîtresses-PROVISIONS RISK&CHARGE
"""

import re
import sys
from pathlib import Path

def remove_personnel_tests(file_path: str) -> bool:
    """
    Supprime tous les tests de la section Personnel du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
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
        
        if 'personnel' not in content.lower():
            print("❌ Erreur: Section Personnel non trouvée")
            return False
        
        # Patterns pour supprimer tous les tests Personnel
        # Chaque pattern capture le bloc complet avec ses modes
        
        patterns = {
            'NN04 - Revue techniques comptables': r',\s*\{\s*id:\s*[\'"]personnel-nn04[\'"]\s*,\s*reference:\s*[\'"]NN04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables personnel[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'NN03 - Revue CI': r',\s*\{\s*id:\s*[\'"]personnel-nn03[\'"]\s*,\s*reference:\s*[\'"]NN03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne personnel[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'FP04 - Revue techniques comptables': r',\s*\{\s*id:\s*[\'"]personnel-fp04[\'"]\s*,\s*reference:\s*[\'"]FP04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables personnel[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'FP03 - Revue CI': r',\s*\{\s*id:\s*[\'"]personnel-fp03[\'"]\s*,\s*reference:\s*[\'"]FP03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne personnel[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'FP02 - Travaux analytiques': r',\s*\{\s*id:\s*[\'"]personnel-fp02-travaux[\'"]\s*,\s*reference:\s*[\'"]FP02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Personnel[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'FP02 - Feuilles maîtresses': r',\s*\{\s*id:\s*[\'"]personnel-fp02[\'"]\s*,\s*reference:\s*[\'"]FP02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-PERSONNEL[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'FP145 - Travaux analytiques salaire': r',\s*\{\s*id:\s*[\'"]personnel-fp145[\'"]\s*,\s*reference:\s*[\'"]FP145[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques salaire[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'NN02 - Travaux analytiques Prov Risk': r',\s*\{\s*id:\s*[\'"]personnel-nn02-travaux[\'"]\s*,\s*reference:\s*[\'"]NN02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Prov Risk[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}',
            
            'NN02 - Feuilles maîtresses Provisions': r',\s*\{\s*id:\s*[\'"]personnel-nn02[\'"]\s*,\s*reference:\s*[\'"]NN02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-PROVISIONS RISK&CHARGE[\'"]\s*,\s*processus:\s*[\'"]personnel[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        }
        
        # Compter les occurrences avant suppression
        print(f"\n📊 Tests trouvés:")
        counts = {}
        for test_name, pattern in patterns.items():
            count = len(re.findall(pattern, content, re.DOTALL))
            counts[test_name] = count
            print(f"   - {test_name}: {count}")
        
        total_found = sum(counts.values())
        if total_found == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        removed_count = 0
        
        for test_name, pattern in patterns.items():
            if counts[test_name] > 0:
                modified_content = re.sub(pattern, '', modified_content, flags=re.DOTALL)
                print(f"✅ {test_name} supprimé")
                removed_count += 1
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - Total de tests supprimés: {removed_count}")
        print(f"   - Tous les tests et modes associés ont été supprimés")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS PERSONNEL - SECTION PROGRAMME DE CONTRÔLE")
    print("E-revision")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer (avec tous les modes):")
    print(f"   1. NN04 - Revue des techniques comptables personnel")
    print(f"   2. NN03 - Revue du Contrôle interne personnel")
    print(f"   3. FP04 - Revue des techniques comptables personnel")
    print(f"   4. FP03 - Revue du Contrôle interne personnel")
    print(f"   5. FP02 - Travaux analytiques -Personnel")
    print(f"   6. FP02 - Feuilles maîtresses-PERSONNEL")
    print(f"   7. FP145 - Travaux analytiques salaire")
    print(f"   8. NN02 - Travaux analytiques -Prov Risk")
    print(f"   9. NN02 - Feuilles maîtresses-PROVISIONS RISK&CHARGE")
    
    # Exécuter la suppression
    success = remove_personnel_tests(str(file_path))
    
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
