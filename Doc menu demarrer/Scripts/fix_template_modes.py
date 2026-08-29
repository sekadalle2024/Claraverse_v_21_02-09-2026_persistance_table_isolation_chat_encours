#!/usr/bin/env python3
"""
Script pour corriger les modes de la section Template dans la Bibliothèque

Transforme la structure actuelle (command direct) en structure avec modes:
- [mode normal] : commande de base
- [mode Guide des commandes] : commande de base + [Guide des commandes] = Activate
"""

import re
import sys

def fix_template_modes(content):
    """
    Transforme chaque étape Template pour ajouter les modes normal et guide-commandes
    """
    
    # Pattern pour trouver une étape Template avec command direct
    pattern = r'''(\s+\{
\s+id: '(template-[^']+)',
\s+label: '([^']+)',
\s+icon: <FileText className="w-4 h-4" />,
\s+command: `\[Logiciel\] = E-audit pro
\[Etape de mission\] = Bibliothèque
\[Section\] = Template
\[Commande\] = ([^\n]+)
\[Nb de lignes\] = 50`
\s+\})'''
    
    modifications_count = 0
    
    def replacer(match):
        nonlocal modifications_count
        indent = match.group(1).split('{')[0]  # Récupérer l'indentation
        etape_id = match.group(2)
        etape_label = match.group(3)
        commande = match.group(4)
        
        # Créer la nouvelle structure avec modes
        new_structure = f'''{indent}{{
{indent}  id: '{etape_id}',
{indent}  label: '{etape_label}',
{indent}  icon: <FileText className="w-4 h-4" />,
{indent}  modes: [
{indent}    {{
{indent}      id: 'normal',
{indent}      label: 'Normal',
{indent}      command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = {commande}
[Nb de lignes] = 50`
{indent}    }},
{indent}    {{
{indent}      id: 'guide-commandes',
{indent}      label: 'Guide des commandes',
{indent}      command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = {commande}
[Guide des commandes] = Activate
[Nb de lignes] = 50`
{indent}    }}
{indent}  ]
{indent}}}'''
        
        modifications_count += 1
        return new_structure
    
    # Appliquer le remplacement
    modified_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    print(f"✓ {modifications_count} étapes Template modifiées")
    
    return modified_content

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Vérifier si des étapes Template existent
    if "id: 'template'" not in content:
        print("⚠ Section Template non trouvée")
        return False
    
    # Corriger les modes
    print("Correction des modes de la section Template...")
    content = fix_template_modes(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Modes [normal] et [guide-commandes] ajoutés à toutes les étapes Template")
    
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
