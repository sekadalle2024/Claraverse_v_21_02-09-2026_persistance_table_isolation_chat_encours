#!/usr/bin/env python3
"""
Script robuste pour ajouter les modes [Mode Document] et [Mode Database] 
aux étapes de la phase de conclusion d'E-audit pro

Date : 10 avril 2026
"""

import re
import sys

def add_modes_after_avance(content, etape_id):
    """
    Ajoute les modes Document et Database après le mode 'avance' d'une étape
    """
    # Pattern pour trouver le mode 'avance' avec sa commande complète
    # On cherche depuis "id: 'avance'" jusqu'à la fin du bloc (avant le prochain mode ou la fin des modes)
    pattern = rf"(id: '{etape_id}'.*?modes: \[.*?)({{[^{{]*id: 'avance',[^{{]*label: 'Avancé',[^{{]*command: `([^`]+)`[^{{]*}})"
    
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"  ⚠ Mode 'avance' non trouvé pour {etape_id}")
        return content, False
    
    before_avance = match.group(1)
    avance_block = match.group(2)
    command = match.group(3)
    
    # Vérifier si les modes existent déjà
    if "label: 'Mode Document'" in content[match.start():match.end() + 500]:
        print(f"  ✓ Modes déjà présents pour {etape_id}")
        return content, False
    
    # Créer les commandes pour Mode Document et Mode Database
    # On ajoute les variables Router avant la fin de la commande
    document_command = command + '\n[Router] = Document'
    database_command = command + '\n[Router] = Database\n[User_id] = ohada\n[Database] = workspace_02'
    
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
    new_content = content.replace(
        avance_block,
        avance_block + document_block + database_block,
        1  # Remplacer seulement la première occurrence
    )
    
    print(f"  ✓ Modes ajoutés pour {etape_id}")
    return new_content, True

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modifications_count = 0
    
    # Liste des étapes à modifier dans la phase de conclusion
    etapes_to_fix = [
        'frap',
        'synthese-frap',
        'rapport-provisoire',
        'rapport-final',
        'suivi-recos'
    ]
    
    print("\nAjout des modes aux étapes de la phase de conclusion...")
    for etape_id in etapes_to_fix:
        content, modified = add_modes_after_avance(content, etape_id)
        if modified:
            modifications_count += 1
    
    if content == original_content:
        print("\n⚠ Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"\nÉcriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓ Fichier mis à jour avec succès!")
    print(f"✓ {modifications_count} étapes modifiées")
    print(f"✓ Les modes 'Mode Document' et 'Mode Database' ont été ajoutés")
    
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
