#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour transformer le Programme de contrôle des comptes en structure hiérarchique
Transforme 1 étape avec 24 modes plats en 8 étapes (cycles) avec 3 modes chacune

Date: 31 Mars 2026
Auteur: Kiro AI Assistant
"""

import re
import sys

# Définition des cycles opérationnels
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

def generate_cycle_etape(cycle_id, cycle_data):
    """
    Génère une étape pour un cycle avec ses 3 niveaux de risque
    """
    # Générer les 3 modes de risque
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
    
    # Créer l'étape du cycle
    etape = f"""          {{
            id: 'cycle-{cycle_id}',
            label: '{cycle_data['label']}',
            icon: <{cycle_data['icon']} className="w-4 h-4" />,
            modes: [
{',\n'.join(modes)}
            ]
          }}"""
    
    return etape

def create_all_cycle_etapes():
    """
    Crée toutes les étapes de cycles
    """
    etapes = []
    
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        etape = generate_cycle_etape(cycle_id, cycle_data)
        etapes.append(etape)
    
    return ',\n'.join(etapes)

def update_programme_controle_comptes(content):
    """
    Remplace l'étape unique avec 24 modes par 8 étapes avec 3 modes chacune
    """
    print("🔍 Recherche de la section 'Programme de controle des comptes'...")
    
    # Pattern pour trouver l'étape complète avec tous ses modes
    pattern = r"""(\s+\{
\s+id: 'programme-controle-comptes',
\s+label: 'Programme de controle des comptes',
\s+icon: <CheckSquare className="w-4 h-4" />,
\s+modes: \[)
.*?
(\s+\]
\s+\})"""
    
    # Vérifier si la section existe
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("❌ Section 'Programme de controle des comptes' non trouvée")
        return content
    
    print("✅ Section trouvée")
    print("📝 Génération des 8 étapes de cycles...")
    
    # Générer toutes les étapes de cycles
    all_etapes = create_all_cycle_etapes()
    
    # Remplacer l'ancienne étape unique par les 8 nouvelles étapes
    new_content = all_etapes
    
    # Remplacer dans le contenu
    content = re.sub(pattern, new_content, content, flags=re.DOTALL)
    
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
    print("\n🔄 Transformation en structure hiérarchique...")
    content = update_programme_controle_comptes(content)
    
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
    print("   AVANT: 1 étape 'Programme de controle des comptes' avec 24 modes")
    print("   APRÈS: 8 étapes (1 par cycle) avec 3 modes chacune")
    print("\n✅ Affichage:")
    print("   • Chaque cycle apparaît comme une étape séparée")
    print("   • Cliquer sur un cycle affiche ses 3 niveaux de risque")
    print("   • Interface plus claire et organisée")
    
    print("\n📊 Cycles créés (8 étapes):")
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        print(f"   • {cycle_data['label']} → 3 niveaux de risque (R=1, R=2, R=3)")
    
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    print(f"   • Étapes créées: {len(CYCLES_OPERATIONNELS)}")
    print(f"   • Modes par étape: 3")
    print(f"   • Total de modes: {len(CYCLES_OPERATIONNELS) * 3}")
    print(f"   • Structure: Hiérarchique avec sous-menus")
    print("\n" + "=" * 70)
    print("⚠️  PROCHAINES ÉTAPES")
    print("=" * 70)
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-revision > Programme de contrôle des comptes")
    print("   3. Vérifier que chaque cycle s'affiche séparément")
    print("   4. Cliquer sur un cycle pour voir ses 3 niveaux de risque")
    print("=" * 70)

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 TRANSFORMATION EN STRUCTURE HIÉRARCHIQUE")
    print("=" * 70)
    print("   8 cycles avec 3 niveaux de risque chacun")
    print("=" * 70 + "\n")
    
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        success = process_file(filepath)
        
        if success:
            print_summary()
            sys.exit(0)
        else:
            print("\n❌ Échec de la transformation")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
