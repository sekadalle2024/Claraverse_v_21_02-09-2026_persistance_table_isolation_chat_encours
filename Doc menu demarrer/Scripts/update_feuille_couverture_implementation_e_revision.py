#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script: update_feuille_couverture_implementation_e_revision.py
Date: 11 Mai 2026
Objectif: Mettre à jour les modes [Normal] et [Demo] pour la section PLANIFICATION,
          étape "Feuille de couverture Implementation" du logiciel E-revision

Nouvelles variables:
    Mode [Normal]:
        [Command] = Couverture
        [Processus] = Controle des rapprochements bancaires
        [Contrôle] = vérifier que les rapprochements bancaires ont été étables et approuvés sur la periode
        [Integration] = Implementation_programme_controle
        [Nb de lignes] = 25

    Mode [Demo]:
        [Command] = Couverture
        [Processus] = Controle des rapprochements bancaires
        [Contrôle] = vérifier que les rapprochements bancaires ont été étables et approuvés sur la periode
        [Integration] = Implementation_programme_controle
        [Nb de lignes] = 25
        [Demo] = Activate
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

def find_e_revision_section(content):
    """Trouve la section E-revision dans le contenu"""
    # Recherche simple de l'id e-revision
    if "id: 'e-revision'" in content or 'id: "e-revision"' in content:
        print("✅ Section E-revision trouvée")
        return True
    print("❌ Section E-revision non trouvée")
    return False

def update_feuille_couverture_implementation(content):
    """Met à jour les modes Normal et Demo de Feuille de couverture Implementation"""
    
    # Pattern pour trouver l'étape "Feuille de couverture implementation"
    # On cherche l'id et les modes associés
    pattern = re.compile(
        r"(id:\s*'feuille-couverture-implementation',\s*"
        r"label:\s*'Feuille de couverture implementation',\s*"
        r"icon:.*?,\s*"
        r"modes:\s*\[)"
        r"(.*?)"  # Contenu des modes actuels
        r"(\s*\]\s*\})",  # Fin des modes
        re.DOTALL
    )
    
    # Nouveaux modes
    new_modes = """
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = vérifier que les rapprochements bancaires ont été étables et approuvés sur la periode
[Integration] = Implementation_programme_controle
[Nb de lignes] = 25`
              },
              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = vérifier que les rapprochements bancaires ont été étables et approuvés sur la periode
[Integration] = Implementation_programme_controle
[Nb de lignes] = 25
[Demo] = Activate`
              }"""
    
    def replacer(match):
        return match.group(1) + new_modes + "\n            " + match.group(3)
    
    modified = pattern.sub(replacer, content)
    
    if modified != content:
        print("✅ Modes Normal et Demo mis à jour pour 'Feuille de couverture Implementation'")
        return modified, True
    
    print("⚠️  Étape 'Feuille de couverture Implementation' non trouvée ou déjà modifiée")
    return content, False

def main():
    """Fonction principale"""
    print("=" * 80)
    print("MISE À JOUR - Feuille de couverture Implementation (E-revision)")
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
    
    # Vérifier la présence de E-revision
    if not find_e_revision_section(content):
        print("❌ Impossible de continuer sans la section E-revision")
        return False
    
    print()
    
    # Créer un backup
    backup_path = create_backup(DEMARRER_MENU_PATH)
    print()
    
    # Appliquer les modifications
    print("🔧 Application des modifications...")
    print()
    
    content, changed = update_feuille_couverture_implementation(content)
    
    print()
    
    if changed:
        # Écrire le fichier modifié
        with open(DEMARRER_MENU_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("=" * 80)
        print("✅ SUCCÈS - Modifications appliquées")
        print("=" * 80)
        print()
        print("📋 Résumé des modifications:")
        print("   • Logiciel: E-revision")
        print("   • Section: PLANIFICATION")
        print("   • Étape: Feuille de couverture Implementation")
        print()
        print("   Mode [Normal] mis à jour:")
        print("     - [Command] = Couverture")
        print("     - [Processus] = Controle des rapprochements bancaires")
        print("     - [Contrôle] = vérifier que les rapprochements bancaires ont été")
        print("                    étables et approuvés sur la periode")
        print("     - [Integration] = Implementation_programme_controle")
        print("     - [Nb de lignes] = 25")
        print()
        print("   Mode [Demo] mis à jour:")
        print("     - [Command] = Couverture")
        print("     - [Processus] = Controle des rapprochements bancaires")
        print("     - [Contrôle] = vérifier que les rapprochements bancaires ont été")
        print("                    étables et approuvés sur la periode")
        print("     - [Integration] = Implementation_programme_controle")
        print("     - [Nb de lignes] = 25")
        print("     - [Demo] = Activate")
        print()
        print(f"   • Fichier modifié: {DEMARRER_MENU_PATH.name}")
        print(f"   • Backup créé: {os.path.basename(backup_path)}")
        print()
        print("🚀 Prochaines étapes:")
        print("   1. Relancer l'application: npm run dev")
        print("   2. Ouvrir le menu Démarrer")
        print("   3. Naviguer vers E-revision > PLANIFICATION > Feuille de couverture Implementation")
        print("   4. Tester les modes Normal et Demo")
        print("   5. Vérifier que les commandes générées sont correctes")
        print()
        return True
    else:
        print("=" * 80)
        print("ℹ️  INFORMATION - Aucune modification nécessaire")
        print("=" * 80)
        print()
        print("Les modifications semblent déjà avoir été appliquées")
        print("ou l'étape n'a pas été trouvée.")
        print()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
