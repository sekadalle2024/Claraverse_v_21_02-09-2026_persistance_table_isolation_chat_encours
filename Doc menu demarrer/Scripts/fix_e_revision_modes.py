#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger les erreurs dans DemarrerMenu.tsx pour E-revision

Corrections à effectuer :
1. Remplacer "label: 'Cours'" par "label: 'Mode normal'" dans MODES (ligne 102)
2. Remplacer "[Guide Methodo] : Activate" par "- [Methodo audit] : Activate" dans MODES (ligne 106)

Date : 15 Avril 2026
"""

import re
import sys

def fix_modes_label_cours(content):
    """
    Corrige le label 'Cours' en 'Mode normal' dans la constante MODES
    """
    # Pattern pour trouver la ligne exacte dans MODES
    pattern = r"(const MODES: ModeItem\[\] = \[\s*\{ id: 'normal', label: )'Cours'(, prefix: '' \})"
    replacement = r"\1'Mode normal'\2"
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        print("✓ Correction 1 : 'Cours' → 'Mode normal' dans MODES")
        return new_content, True
    else:
        print("⚠️ Correction 1 : Pattern non trouvé")
        return content, False

def fix_guide_methodo_variable(content):
    """
    Corrige la variable [Guide Methodo] en - [Methodo audit] dans MODES
    """
    # Pattern pour trouver la ligne exacte dans MODES
    pattern = r"(\{ id: 'methodo', label: 'Methodo audit', prefix: '\[Mode\] = Avancé\\n)\[Guide Methodo\] : Activate(\\n' \})"
    replacement = r"\1- [Methodo audit] : Activate\2"
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        print("✓ Correction 2 : '[Guide Methodo] : Activate' → '- [Methodo audit] : Activate' dans MODES")
        return new_content, True
    else:
        print("⚠️ Correction 2 : Pattern non trouvé")
        return content, False

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
    corrections_made = []
    
    # Correction 1 : Label 'Cours' → 'Mode normal'
    print("\n🔧 Correction 1 : Label 'Cours' dans MODES")
    print("   Remplacement : label: 'Cours' → label: 'Mode normal'")
    content, success1 = fix_modes_label_cours(content)
    if success1:
        corrections_made.append("Label 'Cours' → 'Mode normal'")
    
    # Correction 2 : Variable [Guide Methodo]
    print("\n🔧 Correction 2 : Variable [Guide Methodo] dans MODES")
    print("   Remplacement : '[Guide Methodo] : Activate' → '- [Methodo audit] : Activate'")
    content, success2 = fix_guide_methodo_variable(content)
    if success2:
        corrections_made.append("Variable [Guide Methodo] → - [Methodo audit]")
    
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
    print("\n📋 Résumé des corrections :")
    for i, correction in enumerate(corrections_made, 1):
        print(f"   {i}. {correction}")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 CORRECTION DES ERREURS E-REVISION - DemarrerMenu.tsx")
    print("=" * 70)
    print("\nProblèmes identifiés :")
    print("1. Label 'Cours' au lieu de 'Mode normal' dans MODES")
    print("2. Variable '[Guide Methodo]' au lieu de '- [Methodo audit]' dans MODES")
    
    try:
        success = process_file(filepath)
        
        if success:
            print("\n" + "=" * 70)
            print("✅ CORRECTIONS TERMINÉES AVEC SUCCÈS")
            print("=" * 70)
            print("\n⚠️ Prochaines étapes :")
            print("   1. Vérifier la compilation : npm run build")
            print("   2. Tester l'interface utilisateur")
            print("   3. Vérifier les commandes générées dans le chat")
            print("   4. Tester spécifiquement la section E-revision")
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
