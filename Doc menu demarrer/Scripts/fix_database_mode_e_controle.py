#!/usr/bin/env python3
"""
Script pour corriger les modes Database d'E-controle
Supprime la duplication de [Router] = Document avant [Router] = Database
"""

import re
import sys

def fix_database_modes(content):
    """
    Corrige les modes Database en supprimant [Router] = Document
    """
    # Pattern pour trouver les modes Database avec duplication
    pattern = r'''(id: 'database',\s+label: 'Mode Database',\s+command: `[^`]*)\[Router\] = Document\s+(\[Router\] = Database)'''
    
    # Compter les corrections
    corrections = len(re.findall(pattern, content, re.DOTALL))
    
    # Supprimer la duplication
    content = re.sub(pattern, r'\1\2', content, flags=re.DOTALL)
    
    print(f"✓ {corrections} duplications corrigées")
    
    return content

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Corriger les modes Database
    print("Correction des modes Database d'E-controle...")
    content = fix_database_modes(content)
    
    if content == original_content:
        print("Aucune correction nécessaire")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des corrections dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier corrigé avec succès!")
    
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
