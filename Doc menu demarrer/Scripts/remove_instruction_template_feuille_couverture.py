#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour supprimer la ligne [Instruction] = Template
des modes Normal et Demo de l'étape Feuille couverture
dans E-audit pro - Phase de réalisation

Date: 09 Mai 2026
"""

import re
import sys
from pathlib import Path

def remove_instruction_template_feuille_couverture():
    """
    Supprime [Instruction] = Template des modes Normal et Demo
    pour Feuille couverture dans E-audit pro
    """
    
    # Chemin du fichier
    file_path = Path('src/components/Clara_Components/DemarrerMenu.tsx')
    
    if not file_path.exists():
        print(f"❌ Erreur: Le fichier {file_path} n'existe pas")
        return False
    
    # Lire le contenu
    print(f"📖 Lecture du fichier {file_path}...")
    content = file_path.read_text(encoding='utf-8')
    original_content = content
    
    # Compteur de modifications
    modifications = 0
    
    # Pattern pour trouver la section Feuille couverture dans Phase de réalisation
    # On cherche spécifiquement les modes Normal et Demo
    
    # Pattern 1: Mode Normal avec [Instruction] = Template
    pattern_normal = re.compile(
        r"(id: 'normal',\s*\n\s*label: 'Normal',\s*\n\s*command: `\[Command\] = Couverture\s*\n"
        r"\[Processus\] = Sécurité trésorerie\s*\n"
        r"\[Contrôle\] = Verifier l exhaustivite des inventaires de caisse\s*\n)"
        r"\[Instruction\] = Template\s*\n"
        r"(\[Modele de test\] = no, compte, site, libelle, solde BG, Solde Pv inventaire\s*\n"
        r"\[Nb de lignes\] = 15`)",
        re.MULTILINE
    )
    
    # Pattern 2: Mode Demo avec [Instruction] = Template
    pattern_demo = re.compile(
        r"(id: 'demo',\s*\n\s*label: 'Demo',\s*\n\s*command: `\[Command\] = Couverture\s*\n"
        r"\[Processus\] = Sécurité trésorerie\s*\n"
        r"\[Contrôle\] = Verifier l exhaustivite des inventaires de caisse\s*\n)"
        r"\[Instruction\] = Template\s*\n"
        r"(\[Modele de test\] = no, compte, site, libelle, solde BG, Solde Pv inventaire\s*\n"
        r"\[Nb de lignes\] = 15\s*\n"
        r"\[Demo\] = Activate`)",
        re.MULTILINE
    )
    
    # Supprimer [Instruction] = Template du mode Normal
    if pattern_normal.search(content):
        content = pattern_normal.sub(r'\1\2', content)
        modifications += 1
        print("✅ Suppression de [Instruction] = Template du mode Normal")
    else:
        print("ℹ️  Mode Normal: [Instruction] = Template non trouvé (déjà supprimé ou absent)")
    
    # Supprimer [Instruction] = Template du mode Demo
    if pattern_demo.search(content):
        content = pattern_demo.sub(r'\1\2', content)
        modifications += 1
        print("✅ Suppression de [Instruction] = Template du mode Demo")
    else:
        print("ℹ️  Mode Demo: [Instruction] = Template non trouvé (déjà supprimé ou absent)")
    
    # Vérifier si des modifications ont été effectuées
    if content != original_content:
        # Sauvegarder le fichier modifié
        print(f"\n💾 Sauvegarde des modifications dans {file_path}...")
        file_path.write_text(content, encoding='utf-8')
        print(f"✅ Fichier modifié avec succès!")
        print(f"📊 Nombre de modifications: {modifications}")
        return True
    else:
        print("\nℹ️  Aucune modification nécessaire - La ligne [Instruction] = Template")
        print("   n'est pas présente dans les modes Normal et Demo de Feuille couverture")
        return False

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🔧 Suppression [Instruction] = Template - Feuille couverture")
    print("   E-audit pro > Phase de réalisation > Feuille couverture")
    print("   Modes: Normal et Demo")
    print("=" * 70)
    print()
    
    success = remove_instruction_template_feuille_couverture()
    
    print()
    print("=" * 70)
    if success:
        print("✅ SUCCÈS: Modifications appliquées")
    else:
        print("ℹ️  INFORMATION: Aucune modification nécessaire")
    print("=" * 70)
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())
