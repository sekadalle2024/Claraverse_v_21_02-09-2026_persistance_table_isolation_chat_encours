# -*- coding: utf-8 -*-
"""
Script simple pour extraire la structure des états de contrôle
"""

import re
import json

# Lire le fichier HTML
with open('test_etats_controle_html.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extraire les titres des sections
pattern_titre = r'<span>🔍\s*([^<]+)</span>'
titres = re.findall(pattern_titre, html_content)

print(f"📊 Nombre de sections trouvées: {len(titres)}\n")
print("=" * 80)

for idx, titre in enumerate(titres, 1):
    print(f"{idx}. {titre.strip()}")

print("\n" + "=" * 80)
print(f"\n✅ Total: {len(titres)} états de contrôle")

# Extraire aussi les références (REF) pour chaque section
pattern_section = r'<div class="section[^"]*">.*?<span>🔍\s*([^<]+)</span>.*?<tbody>(.*?)</tbody>'
sections = re.findall(pattern_section, html_content, re.DOTALL)

print("\n" + "=" * 80)
print("\n📋 Détail des références par section:\n")

etats_structure = []

for idx, (titre, tbody) in enumerate(sections, 1):
    print(f"\n{idx}. {titre.strip()}")
    
    # Extraire les références et libellés
    pattern_row = r'<td class="ref-cell">([^<]+)</td>\s*<td[^>]*>([^<]+)</td>'
    rows = re.findall(pattern_row, tbody)
    
    lignes = []
    for ref, libelle in rows:
        ref = ref.strip()
        libelle = libelle.strip()
        print(f"   - {ref}: {libelle}")
        lignes.append({
            'ref': ref,
            'libelle': libelle
        })
    
    etats_structure.append({
        'numero': idx,
        'titre': titre.strip(),
        'lignes': lignes
    })

# Sauvegarder la structure
with open('structure_16_etats.json', 'w', encoding='utf-8') as f:
    json.dump(etats_structure, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 80)
print(f"\n💾 Structure sauvegardée dans: structure_16_etats.json")
