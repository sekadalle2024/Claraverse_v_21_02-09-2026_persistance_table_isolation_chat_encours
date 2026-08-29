# -*- coding: utf-8 -*-
"""
Script de vérification du format exhaustif dans le fichier HTML de test
"""

import os
import re


def analyser_html_test():
    """Analyse le fichier HTML de test pour vérifier le format exhaustif"""
    
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    fichier = os.path.join(desktop, "test_etats_controle_html.html")
    
    if not os.path.exists(fichier):
        print(f"❌ Fichier non trouvé: {fichier}")
        return
    
    print("═══════════════════════════════════════════════════════════════")
    print("  🔍 VÉRIFICATION DU FORMAT EXHAUSTIF")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    with open(fichier, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extraire les sections
    sections = re.findall(r'<div class="section[^"]*">(.*?)</div>\s*</div>\s*</div>', html_content, re.DOTALL)
    
    print(f"📊 Nombre de sections trouvées: {len(sections)}")
    print()
    
    for i, section in enumerate(sections, 1):
        # Extraire le titre
        titre_match = re.search(r'<span>🔍\s*([^<]+)</span>', section)
        if not titre_match:
            continue
        
        titre = titre_match.group(1).strip()
        
        # Extraire les lignes du tableau
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', section, re.DOTALL)
        
        print(f"{'='*70}")
        print(f"Section {i}: {titre}")
        print(f"{'='*70}")
        print(f"Nombre de lignes: {len(rows)}")
        print()
        
        # Analyser les lignes
        lignes_n = 0
        lignes_n1 = 0
        lignes_mixtes = 0
        
        print("Aperçu des lignes:")
        for j, row in enumerate(rows[:10], 1):
            cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
            if len(cells) >= 4:
                ref = re.sub(r'<[^>]+>', '', cells[0]).strip()
                libelle = re.sub(r'<[^>]+>', '', cells[1]).strip()
                montant_n = re.sub(r'<[^>]+>', '', cells[2]).strip()
                montant_n1 = re.sub(r'<[^>]+>', '', cells[3]).strip()
                
                print(f"  {j}. [{ref}] {libelle}")
                print(f"      N: {montant_n:>15} | N-1: {montant_n1:>15}")
                
                # Compter les types de lignes
                has_n = montant_n and montant_n != '-' and montant_n != '0'
                has_n1 = montant_n1 and montant_n1 != '-' and montant_n1 != '0'
                
                if has_n and not has_n1:
                    lignes_n += 1
                elif has_n1 and not has_n:
                    lignes_n1 += 1
                elif has_n and has_n1:
                    lignes_mixtes += 1
        
        if len(rows) > 10:
            print(f"  ... ({len(rows) - 10} lignes supplémentaires)")
        
        print()
        
        # Analyser toutes les lignes pour les statistiques
        for row in rows[10:]:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
            if len(cells) >= 4:
                montant_n = re.sub(r'<[^>]+>', '', cells[2]).strip()
                montant_n1 = re.sub(r'<[^>]+>', '', cells[3]).strip()
                
                has_n = montant_n and montant_n != '-' and montant_n != '0'
                has_n1 = montant_n1 and montant_n1 != '-' and montant_n1 != '0'
                
                if has_n and not has_n1:
                    lignes_n += 1
                elif has_n1 and not has_n:
                    lignes_n1 += 1
                elif has_n and has_n1:
                    lignes_mixtes += 1
        
        print(f"📊 Analyse du format:")
        print(f"  - Lignes avec N uniquement: {lignes_n}")
        print(f"  - Lignes avec N-1 uniquement: {lignes_n1}")
        print(f"  - Lignes avec N et N-1: {lignes_mixtes}")
        
        if lignes_n > 0 and lignes_n1 > 0:
            print(f"  ✅ FORMAT EXHAUSTIF DÉTECTÉ (lignes séparées pour N et N-1)")
        elif lignes_mixtes > 0:
            print(f"  ⚠️ FORMAT COMPACT DÉTECTÉ (N et N-1 sur la même ligne)")
        else:
            print(f"  ❓ Format indéterminé")
        
        print()
    
    print("═══════════════════════════════════════════════════════════════")
    print("  ✅ VÉRIFICATION TERMINÉE")
    print("═══════════════════════════════════════════════════════════════")


if __name__ == "__main__":
    analyser_html_test()
