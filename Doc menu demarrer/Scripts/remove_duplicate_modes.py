#!/usr/bin/env python3
"""
Script pour supprimer les doublons de modes Document et Database
dans E-audit pro

Date : 10 avril 2026
"""

import re
import sys

def remove_duplicate_modes(content):
    """
    Supprime les doublons de modes Document et Database
    """
    # Pattern pour trouver les blocs de modes Document/Database consécutifs
    # On cherche un bloc Document suivi d'un bloc Database, puis un autre bloc Document suivi d'un autre Database
    pattern = r'''(,
              \{
                id: 'document',
                label: 'Mode Document',
                command: `[^`]+`
              \},
              \{
                id: 'database',
                label: 'Mode Database',
                command: `[^`]+`
              \})(,
              \{
                id: 'document',
                label: 'Mode Document',
                command: `[^`]+`
              \},
              \{
                id: 'database',
                label: 'Mode Database',
                command: `[^`]+`
              \})'''
    
    # Compter les doublons
    matches = list(re.finditer(pattern, content, re.DOTALL))
    print(f"Doublons trouvés : {len(matches)}")
    
    if not matches:
        return content, 0
    
    # Supprimer le deuxième bloc (le doublon)
    for match in reversed(matches):  # Reversed pour ne pas décaler les indices
        # On garde le premier bloc et on supprime le deuxième
        content = content[:match.start(2)] + content[match.end(2):]
    
    return content, len(matches)

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    print("\nSuppression des doublons de modes Document et Database...")
    content, removed_count = remove_duplicate_modes(content)
    
    if content == original_content:
        print("\n⚠ Aucun doublon trouvé")
        return False
    
    # Sauvegarder le fichier
    print(f"\nÉcriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✓ Fichier mis à jour avec succès!")
    print(f"✓ {removed_count} doublons supprimés")
    
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
