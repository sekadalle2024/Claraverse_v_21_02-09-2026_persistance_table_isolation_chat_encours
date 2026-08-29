#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression des tests CC02, CC03, CC04 de la section Stock
dans le PROGRAMME DE CONTRÔLE pour E-revision

Auteur: Assistant IA
Date: 16 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression des tests comptables Stock
"""

import re
import sys
from pathlib import Path
from datetime import datetime

def remove_stock_tests_cc02_cc03_cc04(file_path: str) -> bool:
    """
    Supprime les tests CC02, CC03, CC04 de la section Stock du PROGRAMME DE CONTRÔLE
    pour E-revision dans DemarrerMenu.tsx
    
    Tests à supprimer:
    - CC02: Feuilles maîtresses-STOCKS (avec tous les modes)
    - CC02: Travaux analytiques -Stocks (avec tous les modes)
    - CC03: Revue du Contrôle interne (avec tous les modes)
    - CC04: Revue des techniques comptables (avec tous les modes)
    
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
        
        if 'stock' not in content.lower():
            print("❌ Erreur: Section Stock non trouvée")
            return False
        
        # Créer une sauvegarde avec timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{file_path}.backup_stock_{timestamp}"
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Sauvegarde créée: {backup_path}")
        
        # Pattern pour supprimer le test CC02 - Feuilles maîtresses-STOCKS (AVEC modes)
        pattern_cc02_feuilles = r',\s*\{\s*id:\s*[\'"]stocks-cc02[\'"]\s*,\s*reference:\s*[\'"]CC02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-STOCKS[\'"]\s*,\s*processus:\s*[\'"]Stock[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test CC02 - Travaux analytiques -Stocks (AVEC modes)
        pattern_cc02_travaux = r',\s*\{\s*id:\s*[\'"]stocks-cc02-travaux[\'"]\s*,\s*reference:\s*[\'"]CC02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques -Stocks[\'"]\s*,\s*processus:\s*[\'"]Stock[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test CC03 - Revue du Contrôle interne (AVEC modes)
        pattern_cc03 = r',\s*\{\s*id:\s*[\'"]stocks-cc03[\'"]\s*,\s*reference:\s*[\'"]CC03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne[\'"]\s*,\s*processus:\s*[\'"]Stock[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Pattern pour supprimer le test CC04 - Revue des techniques comptables (AVEC modes)
        pattern_cc04 = r',\s*\{\s*id:\s*[\'"]stocks-cc04[\'"]\s*,\s*reference:\s*[\'"]CC04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables[\'"]\s*,\s*processus:\s*[\'"]Stock[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_cc02_feuilles = len(re.findall(pattern_cc02_feuilles, content, re.DOTALL))
        count_cc02_travaux = len(re.findall(pattern_cc02_travaux, content, re.DOTALL))
        count_cc03 = len(re.findall(pattern_cc03, content, re.DOTALL))
        count_cc04 = len(re.findall(pattern_cc04, content, re.DOTALL))
        
        print(f"\n📊 Tests trouvés:")
        print(f"   - CC02 Feuilles maîtresses-STOCKS: {count_cc02_feuilles}")
        print(f"   - CC02 Travaux analytiques -Stocks: {count_cc02_travaux}")
        print(f"   - CC03 Revue du Contrôle interne: {count_cc03}")
        print(f"   - CC04 Revue des techniques comptables: {count_cc04}")
        
        if count_cc02_feuilles == 0 and count_cc02_travaux == 0 and count_cc03 == 0 and count_cc04 == 0:
            print("\n⚠️  Aucun test à supprimer trouvé")
            return False
        
        # Supprimer les tests
        modified_content = content
        
        # Supprimer CC02 - Feuilles maîtresses-STOCKS
        if count_cc02_feuilles > 0:
            modified_content = re.sub(pattern_cc02_feuilles, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test CC02 Feuilles maîtresses-STOCKS supprimé")
        
        # Supprimer CC02 - Travaux analytiques -Stocks
        if count_cc02_travaux > 0:
            modified_content = re.sub(pattern_cc02_travaux, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test CC02 Travaux analytiques -Stocks supprimé")
        
        # Supprimer CC03
        if count_cc03 > 0:
            modified_content = re.sub(pattern_cc03, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test CC03 Revue du Contrôle interne supprimé")
        
        # Supprimer CC04
        if count_cc04 > 0:
            modified_content = re.sub(pattern_cc04, '', modified_content, flags=re.DOTALL)
            print(f"✅ Test CC04 Revue des techniques comptables supprimé")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - CC02 Feuilles maîtresses-STOCKS: Supprimé (avec tous les modes)")
        print(f"   - CC02 Travaux analytiques -Stocks: Supprimé (avec tous les modes)")
        print(f"   - CC03 Revue du Contrôle interne: Supprimé (avec tous les modes)")
        print(f"   - CC04 Revue des techniques comptables: Supprimé (avec tous les modes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DES TESTS CC02, CC03, CC04 - SECTION STOCK")
    print("E-revision - Programme de contrôle")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Tests à supprimer:")
    print(f"   1. CC02 - Feuilles maîtresses-STOCKS (avec tous les modes)")
    print(f"   2. CC02 - Travaux analytiques -Stocks (avec tous les modes)")
    print(f"   3. CC03 - Revue du Contrôle interne (avec tous les modes)")
    print(f"   4. CC04 - Revue des techniques comptables (avec tous les modes)")
    
    # Exécuter la suppression
    success = remove_stock_tests_cc02_cc03_cc04(str(file_path))
    
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
