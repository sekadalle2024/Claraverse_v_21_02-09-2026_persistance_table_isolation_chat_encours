#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour mettre à jour la section REVUE ANALYTIQUE dans E-revision - DemarrerMenu.tsx

Modifications à effectuer pour la section "Revue analytique générale" :
1. Modifier le contenu du mode [Normal]
2. Ajouter le mode [Demo]
3. Supprimer le mode [Avancé]

Date : 09 Mai 2026
"""

import re
import sys

def find_revue_analytique_section(content):
    """
    Trouve la section 'revue-analytique-generale' dans le contenu
    """
    # Pattern pour trouver le début de la section revue-analytique-generale
    pattern = r"(\{\s*id: 'revue-analytique-generale',\s*label: 'Revue analytique générale',\s*icon: <BarChart3 className=\"w-4 h-4\" />,\s*modes: \[)"
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.start(), match.end()
    return None, None

def extract_modes_section(content, start_pos):
    """
    Extrait la section modes complète à partir de la position de départ
    """
    # Compter les crochets pour trouver la fin de la section modes
    bracket_count = 0
    in_modes = False
    end_pos = start_pos
    
    for i in range(start_pos, len(content)):
        char = content[i]
        if char == '[':
            bracket_count += 1
            in_modes = True
        elif char == ']':
            bracket_count -= 1
            if in_modes and bracket_count == 0:
                end_pos = i + 1
                break
    
    return content[start_pos:end_pos]

def create_new_modes_section():
    """
    Crée la nouvelle section modes avec les modifications demandées
    """
    new_modes = """modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Revue analytique
[Processus] : Trésorerie
[Données de base] = pièce jointe`
              },
              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] : Revue analytique
[Processus] : Trésorerie
[Données de base] = pièce jointe
[Demo] = Activate`
              },
              {
                id: 'methodo',
                label: 'Methodo revision',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Methodo revision] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate`
              }
            ]"""
    
    return new_modes

def update_revue_analytique_modes(content):
    """
    Met à jour la section modes de revue-analytique-generale
    """
    # Trouver le début de revue-analytique-generale
    start_marker = "id: 'revue-analytique-generale',"
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print("⚠️ Section 'revue-analytique-generale' non trouvée")
        return content, False
    
    # Trouver le début de modes: [
    modes_start = content.find("modes: [", start_idx)
    if modes_start == -1:
        print("⚠️ Section 'modes' non trouvée")
        return content, False
    
    # Trouver la fin de la section modes (le ] correspondant)
    bracket_count = 0
    modes_end = modes_start + len("modes: [")
    
    for i in range(modes_start + len("modes: ["), len(content)):
        char = content[i]
        if char == '[':
            bracket_count += 1
        elif char == ']':
            if bracket_count == 0:
                modes_end = i
                break
            bracket_count -= 1
    
    # Vérifier qu'on a trouvé la fin
    if modes_end <= modes_start:
        print("⚠️ Fin de la section 'modes' non trouvée")
        return content, False
    
    # Extraire la section avant et après
    before = content[:modes_start]
    after = content[modes_end:]
    
    # Créer la nouvelle section
    new_modes = create_new_modes_section()
    
    # Reconstruire le contenu
    new_content = before + new_modes + after
    
    print("✓ Section 'revue-analytique-generale' mise à jour")
    print("  - Mode [Normal] : Modifié")
    print("  - Mode [Demo] : Ajouté")
    print("  - Mode [Avancé] : Supprimé")
    print("  - Mode [Methodo revision] : Conservé")
    print("  - Mode [Guide des commandes] : Conservé")
    
    return new_content, True

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"\n📄 Lecture du fichier {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Erreur : Fichier {filepath} non trouvé")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la lecture : {e}")
        return False
    
    original_content = content
    
    # Mise à jour de la section revue-analytique-generale
    print("\n🔧 Mise à jour de la section 'Revue analytique générale'")
    content, success = update_revue_analytique_modes(content)
    
    if not success or content == original_content:
        print("\n⚠️ Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"\n💾 Écriture des modifications dans {filepath}...")
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture : {e}")
        return False
    
    print("\n✅ Fichier mis à jour avec succès!")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 80)
    print("🔧 MISE À JOUR SECTION REVUE ANALYTIQUE - E-REVISION")
    print("=" * 80)
    print("\nModifications à effectuer :")
    print("1. Modifier le mode [Normal] :")
    print("   [Command] : Revue analytique")
    print("   [Processus] : Trésorerie")
    print("   [Données de base] = pièce jointe")
    print("\n2. Ajouter le mode [Demo] :")
    print("   [Command] : Revue analytique")
    print("   [Processus] : Trésorerie")
    print("   [Données de base] = pièce jointe")
    print("   [Demo] = Activate")
    print("\n3. Supprimer le mode [Avancé]")
    
    try:
        success = process_file(filepath)
        
        if success:
            print("\n" + "=" * 80)
            print("✅ MODIFICATIONS TERMINÉES AVEC SUCCÈS")
            print("=" * 80)
            print("\n⚠️ Prochaines étapes :")
            print("   1. Vérifier la compilation : npm run build")
            print("   2. Tester l'interface utilisateur")
            print("   3. Vérifier les commandes générées dans le chat")
            print("   4. Tester spécifiquement E-revision > Revue analytique")
        else:
            print("\n" + "=" * 80)
            print("⚠️ AUCUNE MODIFICATION EFFECTUÉE")
            print("=" * 80)
        
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ Erreur inattendue : {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
