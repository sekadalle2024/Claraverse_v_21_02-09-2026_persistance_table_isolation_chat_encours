#!/usr/bin/env python3
"""
Script pour ajouter les modes aux étapes de synthèse de mission (basés sur mode normal)
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacements = [
        # Recos revision des comptes
        {
            'old': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Recos revision des comptes
[Cycle] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs`
              }
            ]
          },
          {
            id: 'recos-controle-interne-comptable',''',
            'new': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Recos revision des comptes
[Cycle] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] : Recos revision des comptes
[Cycle] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] : Recos revision des comptes
[Cycle] : trésorerie
[test] : AA040
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'recos-controle-interne-comptable','''
        },
        # Recos contrôle interne comptable
        {
            'old': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Recos contrôle interne comptable
[Cycle] : trésorerie
[test] : AA010
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs`
              }
            ]
          },
          {
            id: 'rapport-synthese-cac',''',
            'new': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Recos contrôle interne comptable
[Cycle] : trésorerie
[test] : AA010
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] : Recos contrôle interne comptable
[Cycle] : trésorerie
[test] : AA010
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] : Recos contrôle interne comptable
[Cycle] : trésorerie
[test] : AA010
[reference] : test sur la validation du compte caisse
[Nature de test] = [Rapprochement]
[Assertion] = validité
[Anomalie] = inexistence de pièce justificatives de caisse de 600 0000 FCFA sur les petites depenses fournisseurs
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'rapport-synthese-cac','''
        },
        # Rapport de synthèse CAC
        {
            'old': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Rapport de synthèse CAC`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'e-audit-plan',''',
            'new': '''              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Rapport de synthèse CAC`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] : Rapport de synthèse CAC
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] : Rapport de synthèse CAC
[Guide des commandes] : Activate`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'e-audit-plan','''
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
