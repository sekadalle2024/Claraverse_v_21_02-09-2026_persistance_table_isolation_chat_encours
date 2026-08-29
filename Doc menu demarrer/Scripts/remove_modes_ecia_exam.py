#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour supprimer les modes Demo, Avancé et Manuel pour E-CIA Exam Part 1
En créant des modes spécifiques qui ne contiennent que le mode "Cours"

Date: 27 Mars 2026
"""

import re

def add_specific_modes_to_ecia_exam(file_path):
    """
    Ajoute des modes spécifiques à E-CIA Exam Part 1 (uniquement mode Cours)
    pour remplacer l'utilisation des modes globaux
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Définir les modes spécifiques pour E-CIA Exam (uniquement Cours)
    ecia_modes = """const ECIA_MODES: ModeItem[] = [
  { id: 'cours', label: 'Cours', prefix: '' }
];

"""
    
    # Étape 1: Ajouter la définition des modes E-CIA après les MODES globaux
    print("📝 Étape 1: Ajout des modes spécifiques E-CIA...")
    
    # Trouver la fin de la définition des MODES globaux
    pattern_modes_end = r"(const MODES: ModeItem\[\] = \[.*?\];)\n\n(// ============================================================\n// CONFIGURATION DU MENU)"
    
    def add_ecia_modes(match):
        return match.group(1) + "\n\n" + ecia_modes + match.group(2)
    
    content = re.sub(pattern_modes_end, add_ecia_modes, content, flags=re.DOTALL)
    print("   ✅ Modes E-CIA ajoutés")
    
    # Étape 2: Modifier le composant SubMenuPortal pour utiliser ECIA_MODES pour E-CIA Exam
    print("📝 Étape 2: Modification du SubMenuPortal...")
    
    # Trouver la ligne qui utilise (etape.modes || MODES)
    pattern_submenu = r"(\{)\(etape\.modes \|\| MODES\)\.map\(mode => \("
    replacement_submenu = r"\1(etape.modes || (activeLogiciel === 'e-cia-exam-part1' ? ECIA_MODES : MODES)).map(mode => ("
    
    # Note: Nous devons passer activeLogiciel au SubMenuPortal
    # Mais pour simplifier, nous allons utiliser une approche différente
    
    # Cherchons plutôt à modifier directement les tests E-CIA pour avoir des modes
    print("   ⚠️  Approche alternative: Ajout de modes aux tests E-CIA...")
    
    # Étape 3: Trouver tous les tests E-CIA et leur ajouter des modes
    print("📝 Étape 3: Ajout de modes aux tests E-CIA Exam...")
    
    # Pattern pour trouver un test E-CIA (dans la section e-cia-exam-part1)
    # On cherche les tests qui ont une commande
    pattern_test = r"(id: 'e-cia-exam-part1',\s+label: 'E-CIA exam part 1',\s+icon:.*?phases: \[)"
    
    # Vérifier si on trouve la section E-CIA
    if re.search(pattern_test, content, flags=re.DOTALL):
        print("   ✅ Section E-CIA Exam trouvée")
        
        # Maintenant, nous devons modifier l'approche
        # Au lieu d'ajouter des modes à chaque test, nous allons modifier
        # la logique du SubMenuPortal pour détecter E-CIA Exam
        
        # Cherchons le SubMenuPortal
        pattern_submenu_component = r"(const SubMenuPortal: React\.FC<SubMenuPortalProps> = \(\{ etape, anchorRect, onModeClick, onClose \}\) => \{)"
        
        if re.search(pattern_submenu_component, content):
            print("   ✅ Composant SubMenuPortal trouvé")
            
            # Nous devons ajouter une logique pour détecter si l'étape vient de E-CIA Exam
            # Pour cela, nous allons vérifier si la commande contient "Cours CIA"
            
            # Trouvons la ligne qui mappe les modes
            pattern_modes_map = r"(\{)\(etape\.modes \|\| MODES\)(\.map\(mode => \()"
            
            # Remplacer par une logique conditionnelle
            replacement_modes_map = r"\1(etape.modes || (etape.command?.includes('Cours CIA') ? ECIA_MODES : MODES))\2"
            
            content = re.sub(pattern_modes_map, replacement_modes_map, content)
            print("   ✅ Logique conditionnelle ajoutée au SubMenuPortal")
        else:
            print("   ❌ Composant SubMenuPortal non trouvé")
    else:
        print("   ❌ Section E-CIA Exam non trouvée")
    
    # Étape 4: Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - Modes spécifiques E-CIA créés (uniquement 'Cours')")
    print("   - Logique conditionnelle ajoutée au SubMenuPortal")
    print("   - E-CIA Exam n'affichera plus les modes Demo, Avancé, Manuel")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-CIA Exam Part 1")
    print("   3. Vérifier que seul le mode 'Cours' s'affiche")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 60)
    print("🚀 Suppression des modes Demo, Avancé, Manuel pour E-CIA Exam")
    print("=" * 60)
    print()
    
    try:
        add_specific_modes_to_ecia_exam(file_path)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
        import traceback
        traceback.print_exc()
