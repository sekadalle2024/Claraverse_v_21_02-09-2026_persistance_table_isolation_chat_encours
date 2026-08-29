#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour créer une structure hiérarchique pour le Programme de contrôle des comptes
Transforme les 24 modes plats en 8 groupes de cycles avec 3 sous-modes chacun

Date: 31 Mars 2026
Auteur: Kiro AI Assistant
"""

import re
import sys

# Définition des cycles opérationnels avec leurs niveaux de risque
CYCLES_OPERATIONNELS = {
    'tresorerie': {
        'label': 'Trésorerie',
        'processus': 'trésorerie',
        'icon': 'PiggyBank',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'ventes': {
        'label': 'Ventes',
        'processus': 'ventes',
        'icon': 'TrendingUp',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'stocks': {
        'label': 'Stocks',
        'processus': 'stocks',
        'icon': 'Package',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    },
    'capitaux-propres': {
        'label': 'Capitaux propres',
        'processus': 'capitaux propres',
        'icon': 'Building',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Présentation']
        }
    },
    'achats': {
        'label': 'Achats',
        'processus': 'achats',
        'icon': 'Receipt',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'immobilisations': {
        'label': 'Immobilisations',
        'processus': 'immobilisations',
        'icon': 'Building',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    },
    'personnel': {
        'label': 'Personnel',
        'processus': 'personnel',
        'icon': 'Users',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'emprunts': {
        'label': 'Emprunts',
        'processus': 'emprunts',
        'icon': 'Briefcase',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    }
}

def generate_cycle_structure(cycle_id, cycle_data):
    """
    Génère la structure hiérarchique pour un cycle avec ses 3 niveaux de risque
    """
    # Générer les 3 modes de risque pour ce cycle
    modes = []
    for risk_level in ['R1', 'R2', 'R3']:
        assertions = ', '.join(cycle_data['risques'][risk_level])
        mode = f"""              {{
                id: '{cycle_id}-{risk_level.lower()}',
                label: 'Risque {risk_level[-1]}',
                command: `[Command] : Programme_controle_comptes
[Processus] : {cycle_data['processus']}
[Niveau de risque R] = {risk_level[-1]}
[Assertion] = {assertions}`
              }}"""
        modes.append(mode)
    
    # Créer la structure du cycle avec ses modes
    cycle_structure = f"""          {{
            id: 'cycle-{cycle_id}',
            label: '{cycle_data['label']}',
            icon: <{cycle_data['icon']} className="w-4 h-4" />,
            modes: [
{','.join(modes)}
            ]
          }}"""
    
    return cycle_structure

def create_hierarchical_structure():
    """
    Crée la structure hiérarchique complète avec tous les cycles
    """
    cycles = []
    
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        cycle_structure = generate_cycle_structure(cycle_id, cycle_data)
        cycles.append(cycle_structure)
    
    # Créer la structure complète de la phase
    full_structure = f"""        {{
          id: 'programme-controle',
          label: 'Programme de contrôle',
          etapes: [
{','.join(cycles)}
          ]
        }}"""
    
    return full_structure

def update_programme_controle_hierarchical(content):
    """
    Met à jour la section Programme de contrôle des comptes avec la structure hiérarchique
    """
    print("🔍 Recherche de la section 'Programme de contrôle'...")
    
    # Pattern pour trouver toute la phase "Programme de contrôle"
    # On cherche depuis le début de la phase jusqu'à la phase suivante
    pattern = r"""(\s+\{
\s+id: 'programme-controle',
\s+label: 'Programme de contrôle',
\s+etapes: \[)
.*?
(\s+\]
\s+\})
(\s+\},
\s+\{
\s+id: 'revue-analytique',)"""
    
    # Vérifier si la section existe
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("❌ Section 'Programme de contrôle' non trouvée")
        print("⚠️  Tentative avec un pattern alternatif...")
        
        # Pattern alternatif: chercher juste l'étape programme-controle-comptes
        pattern_alt = r"""(\s+\{
\s+id: 'programme-controle-comptes',
\s+label: 'Programme de controle des comptes',
\s+icon: <CheckSquare className="w-4 h-4" />,
\s+modes: \[)
.*?
(\s+\]
\s+\})"""
        
        match_alt = re.search(pattern_alt, content, re.DOTALL)
        if not match_alt:
            print("❌ Impossible de trouver la section à modifier")
            return content
        
        print("✅ Section trouvée (pattern alternatif)")
        print("📝 Génération de la structure hiérarchique...")
        
        # Générer la structure hiérarchique
        hierarchical_structure = create_hierarchical_structure()
        
        # Remplacer l'ancienne structure par la nouvelle
        # On doit remplacer toute la phase, pas juste l'étape
        # Chercher la phase complète
        phase_pattern = r"""(\s+\{
\s+id: 'programme-controle',
\s+label: 'Programme de contrôle',
\s+etapes: \[
\s+\{
\s+id: 'programme-controle-comptes',)
.*?
(\s+\]
\s+\}
\s+\])
\s+\}"""
        
        phase_match = re.search(phase_pattern, content, re.DOTALL)
        if phase_match:
            new_content = hierarchical_structure
            content = re.sub(phase_pattern, new_content, content, flags=re.DOTALL)
            print("✅ Structure hiérarchique créée avec succès")
        else:
            print("⚠️  Impossible de remplacer la phase complète")
            return content
    else:
        print("✅ Section trouvée")
        print("📝 Génération de la structure hiérarchique...")
        
        # Générer la structure hiérarchique
        hierarchical_structure = create_hierarchical_structure()
        
        # Construire le nouveau contenu
        new_section = f"""{match.group(1)}
{hierarchical_structure}
{match.group(2)}{match.group(3)}"""
        
        # Remplacer dans le contenu
        content = re.sub(pattern, new_section, content, flags=re.DOTALL)
        
        print("✅ Structure hiérarchique créée avec succès")
    
    return content

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx
    """
    print(f"📖 Lecture du fichier {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé: {filepath}")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la lecture: {e}")
        return False
    
    original_content = content
    
    # Mettre à jour la section
    print("\n🔄 Création de la structure hiérarchique...")
    content = update_programme_controle_hierarchical(content)
    
    if content == original_content:
        print("⚠️  Aucune modification effectuée")
        return False
    
    # Sauvegarder le fichier
    print(f"\n💾 Écriture des modifications dans {filepath}...")
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"❌ Erreur lors de l'écriture: {e}")
        return False
    
    print("✅ Fichier mis à jour avec succès!")
    
    return True

