#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test direct de la fonction calculer_tft_liasse
"""
import pandas as pd
import sys
sys.path.insert(0, 'py_backend')

from tableau_flux_tresorerie_v2 import calculer_tft_liasse

print("=" * 80)
print("TEST DIRECT TFT")
print("=" * 80)
print()

# Charger les balances
balance_file = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
excel_data = pd.ExcelFile(balance_file)

balance_n = pd.read_excel(excel_data, sheet_name=0)
balance_n1 = pd.read_excel(excel_data, sheet_name=1)
balance_n2 = pd.read_excel(excel_data, sheet_name=2)

print(f"Balance N: {len(balance_n)} lignes")
print(f"Balance N-1: {len(balance_n1)} lignes")
print(f"Balance N-2: {len(balance_n2)} lignes")
print()

# Appeler la fonction
try:
    print("Appel de calculer_tft_liasse...")
    tft_data = calculer_tft_liasse(balance_n, balance_n1, balance_n2, 1000000, 950000)
    print(f"✅ TFT calculé avec succès")
    print(f"  Nombre de lignes: {len(tft_data.get('tft', []))}")
    print()
    
    # Afficher les premières lignes
    print("Premières lignes du TFT:")
    for ligne in tft_data['tft'][:5]:
        print(f"  {ligne['ref']}: {ligne['libelle']} = {ligne['montant_n']:,.0f}")
    
except Exception as e:
    print(f"❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 80)
