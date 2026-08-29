#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger les variables de mode dans DemarrerMenu.tsx

Corrections à effectuer :
1. E-audit pro et E-contrôle : Remplacer " [Guide Methodo] : Activate" par "- [Methodo audit] : Activate"
2. E-revision pro : Remplacer " [Guide Methodo] : Activate" par "[Methodo revision] : Activate"

Date : 28 Mars 2026
"""

import re
import sys

def fix_e_audit_e_controle_methodo(content):
    """
    Corrige la variable [Guide Methodo] en [Methodo audit] pour E-audit pro et E-contrôle
    Remplace "[Guide Methodo] : Activate" par "- [Methodo audit] : Activate"
    """
    # Trouver la section E-audit pro
    e_audit_start = content.find("id: 'e-audit-pro'")
    if e_audit_start == -1:
        print("⚠️ Section E-audit pro non trouvée")
        return content
    
    # Trouver la fin de E-audit pro (début de E-revision)
    e_audit_end = content.find("id: 'e-revision'", e_audit_start)
    if e_audit_end == -1:
        print("⚠️ Fin de section E-audit pro non trouvée")
        return content
    
    # Trouver la section E-contrôle
    e_controle_start = content.find("id: 'e-controle'")
    if e_controle_start == -1:
        print("⚠️ Section E-contrôle non trouvée")
        e_controle_end = e_controle_start
    else:
        # Trouver la fin de E-contrôle (chercher la section suivante)
        e_controle_end = content.find("id: 'e-cia-exam-part1'", e_controle_start)
        if e_controle_end == -1:
            # Chercher d'autres sections possibles
            e_controle_end = content.find("id: 'e-cia-exam'", e_controle_start)
            if e_controle_end == -1:
                e_controle_end = len(content)
    
    print(f"✓ Section E-audit pro trouvée : {e_audit_start} à {e_audit_end}")
    if e_controle_start != -1:
        print(f"✓ Section E-contrôle trouvée : {e_controle_start} à {e_controle_end}")
    
    # Extraire les sections
    before_e_audit = content[:e_audit_start]
    e_audit_section = content[e_audit_start:e_audit_end]
    
    if e_controle_start != -1:
        between_sections = content[e_audit_end:e_controle_start]
        e_controle_section = content[e_controle_start:e_controle_end]
        after_sections = content[e_controle_end:]
    else:
        between_sections = content[e_audit_end:]
        e_controle_section = ""
        after_sections = ""
    
    # Appliquer les corrections dans E-audit pro
    count_e_audit = e_audit_section.count("[Guide Methodo] : Activate")
    e_audit_section = e_audit_section.replace(
        "[Guide Methodo] : Activate",
        "- [Methodo audit] : Activate"
    )
    print(f"✓ E-audit pro : {count_e_audit} occurrences corrigées")
    
    # Appliquer les corrections dans E-contrôle
    if e_controle_section:
        count_e_controle = e_controle_section.count("[Guide Methodo] : Activate")
        e_controle_section = e_controle_section.replace(
            "[Guide Methodo] : Activate",
            "- [Methodo audit] : Activate"
        )
        print(f"✓ E-contrôle : {count_e_controle} occurrences corrigées")
    
    # Reconstruire le contenu
    return before_e_audit + e_audit_section + between_sections + e_controle_section + after_sections

def fix_e_revision_methodo(content):
    """
    Corrige la variable [Guide Methodo] en [Methodo revision] pour E-revision
    Remplace "[Guide Methodo] : Activate" par "[Methodo revision] : Activate"
    """
    # Trouver la section E-revision (pas e-revision-pro)
    e_revision_start = content.find("id: 'e-revision'")
    if e_revision_start == -1:
        print("⚠️ Section E-revision non trouvée")
        return content
    
    # Trouver la fin de E-revision (début de E-audit plan ou section suivante)
    e_revision_end = content.find("id: 'e-audit-plan'", e_revision_start)
    if e_revision_end == -1:
        # Si E-audit plan n'existe pas, chercher la section suivante
        e_revision_end = content.find("id: 'e-cia-exam-part2'", e_revision_start)
        if e_revision_end == -1:
            # Chercher e-controle comme fin possible
            e_revision_end = content.find("id: 'e-controle'", e_revision_start)
            if e_revision_end == -1:
                e_revision_end = len(content)
    
    print(f"✓ Section E-revision trouvée : {e_revision_start} à {e_revision_end}")
    
    # Extraire les sections
    before_e_revision = content[:e_revision_start]
    e_revision_section = content[e_revision_start:e_revision_end]
    after_e_revision = content[e_revision_end:]
    
    # Appliquer les corrections dans E-revision
    count_e_revision = e_revision_section.count("[Guide Methodo] : Activate")
    e_revision_section = e_revision_section.replace(
        "[Guide Methodo] : Activate",
        "[Methodo revision] : Activate"
    )
    print(f"✓ E-revision : {count_e_revision} occurrences corrigées")
    
    # Reconstruire le contenu
    return before_e_revision + e_revision_section + after_e_revision

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
    
    # Correction 1 : E-audit pro et E-contrôle
    print("\n🔧 Correction 1 : E-audit pro et E-contrôle")
    print("   Remplacement : '[Guide Methodo] : Activate' → '- [Methodo audit] : Activate'")
    content = fix_e_audit_e_controle_methodo(content)
    
    # Correction 2 : E-revision
    print("\n🔧 Correction 2 : E-revision")
    print("   Remplacement : '[Guide Methodo] : Activate' → '[Methodo revision] : Activate'")
    content = fix_e_revision_methodo(content)
    
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
    print("   • E-audit pro : Variables [Guide Methodo] corrigées en - [Methodo audit]")
    print("   • E-contrôle : Variables [Guide Methodo] corrigées en - [Methodo audit]")
    print("   • E-revision : Variables [Guide Methodo] corrigées en [Methodo revision]")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 CORRECTION DES VARIABLES DE MODE - DemarrerMenu.tsx")
    print("=" * 70)
    
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
