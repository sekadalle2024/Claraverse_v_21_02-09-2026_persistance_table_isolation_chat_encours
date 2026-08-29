#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: fix_demo_position_feuille_couverture.py
Date: 05 Mai 2026
Objectif: Déplacer [Demo] = Activate de la première ligne vers la dernière ligne
          dans le mode Demo de l'étape "Feuille couverture" de E-audit Pro

Problème:
    Actuellement, le mode Demo a [Demo] = Activate en PREFIX (première ligne).
    Il doit être en SUFFIX (dernière ligne, après [Nb de lignes] = X).

Solution:
    1. Ajouter la propriété 'suffix' à l'interface ModeItem
    2. Modifier le mode Demo pour utiliser suffix au lieu de prefix
    3. Modifier la logique de génération de commande pour ajouter le suffix
"""

import re
import os
from datetime import datetime
from pathlib import Path

# Chemins
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DEMARRER_MENU_PATH = PROJECT_ROOT / "src" / "components" / "Clara_Components" / "DemarrerMenu.tsx"

def create_backup(file_path):
    """Crée un backup du fichier avec timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{file_path}.bak_{timestamp}"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Backup créé: {backup_path}")
    return backup_path

def add_suffix_to_interface(content):
    """Ajoute la propriété suffix à l'interface ModeItem"""
    
    # Pattern pour trouver l'interface ModeItem
    pattern = re.compile(
        r"(interface ModeItem \{\s*\n"
        r"\s*id: string;\s*\n"
        r"\s*label: string;\s*\n"
        r"\s*prefix\?: string;\s*\n)"
        r"(\s*command\?: string;\s*\n"
        r"\})",
        re.MULTILINE
    )
    
    # Ajouter suffix avant command
    replacement = r"\1  suffix?: string;\n\2"
    
    modified = pattern.sub(replacement, content)
    
    if modified != content:
        print("✅ Propriété 'suffix' ajoutée à l'interface ModeItem")
        return modified, True
    
    # Vérifier si suffix existe déjà
    if "suffix?: string;" in content:
        print("ℹ️  Propriété 'suffix' déjà présente dans l'interface")
        return content, False
    
    print("⚠️  Interface ModeItem non trouvée ou déjà modifiée")
    return content, False

def fix_demo_mode_definition(content):
    """Modifie la définition du mode Demo pour utiliser suffix"""
    
    # Pattern pour trouver la ligne du mode Demo
    pattern = re.compile(
        r"(\{\s*id:\s*'demo',\s*label:\s*'Demo',\s*)prefix:\s*'\[Demo\]\s*=\s*Activate\\n'\s*(\})",
        re.IGNORECASE
    )
    
    # Remplacer prefix par suffix (vide prefix, ajouter suffix)
    replacement = r"\1prefix: '', suffix: '\\n[Demo] = Activate' \2"
    
    modified = pattern.sub(replacement, content)
    
    if modified != content:
        print("✅ Mode Demo modifié: prefix vidé, suffix ajouté")
        return modified, True
    
    print("⚠️  Définition du mode Demo non trouvée ou déjà modifiée")
    return content, False

def fix_command_generation(content):
    """Modifie la logique de génération de commande pour ajouter le suffix"""
    
    # Pattern pour trouver la ligne de génération de commande
    # Ligne actuelle: const rawCommand = mode.command || (mode.prefix && activeEtape.command ? mode.prefix + activeEtape.command : activeEtape.command || '');
    
    pattern = re.compile(
        r"(const rawCommand = mode\.command \|\| \(mode\.prefix && activeEtape\.command \? mode\.prefix \+ activeEtape\.command : activeEtape\.command \|\| ''\));",
        re.MULTILINE
    )
    
    # Nouvelle logique avec suffix
    replacement = (
        r"const rawCommand = mode.command || "
        r"(mode.prefix && activeEtape.command ? "
        r"mode.prefix + activeEtape.command + (mode.suffix || '') : "
        r"(activeEtape.command || '') + (mode.suffix || ''));"
    )
    
    modified = pattern.sub(replacement, content)
    
    if modified != content:
        print("✅ Logique de génération de commande modifiée pour supporter suffix")
        return modified, True
    
    # Vérifier si la logique existe déjà avec suffix
    if "mode.suffix" in content:
        print("ℹ️  Logique de génération déjà modifiée pour supporter suffix")
        return content, False
    
    print("⚠️  Logique de génération de commande non trouvée")
    return content, False

def main():
    """Fonction principale"""
    print("=" * 80)
    print("CORRECTION POSITION [Demo] = Activate - Feuille Couverture")
    print("=" * 80)
    print()
    
    # Vérifier que le fichier existe
    if not DEMARRER_MENU_PATH.exists():
        print(f"❌ ERREUR: Fichier non trouvé: {DEMARRER_MENU_PATH}")
        return False
    
    print(f"📂 Fichier cible: {DEMARRER_MENU_PATH}")
    print()
    
    # Lire le contenu
    with open(DEMARRER_MENU_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Créer un backup
    backup_path = create_backup(DEMARRER_MENU_PATH)
    print()
    
    # Appliquer les corrections
    print("🔧 Application des corrections...")
    print()
    
    changes_made = False
    
    # 1. Ajouter suffix à l'interface
    content, changed = add_suffix_to_interface(content)
    changes_made = changes_made or changed
    
    # 2. Modifier la définition du mode Demo
    content, changed = fix_demo_mode_definition(content)
    changes_made = changes_made or changed
    
    # 3. Modifier la logique de génération
    content, changed = fix_command_generation(content)
    changes_made = changes_made or changed
    
    print()
    
    if changes_made:
        # Écrire le fichier modifié
        with open(DEMARRER_MENU_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("=" * 80)
        print("✅ SUCCÈS - Corrections appliquées")
        print("=" * 80)
        print()
        print("📋 Résumé des modifications:")
        print("   1. Propriété 'suffix' ajoutée à l'interface ModeItem")
        print("   2. Mode Demo: prefix vidé, suffix ajouté")
        print("   3. Logique de génération modifiée pour supporter suffix")
        print()
        print(f"   • Fichier modifié: {DEMARRER_MENU_PATH.name}")
        print(f"   • Backup créé: {os.path.basename(backup_path)}")
        print()
        print("🎯 Résultat:")
        print("   La ligne [Demo] = Activate sera maintenant ajoutée")
        print("   EN DERNIÈRE POSITION (après [Nb de lignes] = X)")
        print("   au lieu de la première position.")
        print()
        print("🚀 Prochaines étapes:")
        print("   1. Relancer l'application: npm run dev")
        print("   2. Tester le mode Demo de 'Feuille couverture'")
        print("   3. Vérifier que [Demo] = Activate est en dernière ligne")
        print()
        return True
    else:
        print("=" * 80)
        print("ℹ️  INFORMATION - Aucune modification nécessaire")
        print("=" * 80)
        print()
        print("Les corrections semblent déjà avoir été appliquées")
        print("ou les patterns n'ont pas été trouvés.")
        print()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

