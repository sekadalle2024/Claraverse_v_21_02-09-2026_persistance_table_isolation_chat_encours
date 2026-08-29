#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour renommer "Methodo audit" en "Methodo revision" 
uniquement dans la section E-revision du fichier DemarrerMenu.tsx
"""

import re

def rename_methodo_in_e_revision(file_path):
    """
    Renomme "Methodo audit" en "Methodo revision" dans la section E-revision
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Trouver la section E-revision (de id: 'e-revision' jusqu'au prochain logiciel)
    # Pattern pour capturer toute la section E-revision
    pattern = r"(id: 'e-revision',.*?)((?=id: '[a-z-]+',\s+label:)|$)"
    
    def replace_in_e_revision(match):
        e_revision_section = match.group(1)
        next_section = match.group(2) if match.group(2) else ''
        
        # Dans cette section, remplacer "Methodo audit" par "Methodo revision"
        e_revision_section = e_revision_section.replace("label: 'Methodo audit'", "label: 'Methodo revision'")
        
        return e_revision_section + next_section
    
    # Appliquer le remplacement
    new_content = re.sub(pattern, replace_in_e_revision, content, flags=re.DOTALL)
    
    # Écrire le fichier modifié
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Renommage effectué avec succès")
    print("   'Methodo audit' → 'Methodo revision' dans la section E-revision")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    rename_methodo_in_e_revision(file_path)
