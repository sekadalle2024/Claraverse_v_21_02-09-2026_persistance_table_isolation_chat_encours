# -*- coding: utf-8 -*-
"""
Script pour comparer le mapping TFT avec les références réelles du template
"""
import openpyxl

# Mapping actuel dans export_liasse.py (CORRIGE)
MAPPING_TFT_ACTUEL = {
    'ZA': 'C10',
    'FA': 'C12',
    'FB': 'C13',
    'FC': 'C14',
    'FD': 'C15',
    'FE': 'C16',
    'ZB': 'C19',
    'FF': 'C21',
    'FG': 'C22',
    'FH': 'C23',
    'FI': 'C24',
    'FJ': 'C25',
    'ZC': 'C26',
    'FK': 'C28',
    'FL': 'C29',
    'FM': 'C30',
    'FN': 'C31',
    'ZD': 'C32',
    'FO': 'C34',
    'FP': 'C35',
    'FQ': 'C36',
    'ZE': 'C37',
    'ZF': 'C38',
    'ZG': 'C39',
    'ZH': 'C40',
}

# Lire le template
wb = openpyxl.load_workbook('py_backend/Liasse_officielle_revise.xlsx')
ws = wb['TFT']

print("="*80)
print("COMPARAISON MAPPING TFT vs TEMPLATE")
print("="*80)
print()

# Extraire les références réelles du template
refs_template = {}
for row in range(10, 50):
    ref = ws[f'A{row}'].value
    if ref and isinstance(ref, str) and len(ref) == 2:
        refs_template[ref] = f'C{row}'

print("Références trouvées dans le template (colonne A):")
for ref, cellule in sorted(refs_template.items()):
    print(f"  {ref}: {cellule}")

print()
print("="*80)
print("COMPARAISON")
print("="*80)
print()

problemes = []
for ref, cellule_actuelle in MAPPING_TFT_ACTUEL.items():
    cellule_template = refs_template.get(ref)
    if cellule_template:
        if cellule_actuelle == cellule_template:
            print(f"✅ {ref}: {cellule_actuelle} (OK)")
        else:
            print(f"⚠️  {ref}: Mapping={cellule_actuelle}, Template={cellule_template} (DIFFÉRENT)")
            problemes.append((ref, cellule_actuelle, cellule_template))
    else:
        print(f"❌ {ref}: Non trouvé dans le template")
        problemes.append((ref, cellule_actuelle, None))

print()
if problemes:
    print("="*80)
    print(f"⚠️  {len(problemes)} DIFFÉRENCE(S) DÉTECTÉE(S)")
    print("="*80)
    print()
    print("Corrections à apporter dans export_liasse.py:")
    print()
    for ref, actuel, template in problemes:
        if template:
            print(f"    '{ref}': '{template}',  # était '{actuel}'")
        else:
            print(f"    '{ref}': '{actuel}',  # NON TROUVÉ dans template")
else:
    print("✅ Tous les mappings correspondent au template!")

wb.close()
