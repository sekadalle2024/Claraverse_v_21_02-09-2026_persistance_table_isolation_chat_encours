#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter le logiciel E-Syscohada révisé dans le bouton Démarrer
- Ajouter après E-CIA EXAM PART 1
- 3 étapes de mission avec modes normal et avancé

Date: 10 Avril 2026
"""

import re

def add_e_syscohada_revise(file_path):
    """
    Ajoute le logiciel E-Syscohada révisé avec ses 3 étapes de mission
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Définir les modes pour E-Syscohada révisé
    syscohada_modes = """
  // Modes pour E-Syscohada révisé
  const SYSCOHADA_MODES: ModeItem[] = [
    { id: 'normal', label: 'Mode normal', prefix: '[mode normal]\\n' },
    { id: 'avance', label: 'Mode avancé', prefix: '[mode avance]\\n' }
  ];
"""
    
    # Trouver où insérer les modes (après ECIA_MODES)
    print("📝 Étape 1: Ajout des modes SYSCOHADA_MODES...")
    pattern_after_ecia = r"(const ECIA_MODES: ModeItem\[\] = \[.*?\];)"
    
    if re.search(pattern_after_ecia, content, re.DOTALL):
        content = re.sub(
            pattern_after_ecia,
            r"\1" + syscohada_modes,
            content,
            flags=re.DOTALL
        )
        print("   ✅ SYSCOHADA_MODES ajouté")
    else:
        print("   ❌ Pattern ECIA_MODES non trouvé")
        return False
    
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
    
    # Trouver E-CIA EXAM PART 1 et ajouter après
    print("📝 Étape 2: Ajout de E-Syscohada révisé après E-CIA EXAM PART 1...")
    
    # Pattern pour trouver la fin de E-CIA EXAM PART 1
    pattern_ecia_end = r"(\{\s+id: 'e-cia-exam-part1',.*?phases: \[.*?\]\s+\})"
    
    if re.search(pattern_ecia_end, content, re.DOTALL):
        content = re.sub(
            pattern_ecia_end,
            r"\1" + syscohada_structure,
            content,
            flags=re.DOTALL
        )
        print("   ✅ E-Syscohada révisé ajouté après E-CIA EXAM PART 1")
    else:
        print("   ❌ Pattern E-CIA EXAM PART 1 non trouvé")
        return False
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - SYSCOHADA_MODES ajouté (2 modes: normal et avancé)")
    print("   - E-Syscohada révisé ajouté après E-CIA EXAM PART 1")
    print("   - 3 phases ajoutées:")
    print("     • Etats financiers - Liasse normale (2 étapes)")
    print("     • Etats financiers - Liasse système minimal (2 étapes)")
    print("     • Etats financiers - Liasse association (2 étapes)")
    print("   - Total: 6 étapes avec 2 modes chacune")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-Syscohada révisé")
    print("   3. Vérifier que les 3 phases s'affichent")
    print("   4. Vérifier que les modes 'Mode normal' et 'Mode avancé' fonctionnent")
    
    return True

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 70)
    print("🚀 Ajout du logiciel E-Syscohada révisé")
    print("=" * 70)
    print()
    
    try:
        success = add_e_syscohada_revise(file_path)
        if not success:
            print("\n❌ Échec de l'ajout")
            print("   Vérifiez les patterns dans le script")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
        import traceback
        traceback.print_exc()
