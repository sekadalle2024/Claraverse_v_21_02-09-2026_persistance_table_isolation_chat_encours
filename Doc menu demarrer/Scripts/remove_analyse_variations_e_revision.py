#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de suppression de la section "Analyse des variations"
dans REVUE ANALYTIQUE pour E-revision

Auteur: Assistant IA
Date: 17 Mai 2026
Contexte: Mise à jour du menu Démarrer E-revision - Suppression de la section Analyse des variations
"""

import re
import sys
from pathlib import Path

def remove_analyse_variations_e_revision(file_path: str) -> bool:
    """
    Supprime la section "Analyse des variations" de REVUE ANALYTIQUE
    pour E-revision dans DemarrerMenu.tsx
    
    Section à supprimer:
    - Analyse des variations (avec tous les modes: Normal, Avancé, Methodo revision, Guide des commandes)
    
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
        
        if 'analyse des variations' not in content.lower():
            print("❌ Erreur: Section 'Analyse des variations' non trouvée")
            return False
        
        # Pattern pour supprimer la section "Analyse des variations" complète
        # Ce pattern capture tout le bloc depuis { jusqu'à la fermeture des modes ]
        # Il inclut l'icône TrendingUp et tous les modes
        pattern_analyse_variations = r',\s*\{\s*id:\s*[\'"]analyse-variations[\'"]\s*,\s*label:\s*[\'"]Analyse des variations[\'"]\s*,\s*icon:\s*<TrendingUp[^>]*\/>\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
        
        # Compter les occurrences avant suppression
        count_analyse_variations = len(re.findall(pattern_analyse_variations, content, re.DOTALL))
        
        print(f"\n📊 Section trouvée:")
        print(f"   - Analyse des variations: {count_analyse_variations}")
        
        if count_analyse_variations == 0:
            print("\n⚠️  Aucune section 'Analyse des variations' à supprimer trouvée")
            return False
        
        # Supprimer la section
        modified_content = content
        
        if count_analyse_variations > 0:
            modified_content = re.sub(pattern_analyse_variations, '', modified_content, flags=re.DOTALL)
            print(f"✅ Section 'Analyse des variations' supprimée")
        
        # Nettoyer les virgules doubles ou en trop
        modified_content = re.sub(r',\s*,', ',', modified_content)
        modified_content = re.sub(r',(\s*\])', r'\1', modified_content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        
        print(f"\n✅ Fichier modifié avec succès: {file_path}")
        print(f"\n📝 Résumé des suppressions:")
        print(f"   - Analyse des variations: Supprimée (avec tous les modes)")
        print(f"     • Mode Normal")
        print(f"     • Mode Avancé")
        print(f"     • Mode Methodo revision")
        print(f"     • Mode Guide des commandes")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la modification du fichier: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Fonction principale"""
    print("=" * 80)
    print("SUPPRESSION DE LA SECTION 'ANALYSE DES VARIATIONS'")
    print("E-revision - Revue analytique")
    print("=" * 80)
    
    # Chemin vers le fichier DemarrerMenu.tsx
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Erreur: Fichier non trouvé: {file_path}")
        sys.exit(1)
    
    print(f"\n📂 Fichier cible: {file_path}")
    print(f"\n🎯 Section à supprimer:")
    print(f"   - Analyse des variations (avec tous les modes)")
    print(f"     • Mode Normal")
    print(f"     • Mode Avancé")
    print(f"     • Mode Methodo revision")
    print(f"     • Mode Guide des commandes")
    
    # Exécuter la suppression
    success = remove_analyse_variations_e_revision(str(file_path))
    
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
