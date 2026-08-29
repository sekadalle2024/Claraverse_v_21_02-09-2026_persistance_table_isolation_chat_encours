#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour mettre à jour le Programme de contrôle des comptes dans E-revision
Remplace les modes Normal, Demo, Methodo revision, Guide des commandes
par des modes basés sur les cycles opérationnels avec niveaux de risque

Date: 31 Mars 2026
Auteur: Kiro AI Assistant
"""

import re
import sys

# Définition des cycles opérationnels et leurs assertions selon le niveau de risque
CYCLES_OPERATIONNELS = {
    'tresorerie': {
        'label': 'Trésorerie',
        'processus': 'trésorerie',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'ventes': {
        'label': 'Ventes',
        'processus': 'ventes',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'stocks': {
        'label': 'Stocks',
        'processus': 'stocks',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    },
    'capitaux-propres': {
        'label': 'Capitaux propres',
        'processus': 'capitaux propres',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Présentation']
        }
    },
    'achats': {
        'label': 'Achats',
        'processus': 'achats',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'immobilisations': {
        'label': 'Immobilisations',
        'processus': 'immobilisations',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    },
    'personnel': {
        'label': 'Personnel',
        'processus': 'personnel',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'emprunts': {
        'label': 'Emprunts',
        'processus': 'emprunts',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Évaluation']
        }
    }
}

def generate_mode_for_cycle_risk(cycle_id, cycle_data, risk_level):
    """
    Génère un mode pour un cycle et un niveau de risque donnés
    """
    assertions = ', '.join(cycle_data['risques'][risk_level])
    
    mode = {
        'id': f'{cycle_id}-{risk_level.lower()}',
        'label': f'{cycle_data["label"]} - Risque {risk_level}',
        'command': f"""[Command] : Programme_controle_comptes
[Processus] : {cycle_data['processus']}
[Niveau de risque R] = {risk_level[-1]}
[Assertion] = {assertions}"""
    }
    
    return mode

def generate_all_modes():
    """
    Génère tous les modes pour tous les cycles et niveaux de risque
    """
    modes = []
    
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        for risk_level in ['R1', 'R2', 'R3']:
            mode = generate_mode_for_cycle_risk(cycle_id, cycle_data, risk_level)
            modes.append(mode)
    
    return modes

def format_mode_as_tsx(mode):
    """
    Formate un mode en syntaxe TypeScript/TSX
    """
    return f"""              {{
                id: '{mode['id']}',
                label: '{mode['label']}',
                command: `{mode['command']}`
              }}"""

def update_programme_controle_comptes(content):
    """
    Met à jour la section Programme de contrôle des comptes
    """
    print("🔍 Recherche de la section 'Programme de controle des comptes'...")
    
    # Pattern pour trouver la section complète
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
    print("📝 Génération des nouveaux modes...")
    
    # Générer tous les modes
    modes = generate_all_modes()
    print(f"✅ {len(modes)} modes générés ({len(CYCLES_OPERATIONNELS)} cycles × 3 niveaux de risque)")
    
    # Formater les modes en TSX
    modes_tsx = ',\n'.join([format_mode_as_tsx(mode) for mode in modes])
    
    # Construire le nouveau contenu
    new_section = f"""{match.group(1)}
{modes_tsx}
{match.group(2)}"""
    
    # Remplacer dans le contenu
    content = re.sub(pattern, new_section, content, flags=re.DOTALL)
    
    print("✅ Section mise à jour avec succès")
    
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
    print("\n🔄 Mise à jour du Programme de contrôle des comptes...")
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
    print("\n✅ Modes supprimés:")
    print("   - Normal")
    print("   - Demo")
    print("   - Methodo revision")
    print("   - Guide des commandes")
    print("\n✅ Nouveaux modes ajoutés (par cycle opérationnel):")
    
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        print(f"\n   📊 {cycle_data['label']}:")
        for risk_level in ['R1', 'R2', 'R3']:
            assertions = ', '.join(cycle_data['risques'][risk_level])
            print(f"      • Risque {risk_level[-1]}: {assertions}")
    
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    print(f"   • Cycles opérationnels: {len(CYCLES_OPERATIONNELS)}")
    print(f"   • Niveaux de risque par cycle: 3 (R=1, R=2, R=3)")
    print(f"   • Total de modes créés: {len(CYCLES_OPERATIONNELS) * 3}")
    print("\n" + "=" * 70)
    print("⚠️  PROCHAINES ÉTAPES")
    print("=" * 70)
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-revision > Programme de contrôle des comptes")
    print("   3. Vérifier que tous les cycles s'affichent correctement")
    print("   4. Tester quelques commandes générées")
    print("=" * 70)

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 MISE À JOUR PROGRAMME DE CONTRÔLE DES COMPTES")
    print("=" * 70)
    print("   Remplacement des modes par cycles opérationnels")
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
