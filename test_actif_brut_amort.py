# -*- coding: utf-8 -*-
"""
Script de test pour le calcul BRUT / AMORTISSEMENT / NET de l'actif
"""
import sys
sys.path.insert(0, 'py_backend')

from calculer_actif_brut_amort import calculer_actif_brut_amort_complet
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

# Balance de test avec des données réalistes
balance_test_n = [
    # Immobilisations incorporelles
    {'numero_compte': '211000', 'libelle': 'Frais de R&D', 'solde_debit': 1000000, 'solde_credit': 0, 'solde_net': 1000000},
    {'numero_compte': '281100', 'libelle': 'Amort. Frais R&D', 'solde_debit': 0, 'solde_credit': 200000, 'solde_net': -200000},
    
    {'numero_compte': '212000', 'libelle': 'Brevets', 'solde_debit': 500000, 'solde_credit': 0, 'solde_net': 500000},
    {'numero_compte': '281200', 'libelle': 'Amort. Brevets', 'solde_debit': 0, 'solde_credit': 100000, 'solde_net': -100000},
    
    # Immobilisations corporelles
    {'numero_compte': '221000', 'libelle': 'Terrains', 'solde_debit': 5000000, 'solde_credit': 0, 'solde_net': 5000000},
    
    {'numero_compte': '231000', 'libelle': 'Bâtiments', 'solde_debit': 10000000, 'solde_credit': 0, 'solde_net': 10000000},
    {'numero_compte': '283100', 'libelle': 'Amort. Bâtiments', 'solde_debit': 0, 'solde_credit': 2000000, 'solde_net': -2000000},
    
    {'numero_compte': '241000', 'libelle': 'Matériel', 'solde_debit': 3000000, 'solde_credit': 0, 'solde_net': 3000000},
    {'numero_compte': '284100', 'libelle': 'Amort. Matériel', 'solde_debit': 0, 'solde_credit': 900000, 'solde_net': -900000},
    
    {'numero_compte': '245000', 'libelle': 'Matériel de transport', 'solde_debit': 2000000, 'solde_credit': 0, 'solde_net': 2000000},
    {'numero_compte': '284500', 'libelle': 'Amort. Mat. transport', 'solde_debit': 0, 'solde_credit': 800000, 'solde_net': -800000},
    
    # Stocks
    {'numero_compte': '311000', 'libelle': 'Marchandises', 'solde_debit': 1500000, 'solde_credit': 0, 'solde_net': 1500000},
    {'numero_compte': '321000', 'libelle': 'Matières premières', 'solde_debit': 800000, 'solde_credit': 0, 'solde_net': 800000},
    
    # Créances
    {'numero_compte': '411000', 'libelle': 'Clients', 'solde_debit': 4000000, 'solde_credit': 0, 'solde_net': 4000000},
    
    # Trésorerie
    {'numero_compte': '521000', 'libelle': 'Banque', 'solde_debit': 2500000, 'solde_credit': 0, 'solde_net': 2500000},
    {'numero_compte': '571000', 'libelle': 'Caisse', 'solde_debit': 500000, 'solde_credit': 0, 'solde_net': 500000},
]

balance_test_n1 = [
    # Immobilisations incorporelles
    {'numero_compte': '211000', 'libelle': 'Frais de R&D', 'solde_debit': 1000000, 'solde_credit': 0, 'solde_net': 1000000},
    {'numero_compte': '281100', 'libelle': 'Amort. Frais R&D', 'solde_debit': 0, 'solde_credit': 100000, 'solde_net': -100000},
    
    {'numero_compte': '212000', 'libelle': 'Brevets', 'solde_debit': 500000, 'solde_credit': 0, 'solde_net': 500000},
    {'numero_compte': '281200', 'libelle': 'Amort. Brevets', 'solde_debit': 0, 'solde_credit': 50000, 'solde_net': -50000},
    
    # Immobilisations corporelles
    {'numero_compte': '221000', 'libelle': 'Terrains', 'solde_debit': 5000000, 'solde_credit': 0, 'solde_net': 5000000},
    
    {'numero_compte': '231000', 'libelle': 'Bâtiments', 'solde_debit': 10000000, 'solde_credit': 0, 'solde_net': 10000000},
    {'numero_compte': '283100', 'libelle': 'Amort. Bâtiments', 'solde_debit': 0, 'solde_credit': 1500000, 'solde_net': -1500000},
    
    {'numero_compte': '241000', 'libelle': 'Matériel', 'solde_debit': 2500000, 'solde_credit': 0, 'solde_net': 2500000},
    {'numero_compte': '284100', 'libelle': 'Amort. Matériel', 'solde_debit': 0, 'solde_credit': 600000, 'solde_net': -600000},
    
    {'numero_compte': '245000', 'libelle': 'Matériel de transport', 'solde_debit': 1500000, 'solde_credit': 0, 'solde_net': 1500000},
    {'numero_compte': '284500', 'libelle': 'Amort. Mat. transport', 'solde_debit': 0, 'solde_credit': 500000, 'solde_net': -500000},
    
    # Stocks
    {'numero_compte': '311000', 'libelle': 'Marchandises', 'solde_debit': 1200000, 'solde_credit': 0, 'solde_net': 1200000},
    {'numero_compte': '321000', 'libelle': 'Matières premières', 'solde_debit': 700000, 'solde_credit': 0, 'solde_net': 700000},
    
    # Créances
    {'numero_compte': '411000', 'libelle': 'Clients', 'solde_debit': 3500000, 'solde_credit': 0, 'solde_net': 3500000},
    
    # Trésorerie
    {'numero_compte': '521000', 'libelle': 'Banque', 'solde_debit': 2000000, 'solde_credit': 0, 'solde_net': 2000000},
    {'numero_compte': '571000', 'libelle': 'Caisse', 'solde_debit': 400000, 'solde_credit': 0, 'solde_net': 400000},
]

