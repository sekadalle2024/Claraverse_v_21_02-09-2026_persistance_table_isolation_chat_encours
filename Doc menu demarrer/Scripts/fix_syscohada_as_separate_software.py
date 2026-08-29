#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger E-Syscohada révisé
- Le retirer de l'intérieur de E-CIA EXAM
- Le placer comme logiciel séparé après E-CIA EXAM

Date: 10 Avril 2026
"""

import re

def fix_syscohada_as_separate(file_path):
    """
    Corrige la position de E-Syscohada pour en faire un logiciel séparé
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Étape 1: Supprimer E-Syscohada de l'intérieur de E-CIA EXAM
    print("📝 Étape 1: Suppression de E-Syscohada de l'intérieur de E-CIA EXAM...")
    
    # Pattern pour trouver et supprimer E-Syscohada (qui est actuellement dans E-CIA)
    # Il commence par une virgule et un accolade ouvrante
    pattern_syscohada = r",\s*\{\s*id: 'e-syscohada-revise',\s*label: 'E-Syscohada révisé',.*?modes: SYSCOHADA_MODES\s*\}\s*\]\s*\}"
    
    content_before = content
    content = re.sub(pattern_syscohada, '', content, flags=re.DOTALL)
    
    if content != content_before:
        print("   ✅ E-Syscohada supprimé de E-CIA EXAM")
    else:
        print("   ⚠️  E-Syscohada non trouvé dans E-CIA EXAM")
    
    # Étape 2: Trouver la vraie fin de E-CIA EXAM
    print("📝 Étape 2: Recherche de la fin de E-CIA EXAM...")
    
    # E-CIA EXAM commence par id: 'e-cia-exam-part1'
    # et se termine par la fermeture de son objet
    # On cherche le pattern: phases: [...] suivi de }
    
    # Trouver E-CIA EXAM
    ecia_start = content.find("id: 'e-cia-exam-part1'")
    if ecia_start == -1:
        print("   ❌ E-CIA EXAM non trouvé")
        return False
    
    print(f"   ✓ E-CIA EXAM trouvé à la position {ecia_start}")
    
    # Chercher la fin de E-CIA EXAM
    # On compte les accolades ouvrantes et fermantes
    brace_count = 0
    in_ecia = False
    ecia_end = -1
    
    for i in range(ecia_start, len(content)):
        char = content[i]
        
        if char == '{':
            if not in_ecia:
                in_ecia = True
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if in_ecia and brace_count == 0:
                ecia_end = i + 1
                break
    
    if ecia_end == -1:
        print("   ❌ Fin de E-CIA EXAM non trouvée")
        return False
    
    print(f"   ✅ Fin de E-CIA EXAM trouvée à la position {ecia_end}")
    
    # Étape 3: Insérer E-Syscohada comme logiciel séparé après E-CIA EXAM
    print("📝 Étape 3: Insertion de E-Syscohada comme logiciel séparé...")
    
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
    
    # Insérer après E-CIA EXAM
    content = content[:ecia_end] + syscohada_structure + content[ecia_end:]
    print("   ✅ E-Syscohada inséré comme logiciel séparé après E-CIA EXAM")
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Corrections appliquées avec succès!")
    print("\n📋 Résumé:")
    print("   - E-Syscohada retiré de l'intérieur de E-CIA EXAM")
    print("   - E-Syscohada ajouté comme logiciel séparé après E-CIA EXAM")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier les diagnostics TypeScript")
    print("   2. Tester l'interface")
    
    return True

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 Correction de E-Syscohada révisé - Logiciel séparé")
    print("=" * 70)
    print()
    
    try:
        success = fix_syscohada_as_separate(file_path)
        if not success:
            print("\n❌ Échec de la correction")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
