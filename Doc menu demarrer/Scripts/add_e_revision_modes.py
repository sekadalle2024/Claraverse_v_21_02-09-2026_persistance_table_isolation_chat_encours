#!/usr/bin/env python3
"""
Script pour ajouter les modes aux étapes restantes d'E-revision
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacements = [
        # Evaluation risque
        {
            'old': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Evaluation des risques
[Processus] = Controle des rapprochements bancaires
[Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
[Matrice de criticite] = Matrice alphabetique - 4 niveau
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_cartographie
[Demo] = Activate
[Nb de lignes] = 25`
              }
            ]
          },
          {
            id: 'feuille-couverture-implementation',''',
            'new': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Evaluation des risques
[Processus] = Controle des rapprochements bancaires
[Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
[Matrice de criticite] = Matrice alphabetique - 4 niveau
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_cartographie
[Demo] = Activate
[Nb de lignes] = 25`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = Evaluation des risques
[Processus] = Controle des rapprochements bancaires
[Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
[Matrice de criticite] = Matrice alphabetique - 4 niveau
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_cartographie
[Guide Methodo] : Activate
[Nb de lignes] = 25`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Evaluation des risques
[Processus] = Controle des rapprochements bancaires
[Modele] : Sous processus, Taches cle, Assertion, risque, évaluation risque, probabilité, impact, controle audit
[Matrice de criticite] = Matrice alphabetique - 4 niveau
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_cartographie
[Guide des commandes] : Activate
[Nb de lignes] = 25`
              }
            ]
          },
          {
            id: 'feuille-couverture-implementation','''
        },
        # Feuille de couverture implementation
        {
            'old': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = voir table 2
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_programme_controle
[Demo] = Activate
[Nb de lignes] = 25`
              }
            ]
          },
          {
            id: 'programme-controle-comptes',''',
            'new': '''              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = voir table 2
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_programme_controle
[Demo] = Activate
[Nb de lignes] = 25`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = voir table 2
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_programme_controle
[Guide Methodo] : Activate
[Nb de lignes] = 25`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = Couverture
[Processus] = Controle des rapprochements bancaires
[Contrôle] = voir table 2
[Contexte de base]
[Modelisation] : les informations des rapprochements bancaires
[Integration] = Implementation_programme_controle
[Guide des commandes] : Activate
[Nb de lignes] = 25`
              }
            ]
          },
          {
            id: 'programme-controle-comptes','''
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
