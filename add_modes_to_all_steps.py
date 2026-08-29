#!/usr/bin/env python3
"""
Script pour ajouter les modes 'Methodo audit' et 'Guide des commandes' 
à TOUTES les étapes qui ont des modes (avance, demo, ou normal)
"""

import re
import sys

def add_modes_after_avance(content):
    """
    Ajoute les deux nouveaux modes après chaque mode 'avance'
    """
    # Pattern pour trouver un bloc de mode avancé suivi de la fermeture des modes
    pattern = r'''(\s+\{
\s+id: 'avance',
\s+label: 'Avancé',
\s+command: `[^`]+`
\s+\})
(\s+\])'''
    
    def replacer(match):
        avance_block = match.group(1)
        closing_bracket = match.group(2)
        
        # Extraire la commande du mode avancé
        command_match = re.search(r'command: `([^`]+)`', avance_block, re.DOTALL)
        if not command_match:
            return match.group(0)
        
        command = command_match.group(1)
        
        # Créer les nouveaux modes en ajoutant la variable appropriée
        # Trouver où insérer la nouvelle variable (avant [Nb de lignes] ou à la fin)
        if '[Nb de lignes]' in command:
            # Insérer avant [Nb de lignes]
            methodo_command = command.replace('[Nb de lignes]', '[Guide Methodo] : Activate\n[Nb de lignes]')
            guide_command = command.replace('[Nb de lignes]', '[Guide des commandes] : Activate\n[Nb de lignes]')
        else:
            # Ajouter à la fin
            methodo_command = command + '\n[Guide Methodo] : Activate'
            guide_command = command + '\n[Guide des commandes] : Activate'
        
        # Construire les nouveaux blocs
        methodo_block = f''',
              {{
                id: 'methodo',
                label: 'Methodo audit',
                command: `{methodo_command}`
              }}'''
        
        guide_block = f''',
              {{
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `{guide_command}`
              }}'''
        
        return avance_block + methodo_block + guide_block + closing_bracket
    
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

def add_modes_after_demo(content):
    """
    Ajoute les deux nouveaux modes après chaque mode 'demo'
    """
    # Pattern pour trouver un bloc de mode demo suivi de la fermeture des modes
    pattern = r'''(\s+\{
\s+id: 'demo',
\s+label: 'Demo',
\s+command: `[^`]+`
\s+\})
(\s+\])'''
    
    def replacer(match):
        demo_block = match.group(1)
        closing_bracket = match.group(2)
        
        # Extraire la commande du mode demo
        command_match = re.search(r'command: `([^`]+)`', demo_block, re.DOTALL)
        if not command_match:
            return match.group(0)
        
        command = command_match.group(1)
        
        # Créer les nouveaux modes en ajoutant la variable appropriée
        # Remplacer [Demo] = Activate par la nouvelle variable
        methodo_command = command.replace('[Demo] = Activate', '[Guide Methodo] : Activate')
        guide_command = command.replace('[Demo] = Activate', '[Guide des commandes] : Activate')
        
        # Si pas de [Demo], ajouter avant [Nb de lignes] ou à la fin
        if '[Demo] = Activate' not in command:
            if '[Nb de lignes]' in command:
                methodo_command = command.replace('[Nb de lignes]', '[Guide Methodo] : Activate\n[Nb de lignes]')
                guide_command = command.replace('[Nb de lignes]', '[Guide des commandes] : Activate\n[Nb de lignes]')
            else:
                methodo_command = command + '\n[Guide Methodo] : Activate'
                guide_command = command + '\n[Guide des commandes] : Activate'
        
        # Construire les nouveaux blocs
        methodo_block = f''',
              {{
                id: 'methodo',
                label: 'Methodo audit',
                command: `{methodo_command}`
              }}'''
        
        guide_block = f''',
              {{
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `{guide_command}`
              }}'''
        
        return demo_block + methodo_block + guide_block + closing_bracket
    
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

def add_modes_after_normal_only(content):
    """
    Ajoute les deux nouveaux modes après le mode 'normal' quand il n'y a pas de mode 'avance' ou 'demo'
    """
    # Pattern pour trouver un bloc avec seulement mode normal
    pattern = r'''(modes: \[
\s+\{
\s+id: 'normal',
\s+label: 'Normal',
\s+command: `[^`]+`
\s+\})
(\s+\])'''
    
    def replacer(match):
        normal_block = match.group(1)
        closing_bracket = match.group(2)
        
        # Extraire la commande du mode normal
        command_match = re.search(r'command: `([^`]+)`', normal_block, re.DOTALL)
        if not command_match:
            return match.group(0)
        
        command = command_match.group(1)
        
        # Créer les nouveaux modes en ajoutant la variable appropriée
        if '[Nb de lignes]' in command:
            methodo_command = command.replace('[Nb de lignes]', '[Guide Methodo] : Activate\n[Nb de lignes]')
            guide_command = command.replace('[Nb de lignes]', '[Guide des commandes] : Activate\n[Nb de lignes]')
        else:
            methodo_command = command + '\n[Guide Methodo] : Activate'
            guide_command = command + '\n[Guide des commandes] : Activate'
        
        # Construire les nouveaux blocs
        methodo_block = f''',
              {{
                id: 'methodo',
                label: 'Methodo audit',
                command: `{methodo_command}`
              }}'''
        
        guide_block = f''',
              {{
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `{guide_command}`
              }}'''
        
        return normal_block + methodo_block + guide_block + closing_bracket
    
    return re.sub(pattern, replacer, content, flags=re.DOTALL)

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Ajouter les modes après 'avance'
    print("Ajout des modes après 'avance'...")
    content = add_modes_after_avance(content)
    
    # Ajouter les modes après 'demo'
    print("Ajout des modes après 'demo'...")
    content = add_modes_after_demo(content)
    
    # Ajouter les modes après 'normal' seul
    print("Ajout des modes après 'normal' (quand seul)...")
    content = add_modes_after_normal_only(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        success = process_file(filepath)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
