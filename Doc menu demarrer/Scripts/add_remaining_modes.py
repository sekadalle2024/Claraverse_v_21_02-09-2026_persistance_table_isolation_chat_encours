#!/usr/bin/env python3
"""
Script pour ajouter les modes manquants de manière ciblée
"""

import re

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Liste des remplacements à faire
    replacements = [
        # Frap - E-audit pro
        {
            'old': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Frap
[Processus] = Elaboration des rapprochement bancaires
[Assertion] = validité, formalisation
[Anomalie] = les rapprochements bancaire ne sont pas verifié par le DAF
[Constat] = inexistence de rapprochement bancaires signés pour les mois de juin a decembre 2025
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              }
            ]
          },
          {
            id: 'synthese-frap',''',
            'new': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Frap
[Processus] = Elaboration des rapprochement bancaires
[Assertion] = validité, formalisation
[Anomalie] = les rapprochements bancaire ne sont pas verifié par le DAF
[Constat] = inexistence de rapprochement bancaires signés pour les mois de juin a decembre 2025
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = /Frap
[Processus] = Elaboration des rapprochement bancaires
[Assertion] = validité, formalisation
[Anomalie] = les rapprochements bancaire ne sont pas verifié par le DAF
[Constat] = inexistence de rapprochement bancaires signés pour les mois de juin a decembre 2025
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = /Frap
[Processus] = Elaboration des rapprochement bancaires
[Assertion] = validité, formalisation
[Anomalie] = les rapprochements bancaire ne sont pas verifié par le DAF
[Constat] = inexistence de rapprochement bancaires signés pour les mois de juin a decembre 2025
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'synthese-frap','''
        },
        # Synthèse des Frap
        {
            'old': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table synthese
[Command Manuel] = Étape mission
[Étape précédente] = Frap
[Étape mission] = Synthèse des Frap
[Modèle] = 
[Pièces jointes] = Frap de la mission`
              }
            ]
          },
          {
            id: 'rapport-provisoire',''',
            'new': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table synthese
[Command Manuel] = Étape mission
[Étape précédente] = Frap
[Étape mission] = Synthèse des Frap
[Modèle] = 
[Pièces jointes] = Frap de la mission`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = /Table synthese
[Command Manuel] = Étape mission
[Étape précédente] = Frap
[Étape mission] = Synthèse des Frap
[Modèle] = 
[Pièces jointes] = Frap de la mission
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = /Table synthese
[Command Manuel] = Étape mission
[Étape précédente] = Frap
[Étape mission] = Synthèse des Frap
[Modèle] = 
[Pièces jointes] = Frap de la mission
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'rapport-provisoire','''
        },
        # Rapport provisoire
        {
            'old': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table rapport_provisoire
[Command Manuel] = Étape mission
[Étape précédente] = Synthèse des Frap
[Étape mission] = Rapport provisoire
[Modèle] = 
[Pièces jointes] = Synthèse des Frap`
              }
            ]
          },
          {
            id: 'reunion-cloture',''',
            'new': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table rapport_provisoire
[Command Manuel] = Étape mission
[Étape précédente] = Synthèse des Frap
[Étape mission] = Rapport provisoire
[Modèle] = 
[Pièces jointes] = Synthèse des Frap`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = /Table rapport_provisoire
[Command Manuel] = Étape mission
[Étape précédente] = Synthèse des Frap
[Étape mission] = Rapport provisoire
[Modèle] = 
[Pièces jointes] = Synthèse des Frap
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = /Table rapport_provisoire
[Command Manuel] = Étape mission
[Étape précédente] = Synthèse des Frap
[Étape mission] = Rapport provisoire
[Modèle] = 
[Pièces jointes] = Synthèse des Frap
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'reunion-cloture','''
        },
        # Rapport final
        {
            'old': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table rapport_final
[Command Manuel] = Étape mission
[Étape précédente] = Rapport provisoire
[Étape mission] = Rapport final
[Modèle] = 
[Pièces jointes] = Rapport provisoire`
              }
            ]
          },
          {
            id: 'suivi-recos',''',
            'new': '''              {
                id: 'avance',
                label: 'Avancé',
                command: `[Command] = /Table rapport_final
[Command Manuel] = Étape mission
[Étape précédente] = Rapport provisoire
[Étape mission] = Rapport final
[Modèle] = 
[Pièces jointes] = Rapport provisoire`
              },
              {
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = /Table rapport_final
[Command Manuel] = Étape mission
[Étape précédente] = Rapport provisoire
[Etape mission] = Rapport final
[Modèle] = 
[Pièces jointes] = Rapport provisoire
[Guide Methodo] : Activate`
              },
              {
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = /Table rapport_final
[Command Manuel] = Étape mission
[Étape précédente] = Rapport provisoire
[Étape mission] = Rapport final
[Modèle] = 
[Pièces jointes] = Rapport provisoire
[Guide des commandes] : Activate`
              }
            ]
          },
          {
            id: 'suivi-recos','''
        }
    ]
    
    # Appliquer les remplacements
    for i, repl in enumerate(replacements, 1):
        if repl['old'] in content:
            content = content.replace(repl['old'], repl['new'])
            print(f"✓ Remplacement {i} effectué")
        else:
            print(f"✗ Remplacement {i} non trouvé")
    
    # Sauvegarder
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✓ Fichier sauvegardé")

if __name__ == '__main__':
    process_file()
