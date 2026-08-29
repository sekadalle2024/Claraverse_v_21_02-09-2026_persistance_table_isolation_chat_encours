#!/usr/bin/env python3
"""
Script pour ajouter les modes à Analyse des variations
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old = '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = Analyse des variations
[Compte] = 
[Période] = 
[Seuil] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              }
            ]
          }
        ]
      },
      {
        id: 'programme-controle','''
    
    new = '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = Analyse des variations
[Compte] = 
[Période] = 
[Seuil] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = Analyse des variations
[Compte] = 
[Période] = 
[Seuil] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Analyse des variations
[Compte] = 
[Période] = 
[Seuil] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate`
              }
            ]
          }
        ]
      },
      {
        id: 'programme-controle','''
    
    if old in content:
        content = content.replace(old, new)
        print("✓ Analyse des variations modifié")
    else:
        print("✗ Pattern non trouvé")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Fichier sauvegardé")

if __name__ == '__main__':
    process_file()
