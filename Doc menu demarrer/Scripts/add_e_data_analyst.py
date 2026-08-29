#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter le logiciel E-Data analyst dans le bouton Démarrer
- Insérer APRÈS E-contrôle et AVANT E-CIA exam part 1
- Section 1 : Echantillonnage (6 méthodes, mode Normal)
- Section 2 : Détection fraude

Icônes utilisées (toutes déjà importées dans DemarrerMenu.tsx) :
  BarChart3, TrendingUp, Calculator, Target, FileSearch, Zap, AlertTriangle

Date: 08 Juillet 2026
"""

import re
import shutil
import os
import sys
from datetime import datetime

# Configure stdout to use UTF-8 if possible to avoid encoding errors on Windows
if sys.platform.startswith('win'):
    import urllib.request
    # Force UTF-8 output if supported
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# ─────────────────────────────────────────────────────────────────────────────
#  BLOC JSX à insérer dans le tableau softwareItems
#  Icônes choisies parmi celles déjà importées :
#    BarChart3, TrendingUp, Calculator, Target, FileSearch, Zap, AlertTriangle
# ─────────────────────────────────────────────────────────────────────────────
E_DATA_ANALYST_BLOCK = """,
  {
    id: 'e-data-analyst',
    label: 'E-Data analyst',
    icon: <BarChart3 className="w-4 h-4" />,
    phases: [
      {
        id: 'echantillonnage',
        label: 'Echantillonnage',
        etapes: [
          {
            id: 'aleatoire-simple',
            label: 'Aléatoire simple',
            icon: <Zap className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Aléatoire simple
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          },
          {
            id: 'systematique',
            label: 'Systématique',
            icon: <TrendingUp className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Systématique
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          },
          {
            id: 'monetaire-mus',
            label: 'Monétaire (MUS)',
            icon: <Target className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Monétaire (MUS)
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          },
          {
            id: 'stratifie',
            label: 'Stratifié',
            icon: <FileSearch className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Stratifié
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          },
          {
            id: 'enregistrements-fixes',
            label: 'Enregistrements fixes',
            icon: <FileText className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Enregistrements fixes
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          },
          {
            id: 'calculer-taille-echantillon',
            label: 'Calculer taille échantillon',
            icon: <Calculator className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Calculer taille échantillon
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          }
        ]
      },
      {
        id: 'detection-fraude',
        label: 'Détection fraude',
        etapes: [
          {
            id: 'analyse-fraude',
            label: 'Analyse fraude',
            icon: <AlertTriangle className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Data analyst
[Méthode]   = Détection fraude
[Colonne cible] = Montant
[Colonne base] =
[Nb lignes] =`
              }
            ]
          }
        ]
      }
    ]
  }"""


def add_e_data_analyst(file_path: str) -> bool:
    """
    Insère le bloc E-Data analyst entre E-contrôle et E-CIA exam part 1.
    Stratégie robuste en deux temps :
      1. On recherche le pattern précis   \n  {\n    id: 'e-cia-exam-part1'
      2. Fallback : on recherche rfind de '\n  {' avant l'identifiant
    """
    print("[INFO] Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # ── Vérification préalable ────────────────────────────────────────────
    if "id: 'e-data-analyst'" in content:
        print("[WARN] E-Data analyst est deja present dans le fichier.")
        print("       Aucune modification effectuee.")
        return False

    if "id: 'e-cia-exam-part1'" not in content:
        print("[ERROR] Le marqueur id: 'e-cia-exam-part1' est introuvable.")
        return False

    # ── Localisation du point d'insertion ────────────────────────────────
    print("[INFO] Localisation du point d'insertion (avant E-CIA exam part 1)...")

    idx_ecia = content.find("id: 'e-cia-exam-part1'")

    # Remonter jusqu'au  \n  {  ou  \r\n  {  qui ouvre ce logiciel
    # On cherche le dernier '\n  {' avant idx_ecia
    block_start = content.rfind('\n  {', 0, idx_ecia)

    if block_start == -1:
        print("[ERROR] Impossible de localiser le debut du bloc E-CIA exam part 1.")
        return False

    print(f"   [OK] Point d'insertion trouve a la position {block_start}")

    # ── Insertion ─────────────────────────────────────────────────────────
    # On insère notre bloc AVANT le '\n  {' qui ouvre E-CIA exam part 1
    new_content = content[:block_start] + E_DATA_ANALYST_BLOCK + content[block_start:]

    # ── Sauvegarde backup ─────────────────────────────────────────────────
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path + f'.backup_e_data_analyst_{timestamp}'
    print(f"[INFO] Sauvegarde backup -> {os.path.basename(backup_path)}")
    shutil.copy2(file_path, backup_path)

    # ── Écriture ──────────────────────────────────────────────────────────
    print("[INFO] Ecriture du fichier modifie...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # ── Vérification post-écriture ────────────────────────────────────────
    with open(file_path, 'r', encoding='utf-8') as f:
        verification = f.read()

    if "id: 'e-data-analyst'" in verification and "id: 'e-cia-exam-part1'" in verification:
        # Vérifier l'ordre : e-data-analyst doit apparaître AVANT e-cia-exam-part1
        pos_data    = verification.find("id: 'e-data-analyst'")
        pos_cia     = verification.find("id: 'e-cia-exam-part1'")
        if pos_data < pos_cia:
            print("\n[SUCCESS] Modifications appliquees avec succes !")
            print("   Ordre verifie : E-Data analyst est bien avant E-CIA exam part 1")
            print("\n[INFO] Resume :")
            print("   - E-Data analyst insere entre E-controle et E-CIA exam part 1")
            print("   - Section 1 : Echantillonnage (6 methodes, mode Normal)")
            print("     * Aleatoire simple")
            print("     * Systematique")
            print("     * Monetaire (MUS)")
            print("     * Stratifie")
            print("     * Enregistrements fixes")
            print("     * Calculer taille echantillon")
            print("   - Section 2 : Detection fraude (1 etape, mode Normal)")
            print(f"\n   Backup : {os.path.basename(backup_path)}")
            return True
        else:
            print("[ERROR] Ordre incorrect : E-Data analyst n'est pas avant E-CIA exam part 1.")
    else:
        print("[ERROR] Verification echouee : identifiants non trouves apres ecriture.")

    # Restauration depuis backup si erreur
    print("[INFO] Restauration du fichier original depuis le backup...")
    shutil.copy2(backup_path, file_path)
    return False


if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'

    print("=" * 70)
    print("Ajout du logiciel E-Data analyst dans le menu Demarrer")
    print("=" * 70)
    print()

    if not os.path.exists(file_path):
        print(f"[ERROR] Fichier non trouve : {file_path}")
        print("   Lancez ce script depuis la racine du projet ClaraVerse.")
        exit(1)

    try:
        success = add_e_data_analyst(file_path)
        if not success:
            print("\n[ERROR] Echec de l'ajout.")
            exit(1)
    except Exception as e:
        print(f"\n[ERROR] Erreur inattendue : {e}")
        import traceback
        traceback.print_exc()
        exit(1)
