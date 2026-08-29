#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test de détection des onglets de balance
"""
import pandas as pd

balance_file = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"

print("=" * 80)
print("TEST DETECTION ONGLETS")
print("=" * 80)
print()

# Lire le fichier
excel_data = pd.ExcelFile(balance_file)
sheet_names = excel_data.sheet_names

print(f"Onglets trouvés: {sheet_names}")
print()

# Patterns actuels
balance_n_patterns = ["Balance N", "balance n", "BALANCE N", "Balance N (", "balance_n"]
balance_n1_patterns = ["Balance N-1", "balance n-1", "BALANCE N-1", "Balance N-1 (", "balance_n1", "balance_n-1"]
balance_n2_patterns = ["Balance N-2", "balance n-2", "BALANCE N-2", "Balance N-2 (", "balance_n2"]

print("Patterns Balance N:", balance_n_patterns)
print("Patterns Balance N-1:", balance_n1_patterns)
print("Patterns Balance N-2:", balance_n2_patterns)
print()

# Tester la détection
balance_n_found = None
balance_n1_found = None
balance_n2_found = None

for sheet in sheet_names:
    if any(pattern in sheet for pattern in balance_n_patterns):
        balance_n_found = sheet
    if any(pattern in sheet for pattern in balance_n1_patterns):
        balance_n1_found = sheet
    if any(pattern in sheet for pattern in balance_n2_patterns):
        balance_n2_found = sheet

print("RÉSULTATS DÉTECTION:")
print(f"  Balance N: {balance_n_found if balance_n_found else 'NON TROUVÉ'}")
print(f"  Balance N-1: {balance_n1_found if balance_n1_found else 'NON TROUVÉ'}")
print(f"  Balance N-2: {balance_n2_found if balance_n2_found else 'NON TROUVÉ'}")
print()

# Proposition: détecter par ordre (le plus récent = N, puis N-1, puis N-2)
print("PROPOSITION: Détection par ordre des onglets")
print("  Hypothèse: Les onglets sont triés du plus récent au plus ancien")
print()

if len(sheet_names) >= 1:
    print(f"  Balance N: {sheet_names[0]}")
if len(sheet_names) >= 2:
    print(f"  Balance N-1: {sheet_names[1]}")
if len(sheet_names) >= 3:
    print(f"  Balance N-2: {sheet_names[2]}")

print()
print("=" * 80)
