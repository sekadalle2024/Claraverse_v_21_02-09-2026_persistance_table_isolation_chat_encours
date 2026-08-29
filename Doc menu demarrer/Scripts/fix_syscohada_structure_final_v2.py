#!/usr/bin/env python3
"""
Script pour corriger la structure du logiciel E-Syscohada révisé dans DemarrerMenu.tsx
Date: 10 avril 2026
Objectif: Restructurer E-Syscohada révisé avec une seule section "Liasses fiscales" 
          contenant 3 étapes de mission, chacune avec 2 modes
"""

import re
import sys
from pathlib import Path

def fix_syscohada_structure():
    """Corrige la structure E-Syscohada révisé"""
    
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Fichier non trouvé: {file_path}")
        return False
    
    print(f"📖 Lecture de {file_path}...")
    content = file_path.read_text(encoding='utf-8')
    
    # Nouvelle structure correcte pour E-Syscohada révisé
    new_syscohada_structure = """  {
    id: 'e-syscohada-revise',
    label: 'E-Syscohada révisé',
    icon: <BookOpen className="w-4 h-4" />,
    phases: [
      {
        id: 'liasses-fiscales',
        label: 'Liasses fiscales',
        etapes: [
          {
            id: 'etats-financiers-liasse-normale',
            label: 'Etats financiers - Liasse normale',
            icon: <FileText className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Mode normal',
                command: `[Command] = Etat fin
[Integration] = Base`
              },
              {
                id: 'avance',
                label: 'Mode avancé',
                command: `[Command] = Etat fin
[Integration] = Affectation du resultat`
              }
            ]
          },
          {
            id: 'etats-financiers-liasse-systeme-minimal',
            label: 'Etats financiers - Liasse système minimal',
            icon: <FileText className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Mode normal',
                command: `[Command] = Liasse système minimal
[Integration] = Base`
              },
              {
                id: 'avance',
                label: 'Mode avancé',
                command: `[Command] = Liasse système minimal
[Integration] = Affectation du resultat`
              }
            ]
          },
          {
            id: 'etats-financiers-liasse-association',
            label: 'Etats financiers - Liasse association',
            icon: <FileText className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Mode normal',
                command: `[Command] = Liasse association
[Integration] = Base`
              },
              {
                id: 'avance',
                label: 'Mode avancé',
                command: `[Command] = Liasse association
[Integration] = Affectation du resultat`
              }
            ]
          }
        ]
      }
    ]
  }"""
    
    # Pattern pour trouver toute la section E-Syscohada révisé
    pattern = r'\{\s*id:\s*[\'"]e-syscohada-revise[\'"],.*?\n  \}'
    
    # Recherche de la section
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("❌ Section E-Syscohada révisé non trouvée")
        return False
    
    print("✅ Section E-Syscohada révisé trouvée")
    print(f"📍 Position: {match.start()} - {match.end()}")
    
    # Remplacement
    new_content = content[:match.start()] + new_syscohada_structure + content[match.end():]
    
    # Sauvegarde
    print(f"💾 Sauvegarde des modifications...")
    file_path.write_text(new_content, encoding='utf-8')
    
    print("✅ Structure E-Syscohada révisé corrigée avec succès!")
    print("\n📋 Nouvelle structure:")
    print("   └─ E-Syscohada révisé")
    print("      └─ Liasses fiscales (section unique)")
    print("         ├─ Etats financiers - Liasse normale")
    print("         │  ├─ Mode normal (Base)")
    print("         │  └─ Mode avancé (Affectation du resultat)")
    print("         ├─ Etats financiers - Liasse système minimal")
    print("         │  ├─ Mode normal (Base)")
    print("         │  └─ Mode avancé (Affectation du resultat)")
    print("         └─ Etats financiers - Liasse association")
    print("            ├─ Mode normal (Base)")
    print("            └─ Mode avancé (Affectation du resultat)")
    
    return True

if __name__ == "__main__":
    print("=" * 70)
    print("🔧 CORRECTION STRUCTURE E-SYSCOHADA RÉVISÉ")
    print("=" * 70)
    print()
    
    success = fix_syscohada_structure()
    
    print()
    print("=" * 70)
    if success:
        print("✅ CORRECTION TERMINÉE AVEC SUCCÈS")
        print()
        print("📝 Prochaines étapes:")
        print("   1. Vérifier la structure dans le menu Démarrer")
        print("   2. Tester les commandes générées")
        print("   3. Valider l'affichage des modes")
    else:
        print("❌ ÉCHEC DE LA CORRECTION")
        sys.exit(1)
    print("=" * 70)
