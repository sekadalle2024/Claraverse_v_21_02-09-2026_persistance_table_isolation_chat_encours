#!/usr/bin/env python3
"""
Script pour corriger les modes Template avec le format EXACT spécifié

[mode normal]
[Command] : Template_table_xxx

[mode Guide des commandes]
[Command] : Template_table_xxx
[Guide des commandes] : Activate
"""

import re
import sys

def fix_template_modes_v2(content):
    """
    Corrige les modes Template avec le format exact demandé
    """
    
    # Pattern pour trouver une étape Template avec modes
    pattern = r'''(\s+\{

\s+id: '(template-[^']+)',

\s+label: '([^']+)',

\s+icon: <FileText className="w-4 h-4" />,

\s+modes: \[

\s+\{

\s+id: 'normal',

\s+label: 'Normal',

\s+command: `\[Logiciel\] = E-audit pro
\[Etape de mission\] = Bibliothèque
\[Section\] = Template
\[Commande\] = ([^\n]+)
\[Nb de lignes\] = 50`

\s+\},

\s+\{

\s+id: 'guide-commandes',

\s+label: 'Guide des commandes',

\s+command: `\[Logiciel\] = E-audit pro
\[Etape de mission\] = Bibliothèque
\[Section\] = Template
\[Commande\] = ([^\n]+)
\[Guide des commandes\] = Activate
\[Nb de lignes\] = 50`

\s+\}

\s+\]

\s+\})'''
    
    modifications_count = 0
    
    def replacer(match):
        nonlocal modifications_count
        indent = match.group(1).split('{')[0]  # Récupérer l'indentation
        etape_id = match.group(2)
        etape_label = match.group(3)
        commande = match.group(4)
        
        # Créer la nouvelle structure avec le format EXACT
        new_structure = f'''{indent}{{
{indent}  id: '{etape_id}',
{indent}  label: '{etape_label}',
{indent}  icon: <FileText className="w-4 h-4" />,
{indent}  modes: [
{indent}    {{
{indent}      id: 'normal',
{indent}      label: 'Normal',
{indent}      command: `[Command] : {commande}`
{indent}    }},
{indent}    {{
{indent}      id: 'guide-commandes',
{indent}      label: 'Guide des commandes',
{indent}      command: `[Command] : {commande}
[Guide des commandes] : Activate`
{indent}    }}
{indent}  ]
{indent}}}'''
        
        modifications_count += 1
        return new_structure
    
    # Appliquer le remplacement
    modified_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    print(f"✓ {modifications_count} étapes Template modifiées avec le format exact")
    
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
    
    # Corriger les modes avec le format exact
    print("Correction des modes Template avec le format exact...")
    content = fix_template_modes_v2(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Format exact appliqué :")
    print(f"  [mode normal] : [Command] : Template_table_xxx")
    print(f"  [mode Guide des commandes] : [Command] : Template_table_xxx + [Guide des commandes] : Activate")
    
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