def print_summary():
    """
    Affiche un résumé des modifications
    """
    print("\n" + "=" * 70)
    print("📋 RÉSUMÉ DES MODIFICATIONS")
    print("=" * 70)
    print("\n✅ Structure transformée:")
    print("   AVANT: 1 étape avec 24 modes plats")
    print("   APRÈS: 1 phase avec 8 cycles (sous-sections déroulantes)")
    print("\n✅ Chaque cycle contient:")
    print("   • 3 niveaux de risque (R=1, R=2, R=3)")
    print("   • Icône spécifique au cycle")
    print("   • Commandes avec assertions appropriées")
    
    print("\n📊 Cycles créés:")
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        print(f"   • {cycle_data['label']} (icône: {cycle_data['icon']})")
    
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    print(f"   • Cycles opérationnels: {len(CYCLES_OPERATIONNELS)}")
    print(f"   • Niveaux de risque par cycle: 3")
    print(f"   • Total de modes: {len(CYCLES_OPERATIONNELS) * 3}")
    print(f"   • Structure: Hiérarchique avec sous-sections déroulantes")
    print("\n" + "=" * 70)
    print("⚠️  PROCHAINES ÉTAPES")
    print("=" * 70)
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-revision > Programme de contrôle")
    print("   3. Vérifier que les cycles sont déroulants")
    print("   4. Tester l'affichage des 3 niveaux de risque par cycle")
    print("=" * 70)

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 CRÉATION STRUCTURE HIÉRARCHIQUE - PROGRAMME DE CONTRÔLE")
    print("=" * 70)
    print("   Transformation en cycles avec sous-sections déroulantes")
    print("=" * 70 + "\n")
    
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        success = process_file(filepath)
        
        if success:
            print_summary()
            sys.exit(0)
        else:
            print("\n❌ Échec de la mise à jour")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
