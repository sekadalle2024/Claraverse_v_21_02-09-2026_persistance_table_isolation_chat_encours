#!/usr/bin/env python3
"""
Script pour ajouter les modes 'Methodo audit' et 'Guide des commandes' 
à TOUTES les étapes d'E-contrôle
"""

import re
import sys

def add_modes_to_e_controle(content):
    """
    Ajoute les deux nouveaux modes après chaque mode 'avance' dans E-contrôle
    """
    # Trouver la section E-contrôle
    e_controle_start = content.find("id: 'e-controle'")
    if e_controle_start == -1:
        print("Section E-contrôle non trouvée")
        return content
    
    # Trouver la fin de la section E-contrôle (début de la section suivante)
    next_logiciel = content.find("id: 'e-cia-exam-part1'", e_controle_start)
    if next_logiciel == -1:
        # Si c'est le dernier logiciel, prendre jusqu'à la fin
        e_controle_section = content[e_controle_start:]
        e_controle_end = len(content)
    else:
        e_controle_section = content[e_controle_start:next_logiciel]
        e_controle_end = e_controle_start + len(e_controle_section)
    
    print(f"Section E-contrôle trouvée de {e_controle_start} à {e_controle_end}")
    
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
    
    # Appliquer le remplacement uniquement à la section E-contrôle
    before_e_controle = content[:e_controle_start]
    e_controle_modified = re.sub(pattern, replacer, e_controle_section, flags=re.DOTALL)
    after_e_controle = content[e_controle_end:]
    
    return before_e_controle + e_controle_modified + after_e_controle

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Ajouter les modes à E-contrôle
    print("Ajout des modes 'Methodo audit' et 'Guide des commandes' à E-contrôle...")
    content = add_modes_to_e_controle(content)
    
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