print("\n" + "="*100)
print("TEST DU CALCUL BRUT / AMORTISSEMENT / NET DE L'ACTIF")
print("="*100)

# Calculer
resultats = calculer_actif_brut_amort_complet(balance_test_n, balance_test_n1)

print("\n" + "="*100)
print("RÉSULTATS - POSTES AVEC VALEURS")
print("="*100)

print(f"\n{'REF':<5} {'LIBELLÉ':<50} {'BRUT N':>15} {'AMORT N':>15} {'NET N':>15}")
print("-" * 100)

for poste in resultats['postes']:
    if poste['net_n'] != 0 or poste['est_totalisation']:
        ref = poste['ref']
        libelle = poste['libelle'][:48]
        brut_n = poste['brut_n']
        amort_n = poste['amort_n']
        net_n = poste['net_n']
        
        # Mettre en évidence les totalisations
        if poste['est_totalisation'] and net_n != 0:
            print(f"{ref:<5} {libelle:<50} {brut_n:>15,.0f} {amort_n:>15,.0f} {net_n:>15,.0f} ⭐")
        else:
            print(f"{ref:<5} {libelle:<50} {brut_n:>15,.0f} {amort_n:>15,.0f} {net_n:>15,.0f}")

print("\n" + "="*100)
print("COMPARAISON N vs N-1")
print("="*100)

print(f"\n{'REF':<5} {'LIBELLÉ':<40} {'NET N':>15} {'NET N-1':>15} {'VARIATION':>15}")
print("-" * 100)

for poste in resultats['postes']:
    if poste['net_n'] != 0 or poste['net_n1'] != 0:
        ref = poste['ref']
        libelle = poste['libelle'][:38]
        net_n = poste['net_n']
        net_n1 = poste['net_n1']
        variation = net_n - net_n1
        
        print(f"{ref:<5} {libelle:<40} {net_n:>15,.0f} {net_n1:>15,.0f} {variation:>15,.0f}")

print("\n" + "="*100)
print("MÉTADONNÉES")
print("="*100)

metadata = resultats['metadata']
print(f"\nNombre total de postes:        {metadata['nb_postes']}")
print(f"Postes avec valeurs:           {metadata['nb_postes_avec_valeurs']}")
print(f"\nTOTAL BRUT N:                  {metadata['total_brut_n']:>15,.0f}")
print(f"TOTAL AMORTISSEMENT N:         {metadata['total_amort_n']:>15,.0f}")
print(f"TOTAL NET N:                   {metadata['total_net_n']:>15,.0f}")

print("\n" + "="*100)
print("VÉRIFICATIONS")
print("="*100)

# Vérifier que NET = BRUT - AMORTISSEMENT
erreurs = 0
for poste in resultats['postes']:
    if not poste['est_totalisation']:
        net_calcule = poste['brut_n'] - poste['amort_n']
        if abs(net_calcule - poste['net_n']) > 0.01:
            print(f"❌ ERREUR {poste['ref']}: NET calculé ({net_calcule:,.0f}) ≠ NET stocké ({poste['net_n']:,.0f})")
            erreurs += 1

if erreurs == 0:
    print("✅ Tous les calculs NET = BRUT - AMORTISSEMENT sont corrects")
else:
    print(f"❌ {erreurs} erreur(s) détectée(s)")

# Vérifier les totalisations
print("\n📊 Vérification des totalisations:")

postes_dict = {p['ref']: p for p in resultats['postes']}

# AZ: TOTAL ACTIF IMMOBILISÉ
refs_immobilise = ['AB', 'AC', 'AE', 'AF', 'AG', 'AH', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AR', 'AS']
total_immobilise_calcule = sum(postes_dict.get(ref, {}).get('net_n', 0) for ref in refs_immobilise)
total_immobilise_stocke = postes_dict.get('AZ', {}).get('net_n', 0)
if abs(total_immobilise_calcule - total_immobilise_stocke) < 0.01:
    print(f"✅ AZ (TOTAL ACTIF IMMOBILISÉ): {total_immobilise_stocke:,.0f}")
else:
    print(f"❌ AZ: Calculé ({total_immobilise_calcule:,.0f}) ≠ Stocké ({total_immobilise_stocke:,.0f})")

print("\n" + "="*100)
print("TEST TERMINÉ")
print("="*100)
