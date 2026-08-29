# -*- coding: utf-8 -*-
"""
Script pour extraire la structure exacte du fichier HTML de test
"""

import os
from bs4 import BeautifulSoup

# Chemin du fichier HTML de test
fichier_html = os.path.join(os.path.expanduser("~"), "Desktop", "test_etats_controle_html.html")

if not os.path.exists(fichier_html):
    print(f"❌ Fichier non trouvé: {fichier_html}")
    exit(1)

# Lire le fichier HTML
with open(fichier_html, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Parser le HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Trouver toutes les sections
sections = soup.find_all('div', class_='section')

print("═══════════════════════════════════════════════════════════════")
print(f"  STRUCTURE DU FICHIER HTML DE TEST")
print("═══════════════════════════════════════════════════════════════")
print(f"\nNombre de sections trouvées: {len(sections)}\n")

for i, section in enumerate(sections, 1):
    # Trouver le titre
    header = section.find('div', class_='section-header')
    if header:
        titre = header.get_text(strip=True).replace('›', '').strip()
        print(f"\n{i}. {titre}")
        print("─" * 70)
        
        # Trouver le tableau
        table = section.find('table')
        if table:
            tbody = table.find('tbody')
            if tbody:
                rows = tbody.find_all('tr')
                print(f"   Nombre de lignes: {len(rows)}")
                
                for j, row in enumerate(rows, 1):
                    cells = row.find_all('td')
                    if len(cells) >= 4:
                        ref = cells[0].get_text(strip=True)
                        libelle = cells[1].get_text(strip=True)
                        montant_n = cells[2].get_text(strip=True)
                        montant_n1 = cells[3].get_text(strip=True)
                        
                        print(f"   {j}. REF={ref:4s} | {libelle:40s} | N={montant_n:15s} | N-1={montant_n1:15s}")

print("\n═══════════════════════════════════════════════════════════════")
print("  FIN DE L'EXTRACTION")
print("═══════════════════════════════════════════════════════════════")
