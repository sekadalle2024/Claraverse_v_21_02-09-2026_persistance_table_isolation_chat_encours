#!/usr/bin/env python3
"""
Script pour ajouter le mode [Mode Database] 
à TOUTES les étapes de mission d'E-controle

[Mode Database] : Permet de collecter des données de la vector store du workflow n8n

Formule [Mode Database] :
- Basé sur le mode avancé (ou mode normal si avancé n'existe pas)
- Ajout de :
  [Router] = Database
  [User_id] = ohada
  [Database] = workspace_02
  avant [Nb de lignes]
"""

import re
import sys

def add_database_mode(content):
    """
    Ajoute le mode Database après chaque mode 'document' ou 'guide-commandes' 
    dans E-controle uniquement
    """
    # Trouver la section E-controle
    e_controle_start = content.find("id: 'e-controle'")
    if e_controle_start == -1:
        print("Section E-controle non trouvée")
        return content
    
    # Trouver la fin de la section E-controle (début de la section suivante)
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
    
    print(f"Section E-controle trouvée de {e_controle_start} à {e_controle_end}")
    
    # Pattern 1: Chercher après le mode 'document' s'il existe
    pattern_document = r'''(\s+\{
\s+id: 'document',
\s+label: 'Mode Document',
\s+command: `([^`]+)`
\s+\})'''
    
    # Pattern 2: Chercher après le mode 'guide-commandes' si pas de mode document
    pattern_guide = r'''(\s+\{
\s+id: 'guide-commandes',
\s+label: 'Guide des commandes',
\s+command: `([^`]+)`
\s+\})'''
    
    # Pattern 3: Chercher après le mode 'avance' si pas de guide-commandes
    pattern_avance = r'''(\s+\{
\s+id: 'avance',
\s+label: 'Avancé',
\s+command: `([^`]+)`
\s+\})'''
    
    modifications_count = 0
    
    def replacer(match):
        nonlocal modifications_count
        mode_block = match.group(1)
        command = match.group(2)
        
        # Vérifier si le mode Database existe déjà
        if "'database'" in mode_block or "id: 'database'" in mode_block:
            return match.group(0)
        
        # Créer la commande pour Mode Database
        # Vérifier si [Nb de lignes] existe
        if '[Nb de lignes]' not in command:
            # Si pas de [Nb de lignes], ajouter les variables à la fin
            database_command = command + '\n[Router] = Database\n[User_id] = ohada\n[Database] = workspace_02'
        else:
            # Ajouter les variables avant [Nb de lignes]
            database_command = command.replace(
                '[Nb de lignes]',
                '[Router] = Database\n[User_id] = ohada\n[Database] = workspace_02\n[Nb de lignes]'
            )
        
        # Construire le nouveau bloc
        database_block = f''',
              {{
                id: 'database',
                label: 'Mode Database',
                command: `{database_command}`
              }}'''
        
        modifications_count += 1
        return mode_block + database_block
    
    # Appliquer le remplacement uniquement à la section E-controle
    before_e_controle = content[:e_controle_start]
    e_controle_modified = e_controle_section
    
    # Essayer d'abord avec le pattern document
    temp_modified = re.sub(pattern_document, replacer, e_controle_modified, flags=re.DOTALL)
    
    if temp_modified != e_controle_modified:
        e_controle_modified = temp_modified
        print(f"✓ Ajout après les modes 'document'")
    else:
        # Si pas de mode document, essayer avec guide-commandes
        modifications_count = 0
        temp_modified = re.sub(pattern_guide, replacer, e_controle_modified, flags=re.DOTALL)
        
        if temp_modified != e_controle_modified:
            e_controle_modified = temp_modified
            print(f"✓ Ajout après les modes 'guide-commandes'")
        else:
            # Si pas de guide-commandes, essayer avec avance
            modifications_count = 0
            e_controle_modified = re.sub(pattern_avance, replacer, e_controle_modified, flags=re.DOTALL)
            print(f"✓ Ajout après les modes 'avance'")
    
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
    
    # Ajouter le mode à E-controle
    print("Ajout du mode 'Mode Database' à E-controle...")
    content = add_database_mode(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Le mode 'Mode Database' a été ajouté à toutes les étapes de mission d'E-controle")
    
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
