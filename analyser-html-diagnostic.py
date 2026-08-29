#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Analyse le HTML généré par le diagnostic pour voir les sections présentes
"""
import re
import sys

# Lire le fichier HTML
html_file = r"C:\Users\LEADER\Desktop\diagnostic_etat_fin_20260404_234555.html"

try:
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    print("=" * 80)
    print("ANALYSE DU HTML GÉNÉRÉ")
    print("=" * 80)
    print()
    
    # Chercher les sections
    pattern = r'<div class="section-header-ef">.*?<span>(.*?)</span>'
    matches = re.findall(pattern, html, re.DOTALL)
    
    print(f"Nombre de sections trouvées: {len(matches)}")
    print()
    
    for i, section in enumerate(matches, 1):
        # Nettoyer le texte
        section_clean = re.sub(r'<[^>]+>', '', section).strip()
        print(f"{i}. {section_clean}")
    
    print()
    print("=" * 80)
    print("VÉRIFICATIONS")
    print("=" * 80)
    print()
    
    # Vérifier les sections attendues
    sections_attendues = [
        ("BILAN - ACTIF", "BILAN.*ACTIF"),
        ("BILAN - PASSIF", "BILAN.*PASSIF"),
        ("COMPTE DE RÉSULTAT", "COMPTE.*RÉSULTAT|COMPTE.*RESULTAT"),
        ("TFT", "TABLEAU.*FLUX.*TRÉSORERIE|TFT"),
        ("NOTES ANNEXES", "NOTES.*ANNEXES"),
        ("États de contrôle", "Etat.*contrôle|ÉTATS.*CONTRÔLE")
    ]
    
    for nom, pattern_check in sections_attendues:
        found = any(re.search(pattern_check, section, re.IGNORECASE) for section in matches)
        status = "[OK]" if found else "[MANQUANT]"
        print(f"{status} {nom}")
    
    print()
    print("=" * 80)
    
except Exception as e:
    print(f"Erreur: {e}")
    sys.exit(1)
