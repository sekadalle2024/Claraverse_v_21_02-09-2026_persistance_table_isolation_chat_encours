#!/usr/bin/env python3
"""
Script pour ajouter le mode [Mode Document] 
à TOUTES les étapes de mission d'E-controle pro

[Mode Document] : Permet d'envoyer des documents en pièces jointes au Workflow n8n

Formule [Mode Document] :
- Basé sur le mode avancé + ajout de [Router] = Document avant [Nb de lignes]
- Si le mode avancé n'existe pas, utiliser le mode normal
"""

import re
import sys

def add_document_mode(content):
    """
    Ajoute le mode Document après chaque mode 'avance' ou 'guide-commandes' 
    dans E-controle pro uniquement
    """
    # Trouver la section E-controle pro
    e_controle_start = content.find("id: 'e-controle'")
    if e_controle_start == -1:
        print("Section E-controle pro non trouvée")
        return content
    
    # Trouver la fin de la section E-controle pro (début de la section suivante)
    next_logiciel = content.find("id: 'e-cia-exam-part1'", e_controle_start)
    if next_logiciel == -1:
        # Chercher un autre logiciel
        next_logiciel = content.find("id: 'e-carto'", e_controle_start)
    
    if next_logiciel == -1:
        # Si c'est le dernier logiciel, prendre jusqu'à la fin
        e_controle_section = content[e_controle_start:]
        e_controle_end = len(content)
    else:
        e_controle_section = content[e_controle_start:next_logiciel]
        e_controle_end = e_controle_start + len(e_controle_section)
    
    print(f"Section E-controle pro trouvée de {e_controle_start} à {e_controle_end}")
    
    # Pattern pour trouver un bloc de mode guide-commandes avec ses variables
    # On cherche le pattern qui se termine par [Nb de lignes] = X`
    pattern = r'''(\s+\{
\s+id: 'guide-commandes',
\s+label: 'Guide des commandes',
\s+command: `([^`]+)`
\s+\})'''
    
    modifications_count = 0
    
    def replacer(match):
        nonlocal modifications_count
        guide_block = match.group(1)
        command = match.group(2)
        
        # Vérifier si [Nb de lignes] existe
        if '[Nb de lignes]' not in command:
            # Si pas de [Nb de lignes], ajouter [Router] à la fin
            document_command = command + '\n[Router] = Document'
        else:
            # Ajouter [Router] = Document avant [Nb de lignes]
            document_command = command.replace(
                '[Nb de lignes]',
                '[Router] = Document\n[Nb de lignes]'
            )
        
        # Construire le nouveau bloc
        document_block = f''',
              {{
                id: 'document',
                label: 'Mode Document',
                command: `{document_command}`
              }}'''
        
        modifications_count += 1
        return guide_block + document_block
    
    # Appliquer le remplacement uniquement à la section E-controle pro
    before_e_controle = content[:e_controle_start]
    e_controle_modified = re.sub(pattern, replacer, e_controle_section, flags=re.DOTALL)
    after_e_controle = content[e_controle_end:]
    
    print(f"✓ {modifications_count} étapes de mission modifiées")
    
    return before_e_controle + e_controle_modified + after_e_controle

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Ajouter le mode à E-controle pro
    print("Ajout du mode 'Mode Document' à E-controle pro...")
    content = add_document_mode(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Le mode 'Mode Document' a été ajouté à toutes les étapes de mission d'E-controle pro")
    
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
