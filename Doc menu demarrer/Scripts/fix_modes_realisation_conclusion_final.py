#!/usr/bin/env python3
"""
Script pour ajouter CORRECTEMENT les modes [Mode Document] et [Mode Database] 
aux étapes de mission des phases de réalisation et conclusion d'E-audit pro

Ce script corrige le problème : les modes n'ont pas été ajoutés aux bonnes étapes

Date : 10 avril 2026
"""

import re
import sys

def add_modes_to_etape(etape_content, etape_id):
    """
    Ajoute les modes Document et Database après le mode 'avance' d'une étape
    """
    # Chercher le mode 'avance'
    avance_pattern = r"(\s+\{\s+id: 'avance',\s+label: 'Avancé',\s+command: `([^`]+)`\s+\})"
    
    match = re.search(avance_pattern, etape_content, re.DOTALL)
    if not match:
        print(f"  ⚠ Pas de mode 'avance' trouvé pour {etape_id}")
        return etape_content
    
    avance_block = match.group(1)
    command = match.group(2)
    
    # Vérifier si les modes Document/Database existent déjà
    if "label: 'Mode Document'" in etape_content:
        print(f"  ✓ Modes déjà présents pour {etape_id}")
        return etape_content
    
    # Créer la commande pour Mode Document
    # Trouver la dernière ligne avant la fin de la commande
    lines = command.split('\n')
    last_line_idx = len(lines) - 1
    
    # Insérer [Router] = Document avant la dernière ligne
    document_lines = lines[:]
    document_lines.insert(last_line_idx, '[Router] = Document')
    document_command = '\n'.join(document_lines)
    
    # Créer la commande pour Mode Database
    database_lines = lines[:]
    database_lines.insert(last_line_idx, '[Router] = Database')
    database_lines.insert(last_line_idx + 1, '[User_id] = ohada')
    database_lines.insert(last_line_idx + 2, '[Database] = workspace_02')
    database_command = '\n'.join(database_lines)
    
    # Construire les nouveaux blocs
    document_block = f''',
              {{
                id: 'document',
                label: 'Mode Document',
                command: `{document_command}`
              }}'''
    
    database_block = f''',
              {{
                id: 'database',
                label: 'Mode Database',
                command: `{database_command}`
              }}'''
    
    # Remplacer le bloc avance par avance + document + database
    new_content = etape_content.replace(
        avance_block,
        avance_block + document_block + database_block
    )
    
    print(f"  ✓ Modes ajoutés pour {etape_id}")
    return new_content

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Liste des étapes à modifier dans les phases de réalisation et conclusion
    etapes_to_fix = [
        'frap',
        'synthese-frap',
        'rapport-provisoire',
        'rapport-final',
        'suivi-recos'
    ]
    
    print("\nAjout des modes aux étapes de la phase de conclusion...")
    for etape_id in etapes_to_fix:
        # Trouver l'étape
        pattern = f"id: '{etape_id}',"
        start_idx = content.find(pattern)
        
        if start_idx == -1:
            print(f"  ⚠ Étape {etape_id} non trouvée")
            continue
        
        # Trouver la fin de l'étape (prochain "id:" au même niveau ou fin de array)
        # Chercher le prochain "}, {" ou "}]" qui marque la fin de l'étape
        end_pattern = r'\n\s+\}\s*(?:,\s*\{|\])'
        end_match = re.search(end_pattern, content[start_idx:])
        
        if not end_match:
            print(f"  ⚠ Fin de l'étape {etape_id} non trouvée")
            continue
        
        end_idx = start_idx + end_match.start() + len(end_match.group(0)) - 2
        
        # Extraire le contenu de l'étape
        etape_content = content[start_idx:end_idx]
        
        # Ajouter les modes
        new_etape_content = add_modes_to_etape(etape_content, etape_id)
        
        # Remplacer dans le contenu
        content = content[:start_idx] + new_etape_content + content[end_idx:]
    
    if content == original_content:
        print("\n⚠ Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"\nÉcriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓ Fichier mis à jour avec succès!")
    print(f"✓ Les modes 'Mode Document' et 'Mode Database' ont été ajoutés aux étapes de la phase de conclusion")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        success = process_file(filepath)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
