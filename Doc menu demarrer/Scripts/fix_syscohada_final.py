#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger E-Syscohada révisé - Version finale
- Supprimer E-Syscohada de partout où il est
- Le réinsérer comme logiciel séparé au bon endroit dans MENU_DATA

Date: 10 Avril 2026
"""

import re

def fix_syscohada_final(file_path):
    """
    Corrige définitivement la position de E-Syscohada
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Étape 1: Supprimer toutes les occurrences de E-Syscohada
    print("📝 Étape 1: Suppression de toutes les occurrences de E-Syscohada...")
    
    # Pattern pour trouver E-Syscohada (peut être avec ou sans virgule avant)
    pattern_syscohada = r",?\s*\{\s*id: 'e-syscohada-revise',\s*label: 'E-Syscohada révisé',\s*icon:.*?modes: SYSCOHADA_MODES\s*\}\s*\]\s*\}"
    
    matches = list(re.finditer(pattern_syscohada, content, re.DOTALL))
    print(f"   Trouvé {len(matches)} occurrence(s) de E-Syscohada")
    
    content = re.sub(pattern_syscohada, '', content, flags=re.DOTALL)
    print("   ✅ E-Syscohada supprimé")
    
    # Étape 2: Trouver où insérer E-Syscohada
    print("📝 Étape 2: Recherche du point d'insertion...")
    
    # Chercher "Bibliothèque" qui vient après E-CIA EXAM
    bibliotheque_pos = content.find("id: 'bibliotheque'")
    
    if bibliotheque_pos == -1:
        print("   ❌ Bibliothèque non trouvée")
        return False
    
    print(f"   ✓ Bibliothèque trouvée à la position {bibliotheque_pos}")
    
    # Remonter pour trouver le début de l'objet Bibliothèque
    # On cherche le { qui précède
    brace_pos = content.rfind('{', 0, bibliotheque_pos)
    
    if brace_pos == -1:
        print("   ❌ Début de Bibliothèque non trouvé")
        return False
    
    # Remonter encore pour trouver la virgule qui précède
    comma_pos = content.rfind(',', 0, brace_pos)
    
    if comma_pos == -1:
        print("   ❌ Virgule avant Bibliothèque non trouvée")
        return False
    
    print(f"   ✅ Point d'insertion trouvé à la position {comma_pos + 1}")
    
    # Étape 3: Créer la structure E-Syscohada
    print("📝 Étape 3: Création de la structure E-Syscohada...")
    
    syscohada_structure = """,
  {
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
            command: `[Command] = Etat fin
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            command: `[Command] = Etat fin
[Integration] = Affectation du resultat`
          }
        ],
        modes: SYSCOHADA_MODES
      },
      {
        id: 'etats-financiers-liasse-systeme-minimal',
        label: 'Etats financiers - Liasse système minimal',
        etapes: [
          {
            id: 'base',
            label: 'Base',
            command: `[Command] = Liasse système minimal
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            command: `[Command] = Liasse système minimal
[Integration] = Affectation du resultat`
          }
        ],
        modes: SYSCOHADA_MODES
      },
      {
        id: 'etats-financiers-liasse-association',
        label: 'Etats financiers - Liasse association',
        etapes: [
          {
            id: 'base',
            label: 'Base',
            command: `[Command] = Liasse association
[Integration] = Base`
          },
          {
            id: 'affectation-resultat',
            label: 'Affectation du resultat',
            command: `[Command] = Liasse association
[Integration] = Affectation du resultat`
          }
        ],
        modes: SYSCOHADA_MODES
      }
    ]
  }"""
    
    # Insérer E-Syscohada avant Bibliothèque
    content = content[:comma_pos + 1] + syscohada_structure + content[comma_pos + 1:]
    print("   ✅ E-Syscohada inséré avant Bibliothèque")
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Corrections appliquées avec succès!")
    print("\n📋 Résumé:")
    print("   - E-Syscohada supprimé de toutes les positions incorrectes")
    print("   - E-Syscohada ajouté comme logiciel séparé avant Bibliothèque")
    print("   - Position: après E-CIA EXAM, avant Bibliothèque")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier les diagnostics TypeScript")
    print("   2. Tester l'interface")
    
    return True

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 Correction finale de E-Syscohada révisé")
    print("=" * 70)
    print()
    
    try:
        success = fix_syscohada_final(file_path)
        if not success:
            print("\n❌ Échec de la correction")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
