#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test complet de l'intégration du TFT dans le workflow
"""
import pandas as pd
import sys
import json
sys.path.insert(0, 'py_backend')

from etats_financiers_v2 import process_balance_to_liasse_format
from tableau_flux_tresorerie_v2 import calculer_tft_liasse
from html_liasse_complete import generate_tft_html_liasse
from etats_controle_exhaustifs import calculer_etat_controle_tft
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("=" * 80)
print("TEST INTÉGRATION TFT COMPLET")
print("=" * 80)
print()

# 1. Charger les balances
balance_file = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
excel_data = pd.ExcelFile(balance_file)

balance_df = pd.read_excel(excel_data, sheet_name=0)
balance_n1_df = pd.read_excel(excel_data, sheet_name=1)
balance_n2_df = pd.read_excel(excel_data, sheet_name=2)

print(f"✅ Balances chargées:")
print(f"   N: {len(balance_df)} lignes")
print(f"   N-1: {len(balance_n1_df)} lignes")
print(f"   N-2: {len(balance_n2_df)} lignes")
print()

# 2. Charger les correspondances
import json
with open('py_backend/correspondances_syscohada.json', 'r', encoding='utf-8') as f:
    correspondances = json.load(f)

print(f"✅ Correspondances chargées")
print()

# 3. Traiter les balances au format liasse
print("🔄 Traitement des balances au format liasse...")
results_liasse = process_balance_to_liasse_format(balance_df, balance_n1_df, balance_n2_df, correspondances)
print(f"✅ Balances traitées")
print(f"   Sections: {list(results_liasse.keys())}")
print()

# 4. Calculer le TFT
print("🔄 Calcul du TFT...")
try:
    resultat_net_n = next((p['montant_n'] for p in results_liasse['compte_resultat'] if p['ref'] == 'XI'), 0)
    resultat_net_n1 = next((p['montant_n1'] for p in results_liasse['compte_resultat'] if p['ref'] == 'XI'), 0)
    
    print(f"   Résultat net N: {resultat_net_n:,.0f}")
    print(f"   Résultat net N-1: {resultat_net_n1:,.0f}")
    
    tft_data = calculer_tft_liasse(balance_df, balance_n1_df, balance_n2_df, resultat_net_n, resultat_net_n1)
    results_liasse['tft'] = tft_data
    
    print(f"✅ TFT calculé: {len(tft_data.get('tft', []))} lignes")
    print(f"   TFT dans results_liasse: {'tft' in results_liasse}")
    print()
    
except Exception as e:
    print(f"❌ ERREUR calcul TFT: {e}")
    import traceback
    traceback.print_exc()
    print()

# 5. Générer le HTML du TFT
print("🔄 Génération HTML du TFT...")
try:
    if 'tft' in results_liasse and results_liasse['tft']:
        html_tft = generate_tft_html_liasse(results_liasse['tft'])
        print(f"✅ HTML TFT généré: {len(html_tft)} caractères")
        
        # Vérifier que le HTML contient bien le TFT
        if 'TABLEAU DES FLUX DE TRÉSORERIE' in html_tft:
            print("   ✓ Titre TFT présent")
        if 'data-section="tft"' in html_tft:
            print("   ✓ Section TFT présente")
        print()
    else:
        print("❌ TFT non disponible dans results_liasse")
        print()
        
except Exception as e:
    print(f"❌ ERREUR génération HTML TFT: {e}")
    import traceback
    traceback.print_exc()
    print()

# 6. Calculer l'état de contrôle TFT
print("🔄 Calcul état de contrôle TFT...")
try:
    if 'tft' in results_liasse and results_liasse['tft']:
        tft_data_list = results_liasse['tft'].get('tft', [])
        etat_controle_tft = calculer_etat_controle_tft(tft_data_list, tft_data_list)
        print(f"✅ État de contrôle TFT calculé: {len(etat_controle_tft.get('postes', []))} postes")
        print()
    else:
        print("❌ TFT non disponible pour l'état de contrôle")
        print()
        
except Exception as e:
    print(f"❌ ERREUR calcul état de contrôle TFT: {e}")
    import traceback
    traceback.print_exc()
    print()

print("=" * 80)
print("TEST TERMINÉ")
print("=" * 80)
