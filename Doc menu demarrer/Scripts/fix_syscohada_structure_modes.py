#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour corriger la structure E-Syscohada révisé
- Supprimer les modes incorrects (Cours, Demo, Methodo audit, Guide des commandes, Manuel)
- Restructurer pour avoir les modes au niveau des étapes, pas des phases
- Chaque phase a 2 étapes : Base et Affectation du resultat
- Chaque étape a 2 modes : Mode normal et Mode avancé
"""

import re
import sys

def fix_syscohada_structure():
    """Corrige la structure E-Syscohada révisé dans DemarrerMenu.tsx"""
    
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {file_path} non trouvé")
        return False
    
    # Vérifier que E-Syscohada existe
    if 'e-syscohada-revise' not in content:
        print("❌ E-Syscohada révisé non trouvé dans le fichier")
        return False
    
    print("✓ E-Syscohada révisé trouvé")
    
    # Nouvelle structure correcte pour E-Syscohada révisé
    new_syscohada_structure = """  {
    id: 'e-syscohada-revise',
    label: 'E-Syscohada révisé',
    icon: <BookOpen className="w-4 h-4" />,
    phases: [
      {
        id: 'etats-financiers-liasse-normale',
        label: 'Etats financiers - Liasse normale',
        etapes: [
          {
            id: 'base',
            label: 'Base',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Etat fin
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Etat fin
[Integration] = Affectation du resultat`
          }
        ]
      },
      {
        id: 'etats-financiers-liasse-systeme-minimal',
        label: 'Etats financiers - Liasse système minimal',
        etapes: [
          {
            id: 'base',
            label: 'Base',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Liasse système minimal
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Liasse système minimal
[Integration] = Affectation du resultat`
          }
        ]
      },
      {
        id: 'etats-financiers-liasse-association',
        label: 'Etats financiers - Liasse association',
        etapes: [
          {
            id: 'base',
            label: 'Base',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Liasse association
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            modes: SYSCOHADA_MODES,
            command: `[Command] = Liasse association
[Integration] = Affectation du resultat`
          }
        ]
      }
    ]
  }"""
    
    # Pattern pour trouver toute la structure E-Syscohada (du début jusqu'à la fermeture)
    # On cherche depuis "id: 'e-syscohada-revise'" jusqu'au prochain logiciel ou la fin
    pattern = r'(\s*\{\s*id:\s*[\'"]e-syscohada-revise[\'"].*?\n\s*\})'
    
    # Trouver la structure E-Syscohada actuelle
    # On doit trouver l'objet complet avec toutes ses accolades
    start_idx = content.find("id: 'e-syscohada-revise'")
    if start_idx == -1:
        print("❌ Impossible de trouver le début de E-Syscohada")
        return False
    
    # Remonter pour trouver l'accolade ouvrante
    brace_start = content.rfind('{', 0, start_idx)
    if brace_start == -1:
        print("❌ Impossible de trouver l'accolade ouvrante")
        return False
    
    # Trouver l'accolade fermante correspondante
    brace_count = 0
    brace_end = -1
    for i in range(brace_start, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                brace_end = i + 1
                break
    
    if brace_end == -1:
        print("❌ Impossible de trouver l'accolade fermante")
        return False
    
    # Extraire l'ancienne structure
    old_structure = content[brace_start:brace_end]
    print(f"\n📋 Ancienne structure trouvée ({len(old_structure)} caractères)")
    
    # Remplacer l'ancienne structure par la nouvelle
    content = content[:brace_start] + new_syscohada_structure + content[brace_end:]
    
    # Sauvegarder le fichier modifié
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ Fichier {file_path} modifié avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture du fichier : {e}")
        return False

def verify_structure():
    """Vérifie que la structure a été correctement modifiée"""
    
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {file_path} non trouvé")
        return False
    
    print("\n🔍 Vérification de la structure...")
    
    tests = {
        "E-Syscohada révisé existe": "e-syscohada-revise" in content,
        "SYSCOHADA_MODES défini": "const SYSCOHADA_MODES" in content,
        "Mode normal trouvé": "Mode normal" in content,
        "Mode avancé trouvé": "Mode avancé" in content,
        "Liasse normale trouvée": "Etats financiers - Liasse normale" in content,
        "Liasse système minimal trouvée": "Etats financiers - Liasse système minimal" in content,
        "Liasse association trouvée": "Etats financiers - Liasse association" in content,
        "Étape Base trouvée": "label: 'Base'" in content,
        "Étape Affectation trouvée": "label: 'Affectation du resultat'" in content,
        "Command Etat fin trouvée": "[Command] = Etat fin" in content,
        "Command Liasse système minimal trouvée": "[Command] = Liasse système minimal" in content,
        "Command Liasse association trouvée": "[Command] = Liasse association" in content,
        "Integration Base trouvée": "[Integration] = Base" in content,
        "Integration Affectation trouvée": "[Integration] = Affectation du resultat" in content,
        "Modes au niveau étape": "modes: SYSCOHADA_MODES" in content
    }
    
    passed = 0
    failed = 0
    
    for test_name, result in tests.items():
        if result:
            print(f"  ✓ {test_name}")
            passed += 1
        else:
            print(f"  ✗ {test_name}")
            failed += 1
    
    print(f"\n📊 Résultat : {passed}/{len(tests)} tests réussis")
    
    if failed > 0:
        print(f"⚠️  {failed} test(s) échoué(s)")
        return False
    else:
        print("✅ Tous les tests sont passés !")
        return True

def main():
    """Fonction principale"""
    
    print("═" * 80)
    print("  CORRECTION STRUCTURE E-SYSCOHADA RÉVISÉ")
    print("═" * 80)
    print()
    print("📋 Objectif :")
    print("  • Supprimer les modes incorrects")
    print("  • Déplacer les modes au niveau des étapes (pas des phases)")
    print("  • Chaque phase a 2 étapes : Base et Affectation du resultat")
    print("  • Chaque étape a 2 modes : Mode normal et Mode avancé")
    print()
    print("─" * 80)
    
    # Étape 1 : Corriger la structure
    if not fix_syscohada_structure():
        print("\n❌ Échec de la correction")
        sys.exit(1)
    
    # Étape 2 : Vérifier la structure
    if not verify_structure():
        print("\n⚠️  La vérification a échoué")
        sys.exit(1)
    
    print()
    print("═" * 80)
    print("  ✅ CORRECTION TERMINÉE AVEC SUCCÈS")
    print("═" * 80)
    print()
    print("📝 Prochaines étapes :")
    print("  1. Tester l'interface utilisateur")
    print("  2. Vérifier que les 3 phases s'affichent")
    print("  3. Vérifier que chaque phase a 2 étapes")
    print("  4. Vérifier que chaque étape a 2 modes")
    print()

if __name__ == '__main__':
    main()
