#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger la position de E-Syscohada révisé
- Supprimer E-Syscohada mal positionné
- Le réinsérer après la vraie fin de E-CIA EXAM

Date: 10 Avril 2026
"""

import re

def fix_syscohada_position(file_path):
    """
    Corrige la position de E-Syscohada révisé
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Étape 1: Supprimer E-Syscohada mal positionné
    print("📝 Étape 1: Suppression de E-Syscohada mal positionné...")
    
    # Pattern pour trouver et supprimer E-Syscohada
    pattern_syscohada = r",\s*\{\s*id: 'e-syscohada-revise',.*?modes: SYSCOHADA_MODES\s*\}\s*\]\s*\}"
    
    content_before = content
    content = re.sub(pattern_syscohada, '', content, flags=re.DOTALL)
    
    if content != content_before:
        print("   ✅ E-Syscohada supprimé")
    else:
        print("   ⚠️  E-Syscohada non trouvé pour suppression")
    
    # Étape 2: Trouver la vraie fin de E-CIA EXAM
    print("📝 Étape 2: Recherche de la fin de E-CIA EXAM...")
    
    # E-CIA EXAM se termine par une fermeture de phases: ]
    # suivi d'une fermeture d'objet: }
    # Cherchons après le dernier objectif de E-CIA
    
    # Pattern pour trouver la fin de E-CIA EXAM
    # On cherche la structure complète de E-CIA EXAM
    pattern_ecia_end = r"(\{\s*id: 'e-cia-exam-part1',.*?)\s*\]\s*\}"
    
    match = re.search(pattern_ecia_end, content, re.DOTALL)
    if match:
        # Trouver la position de fin
        end_pos = match.end()
        print(f"   ✅ Fin de E-CIA EXAM trouvée à la position {end_pos}")
        
        # Définir la structure E-Syscohada révisé
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
        
        # Insérer E-Syscohada après E-CIA EXAM
        content = content[:end_pos] + syscohada_structure + content[end_pos:]
        print("   ✅ E-Syscohada réinséré après E-CIA EXAM")
    else:
        print("   ❌ Fin de E-CIA EXAM non trouvée")
        return False
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Corrections appliquées avec succès!")
    print("\n📋 Résumé:")
    print("   - E-Syscohada mal positionné supprimé")
    print("   - E-Syscohada réinséré après E-CIA EXAM")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier les diagnostics TypeScript")
    print("   2. Compiler le projet: npm run build")
    print("   3. Tester l'interface")
    
    return True

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🔧 Correction de la position de E-Syscohada révisé")
    print("=" * 70)
    print()
    
    try:
        success = fix_syscohada_position(file_path)
        if not success:
            print("\n❌ Échec de la correction")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
