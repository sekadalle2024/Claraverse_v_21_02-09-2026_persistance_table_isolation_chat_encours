#!/usr/bin/env python3
"""
Script pour ajouter les modes aux dernières étapes
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacements = [
        # Programme de controle des comptes
        {
            'old': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Modele] : Cycle, Domaines, Test, Controle audit, Objectif, Evaluation globale des risques, Echantillon
[Programme standard]
[Modelisation] : les informations des rapprochements bancaires
[Contexte de base]
[Integration] = Programme_controle_comptes
[Demo] = Activate`
              }
            ]
          }
        ]
      },
      {
        id: 'revue-analytique',''',
            'new': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Modele] : Cycle, Domaines, Test, Controle audit, Objectif, Evaluation globale des risques, Echantillon
[Programme standard]
[Modelisation] : les informations des rapprochements bancaires
[Contexte de base]
[Integration] = Programme_controle_comptes
[Demo] = Activate`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Modele] : Cycle, Domaines, Test, Controle audit, Objectif, Evaluation globale des risques, Echantillon
[Programme standard]
[Modelisation] : les informations des rapprochements bancaires
[Contexte de base]
[Integration] = Programme_controle_comptes
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Modele] : Cycle, Domaines, Test, Controle audit, Objectif, Evaluation globale des risques, Echantillon
[Programme standard]
[Modelisation] : les informations des rapprochements bancaires
[Contexte de base]
[Integration] = Programme_controle_comptes
[Guide des commandes] : Activate`
              }
            ]
          }
        ]
      },
      {
        id: 'revue-analytique','''
        },
        # Revue analytique générale
        {
            'old': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              }
            ]
          },
          {
            id: 'analyse-variations',''',
            'new': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = 
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'analyse-variations','''
        }
    ]
    
    for i, repl in enumerate(replacements, 1):
        if repl['old'] in content:
            content = content.replace(repl['old'], repl['new'])
            print(f"✓ Remplacement {i} effectué")
        else:
            print(f"✗ Remplacement {i} non trouvé")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✓ Fichier sauvegardé")

if __name__ == '__main__':
    process_file()
