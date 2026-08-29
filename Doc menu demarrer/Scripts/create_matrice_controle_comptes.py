#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour regrouper tous les cycles dans une étape "Matrice de contrôle des comptes"
Crée une structure similaire à "Feuille de couverture implementation"

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

def generate_cycle_mode(cycle_id, cycle_data, risk_level):
    """
    Génère un mode pour un cycle et un niveau de risque
    """
    assertions = ', '.join(cycle_data['risques'][risk_level])
    
    mode = f"""              {{
                id: '{cycle_id}-{risk_level.lower()}',
                label: '{cycle_data["label"]} - Risque {risk_level[-1]}',
                command: `[Command] : Programme_controle_comptes
[Processus] : {cycle_data['processus']}
[Niveau de risque R] = {risk_level[-1]}
[Assertion] = {assertions}`
              }}"""
    
    return mode

def generate_all_modes():
    """
    Génère tous les modes pour tous les cycles (24 modes au total)
    """
    modes = []
    
    for cycle_id, cycle_data in CYCLES_OPERATIONNELS.items():
        for risk_level in ['R1', 'R2', 'R3']:
            mode = generate_cycle_mode(cycle_id, cycle_data, risk_level)
            modes.append(mode)
    
    return ',\n'.join(modes)

def create_matrice_controle_etape():
    """
    Crée l'étape "Matrice de contrôle des comptes" avec tous les modes
    """
    all_modes = generate_all_modes()
    
    etape = f"""          {{
            id: 'matrice-controle-comptes',
            label: 'Matrice de contrôle des comptes',
            icon: <CheckSquare className="w-4 h-4" />,
            modes: [
{all_modes}
            ]
          }}"""
    
    return etape

def replace_cycles_with_matrice(content):
    """
    Remplace les 8 étapes de cycles par une seule étape "Matrice de contrôle des comptes"
    """
    print("🔍 Recherche des étapes de cycles...")
    
    # Pattern pour trouver toutes les étapes de cycles (de cycle-tresorerie jusqu'à cycle-emprunts)
    pattern = r"""(\s+\},
\s+\{
\s+id: 'feuille-couverture-implementation',
.*?
\s+\]
\s+\}),
\s+\{
\s+id: 'cycle-tresorerie',
.*?
\s+id: 'cycle-emprunts',
.*?
\s+\]
\s+\}
(\s+\]
\s+\})"""
    
    # Vérifier si la section existe
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("❌ Section des cycles non trouvée")
        print("⚠️  Tentative avec un pattern alternatif...")
        
        # Pattern alternatif: chercher depuis cycle-tresorerie jusqu'à la fin des etapes
        pattern_alt = r"""(\s+\{
\s+id: 'cycle-tresorerie',
.*?
\s+id: 'cycle-emprunts',
.*?
\s+\]
\s+\})"""
        
        match_alt = re.search(pattern_alt, content, re.DOTALL)
        if not match_alt:
            print("❌ Impossible de trouver les cycles")
            return content
        
        print("✅ Cycles trouvés (pattern alternatif)")
        print("📝 Génération de l'étape 'Matrice de contrôle des comptes'...")
        
        # Générer la nouvelle étape
        matrice_etape = create_matrice_controle_etape()
        
        # Remplacer les cycles par la matrice
        content = re.sub(pattern_alt, matrice_etape, content, flags=re.DOTALL)
        
        print("✅ Étape 'Matrice de contrôle des comptes' créée")
        return content
    
    print("✅ Section trouvée")
    print("📝 Génération de l'étape 'Matrice de contrôle des comptes'...")
    
    # Générer la nouvelle étape
    matrice_etape = create_matrice_controle_etape()
    
    # Construire le nouveau contenu
    new_content = f"""{match.group(1)},
{matrice_etape}{match.group(2)}"""
    
    # Remplacer dans le contenu
    content = re.sub(pattern, new_content, content, flags=re.DOTALL)
    
    print("✅ Étape 'Matrice de contrôle des comptes' créée")
    
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
    
    # Remplacer les cycles par la matrice
    print("\n🔄 Regroupement des cycles dans 'Matrice de contrôle des comptes'...")
    content = replace_cycles_with_matrice(content)
    
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
    print("   AVANT: 8 étapes séparées (1 par cycle)")
    print("   APRÈS: 1 étape 'Matrice de contrôle des comptes' avec 24 modes")
    print("\n✅ Organisation:")
    print("   • Feuille de couverture implementation")
    print("   • Matrice de contrôle des comptes ← NOUVEAU")
    print("     ├── Trésorerie - Risque 1, 2, 3")
    print("     ├── Ventes - Risque 1, 2, 3")
    print("     ├── Stocks - Risque 1, 2, 3")
    print("     ├── Capitaux propres - Risque 1, 2, 3")
    print("     ├── Achats - Risque 1, 2, 3")
    print("     ├── Immobilisations - Risque 1, 2, 3")
    print("     ├── Personnel - Risque 1, 2, 3")
    print("     └── Emprunts - Risque 1, 2, 3")
    
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    print(f"   • Étapes créées: 1 (Matrice de contrôle des comptes)")
    print(f"   • Modes dans l'étape: 24 (8 cycles × 3 niveaux)")
    print(f"   • Position: Après 'Feuille de couverture implementation'")
    print("\n" + "=" * 70)
    print("⚠️  PROCHAINES ÉTAPES")
    print("=" * 70)
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-revision")
    print("   3. Cliquer sur 'Matrice de contrôle des comptes'")
    print("   4. Vérifier que les 24 modes s'affichent")
    print("=" * 70)

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 CRÉATION MATRICE DE CONTRÔLE DES COMPTES")
    print("=" * 70)
    print("   Regroupement de tous les cycles dans une seule étape")
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
