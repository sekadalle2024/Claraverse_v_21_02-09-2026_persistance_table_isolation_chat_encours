#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test final des correspondances TFT"""
import json
import sys

print("=" * 80)
print("TEST DES CORRESPONDANCES TFT SYSCOHADA")
print("=" * 80)

# Charger le fichier
try:
    with open('py_backend/correspondances_syscohada.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("\n[OK] Fichier charge avec succes")
except Exception as e:
    print(f"\n[ERREUR] Chargement: {e}")
    sys.exit(1)

# Vérifier section TFT
if 'tft' not in data:
    print("\n[ERREUR] Section 'tft' manquante")
    sys.exit(1)

print("[OK] Section 'tft' presente")

tft = data['tft']
print(f"\nNombre de rubriques TFT: {len(tft)}")

# Rubriques attendues
rubriques_attendues = [
    'ZA', 'FA', 'FB', 'FC', 'FD', 'FE', 'ZB',
    'FF', 'FG', 'FH', 'FI', 'FJ', 'ZC',
    'FK', 'FL', 'FM', 'FN', 'ZD',
    'FO', 'FP', 'FQ', 'ZE',
    'ZF', 'ZG', 'ZH'
]

refs_trouvees = [item['ref'] for item in tft]

manquantes = []
for ref in rubriques_attendues:
    if ref not in refs_trouvees:
        manquantes.append(ref)

if manquantes:
    print(f"\n[ERREUR] {len(manquantes)} rubrique(s) manquante(s): {', '.join(manquantes)}")
    sys.exit(1)

print(f"[OK] Toutes les {len(rubriques_attendues)} rubriques sont presentes")

# Vérifier les comptes clés
comptes_cles = {
    'Tresorerie': ['50', '51', '52', '53', '54', '57', '58', '56'],
    'Immob. incorporelles': ['21'],
    'Immob. corporelles': ['22', '23', '24'],
    'Immob. financieres': ['26', '27'],
    'Capital': ['101'],
    'Emprunts': ['161', '162', '1661', '1662'],
    'Stocks': ['31', '32', '33', '34', '35', '36', '37', '38']
}

print("\nVerification des comptes cles:")
for nom, comptes in comptes_cles.items():
    trouve = False
    for item in tft:
        if any(c in item['racines'] for c in comptes):
            trouve = True
            break
    
    if trouve:
        print(f"  [OK] {nom}")
    else:
        print(f"  [ERREUR] {nom} - Non trouve")
        sys.exit(1)

print("\n" + "=" * 80)
print("TOUS LES TESTS REUSSIS")
print("=" * 80)

sys.exit(0)
