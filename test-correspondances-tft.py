#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de test pour vérifier la mise à jour des correspondances TFT
"""
import json
import sys

def test_correspondances_tft():
    """Teste la structure et le contenu de la section TFT"""
    
    print("=" * 80)
    print("TEST DES CORRESPONDANCES SYSCOHADA - SECTION TFT")
    print("=" * 80)
    
    # Charger le fichier
    try:
        with open('py_backend/correspondances_syscohada.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("\n✅ Fichier chargé avec succès")
    except Exception as e:
        print(f"\n❌ Erreur de chargement: {e}")
        return False
    
    # Vérifier que la section TFT existe
    if 'tft' not in data:
        print("\n❌ Section 'tft' manquante!")
        return False
    
    print("\n✅ Section 'tft' présente")
    
    tft = data['tft']
    print(f"\n📊 Nombre de rubriques TFT: {len(tft)}")
    
    # Rubriques attendues selon les images
    rubriques_attendues = [
        'ZA', 'FA', 'FB', 'FC', 'FD', 'FE', 'ZB',
        'FF', 'FG', 'FH', 'FI', 'FJ', 'ZC',
        'FK', 'FL', 'FM', 'FN', 'ZD',
        'FO', 'FP', 'FQ', 'ZE',
        'ZF', 'ZG', 'ZH'
    ]
    
    print(f"\n📋 Rubriques attendues: {len(rubriques_attendues)}")
    
    # Vérifier chaque rubrique
    refs_trouvees = [item['ref'] for item in tft]
    
    print("\n" + "=" * 80)
    print("VÉRIFICATION DES RUBRIQUES")
    print("=" * 80)
    
    manquantes = []
    for ref in rubriques_attendues:
        if ref in refs_trouvees:
            print(f"✅ {ref} - Présente")
        else:
            print(f"❌ {ref} - MANQUANTE")
            manquantes.append(ref)
    
    if manquantes:
        print(f"\n❌ {len(manquantes)} rubrique(s) manquante(s): {', '.join(manquantes)}")
        return False
    
    print(f"\n✅ Toutes les {len(rubriques_attendues)} rubriques sont présentes")
    
    # Afficher le détail de chaque rubrique
    print("\n" + "=" * 80)
    print("DÉTAIL DES RUBRIQUES TFT")
    print("=" * 80)
    
    sections = {
        'A. TRÉSORERIE D\'OUVERTURE': ['ZA'],
        'B. FLUX OPÉRATIONNELS': ['FA', 'FB', 'FC', 'FD', 'FE', 'ZB'],
        'C. FLUX D\'INVESTISSEMENT': ['FF', 'FG', 'FH', 'FI', 'FJ', 'ZC'],
        'D. FLUX CAPITAUX PROPRES': ['FK', 'FL', 'FM', 'FN', 'ZD'],
        'E. FLUX CAPITAUX ÉTRANGERS': ['FO', 'FP', 'FQ', 'ZE'],
        'F-H. TOTAUX ET CLÔTURE': ['ZF', 'ZG', 'ZH']
    }
    
    for section_nom, refs in sections.items():
        print(f"\n{section_nom}")
        print("-" * 80)
        for ref in refs:
            item = next((x for x in tft if x['ref'] == ref), None)
            if item:
                racines = ', '.join(item['racines']) if item['racines'] else 'Calcul'
                note = f" (NOTE {item['note']})" if 'note' in item else ""
                print(f"  {ref}{note}: {item['libelle']}")
                print(f"      Comptes: {racines}")
    
    # Vérifier les comptes clés
    print("\n" + "=" * 80)
    print("VÉRIFICATION DES COMPTES CLÉS")
    print("=" * 80)
    
    comptes_cles = {
        'Trésorerie': ['50', '51', '52', '53', '54', '57', '58', '56'],
        'Immobilisations incorporelles': ['21'],
        'Immobilisations corporelles': ['22', '23', '24'],
        'Immobilisations financières': ['26', '27'],
        'Capital': ['101'],
        'Emprunts': ['161', '162', '1661', '1662'],
        'Stocks': ['31', '32', '33', '34', '35', '36', '37', '38']
    }
    
    for nom, comptes in comptes_cles.items():
        trouve = False
        for item in tft:
            if any(c in item['racines'] for c in comptes):
                trouve = True
                break
        
        if trouve:
            print(f"✅ {nom}: {', '.join(comptes)}")
        else:
            print(f"⚠️  {nom}: {', '.join(comptes)} - Non trouvé")
    
    print("\n" + "=" * 80)
    print("✅ TEST RÉUSSI - Correspondances TFT mises à jour correctement")
    print("=" * 80)
    
    return True


if __name__ == '__main__':
    success = test_correspondances_tft()
    sys.exit(0 if success else 1)
