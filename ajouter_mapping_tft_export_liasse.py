# -*- coding: utf-8 -*-
"""
Script pour ajouter le mapping TFT dans export_liasse.py

Ce script ajoute automatiquement:
1. Le dictionnaire MAPPING_TFT avec toutes les références
2. Le code de remplissage du TFT dans la fonction remplir_liasse_officielle()
"""

import os
import re

# Chemin du fichier à modifier
FILE_PATH = "py_backend/export_liasse.py"

# Mapping TFT à ajouter
MAPPING_TFT_CODE = '''
# Mapping TFT (Tableau des Flux de Trésorerie)
MAPPING_TFT = {
    # Trésorerie
    'ZA': 'C10',  # Trésorerie au 1er janvier
    
    # Flux opérationnels
    'FA': 'C12',  # Capacité d'Autofinancement Globale (CAFG)
    'FB': 'C13',  # Variation actif circulant HAO
    'FC': 'C14',  # Variation des stocks
    'FD': 'C15',  # Variation des créances
    'FE': 'C16',  # Variation du passif circulant
    'ZB': 'C17',  # TOTAL Flux opérationnels
    
    # Flux investissement
    'FF': 'C19',  # Décaissements acquisitions immobilisations incorporelles
    'FG': 'C20',  # Décaissements acquisitions immobilisations corporelles
    'FH': 'C21',  # Décaissements acquisitions immobilisations financières
    'FI': 'C22',  # Encaissements cessions immobilisations
    'FJ': 'C23',  # Encaissements cessions immobilisations financières
    'ZC': 'C24',  # TOTAL Flux investissement
    
    # Flux capitaux propres
    'FK': 'C26',  # Augmentation de capital
    'FL': 'C27',  # Subventions d'investissement reçues
    'FM': 'C28',  # Prélèvements sur le capital
    'FN': 'C29',  # Dividendes versés
    'ZD': 'C30',  # TOTAL Flux capitaux propres
    
    # Flux capitaux étrangers
    'FO': 'C32',  # Nouveaux emprunts
    'FP': 'C33',  # Autres dettes financières
    'FQ': 'C34',  # Remboursements
    'ZE': 'C35',  # TOTAL Flux capitaux étrangers
    
    # Totaux finaux
    'ZF': 'C36',  # TOTAL Financement (D+E)
    'ZG': 'C37',  # VARIATION TRÉSORERIE (B+C+F)
    'ZH': 'C38',  # Trésorerie au 31 Décembre
}
'''

# Code de remplissage TFT à ajouter
REMPLISSAGE_TFT_CODE = '''
    # Remplir le TABLEAU DES FLUX DE TRÉSORERIE (TFT)
    if 'TFT' in wb.sheetnames or 'TAFIRE' in wb.sheetnames:
        ws_tft = wb.get('TFT', wb.get('TAFIRE'))
        if ws_tft:
            logger.info("📝 Remplissage TFT...")
            
            for ref, cellule in MAPPING_TFT.items():
                if ref in results.get('tft', {}):
                    montant = results['tft'][ref]['montant']
                    try:
                        ws_tft[cellule] = montant
                        logger.debug(f"   {ref} -> {cellule}: {montant:,.2f}")
                    except Exception as e:
                        logger.warning(f"   Erreur {ref} -> {cellule}: {e}")
'''

def ajouter_mapping_tft():
    """Ajoute le mapping TFT dans export_liasse.py"""
    
    print("="*80)
    print("AJOUT DU MAPPING TFT DANS EXPORT_LIASSE.PY")
    print("="*80)
    print()
    
    # Vérifier que le fichier existe
    if not os.path.exists(FILE_PATH):
        print(f"❌ ERREUR: Fichier non trouvé: {FILE_PATH}")
        return False
    
    # Lire le contenu du fichier
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Vérifier si le mapping TFT existe déjà
    if 'MAPPING_TFT' in content:
        print("⚠️  Le mapping TFT existe déjà dans le fichier.")
        print("   Aucune modification nécessaire.")
        return True
    
    # ÉTAPE 1: Ajouter le dictionnaire MAPPING_TFT
    print("📝 Étape 1: Ajout du dictionnaire MAPPING_TFT...")
    
    # Trouver la position après MAPPING_COMPTE_RESULTAT_PRODUITS
    pattern = r'(MAPPING_COMPTE_RESULTAT_PRODUITS\s*=\s*\{[^}]+\})'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + '\n' + MAPPING_TFT_CODE + content[insert_pos:]
        print("   ✅ Dictionnaire MAPPING_TFT ajouté")
    else:
        print("   ❌ Impossible de trouver MAPPING_COMPTE_RESULTAT_PRODUITS")
        return False
    
    # ÉTAPE 2: Ajouter le code de remplissage
    print("📝 Étape 2: Ajout du code de remplissage TFT...")
    
    # Trouver la position après le remplissage du Compte de Résultat - Produits
    pattern = r'(# Remplir le COMPTE DE RÉSULTAT - PRODUITS.*?logger\.warning\(f"   Erreur \{ref\} -> \{cellule\}: \{e\}"\))'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + '\n' + REMPLISSAGE_TFT_CODE + content[insert_pos:]
        print("   ✅ Code de remplissage TFT ajouté")
    else:
        print("   ⚠️  Position exacte non trouvée, ajout avant 'Sauvegarder dans un buffer'")
        # Fallback: ajouter avant la sauvegarde
        pattern = r'(# Sauvegarder dans un buffer)'
        match = re.search(pattern, content)
        if match:
            insert_pos = match.start()
            content = content[:insert_pos] + REMPLISSAGE_TFT_CODE + '\n    ' + content[insert_pos:]
            print("   ✅ Code de remplissage TFT ajouté (position alternative)")
        else:
            print("   ❌ Impossible de trouver la position d'insertion")
            return False
    
    # Sauvegarder le fichier modifié
    print("💾 Sauvegarde du fichier modifié...")
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("   ✅ Fichier sauvegardé")
    print()
    print("="*80)
    print("✅ MAPPING TFT AJOUTÉ AVEC SUCCÈS")
    print("="*80)
    print()
    print("Modifications apportées:")
    print("  1. Dictionnaire MAPPING_TFT ajouté après MAPPING_COMPTE_RESULTAT_PRODUITS")
    print("  2. Code de remplissage TFT ajouté dans remplir_liasse_officielle()")
    print()
    print("Prochaines étapes:")
    print("  1. Vérifier le fichier: py_backend/export_liasse.py")
    print("  2. Récupérer le template: Liasse_officielle_revise.xlsx")
    print("  3. Tester l'export complet")
    print()
    
    return True


if __name__ == "__main__":
    success = ajouter_mapping_tft()
    exit(0 if success else 1)
