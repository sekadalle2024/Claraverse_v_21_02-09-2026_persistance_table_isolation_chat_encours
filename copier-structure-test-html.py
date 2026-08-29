# -*- coding: utf-8 -*-
"""
Script pour extraire la structure exacte du fichier test_etats_controle_html.html
"""

import os
from datetime import datetime

desktop = os.path.join(os.path.expanduser("~"), "Desktop")
fichier_source = os.path.join(desktop, "test_etats_controle_html.html")

if not os.path.exists(fichier_source):
    print(f"❌ Fichier non trouvé: {fichier_source}")
    exit(1)

with open(fichier_source, 'r', encoding='utf-8') as f:
    content = f.read()

# Extraire les titres des sections
import re
sections = re.findall(r'<span>🔍\s*([^<]+)</span>', content)

print("═══════════════════════════════════════════════════════════════")
print(f"  📊 STRUCTURE DU FICHIER TEST ({len(sections)} sections)")
print("═══════════════════════════════════════════════════════════════")
print()

for i, titre in enumerate(sections, 1):
    print(f"{i}. {titre.strip()}")

print()
print("═══════════════════════════════════════════════════════════════")
