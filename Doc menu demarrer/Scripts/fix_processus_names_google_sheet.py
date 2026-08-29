#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour corriger les noms de processus dans la Matrice de contrôle des comptes
Utilise les noms exacts de la Google Sheet pour la recherche de données

Date: 31 Mars 2026
Auteur: Kiro AI Assistant
"""

import re
import sys

# Mapping des anciens noms vers les noms exacts de la Google Sheet
PROCESSUS_MAPPING = {
    'trésorerie': 'Trésorerie',
    'ventes': 'Ventes',
    'stocks': 'Stock',
    'capitaux propres': 'capitaux propres',
    'achats': 'fournisseur',
    'immobilisations': 'Immobilisations',
    'personnel': 'personnel',
    'emprunts': 'client'
}

# Nouveaux processus à ajouter
NOUVEAUX_PROCESSUS = {
    'impot-taxes': {
        'label': 'Impôt et taxes',
        'processus': 'impôt et taxes',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    },
    'charge-exploitation': {
        'label': 'Charge d\'exploitation',
        'processus': 'charge d\'exploitation',
        'risques': {
            'R1': ['Validité'],
            'R2': ['Validité', 'Exhaustivité'],
            'R3': ['Validité', 'Exhaustivité', 'Comptabilisation', 'Séparation des périodes']
        }
    }
}

def fix_processus_names(content):
    """
    Corrige les noms de processus pour correspondre aux noms de la Google Sheet
    """
    print("🔍 Recherche et correction des noms de processus...")
    
    modifications = 0
    
    # Corriger chaque processus
    for old_name, new_name in PROCESSUS_MAPPING.items():
        # Pattern pour trouver [Processus] : ancien_nom
        pattern = rf'\[Processus\] : {re.escape(old_name)}'
        replacement = f'[Processus] : {new_name}'
        
        # Compter les occurrences
        count = len(re.findall(pattern, content))
        if count > 0:
            content = re.sub(pattern, replacement, content)
            print(f"   ✅ '{old_name}' → '{new_name}' ({count} occurrences)")
            modifications += count
    
    print(f"\n✅ {modifications} noms de processus corrigés")
    
    return content

def add_new_processus_modes(content):
    """
    Ajoute les nouveaux processus (Impôt et taxes, Charge d'exploitation)
    """
    print("\n🔍 Ajout des nouveaux processus...")
    
    # Trouver la fin des modes existants (avant la fermeture de modes)
    pattern = r'(\[Assertion\] = Validité, Exhaustivité, Comptabilisation, Évaluation`\s+\}\s+)(\]\s+\})'
    
    # Vérifier si le pattern existe
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print("❌ Impossible de trouver l'emplacement pour ajouter les nouveaux processus")
        return content
    
    print("✅ Emplacement trouvé")
    
    # Générer les modes pour les nouveaux processus
    new_modes = []
    
    for processus_id, processus_data in NOUVEAUX_PROCESSUS.items():
        for risk_level in ['R1', 'R2', 'R3']:
            assertions = ', '.join(processus_data['risques'][risk_level])
            mode = f""",
              {{
                id: '{processus_id}-{risk_level.lower()}',
                label: '{processus_data["label"]} - Risque {risk_level[-1]}',
                command: `[Command] : Programme_controle_comptes
[Processus] : {processus_data['processus']}
[Niveau de risque R] = {risk_level[-1]}
[Assertion] = {assertions}`
              }}"""
            new_modes.append(mode)
    
    # Insérer les nouveaux modes
    new_content = match.group(1) + ''.join(new_modes) + '\n' + match.group(2)
    content = re.sub(pattern, new_content, content, flags=re.DOTALL)
    
    print(f"✅ {len(new_modes)} nouveaux modes ajoutés")
    
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
    
    # Corriger les noms de processus
    print("\n🔄 Correction des noms de processus...")
    content = fix_processus_names(content)
    
    # Ajouter les nouveaux processus
    content = add_new_processus_modes(content)
    
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
    print("\n✅ Noms de processus corrigés (pour Google Sheet):")
    for old_name, new_name in PROCESSUS_MAPPING.items():
        print(f"   • '{old_name}' → '{new_name}'")
    
    print("\n✅ Nouveaux processus ajoutés:")
    for processus_id, processus_data in NOUVEAUX_PROCESSUS.items():
        print(f"   • {processus_data['label']} (3 niveaux de risque)")
    
    print("\n" + "=" * 70)
    print("📊 STATISTIQUES")
    print("=" * 70)
    print(f"   • Processus corrigés: {len(PROCESSUS_MAPPING)}")
    print(f"   • Nouveaux processus: {len(NOUVEAUX_PROCESSUS)}")
    print(f"   • Total de processus: {len(PROCESSUS_MAPPING) + len(NOUVEAUX_PROCESSUS)}")
    print(f"   • Total de modes: {(len(PROCESSUS_MAPPING) + len(NOUVEAUX_PROCESSUS)) * 3}")
    
    print("\n" + "=" * 70)
    print("📝 NOMS EXACTS POUR GOOGLE SHEET")
    print("=" * 70)
    all_processus = list(PROCESSUS_MAPPING.values()) + [p['processus'] for p in NOUVEAUX_PROCESSUS.values()]
    for i, processus in enumerate(all_processus, 1):
        print(f"   {i}. {processus}")
    
    print("\n" + "=" * 70)
    print("⚠️  PROCHAINES ÉTAPES")
    print("=" * 70)
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-revision")
    print("   3. Vérifier que les noms correspondent à la Google Sheet")
    print("=" * 70)

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("🚀 CORRECTION DES NOMS DE PROCESSUS")
    print("=" * 70)
    print("   Mise à jour pour correspondre aux noms de la Google Sheet")
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
