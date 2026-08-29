import openpyxl

# Charger le fichier
wb = openpyxl.load_workbook('py_backend/Liasse_officielle_revise.xlsx', data_only=True)
ws = wb['NOTE 1']

print("=" * 80)
print("ANALYSE DE LA NOTE 1")
print("=" * 80)
print()

# Afficher toutes les lignes
for i, row in enumerate(ws.iter_rows(min_row=7, max_row=53), 7):
    values = [cell.value for cell in row[:11]]
    if any(v is not None for v in values):
        print(f"Ligne {i:2d}: {values}")

print()
print("=" * 80)
