#!/usr/bin/env python3
"""
Script pour ajouter une section "Template" dans la partie "Bibliothèque" d'E-audit pro

Cette section contient des tables vierges relatives aux étapes de mission,
permettant à l'utilisateur de définir sa propre méthodologie d'audit.

Templates à ajouter :
1. Template table unicolonne et ligne [mode normal]
2. Template table simple [mode normal]
3. Template table etape de mission [mode normal]
4. Template table feuille couverture et test audit [mode normal]
5. Template table Frap [mode normal]
6. Template table synthèses des frap [mode normal]
7. Template table rapport provisoire [mode normal]
8. Template table rapport final [mode normal]
9. Template table suivi des recos [mode normal]
"""

import re
import sys

def add_template_section(content):
    """
    Ajoute la section Template dans la bibliothèque d'E-audit pro
    """
    # Trouver la section Bibliothèque dans E-audit pro
    # La structure utilise 'phases' au lieu de 'items'
    bibliotheque_pattern = r"(id: 'bibliotheque',\s+label: 'Bibliothèque',\s+icon: [^,]+,\s+phases: \[)"
    
    match = re.search(bibliotheque_pattern, content, re.DOTALL)
    if not match:
        print("Section Bibliothèque non trouvée dans E-audit pro")
        return content
    
    bibliotheque_start = match.end()
    print(f"Section Bibliothèque trouvée à la position {bibliotheque_start}")
    
    # Définir la nouvelle phase Template
    template_section = """
      {
        id: 'template',
        label: 'Template',
        etapes: [
          {
            id: 'template-unicolonne',
            label: 'Template table unicolonne et ligne',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_unicolonne
[Nb de lignes] = 50`
          },
          {
            id: 'template-simple',
            label: 'Template table simple',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_simple
[Nb de lignes] = 50`
          },
          {
            id: 'template-etape-mission',
            label: 'Template table etape de mission',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_etape_de_mission
[Nb de lignes] = 50`
          },
          {
            id: 'template-feuille-couverture',
            label: 'Template table feuille couverture et test audit',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_feuille_couverture_test_audit
[Nb de lignes] = 50`
          },
          {
            id: 'template-frap',
            label: 'Template table Frap',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_frap
[Nb de lignes] = 50`
          },
          {
            id: 'template-syntheses-frap',
            label: 'Template table synthèses des frap',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_synthèses_frap
[Nb de lignes] = 50`
          },
          {
            id: 'template-rapport-provisoire',
            label: 'Template table rapport provisoire',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_rapport_provisoire
[Nb de lignes] = 50`
          },
          {
            id: 'template-rapport-final',
            label: 'Template table rapport final',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_rapport_final
[Nb de lignes] = 50`
          },
          {
            id: 'template-suivi-recos',
            label: 'Template table suivi des recos',
            icon: <FileText className="w-4 h-4" />,
            command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_suivi_recos
[Nb de lignes] = 50`
          }
        ]
      },"""
    
    # Insérer la phase Template au début de la bibliothèque
    before = content[:bibliotheque_start]
    after = content[bibliotheque_start:]
    
    modified_content = before + template_section + after
    
    print("✓ Phase Template ajoutée avec 9 templates")
    return modified_content

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Vérifier si la section Template existe déjà
    if "id: 'template'" in content:
        print("⚠ La section Template existe déjà dans le fichier")
        return False
    
    # Ajouter la section Template
    print("Ajout de la section Template dans la Bibliothèque...")
    content = add_template_section(content)
    
    if content == original_content:
        print("Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ Phase Template ajoutée dans la Bibliothèque d'E-audit pro")
    print(f"✓ 9 templates de tables vierges disponibles")
    
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
