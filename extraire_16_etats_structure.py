# -*- coding: utf-8 -*-
"""
Script pour extraire la structure des 16 états de contrôle
depuis le fichier test_etats_controle_html.html
"""

from bs4 import BeautifulSoup
import json

# Lire le fichier HTML
with open('test_etats_controle_html.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# Extraire toutes les sections
sections = soup.find_all('div', class_='section')

print(f"📊 Nombre de sections trouvées: {len(sections)}\n")
print("=" * 80)

etats_structure = []

for idx, section in enumerate(sections, 1):
    # Extraire le titre
    header = section.find('div', class_='section-header')
    if header:
        titre_complet = header.get_text(strip=True).replace('›', '').strip()
        print(f"\n{idx}. {titre_complet}")
        
        # Extraire les lignes du tableau
        tbody = section.find('tbody')
        if tbody:
            rows = tbody.find_all('tr')
            print(f"   Nombre de lignes: {len(rows)}")
            
            lignes = []
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    ref = cells[0].get_text(strip=True)
                    libelle = cells[1].get_text(strip=True)
                    print(f"   - {ref}: {libelle}")
                    lignes.append({
                        'ref': ref,
                        'libelle': libelle
                    })
            
            etats_structure.append({
                'numero': idx,
                'titre': titre_complet,
                'lignes': lignes
            })

print("\n" + "=" * 80)
print(f"\n✅ Total: {len(etats_structure)} états de contrôle extraits")

# Sauvegarder la structure en JSON
with open('structure_16_etats.json', 'w', encoding='utf-8') as f:
    json.dump(etats_structure, f, ensure_ascii=False, indent=2)

print("\n💾 Structure sauvegardée dans: structure_16_etats.json")
