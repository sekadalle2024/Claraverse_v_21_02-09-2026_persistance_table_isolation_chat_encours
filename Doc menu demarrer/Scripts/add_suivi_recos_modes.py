#!/usr/bin/env python3
"""
Script pour ajouter les modes à Suivi des recos
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Suivi des recos
    old = '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table suivi_recos
[Command Manuel] = Étape mission
[Étape précédente] = Rapport final
[Étape mission] = Suivi des recos
[Modèle] = 
[Pièces jointes] = Rapport final`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'e-revision','''
    
    new = '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table suivi_recos
[Command Manuel] = Étape mission
[Étape précédente] = Rapport final
[Étape mission] = Suivi des recos
[Modèle] = 
[Pièces jointes] = Rapport final`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = /Table suivi_recos
[Command Manuel] = Étape mission
[Étape précédente] = Rapport final
[Étape mission] = Suivi des recos
[Modèle] = 
[Pièces jointes] = Rapport final
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = /Table suivi_recos
[Command Manuel] = Étape mission
[Étape précédente] = Rapport final
[Étape mission] = Suivi des recos
[Modèle] = 
[Pièces jointes] = Rapport final
[Guide des commandes] : Activate`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'e-revision','''
    
    if old in content:
        content = content.replace(old, new)
        print("✓ Suivi des recos modifié")
    else:
        print("✗ Pattern non trouvé")
    
    # Sauvegarder
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Fichier sauvegardé")

if __name__ == '__main__':
    process_file()
