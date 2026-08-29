#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests FE02, FE03, FE04 de la section Client
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Client
"""

import re
import sys
from pathlib import Path

def remove_client_tests_fe02_fe03_fe04(file_path: str) -> bool:
    """
    Supprime les tests FE02, FE03, FE04 de la section Client du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - FE02: Travaux analytiques -Clients (avec tous les modes)
    - FE02: Feuilles maîtresses-CLIENTS (avec tous les modes)
    - FE04: Revue des techniques comptables (avec tous les modes)
    - FE03: Revue du Contrôle interne (avec tous les modes)
    
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
        
        if 'client' not in content.lower():
            print("❌ Erreur: Section Client non trouvée")
            return False
        
        # Pattern pour supprimer le test FE02 - Travaux analytiques -Clients (AVEC modes)
        pattern_fe02_travaux = r',\s*\{\s*id:\s*[\'"]clients-fe02-travaux[\'"]\s*,\s*reference:\s*[\'"]FE02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Clients[\'"]\s*,\s*processus:\s*[\'"]client[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FE02 - Feuilles maîtresses-CLIENTS (AVEC modes)
        pattern_fe02_feuilles = r',\s*\{\s*id:\s*[\'"]clients-fe02[\'"]\s*,\s*reference:\s*[\'"]FE02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-CLIENTS[\'"]\s*,\s*processus:\s*[\'"]client[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FE04 - Revue des techniques comptables (AVEC modes)
        pattern_fe04 = r',\s*\{\s*id:\s*[\'"]clients-fe04[\'"]\s*,\s*reference:\s*[\'"]FE04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]client[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test FE03 - Revue du Contrôle interne (AVEC modes)
        pattern_fe03 = r',\s*\{\s*id:\s*[\'"]clients-fe03[\'"]\s*,\s*reference:\s*[\'"]FE03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]client[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_fe02_travaux = len(re.findall(pattern_fe02_travaux, content, re.DOTALL))
        count_fe02_feuilles = len(re.findall(pattern_fe02_feuilles, content, re.DOTALL))
        count_fe04 = len(re.findall(pattern_fe04, content, re.DOTALL))
        count_fe03 = len(re.findall(pattern_fe03, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - FE02 Travaux analytiques -Clients: {count_fe02_travaux}")
        print(f"   - FE02 Feuilles maîtresses-CLIENTS: {count_fe02_feuilles}")
        print(f"   - FE04 Revue techniques comptables: {count_fe04}")
        print(f"   - FE03 Revue CI: {count_fe03}")
        
        if count_fe02_travaux == 0 and count_fe02_feuilles == 0 and count_fe04 == 0 and count_fe03 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer FE02 - Travaux analytiques -Clients
        if count_fe02_travaux > 0:
            modified_content = re.sub(pattern_fe02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FE02 Travaux analytiques -Clients supprimé")
        
        # Supprimer FE02 - Feuilles maîtresses-CLIENTS
        if count_fe02_feuilles > 0:
            modified_content = re.sub(pattern_fe02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FE02 Feuilles maîtresses-CLIENTS supprimé")
        
        # Supprimer FE04
        if count_fe04 > 0:
            modified_content = re.sub(pattern_fe04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FE04 Revue des techniques comptables supprimé")
        
        # Supprimer FE03
        if count_fe03 > 0:
            modified_content = re.sub(pattern_fe03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test FE03 Revue du Contrôle interne supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - FE02 Travaux analytiques -Clients: Supprimé (avec tous les modes)")
        print(f"   - FE02 Feuilles maîtresses-CLIENTS: Supprimé (avec tous les modes)")
        print(f"   - FE04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        print(f"   - FE03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS FE02, FE03, FE04 - SECTION CLIENT")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. FE02 - Travaux analytiques -Clients (avec tous les modes)")
    print(f"   2. FE02 - Feuilles maîtresses-CLIENTS (avec tous les modes)")
    print(f"   3. FE04 - Revue des techniques comptables (avec tous les modes)")
    print(f"   4. FE03 - Revue du Contrôle interne (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_client_tests_fe02_fe03_fe04(str(file_path))
    
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
