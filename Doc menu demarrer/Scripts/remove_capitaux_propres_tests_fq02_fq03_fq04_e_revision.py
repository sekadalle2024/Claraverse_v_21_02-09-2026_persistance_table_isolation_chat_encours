#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests FQ02, FQ03, FQ04 de la section Capitaux propres
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Capitaux propres
"""

import re
import sys
from pathlib import Path

def remove_capitaux_propres_tests_fq02_fq03_fq04(file_path: str) -> bool:
    """
    Supprime les tests FQ02, FQ03, FQ04 de la section Capitaux propres du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - FQ02: Feuilles maîtresses-CAPITAUX PROPRES (avec tous les modes)
    - FQ02: Travaux analytiques capitaux (avec tous les modes)
    - FQ03: Revue du Contrôle interne capitaux propres (avec tous les modes)
    - FQ04: Revue des techniques comptables capitaux propres (avec tous les modes)
    
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
        
        if 'capitaux propres' not in content.lower():
            print("❌ Erreur: Section Capitaux propres non trouvée")
            return False
        
        # Pattern pour supprimer le test FQ02 - Feuilles maîtresses (AVEC modes)
        # Ce pattern capture tout le bloc depuis { jusqu'à la fermeture des modes ]
        pattern_fq02_feuilles = r',\s*\{\s*id:\s*[\'"]capitaux-fq02[\'"]\s*,\s*reference:\s*[\'"]FQ02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-CAPITAUX PROPRES[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FQ02 - Travaux analytiques capitaux (AVEC modes)
        pattern_fq02_travaux = r',\s*\{\s*id:\s*[\'"]capitaux-fq02-travaux[\'"]\s*,\s*reference:\s*[\'"]FQ02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques capitaux[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FQ03 - Revue du Contrôle interne (AVEC modes)
        pattern_fq03 = r',\s*\{\s*id:\s*[\'"]capitaux-fq03[\'"]\s*,\s*reference:\s*[\'"]FQ03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FQ04 - Revue des techniques comptables (AVEC modes)
        pattern_fq04 = r',\s*\{\s*id:\s*[\'"]capitaux-fq04[\'"]\s*,\s*reference:\s*[\'"]FQ04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_fq02_feuilles = len(re.findall(pattern_fq02_feuilles, content, re.DOTALL | re.IGNORECASE))
        count_fq02_travaux = len(re.findall(pattern_fq02_travaux, content, re.DOTALL | re.IGNORECASE))
        count_fq03 = len(re.findall(pattern_fq03, content, re.DOTALL | re.IGNORECASE))
        count_fq04 = len(re.findall(pattern_fq04, content, re.DOTALL | re.IGNORECASE))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - FQ02 Feuilles maîtresses: {count_fq02_feuilles}")
        print(f"   - FQ02 Travaux analytiques capitaux: {count_fq02_travaux}")
        print(f"   - FQ03 Revue CI: {count_fq03}")
        print(f"   - FQ04 Revue techniques: {count_fq04}")
        
        if count_fq02_feuilles == 0 and count_fq02_travaux == 0 and count_fq03 == 0 and count_fq04 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer FQ02 - Feuilles maîtresses
        if count_fq02_feuilles > 0:
            modified_content = re.sub(pattern_fq02_feuilles, '', modified_content, flags=re.DOTALL | re.IGNORECASE)
            print(f"✅ Test FQ02 Feuilles maîtresses supprimé")
        
        # Supprimer FQ02 - Travaux analytiques capitaux
        if count_fq02_travaux > 0:
            modified_content = re.sub(pattern_fq02_travaux, '', modified_content, flags=re.DOTALL | re.IGNORECASE)
            print(f"✅ Test FQ02 Travaux analytiques capitaux supprimé")
        
        # Supprimer FQ03
        if count_fq03 > 0:
            modified_content = re.sub(pattern_fq03, '', modified_content, flags=re.DOTALL | re.IGNORECASE)
            print(f"✅ Test FQ03 Revue du Contrôle interne supprimé")
        
        # Supprimer FQ04
        if count_fq04 > 0:
            modified_content = re.sub(pattern_fq04, '', modified_content, flags=re.DOTALL | re.IGNORECASE)
            print(f"✅ Test FQ04 Revue des techniques comptables supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - FQ02 Feuilles maîtresses-CAPITAUX PROPRES: Supprimé (avec tous les modes)")
        print(f"   - FQ02 Travaux analytiques capitaux: Supprimé (avec tous les modes)")
        print(f"   - FQ03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - FQ04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS FQ02, FQ03, FQ04 - SECTION CAPITAUX PROPRES")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. FQ02 - Feuilles maîtresses-CAPITAUX PROPRES (avec tous les modes)")
    print(f"   2. FQ02 - Travaux analytiques capitaux (avec tous les modes)")
    print(f"   3. FQ03 - Revue du Contrôle interne capitaux propres (avec tous les modes)")
    print(f"   4. FQ04 - Revue des techniques comptables capitaux propres (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_capitaux_propres_tests_fq02_fq03_fq04(str(file_path))
    
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
