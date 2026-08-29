#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter E-CIA EXAM PART 3 au menu Démarrer
- Ajouter E-CIA EXAM PART 3 après E-CIA EXAM PART 2
- Avant E-Syscohada révisé
- Structure complète avec Section A, B, C, D
- Modes: [Mode cours] et [Mode QCM]

Date: 09 Juillet 2026
"""

import re

# Début de la structure E-CIA EXAM PART 3 - Section A
ECIA_PART3_SECTION_A_START = """  {
    id: 'e-cia-exam-part3',
    label: 'E-CIA exam part 3',
    icon: <GraduationCap className="w-4 h-4" />,
    phases: [
      {
        id: 'section-a',
        label: 'Section A - Opérations de l\\'audit interne (25%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Méthodologies de planification et organisation',
            icon: <Target className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Méthodes de gestion des prestataires externes',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Méthodologies de planification, organisation, direction et suivi
[Points] = Méthodes de gestion des prestataires externes de services d'audit
[Norme] = Norme 9.3 Méthodologies`
              },
              {
                id: 'obj1-point-b',
                reference: '1.b',
                label: 'Méthodes de suivi des opérations d\\'audit',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Méthodologies de planification, organisation, direction et suivi
[Points] = Méthodes de suivi des opérations d'audit interne
[Norme] = Norme 12.1 Évaluation interne de la qualité`
              },
              {
                id: 'obj1-point-c',
                reference: '1.c',
                label: 'Équilibrer missions d\\'assurance et de conseil',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Méthodologies de planification, organisation, direction et suivi
[Points] = Méthodes pour équilibrer les missions d'assurance et de conseil
[Norme] = Norme 9.3 Méthodologies`
              },
              {
                id: 'obj1-point-d',
                reference: '1.d',
                label: 'Conditions de révision des méthodologies',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Méthodologies de planification, organisation, direction et suivi
[Points] = Conditions justifiant la révision des méthodologies d'audit
[Norme] = Norme 9.3 Méthodologies`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Gestion des ressources financières, humaines et technologiques',
            icon: <Cog className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Étapes et considérations du processus budgétaire',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Gestion des ressources financières, humaines et technologiques
[Points] = Étapes et considérations du processus budgétaire
[Norme] = Norme 10.1 Gestion des ressources financières`
              },
              {
                id: 'obj2-point-b',
                reference: '2.b',
                label: 'Étapes du recrutement des ressources',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Gestion des ressources financières, humaines et technologiques
[Points] = Étapes du recrutement des ressources
[Norme] = Norme 10.2 Gestion des ressources humaines`
              },
              {
                id: 'obj2-point-d',
                reference: '2.d',
                label: 'Stratégies de formation et fidélisation',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Gestion des ressources financières, humaines et technologiques
[Points] = Stratégies de formation, développement et fidélisation
[Norme] = Norme 10.2 Gestion des ressources humaines`
              },
              {
                id: 'obj2-point-f',
                reference: '2.f',
                label: 'Considérations pour les ressources technologiques',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Gestion des ressources financières, humaines et technologiques
[Points] = Considérations clés pour les ressources technologiques
[Norme] = Norme 10.3 Ressources technologiques`
              }
            ]
          },
          {
            id: 'objectif-3',
            label: 'Objectif 3 - Aligner stratégie d\\'audit avec attentes',
            icon: <Target className="w-4 h-4" />,
            tests: [
              {
                id: 'obj3-point-a',
                reference: '3.a',
                label: 'Stratégie d\\'audit et stratégie commerciale',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Aligner stratégie d'audit avec attentes des parties prenantes
[Points] = Stratégie d'audit soutient stratégie commerciale et GDR
[Norme] = Norme 9.2 Stratégie de l'audit interne`
              },
              {
                id: 'obj3-point-b',
                reference: '3.b',
                label: 'But des énoncés de mission et vision',
                processus: 'Section A',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section A - Opérations de l'audit interne
[Objectifs] = Aligner stratégie d'audit avec attentes des parties prenantes
[Points] = But des énoncés de mission et vision de l'audit interne
[Norme] = Norme 9.2 Stratégie de l'audit interne`
              }
            ]
          }
        ]
      },
      {
        id: 'section-b',
        label: 'Section B - Plan d\\'audit interne (15%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Identifier sources de missions potentielles',
            icon: <FileSearch className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Processus de définition de l\\'univers d\\'audit',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section B - Plan d'audit interne
[Objectifs] = Identifier sources de missions potentielles
[Points] = Processus de définition de l'univers d'audit
[Norme] = Norme 9.4 Plan d'audit interne`
              },
              {
                id: 'obj1-point-c',
                reference: '1.c',
                label: 'Applicabilité des Exigences thématiques',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section B - Plan d'audit interne
[Objectifs] = Identifier sources de missions potentielles
[Points] = Applicabilité des Exigences thématiques de l'IIA
[Norme] = Norme 9.4 Plan d'audit interne`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Élaboration plan d\\'audit fondé sur risques',
            icon: <Shield className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Méthodologie d\\'évaluation et hiérarchisation',
                processus: 'Section B',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section B - Plan d'audit interne
[Objectifs] = Élaboration d'un plan d'audit fondé sur les risques
[Points] = Méthodologie d'évaluation et hiérarchisation des risques
[Norme] = Norme 9.4 Plan d'audit interne`
              }
            ]
          }
        ]
      },
      {
        id: 'section-c',
        label: 'Section C - Qualité de la fonction d\\'audit interne (15%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Éléments requis du PAAQ',
            icon: <CheckSquare className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Composantes clés de l\\'assurance qualité',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section C - Qualité de la fonction d'audit interne
[Objectifs] = Éléments requis du programme d'assurance qualité (PAAQ)
[Points] = Composantes clés de l'assurance qualité
[Norme] = Norme 8.3 Qualité`
              },
              {
                id: 'obj1-point-e',
                reference: '1.e',
                label: 'Évaluations internes et externes',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section C - Qualité de la fonction d'audit interne
[Objectifs] = Éléments requis du programme d'assurance qualité (PAAQ)
[Points] = Éléments des évaluations internes et externes
[Norme] = Norme 8.3 Qualité`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Divulgation non-conformité aux Normes',
            icon: <AlertTriangle className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Informations à communiquer',
                processus: 'Section C',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section C - Qualité de la fonction d'audit interne
[Objectifs] = Divulgation appropriée de la non-conformité
[Points] = Informations qui doivent être communiquées
[Norme] = Norme 15.1 Communication résultats`
              }
            ]
          }
        ]
      },
      {
        id: 'section-d',
        label: 'Section D - Résultats de la mission et suivi (45%)',
        cycles: [
          {
            id: 'objectif-1',
            label: 'Objectif 1 - Attributs d\\'une communication efficace',
            icon: <FileText className="w-4 h-4" />,
            tests: [
              {
                id: 'obj1-point-a',
                reference: '1.a',
                label: 'Définir termes communication efficace',
                processus: 'Section D',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section D - Résultats de la mission et suivi
[Objectifs] = Attributs d'une communication efficace
[Points] = Définir termes: exactitude, objectivité, clarté, concision
[Norme] = Norme 11.2 Communication efficace`
              }
            ]
          },
          {
            id: 'objectif-2',
            label: 'Objectif 2 - Démontrer communication efficace',
            icon: <FileCheck className="w-4 h-4" />,
            tests: [
              {
                id: 'obj2-point-a',
                reference: '2.a',
                label: 'Composantes clés des rapports d\\'audit',
                processus: 'Section D',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section D - Résultats de la mission et suivi
[Objectifs] = Démontrer une communication efficace des résultats
[Points] = Composantes clés des rapports d'audit
[Norme] = Norme 15.1 Communication résultats`
              }
            ]
          },
          {
            id: 'objectif-4',
            label: 'Objectif 4 - Processus de communication de clôture',
            icon: <ClipboardList className="w-4 h-4" />,
            tests: [
              {
                id: 'obj4-point-a',
                reference: '4.a',
                label: 'Objectif de la réunion de clôture',
                processus: 'Section D',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section D - Résultats de la mission et suivi
[Objectifs] = Processus de communication de clôture et reporting
[Points] = Objectif et parties impliquées dans réunion de clôture
[Norme] = Norme 13.1 Réunion de clôture`
              }
            ]
          },
          {
            id: 'objectif-6',
            label: 'Objectif 6 - Communication acceptation des risques',
            icon: <Shield className="w-4 h-4" />,
            tests: [
              {
                id: 'obj6-point-a',
                reference: '6.a',
                label: 'Déterminer si risque inacceptable',
                processus: 'Section D',
                command: `[Command] = Cours CIA
[Partie] = partie 3
[Section] = Section D - Résultats de la mission et suivi
[Objectifs] = Communication de l'acceptation des risques
[Points] = Méthode pour déterminer si risque inacceptable
[Norme] = Norme 11.5 Communication acceptation risques`
              }
            ]
          }
        ]
      }
    ]
  },"""


# Combiner toute la structure
ECIA_PART3_STRUCTURE = ECIA_PART3_SECTION_A_START

def add_ecia_part3_to_menu(file_path):
    """
    Ajoute E-CIA EXAM PART 3 entre E-CIA EXAM PART 2 et E-Syscohada révisé
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Chercher la fin de E-CIA EXAM PART 2 et avant E-Syscohada
    print("📝 Recherche de la position d'insertion...")
    
    # Pattern pour trouver la fermeture de E-CIA EXAM PART 2
    pattern = r"(    \]\n  \},\n  \{\n    id: 'e-syscohada-revise',)"
    
    if not re.search(pattern, content):
        print("❌ Pattern non trouvé - recherche du pattern alternatif...")
        # Essayer un pattern plus flexible
        pattern = r"(\n  \},\n  \{\n    id: 'e-syscohada-revise',)"
        
        if not re.search(pattern, content):
            raise ValueError("Impossible de trouver la position d'insertion")
    
    print("✅ Position d'insertion trouvée")
    
    # Insérer E-CIA EXAM PART 3
    print("📝 Insertion de E-CIA EXAM PART 3...")
    replacement = f"    ]\n  }},\n{ECIA_PART3_STRUCTURE}\n  {{\n    id: 'e-syscohada-revise',"
    
    content = re.sub(pattern, replacement, content)
    
    print("✅ E-CIA EXAM PART 3 inséré")
    
    # Vérifier que l'insertion a été faite
    if 'e-cia-exam-part3' in content:
        print("✅ Vérification: E-CIA EXAM PART 3 trouvé dans le contenu")
    else:
        raise ValueError("Erreur: E-CIA EXAM PART 3 non trouvé après insertion")
    
    # Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - E-CIA EXAM PART 3 ajouté après E-CIA EXAM PART 2")
    print("   - Position: Avant E-Syscohada révisé")
    print("   - Structure complète avec:")
    print("     • Section A - Opérations de l'audit interne (25%)")
    print("       - 3 objectifs avec points détaillés")
    print("     • Section B - Plan d'audit interne (15%)")
    print("       - 2 objectifs avec points détaillés")
    print("     • Section C - Qualité de la fonction (15%)")
    print("       - 2 objectifs avec points détaillés")
    print("     • Section D - Résultats et suivi (45%)")
    print("       - 4 objectifs avec points détaillés")
    print("   - Modes disponibles: [Mode cours] et [Mode QCM]")
    print("   - Format identique à E-CIA EXAM PART 1 et PART 2")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-CIA Exam Part 3")
    print("   3. Vérifier que les 4 sections s'affichent correctement")
    print("   4. Vérifier que les modes 'Cours' et 'QCM' fonctionnent")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 60)
    print("🚀 Ajout de E-CIA EXAM PART 3")
    print("=" * 60)
    print()
    
    try:
        add_ecia_part3_to_menu(file_path)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
        import traceback
        traceback.print_exc()
