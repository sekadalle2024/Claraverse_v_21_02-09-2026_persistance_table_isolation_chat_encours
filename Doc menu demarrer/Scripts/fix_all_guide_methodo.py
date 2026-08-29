#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger TOUTES les occurrences de [Guide Methodo] : Activate
dans DemarrerMenu.tsx

Correction globale : Remplacer "[Guide Methodo] : Activate" par "- [Methodo audit] : Activate"
Exception : La ligne 104 (définition du mode global) n'est pas modifiée

Date : 28 Mars 2026
"""

import re
import sys

def fix_all_guide_methodo(content):
    """
    Corrige toutes les occurrences de [Guide Methodo] : Activate
    en - [Methodo audit] : Activate
    
    Exception : Ne modifie pas la définition du mode dans MODES
    """
    
    # Compter les occurrences avant correction
    count_before = content.count("[Guide Methodo] : Activate")
    print(f"📊 Occurrences trouvées : {count_before}")
    
    # Trouver la section MODES pour l'exclure
    modes_start = content.find("const MODES: ModeItem[] = [")
    if modes_start == -1:
        print("⚠️ Section MODES non trouvée")
        modes_end = 0
    else:
        # Trouver la fin de la définition MODES
        modes_end = content.find("];", modes_start)
        if modes_end != -1:
            modes_end += 2  # Inclure "];
            print(f"✓ Section MODES trouvée : {modes_start} à {modes_end}")
        else:
            modes_end = modes_start
    
    # Diviser le contenu en 3 parties
    before_modes = content[:modes_start] if modes_start != -1 else ""
    modes_section = content[modes_start:modes_end] if modes_start != -1 else ""
    after_modes = content[modes_end:] if modes_start != -1 else content
    
    # Appliquer la correction uniquement après la section MODES
    count_in_modes = modes_section.count("[Guide Methodo] : Activate")
    count_after_modes = after_modes.count("[Guide Methodo] : Activate")
    
    print(f"   • Dans MODES (non modifié) : {count_in_modes}")
    print(f"   • Dans le reste du fichier : {count_after_modes}")
    
    # Remplacer dans la partie après MODES
    after_modes_fixed = after_modes.replace(
        "[Guide Methodo] : Activate",
        "- [Methodo audit] : Activate"
    )
    
    # Vérifier le nombre de corrections
    count_after = after_modes_fixed.count("- [Methodo audit] : Activate")
    corrections_made = count_after_modes
    
    print(f"\n✓ {corrections_made} occurrences corrigées")
    
    # Reconstruire le contenu
    return before_modes + modes_section + after_modes_fixed

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"\n📄 Lecture du fichier {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {filepath} non trouvé")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la lecture : {e}")
        return False
    
    original_content = content
    
    # Appliquer la correction globale
    print("\n🔧 Correction globale de [Guide Methodo] : Activate")
    print("   Remplacement : '[Guide Methodo] : Activate' → '- [Methodo audit] : Activate'")
    content = fix_all_guide_methodo(content)
    
    if content == original_content:
        print("\n⚠️ Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"\n💾 Écriture des modifications dans {filepath}...")
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture : {e}")
        return False
    
    print("\n✅ Fichier mis à jour avec succès!")
    
    # Vérification finale
    print("\n🔍 Vérification finale...")
    with open(filepath, 'r', encoding='utf-8') as f:
        final_content = f.read()
    
    remaining = final_content.count("[Guide Methodo] : Activate")
    new_count = final_content.count("- [Methodo audit] : Activate")
    
    print(f"   • Occurrences restantes de [Guide Methodo] : {remaining}")
    print(f"   • Nouvelles occurrences de - [Methodo audit] : {new_count}")
    
    if remaining == 1:
        print("   ✓ OK : 1 occurrence restante (définition du mode global)")
    elif remaining > 1:
        print(f"   ⚠️ Attention : {remaining} occurrences restantes")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 CORRECTION GLOBALE [Guide Methodo] - DemarrerMenu.tsx")
    print("=" * 70)
    
    try:
        success = process_file(filepath)
        
        if success:
            print("\n" + "=" * 70)
            print("✅ CORRECTIONS TERMINÉES AVEC SUCCÈS")
            print("=" * 70)
            print("\n📋 Résumé :")
            print("   • Toutes les occurrences de [Guide Methodo] : Activate")
            print("     ont été remplacées par - [Methodo audit] : Activate")
            print("   • Exception : Définition du mode global (ligne ~104) conservée")
            print("\n⚠️ Prochaines étapes :")
            print("   1. Vérifier la compilation : npm run build")
            print("   2. Tester l'interface utilisateur")
            print("   3. Vérifier les commandes générées dans le chat")
        else:
            print("\n" + "=" * 70)
            print("⚠️ AUCUNE MODIFICATION EFFECTUÉE")
            print("=" * 70)
        
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ Erreur inattendue : {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
