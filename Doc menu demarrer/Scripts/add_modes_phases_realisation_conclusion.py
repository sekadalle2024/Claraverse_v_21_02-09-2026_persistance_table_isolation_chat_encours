#!/usr/bin/env python3
"""
Script pour ajouter les modes [Mode Document] et [Mode Database] 
aux étapes de mission des phases de réalisation et conclusion d'E-audit pro

Date : 10 avril 2026
"""

import re
import sys

def add_document_database_modes_to_phases(content):
    """
    Ajoute les modes Document et Database après chaque mode 'avance' 
    dans les phases de réalisation et conclusion d'E-audit pro
    """
    # Trouver la section E-audit pro
    e_audit_pro_start = content.find("id: 'e-audit-pro'")
    if e_audit_pro_start == -1:
        print("Section E-audit pro non trouvée")
        return content
    
    # Trouver la fin de la section E-audit pro
    next_logiciel = content.find("id: 'e-carto'", e_audit_pro_start)
    if next_logiciel == -1:
        next_logiciel = content.find("id: 'e-revision'", e_audit_pro_start)
    
    if next_logiciel == -1:
        e_audit_section = content[e_audit_pro_start:]
        e_audit_end = len(content)
    else:
        e_audit_section = content[e_audit_pro_start:next_logiciel]
        e_audit_end = e_audit_pro_start + len(e_audit_section)
    
    print(f"Section E-audit pro trouvée de {e_audit_pro_start} à {e_audit_end}")
    
    # Pattern pour trouver un bloc de mode avancé avec ses variables
    pattern = r'''(\s+\{
\s+id: 'avance',
\s+label: 'Avancé',
\s+command: `([^`]+)`
\s+\})'''
    
    modifications_count = 0
    
    def replacer(match):
        nonlocal modifications_count
        avance_block = match.group(1)
        command = match.group(2)
        
        # Vérifier si [Nb de lignes] existe
        if '[Nb de lignes]' not in command:
            return match.group(0)
        
        # Créer la commande pour Mode Document
        document_command = command.replace(
            '[Nb de lignes]',
            '[Router] = Document\n[Nb de lignes]'
        )
        
        # Créer la commande pour Mode Database
        database_command = command.replace(
            '[Nb de lignes]',
            '[Router] = Database\n[User_id] = ohada\n[Database] = workspace_02\n[Nb de lignes]'
        )
        
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
        
        modifications_count += 1
        return avance_block + document_block + database_block
    
    # Appliquer le remplacement uniquement à la section E-audit pro
    before_e_audit = content[:e_audit_pro_start]
    e_audit_modified = re.sub(pattern, replacer, e_audit_section, flags=re.DOTALL)
    after_e_audit = content[e_audit_end:]
    
    print(f"✓ {modifications_count} étapes de mission modifiées dans les phases de réalisation et conclusion")
    
    return before_e_audit + e_audit_modified + after_e_audit

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Ajouter les modes aux phases de réalisation et conclusion
    print("Ajout des modes 'Mode Document' et 'Mode Database' aux phases de réalisation et conclusion...")
    content = add_document_database_modes_to_phases(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Les modes 'Mode Document' et 'Mode Database' ont été ajoutés aux phases de réalisation et conclusion d'E-audit pro")
    
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
