# -*- coding: utf-8 -*-
"""Script pour vérifier les noms des onglets dans le fichier de balance"""

import pandas as pd
import os

fichier = os.path.join("py_backend", "P000 -BALANCE DEMO N_N-1_N-2.xls")

if os.path.exists(fichier):
    print(f"✅ Fichier trouvé: {fichier}")
    
    # Lire le fichier Excel
    xls = pd.ExcelFile(fichier)
    
    print(f"\n📋 Onglets disponibles dans le fichier:")
    for i, sheet_name in enumerate(xls.sheet_names, 1):
        print(f"   {i}. '{sheet_name}'")
else:
    print(f"❌ Fichier non trouvé: {fichier}")
