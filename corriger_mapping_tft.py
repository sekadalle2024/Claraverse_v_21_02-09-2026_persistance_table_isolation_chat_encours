# -*- coding: utf-8 -*-
"""
Script pour corriger le mapping TFT dans export_liasse.py
selon les cellules réelles du template
"""
import re

# Mapping corrigé basé sur le template réel
MAPPING_TFT_CORRIGE = """# Mapping TFT (Tableau des Flux de Trésorerie)
MAPPING_TFT = {
    # Trésorerie
    'ZA': 'C10',  # Trésorerie au 1er janvier
    
    # Flux opérationnels
    'FA': 'C12',  # Capacité d'Autofinancement Globale (CAFG)
    'FB': 'C13',  # Variation actif circulant HAO
    'FC': 'C14',  # Variation des stocks
    'FD': 'C15',  # Variation des créances
    'FE': 'C16',  # Variation du passif circulant
    'ZB': 'C19',  # TOTAL Flux opérationnels
    
    # Flux investissement
    'FF': 'C21',  # Décaissements acquisitions immobilisations incorporelles
    'FG': 'C22',  # Décaissements acquisitions immobilisations corporelles
    'FH': 'C23',  # Décaissements acquisitions immobilisations financières
    'FI': 'C24',  # Encaissements cessions immobilisations
    'FJ': 'C25',  # Encaissements cessions immobilisations financières
    'ZC': 'C26',  # TOTAL Flux investissement
    
    # Flux capitaux propres
    'FK': 'C28',  # Augmentation de capital
    'FL': 'C29',  # Subventions d'investissement reçues
    'FM': 'C30',  # Prélèvements sur le capital
    'FN': 'C31',  # Dividendes versés
    'ZD': 'C32',  # TOTAL Flux capitaux propres
    
    # Flux capitaux étrangers
    'FO': 'C34',  # Nouveaux emprunts
    'FP': 'C35',  # Autres dettes financières
    'FQ': 'C36',  # Remboursements
    'ZE': 'C37',  # TOTAL Flux capitaux étrangers
    
    # Totaux finaux
    'ZF': 'C38',  # TOTAL Financement (D+E)
    'ZG': 'C39',  # VARIATION TRÉSORERIE (B+C+F)
    'ZH': 'C40',  # Trésorerie au 31 Décembre
}"""

print("="*80)
print("CORRECTION DU MAPPING TFT DANS EXPORT_LIASSE.PY")
print("="*80)
print()

# Lire le fichier
with open('py_backend/export_liasse.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver et remplacer le mapping TFT
pattern = r'# Mapping TFT \(Tableau des Flux de Trésorerie\)\nMAPPING_TFT = \{[^}]+\}'
match = re.search(pattern, content, re.DOTALL)

if match:
    print("✅ Mapping TFT trouvé")
    content = content[:match.start()] + MAPPING_TFT_CORRIGE + content[match.end():]
    
    # Sauvegarder
    with open('py_backend/export_liasse.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Mapping TFT corrigé avec les cellules du template réel")
    print()
    print("Corrections appliquées:")
    print("  - ZB: C17 → C19")
    print("  - FF-FJ: Décalage de +2 lignes")
    print("  - ZC: C24 → C26")
    print("  - FK-FN: Décalage de +2 lignes")
    print("  - ZD: C30 → C32")
    print("  - FO-FQ: Décalage de +2 lignes")
    print("  - ZE-ZH: Décalage de +2 lignes")
    print()
    print("✅ Fichier sauvegardé: py_backend/export_liasse.py")
else:
    print("❌ Mapping TFT non trouvé dans le fichier")

print()
print("="*80)
print("Prochaine étape: Relancer la vérification")
print("  python test_verification_export_liasse.py")
print("="*80)
