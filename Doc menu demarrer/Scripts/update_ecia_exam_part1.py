#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour mettre à jour E-CIA Exam Part 1
- Renommer le mode [Normal] par mode [Cours]
- Renommer la valeur de la rubrique [Command], de "cours" à "Cours CIA"

Date: 27 Mars 2026
"""

import re

def update_ecia_exam_part1(file_path):
    """
    Met à jour le mode Normal et les commandes pour E-CIA Exam Part 1
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Étape 1: Renommer le mode "Normal" en "Cours" dans le tableau MODES
    print("📝 Étape 1: Renommage du mode 'Normal' en 'Cours'...")
    
    # Pattern pour trouver le mode "normal" dans le tableau MODES
    pattern_mode = r"(\{\s*id:\s*'normal',\s*label:\s*)'Normal'(,\s*prefix:\s*''\s*\})"
    replacement_mode = r"\1'Cours'\2"
    
    content = re.sub(pattern_mode, replacement_mode, content)
    print("   ✅ Mode 'Normal' renommé en 'Cours'")
    
    # Étape 2: Remplacer toutes les occurrences de [Command] = cours par [Command] = Cours CIA
    print("📝 Étape 2: Remplacement de '[Command] = cours' par '[Command] = Cours CIA'...")
    
    # Pattern pour trouver [Command] = cours
    pattern_command = r'\[Command\]\s*=\s*cours'
    replacement_command = r'[Command] = Cours CIA'
    
    # Compter les occurrences avant remplacement
    count = len(re.findall(pattern_command, content))
    print(f"   📊 {count} occurrences trouvées")
    
    # Effectuer le remplacement
    content = re.sub(pattern_command, replacement_command, content)
    print(f"   ✅ {count} occurrences remplacées")
    
    # Étape 3: Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print(f"   - Mode 'Normal' → 'Cours'")
    print(f"   - {count} commandes '[Command] = cours' → '[Command] = Cours CIA'")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-CIA Exam Part 1")
    print("   3. Vérifier que le mode 'Cours' s'affiche correctement")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 60)
    print("🚀 Mise à jour E-CIA Exam Part 1")
    print("=" * 60)
    print()
    
    try:
        update_ecia_exam_part1(file_path)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
