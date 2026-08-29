#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

"""
Script pour corriger la position de [Demo] = Activate dans le composant DemarrerMenu.tsx

PROBLEME :
  Dans les modes [Demo] de la section "PROGRAMME DE CONTROLE" (E-revision),
  la ligne `[Demo] = Activate` est placée EN DEBUT de commande (avant [Command]).
  
  Structure ACTUELLE (incorrecte) :
    command: `[Demo] = Activate
    [Command] = /feuille couverture
    [Processus] = ...
    [test] = ...
    [reference] = ...
    [Nb de lignes] = X`

SOLUTION :
  La ligne `[Demo] = Activate` doit être placée APRES la ligne `[Nb de lignes] = X`,
  en fin de commande.

  Structure CIBLE (correcte) :
    command: `[Command] = /feuille couverture
    [Processus] = ...
    [test] = ...
    [reference] = ...
    [Nb de lignes] = X
    [Demo] = Activate`

Date: 04 Mai 2026
Auteur: Antigravity AI Assistant
"""

import re
import sys
import shutil
from datetime import datetime

# =============================================================================
# CONFIGURATION
# =============================================================================

FILEPATH = 'src/components/Clara_Components/DemarrerMenu.tsx'
BACKUP_SUFFIX = f'.bak_{datetime.now().strftime("%Y%m%d_%H%M%S")}'

# =============================================================================
# LOGIQUE DE CORRECTION
# =============================================================================

def fix_demo_position(content: str) -> tuple[str, int]:
    """
    Déplace la ligne [Demo] = Activate de la position initiale vers
    la fin de la commande, après [Nb de lignes] = X.

    Stratégie :
      - Cherche le pattern exact :
          `[Demo] = Activate\n[Command] = /feuille couverture\n...[Nb de lignes] = <N>`
      - Le remplace par :
          `[Command] = /feuille couverture\n...[Nb de lignes] = <N>\n[Demo] = Activate`

    Utilise re.sub avec DOTALL pour gérer les blocs multilignes.
    """

    # Pattern : [Demo] = Activate suivi du reste du bloc jusqu'à [Nb de lignes] = N
    # Le backtick de fermeture termine le template literal TSX.
    pattern = re.compile(
        r'\[Demo\] = Activate\n'          # ligne Demo en début
        r'(\[Command\] = /feuille couverture\n'   # Command
        r'(?:(?!\[Nb de lignes\]).)+?)'    # tout ce qui est entre (non-greedy)
        r'(\[Nb de lignes\] = \d+)',        # Nb de lignes (fin)
        re.DOTALL
    )

    replacement = r'\1\2\n[Demo] = Activate'

    new_content, count = re.subn(pattern, replacement, content)
    return new_content, count


def process_file(filepath: str) -> bool:
    """
    Lit, corrige et sauvegarde le fichier DemarrerMenu.tsx.
    Crée automatiquement un backup avant modification.
    """
    print(f"[INFO] Lecture du fichier : {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé : {filepath}")
        return False
    except Exception as e:
        print(f"❌ Erreur de lecture : {e}")
        return False

    print(f"[OK] Fichier lu ({len(content):,} caracteres)")

    # Backup
    backup_path = filepath + BACKUP_SUFFIX
    try:
        shutil.copy2(filepath, backup_path)
        print(f"[OK] Backup cree : {backup_path}")
    except Exception as e:
        print(f"[WARN] Impossible de creer le backup : {e}")
        return False

    # Correction
    print("\n[...] Application de la correction [Demo] = Activate ...")
    new_content, count = fix_demo_position(content)

    if count == 0:
        print("[WARN] Aucune occurrence trouvee. Verifiez le pattern.")
        print("     (Le fichier est peut-etre deja corrige, ou le format a change.)")
        return False

    print(f"[OK] {count} occurrence(s) corrigee(s)")

    # Vérification : s'assurer qu'il ne reste plus de [Demo] en début
    remaining = len(re.findall(r'\[Demo\] = Activate\n\[Command\]', new_content))
    if remaining > 0:
        print(f"[WARN] ATTENTION : {remaining} occurrence(s) non corrigee(s) detectees.")
        print("    Verifiez manuellement le fichier.")
    else:
        print("[OK] Verification : aucune occurrence residuelle.")

    # Écriture
    print(f"\n[...] Ecriture des modifications dans : {filepath}")
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
    except Exception as e:
        print(f"❌ Erreur d'écriture : {e}")
        return False

    print("[OK] Fichier mis a jour avec succes !")
    return True, count


def print_summary(count: int):
    print("\n" + "=" * 70)
    print("RESUME DES MODIFICATIONS")
    print("=" * 70)
    print(f"\n[OK] Nombre de corrections appliquees : {count}")
    print("\nModification effectuee :")
    print("   AVANT :")
    print("     command: `[Demo] = Activate")
    print("     [Command] = /feuille couverture")
    print("     [Processus] = ...")
    print("     [Nb de lignes] = X`")
    print("\n   APRÈS :")
    print("     command: `[Command] = /feuille couverture")
    print("     [Processus] = ...")
    print("     [Nb de lignes] = X")
    print("     [Demo] = Activate`")
    print("\n" + "=" * 70)
    print("PROCHAINES ETAPES")
    print("=" * 70)
    print("   1. Relancer l'application : npm run dev")
    print("   2. Tester le menu Demarrer > E-revision > Programme de controle")
    print("   3. Selectionner un cycle operationnel et verifier le mode [Demo]")
    print("   4. Confirmer que [Demo] = Activate apparait en DERNIERE ligne")
    print("=" * 70)


# =============================================================================
# POINT D'ENTREE
# =============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("CORRECTION POSITION [Demo] = Activate - E-revision")
    print("=" * 70)
    print("   Section : PROGRAMME DE CONTROLE (tous les cycles operationnels)")
    print("   Objectif : deplacer [Demo] = Activate apres [Nb de lignes] = X")
    print("=" * 70 + "\n")

    try:
        result = process_file(FILEPATH)

        if isinstance(result, tuple):
            success, count = result
        else:
            success = result
            count = 0

        if success:
            print_summary(count)
            sys.exit(0)
        else:
            print("\n[ERREUR] Echec de la mise a jour.")
            sys.exit(1)

    except Exception as e:
        print(f"\n[ERREUR] Erreur inattendue : {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
