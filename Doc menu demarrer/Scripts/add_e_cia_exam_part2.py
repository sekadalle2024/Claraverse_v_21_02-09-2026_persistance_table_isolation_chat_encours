#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter E-CIA EXAM PART 2 au menu Démarrer
- Ajouter E-CIA EXAM PART 2 après E-CIA EXAM PART 1
- Avant E-Syscohada révisé
- Structure complète avec Section A, B, C
- Modes: [Mode cours] et [Mode QCM]

Date: 08 Juillet 2026
"""

import re

# Structure complète de E-CIA EXAM PART 2
ECIA_PART2_STRUCTURE = """  {
    id: 'e-cia-exam-part2',
    label: 'E-CIA exam part 2',
    icon: <GraduationCap className="w-4 h-4" />,
    phases: [
      {
        id: 'section-a',
        label: 'Section A - Planification de la mission (50%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Déterminer les objectifs et le périmètre',
            icon: <Target className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Reconnaître l\\'application des Exigences thématiques',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les objectifs et le périmètre de la mission
[Points] = Reconnaître comment appliquer les Exigences thématiques lors de la détermination des objectifs et du périmètre
[Norme] = Norme 13.3 Objectifs et périmètre de la mission

[Command QCM] = QCM CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les objectifs et le périmètre de la mission
[Points] = Reconnaître comment appliquer les Exigences thématiques lors de la détermination des objectifs et du périmètre
[Norme] = Norme 13.3 Objectifs et périmètre de la mission

[Command Synthèse] = synthèse
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les objectifs et le périmètre de la mission
[Points] = Reconnaître comment appliquer les Exigences thématiques`
              },
              {
                id: 'obj1-point-b',
                reference: '1.b',
                label: 'Reconnaître les éléments d\\'élaboration des objectifs',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les objectifs et le périmètre de la mission
[Points] = Reconnaître les éléments à prendre en compte dans l'élaboration des objectifs de la mission
[Norme] = Norme 13.3 Objectifs et périmètre de la mission`
              },
              {
                id: 'obj1-point-c',
                reference: '1.c',
                label: 'Identifier et documenter les limitations de périmètre',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les objectifs et le périmètre de la mission
[Points] = Identifier et documenter les limitations de périmètre pertinentes lors de la planification
[Norme] = Norme 13.3 Objectifs et périmètre de la mission`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Déterminer les critères d\\'évaluation',
            icon: <FileCheck className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Identifier les critères pertinents',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les critères d'évaluation basés sur les informations collectées
[Points] = Identifier les critères les plus pertinents pour évaluer l'activité examinée
[Norme] = Norme 13.4 Critères d'évaluation`
              }
            ]
          },
          {
            id: 'objectif-3',
            label: 'Objectif 3 - Planifier pour évaluer risques et contrôles',
            icon: <Shield className="w-4 h-4" />,
            tests: [
              {
                id: 'obj3-point-c',
                reference: '3.c',
                label: 'Reconnaître risques cybersécurité et CGI',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Planifier la mission pour évaluer les risques et contrôles clés
[Points] = Reconnaître les risques de cybersécurité, les contrôles informatiques généraux (CGI) et les cadres de contrôle IT
[Norme] = Norme 13.2 Évaluation des risques dans le cadre de la mission`
              },
              {
                id: 'obj3-point-e',
                reference: '3.e',
                label: 'Reconnaître concepts de finance et comptabilité',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Planifier la mission pour évaluer les risques et contrôles clés
[Points] = Reconnaître les concepts de finance et de comptabilité liés à l'activité examinée
[Norme] = Norme 13.2 Évaluation des risques dans le cadre de la mission`
              }
            ]
          },
          {
            id: 'objectif-6',
            label: 'Objectif 6 - Déterminer les procédures de mission',
            icon: <ClipboardList className="w-4 h-4" />,
            tests: [
              {
                id: 'obj6-point-a',
                reference: '6.a',
                label: 'Déterminer procédures d\\'évaluation de la conception',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les procédures de mission et préparer le programme de travail
[Points] = Déterminer les procédures pour évaluer la conception des contrôles
[Norme] = Norme 13.6 Programme de travail`
              },
              {
                id: 'obj6-point-b',
                reference: '6.b',
                label: 'Identifier procédures pour tester l\\'efficacité',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section A - Planification de la mission
[Objectifs] = Déterminer les procédures de mission et préparer le programme de travail
[Points] = Identifier les procédures pour tester l'efficacité des contrôles
[Norme] = Norme 14.2 Analyses et constats potentiels de la mission`
              }
            ]
          }
        ]
      },
      {
        id: 'section-b',
        label: 'Section B - Collecte, analyse et évaluation (40%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Identifier sources d\\'information',
            icon: <FileSearch className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Déterminer méthodes pour obtenir informations',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Identifier les sources d'information pour soutenir les objectifs et procédures
[Points] = Déterminer les méthodes appropriées pour obtenir des informations (entretiens, observations, analyses)
[Norme] = Norme 14.1 Collecte d'informations pour l'analyse et l'évaluation`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Évaluer la pertinence et fiabilité des preuves',
            icon: <CheckSquare className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-b',
                reference: '2.b',
                label: 'Reconnaître facteurs impactant la fiabilité',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Évaluer la pertinence, la suffisance et la fiabilité des preuves recueillies
[Points] = Reconnaître les facteurs impactant la fiabilité des preuves
[Norme] = Norme 14.1 Collecte d'informations pour l'analyse et l'évaluation`
              }
            ]
          },
          {
            id: 'objectif-4',
            label: 'Objectif 4 - Appliquer approches analytiques',
            icon: <BarChart3 className="w-4 h-4" />,
            tests: [
              {
                id: 'obj4-point-d',
                reference: '4.d',
                label: 'Expliquer processus d\\'analyse de données',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Appliquer les approches analytiques et les techniques de cartographie de processus
[Points] = Expliquer les processus d'analyse de données (définition, collecte, normalisation, analyse, résultats)
[Norme] = Norme 14.2 Analyses et constats potentiels de la mission`
              },
              {
                id: 'obj4-point-e',
                reference: '4.e',
                label: 'Déterminer quand utiliser méthodes d\\'analyse',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Appliquer les approches analytiques et les techniques de cartographie de processus
[Points] = Déterminer quand utiliser les méthodes d'analyse diagnostique, prescriptive, prédictive ou de détection d'anomalies
[Norme] = Norme 14.2 Analyses et constats potentiels de la mission`
              }
            ]
          },
          {
            id: 'objectif-6',
            label: 'Objectif 6 - Déterminer écart entre critères et situation',
            icon: <AlertTriangle className="w-4 h-4" />,
            tests: [
              {
                id: 'obj6-point-b',
                reference: '6.b',
                label: 'Identifier causes racines et effets',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Déterminer l'écart entre les critères d'évaluation et la situation actuelle
[Points] = Identifier les causes racines et les effets potentiels des écarts
[Norme] = Norme 14.3 Évaluation des constats`
              }
            ]
          },
          {
            id: 'objectif-7',
            label: 'Objectif 7 - Préparer les documents de travail',
            icon: <FileText className="w-4 h-4" />,
            tests: [
              {
                id: 'obj7-point-a',
                reference: '7.a',
                label: 'Organiser informations dans documents',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Préparer les documents de travail
[Points] = Organiser les informations dans les documents de travail pour soutenir les conclusions
[Norme] = Norme 14.6 Documentation relative à la mission`
              },
              {
                id: 'obj7-point-d',
                reference: '7.d',
                label: 'Déterminer facteurs d\\'organisation et conservation',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section B - Collecte, analyse et évaluation des informations
[Objectifs] = Préparer les documents de travail
[Points] = Déterminer les facteurs pour organiser et conserver la documentation (exigences légales, politiques internes)
[Norme] = Norme 14.6 Documentation relative à la mission`
              }
            ]
          }
        ]
      },
      {
        id: 'section-c',
        label: 'Section C - Supervision et communication (10%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Appliquer supervision appropriée',
            icon: <Users className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Décrire application supervision tout au long',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une supervision appropriée tout au long de la mission
[Points] = Décrire comment la supervision s'applique tout au long des missions, y compris lors de la planification
[Norme] = Norme 12.3 Supervision et amélioration de la réalisation de la mission`
              },
              {
                id: 'obj1-point-b',
                reference: '1.b',
                label: 'Décrire responsabilités coordination affectations',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une supervision appropriée tout au long de la mission
[Points] = Décrire les responsabilités du superviseur liées à la coordination des affectations de travail
[Norme] = Norme 12.3 Supervision et amélioration de la réalisation de la mission`
              },
              {
                id: 'obj1-point-c',
                reference: '1.c',
                label: 'Décrire responsabilités revue documents',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une supervision appropriée tout au long de la mission
[Points] = Décrire les responsabilités du superviseur liées à la revue des documents de travail et des conclusions
[Norme] = Norme 14.6 Documentation relative à la mission`
              },
              {
                id: 'obj1-point-d',
                reference: '1.d',
                label: 'Décrire responsabilités évaluation performance',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une supervision appropriée tout au long de la mission
[Points] = Décrire les responsabilités du superviseur liées à l'évaluation de la performance des auditeurs
[Norme] = Norme 12.3 Supervision et amélioration de la réalisation de la mission`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Appliquer communication appropriée',
            icon: <FileText className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Déterminer méthodes communication efficaces',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une communication appropriée avec les parties prenantes tout au long de la mission
[Points] = Déterminer des méthodes de communication efficaces (formelles ou informelles, écrites ou orales)
[Norme] = Norme 11.2 Communication efficace`
              },
              {
                id: 'obj2-point-b',
                reference: '2.b',
                label: 'Identifier situations nécessitant escalade',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une communication appropriée avec les parties prenantes tout au long de la mission
[Points] = Identifier les situations qui nécessitent une remontée (escalade)
[Norme] = Norme 15.2 Confirmation de la mise en œuvre des recommandations ou plans d'action`
              },
              {
                id: 'obj2-point-c',
                reference: '2.c',
                label: 'Déterminer parties prenantes appropriées',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 2
[Section] = Section C - Supervision et communication de la mission
[Objectifs] = Appliquer une communication appropriée avec les parties prenantes tout au long de la mission
[Points] = Déterminer les parties prenantes appropriées pour la communication de la mission
[Norme] = Norme 15.1 Communication des résultats définitifs de la mission`
              }
            ]
          }
        ]
      }
    ]
  },"""

def add_ecia_part2_to_menu(file_path):
    """
    Ajoute E-CIA EXAM PART 2 entre E-CIA EXAM PART 1 et E-Syscohada révisé
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Chercher la fin de E-CIA EXAM PART 1 et avant E-Syscohada
    print("📝 Recherche de la position d'insertion...")
    
    # Pattern pour trouver la fermeture de E-CIA EXAM PART 1 et le début de E-Syscohada
    pattern = r"(    \]\n  \},\n  \{\n    id: 'e-syscohada-revise',)"
    
    if not re.search(pattern, content):
        print("❌ Pattern non trouvé - recherche du pattern alternatif...")
        # Essayer un pattern plus flexible
        pattern = r"(\n  \},\n  \{\n    id: 'e-syscohada-revise',)"
        
        if not re.search(pattern, content):
            raise ValueError("Impossible de trouver la position d'insertion")
    
    print("✅ Position d'insertion trouvée")
    
    # Insérer E-CIA EXAM PART 2
    print("📝 Insertion de E-CIA EXAM PART 2...")
    replacement = f"    ]\n  }},\n{ECIA_PART2_STRUCTURE}\n  {{\n    id: 'e-syscohada-revise',"
    
    content = re.sub(pattern, replacement, content)
    
    print("✅ E-CIA EXAM PART 2 inséré")
    
    # Vérifier que l'insertion a été faite
    if 'e-cia-exam-part2' in content:
        print("✅ Vérification: E-CIA EXAM PART 2 trouvé dans le contenu")
    else:
        raise ValueError("Erreur: E-CIA EXAM PART 2 non trouvé après insertion")
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - E-CIA EXAM PART 2 ajouté après E-CIA EXAM PART 1")
    print("   - Position: Avant E-Syscohada révisé")
    print("   - Structure complète avec:")
    print("     • Section A - Planification de la mission (50%)")
    print("       - 4 objectifs avec points détaillés")
    print("     • Section B - Collecte, analyse et évaluation (40%)")
    print("       - 5 objectifs avec points détaillés")
    print("     • Section C - Supervision et communication (10%)")
    print("       - 2 objectifs avec points détaillés")
    print("   - Modes disponibles: [Mode cours] et [Mode QCM]")
    print("   - Format identique à E-CIA EXAM PART 1")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-CIA Exam Part 2")
    print("   3. Vérifier que les sections et objectifs s'affichent")
    print("   4. Vérifier que les modes 'Cours' et 'QCM' fonctionnent")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 60)
    print("🚀 Ajout de E-CIA EXAM PART 2")
    print("=" * 60)
    print()
    
    try:
        add_ecia_part2_to_menu(file_path)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
        import traceback
        traceback.print_exc()
