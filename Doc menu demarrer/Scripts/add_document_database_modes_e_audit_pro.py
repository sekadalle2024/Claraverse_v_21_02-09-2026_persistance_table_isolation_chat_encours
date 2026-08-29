#!/usr/bin/env python3
"""
Script pour ajouter les modes [Mode Document] et [Mode Database] 
à TOUTES les étapes de mission d'E-audit pro

[Mode Document] : Permet d'envoyer des documents en pièces jointes au Workflow n8n
[Mode Database] : Permet de collecter des données de la vector store du workflow n8n

Formule [Mode Document] :
- Basé sur le mode avancé + ajout de [Router] = Document avant [Nb de lignes]

Formule [Mode Database] :
- Basé sur le mode avancé + ajout de :
  [Router] = Database
  [User_id] = ohada
  [Database] = workspace_02
  avant [Nb de lignes]
"""

import re
import sys

def add_document_database_modes(content):
    """
    Ajoute les modes Document et Database après chaque mode 'guide-commandes' 
    dans E-audit pro uniquement
    """
    # Trouver la section E-audit pro
    e_audit_pro_start = content.find("id: 'e-audit-pro'")
    if e_audit_pro_start == -1:
        print("Section E-audit pro non trouvée")
        return content
    
    # Trouver la fin de la section E-audit pro (début de la section suivante)
    next_logiciel = content.find("id: 'e-carto'", e_audit_pro_start)
    if next_logiciel == -1:
        # Chercher un autre logiciel
        next_logiciel = content.find("id: 'e-revision'", e_audit_pro_start)
    
    if next_logiciel == -1:
        # Si c'est le dernier logiciel, prendre jusqu'à la fin
        e_audit_section = content[e_audit_pro_start:]
        e_audit_end = len(content)
    else:
        e_audit_section = content[e_audit_pro_start:next_logiciel]
        e_audit_end = e_audit_pro_start + len(e_audit_section)
    
    print(f"Section E-audit pro trouvée de {e_audit_pro_start} à {e_audit_end}")
    
    # Pattern pour trouver un bloc de mode avancé avec ses variables
    # On cherche le pattern qui se termine par [Nb de lignes] = X`
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
        
        # Vérifier si c'est une étape de mission (contient [Etape de mission])
        if '[Etape de mission]' not in command:
            return match.group(0)
        
        # Vérifier si [Nb de lignes] existe
        if '[Nb de lignes]' not in command:
            return match.group(0)
        
        # Créer la commande pour Mode Document
        # Ajouter [Router] = Document avant [Nb de lignes]
        document_command = command.replace(
            '[Nb de lignes]',
            '[Router] = Document\n[Nb de lignes]'
        )
        
        # Créer la commande pour Mode Database
        # Ajouter [Router] = Database, [User_id] = ohada, [Database] = workspace_02 avant [Nb de lignes]
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
    
    print(f"✓ {modifications_count} étapes de mission modifiées")
    
    return before_e_audit + e_audit_modified + after_e_audit

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Ajouter les modes à E-audit pro
    print("Ajout des modes 'Mode Document' et 'Mode Database' à E-audit pro...")
    content = add_document_database_modes(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Les modes 'Mode Document' et 'Mode Database' ont été ajoutés à toutes les étapes de mission d'E-audit pro")
    
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
