# -*- coding: utf-8 -*-
"""
Script de test des états de contrôle N et N-1
Génère un fichier HTML sur le bureau avec tous les contrôles
Date: 04 Avril 2026
"""

import pandas as pd
import json
import os
from datetime import datetime
from pathlib import Path

# Import des modules de contrôle
from etats_controle_exhaustifs import (
    calculer_etat_controle_bilan_actif,
    calculer_etat_controle_bilan_passif,
    calculer_etat_controle_compte_resultat,
    calculer_etat_controle_tft,
    calculer_etat_controle_sens_comptes,
    calculer_etat_equilibre_bilan
)

from html_etats_controle import generate_all_etats_controle_html


def charger_balance_demo(fichier_excel: str = "P000 -BALANCE DEMO N_N-1_N-2.xls"):
    """Charge les balances de démonstration depuis le fichier Excel"""
    print(f"\n📂 Chargement du fichier: {fichier_excel}")
    
    try:
        # Lire les 3 onglets
        balance_n = pd.read_excel(fichier_excel, sheet_name="BALANCE N")
        balance_n1 = pd.read_excel(fichier_excel, sheet_name="BALANCE N-1")
        balance_n2 = pd.read_excel(fichier_excel, sheet_name="BALANCE N-2")
        
        print(f"✅ Balance N: {len(balance_n)} comptes")
        print(f"✅ Balance N-1: {len(balance_n1)} comptes")
        print(f"✅ Balance N-2: {len(balance_n2)} comptes")
        
        return balance_n, balance_n1, balance_n2
        
    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")
        raise


def charger_correspondances(fichier_json: str = "correspondances_syscohada.json"):
    """Charge le fichier de correspondances"""
    print(f"\n📂 Chargement des correspondances: {fichier_json}")
    
    try:
        with open(fichier_json, 'r', encoding='utf-8') as f:
            correspondances = json.load(f)
        
        print(f"✅ Correspondances chargées:")
        print(f"   - Bilan Actif: {len(correspondances['bilan_actif'])} postes")
        print(f"   - Bilan Passif: {len(correspondances['bilan_passif'])} postes")
        print(f"   - Charges: {len(correspondances['charges'])} postes")
        print(f"   - Produits: {len(correspondances['produits'])} postes")
        
        return correspondances
        
    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")
        raise


def calculer_etats_financiers(balance, correspondances):
    """Calcule les états financiers à partir d'une balance"""
    
    # Initialiser les structures
    bilan_actif = []
    bilan_passif = []
    compte_resultat = []
    
    # Calculer les postes du bilan actif
    for poste in correspondances['bilan_actif']:
        ref = poste['ref']
        libelle = poste['libelle']
        racines = poste['racines']
        
        montant = 0
        for _, compte in balance.iterrows():
            numero = str(compte.get('Numéro', ''))
            for racine in racines:
                if numero.startswith(str(racine)):
                    solde_debit = float(compte.get('Solde  Débit', 0) or 0)
                    solde_credit = float(compte.get('Solde Crédit', 0) or 0)
                    montant += solde_debit - solde_credit
                    break
        
        bilan_actif.append({
            'ref': ref,
            'libelle': libelle,
            'montant_n': montant
        })
    
    # Calculer les postes du bilan passif
    for poste in correspondances['bilan_passif']:
        ref = poste['ref']
        libelle = poste['libelle']
        racines = poste['racines']
        
        montant = 0
        for _, compte in balance.iterrows():
            numero = str(compte.get('Numéro', ''))
            for racine in racines:
                if numero.startswith(str(racine)):
                    solde_debit = float(compte.get('Solde  Débit', 0) or 0)
                    solde_credit = float(compte.get('Solde Crédit', 0) or 0)
                    montant += solde_credit - solde_debit
                    break
        
        bilan_passif.append({
            'ref': ref,
            'libelle': libelle,
            'montant_n': montant
        })
    
    # Calculer le compte de résultat (simplifié)
    total_charges = 0
    total_produits = 0
    
    for _, compte in balance.iterrows():
        numero = str(compte.get('Numéro', ''))
        solde_debit = float(compte.get('Solde  Débit', 0) or 0)
        solde_credit = float(compte.get('Solde Crédit', 0) or 0)
        
        if numero.startswith('6'):
            total_charges += solde_debit
        elif numero.startswith('7'):
            total_produits += solde_credit
    
    resultat_net = total_produits - total_charges
    
    compte_resultat.append({
        'ref': 'ZI',
        'libelle': 'RÉSULTAT NET',
        'montant_n': resultat_net
    })
    
    return bilan_actif, bilan_passif, compte_resultat, resultat_net


def generer_html_complet(etats_controle, nom_fichier="test_etats_controle_n_n1.html"):
    """Génère le fichier HTML complet sur le bureau"""
    
    # Obtenir le chemin du bureau
    bureau = str(Path.home() / "Desktop")
    chemin_complet = os.path.join(bureau, nom_fichier)
    
    print(f"\n📝 Génération du fichier HTML: {chemin_complet}")
    
    # Générer le contenu HTML des états de contrôle
    html_etats = generate_all_etats_controle_html(etats_controle)
    
    # Template HTML complet
    html_complet = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>États de Contrôle N et N-1 - Test {datetime.now().strftime('%d/%m/%Y %H:%M')}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }}
        
        .header p {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .controls {{
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }}
        
        .btn {{
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        
        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
        }}
        
        .btn-secondary {{
            background: #6c757d;
            color: white;
        }}
        
        .btn-secondary:hover {{
            background: #5a6268;
            transform: translateY(-2px);
        }}
        
        .content {{
            padding: 30px;
        }}
        
        .etats-fin-section {{
            margin-bottom: 20px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s ease;
        }}
        
        .etats-fin-section:hover {{
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }}
        
        .section-header-ef {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 25px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 1.1em;
            transition: all 0.3s ease;
        }}
        
        .section-header-ef:hover {{
            background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
        }}
        
        .section-header-ef .arrow {{
            font-size: 1.5em;
            transition: transform 0.3s ease;
        }}
        
        .section-header-ef.active .arrow {{
            transform: rotate(90deg);
        }}
        
        .section-content-ef {{
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s ease;
        }}
        
        .section-content-ef.active {{
            max-height: 5000px;
            padding: 20px;
        }}
        
        .liasse-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        
        .liasse-table thead {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        .liasse-table th {{
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #5568d3;
        }}
        
        .liasse-table td {{
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
        }}
        
        .liasse-table tbody tr:hover {{
            background: #f8f9fa;
        }}
        
        .ref-cell {{
            font-weight: 700;
            color: #667eea;
            text-align: center;
        }}
        
        .libelle-cell {{
            color: #495057;
        }}
        
        .montant-cell {{
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: #212529;
        }}
        
        .total-row {{
            background: #e7f3ff;
            font-weight: 700;
        }}
        
        .total-row td {{
            border-top: 2px solid #667eea;
            border-bottom: 2px solid #667eea;
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .controls {{
                display: none;
            }}
            
            .section-content-ef {{
                max-height: none !important;
                padding: 20px !important;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 États de Contrôle N et N-1</h1>
            <p>Test généré le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="ouvrirTout()">📂 Tout Ouvrir</button>
            <button class="btn btn-secondary" onclick="fermerTout()">📁 Tout Fermer</button>
            <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimer</button>
        </div>
        
        <div class="content">
            {html_etats}
        </div>
        
        <div class="footer">
            <p>📊 États de Contrôle SYSCOHADA Révisé</p>
            <p>Généré automatiquement par ClaraVerse - {datetime.now().strftime('%Y')}</p>
        </div>
    </div>
    
    <script>
        // Gestion des accordéons
        document.addEventListener('DOMContentLoaded', function() {{
            const headers = document.querySelectorAll('.section-header-ef');
            
            headers.forEach(header => {{
                header.addEventListener('click', function() {{
                    const content = this.nextElementSibling;
                    const isActive = content.classList.contains('active');
                    
                    // Toggle
                    this.classList.toggle('active');
                    content.classList.toggle('active');
                }});
            }});
        }});
        
        function ouvrirTout() {{
            document.querySelectorAll('.section-header-ef').forEach(h => h.classList.add('active'));
            document.querySelectorAll('.section-content-ef').forEach(c => c.classList.add('active'));
        }}
        
        function fermerTout() {{
            document.querySelectorAll('.section-header-ef').forEach(h => h.classList.remove('active'));
            document.querySelectorAll('.section-content-ef').forEach(c => c.classList.remove('active'));
        }}
    </script>
</body>
</html>"""
    
    # Écrire le fichier
    with open(chemin_complet, 'w', encoding='utf-8') as f:
        f.write(html_complet)
    
    print(f"✅ Fichier HTML généré avec succès!")
    print(f"📍 Emplacement: {chemin_complet}")
    
    return chemin_complet


def main():
    """Fonction principale"""
    print("=" * 80)
    print("🔍 TEST DES ÉTATS DE CONTRÔLE N ET N-1")
    print("=" * 80)
    
    try:
        # 1. Charger les balances
        balance_n, balance_n1, balance_n2 = charger_balance_demo()
        
        # 2. Charger les correspondances
        correspondances = charger_correspondances()
        
        # 3. Calculer les états financiers pour N
        print("\n📊 Calcul des états financiers N...")
        bilan_actif_n, bilan_passif_n, compte_resultat_n, resultat_net_n = calculer_etats_financiers(
            balance_n, correspondances
        )
        
        # 4. Calculer les états financiers pour N-1
        print("📊 Calcul des états financiers N-1...")
        bilan_actif_n1, bilan_passif_n1, compte_resultat_n1, resultat_net_n1 = calculer_etats_financiers(
            balance_n1, correspondances
        )
        
        # 5. Calculer les états de contrôle
        print("\n🔍 Calcul des états de contrôle...")
        
        etats_controle = {}
        
        # États de contrôle pour N
        etats_controle['etat_controle_bilan_actif'] = calculer_etat_controle_bilan_actif(
            bilan_actif_n, []
        )
        
        etats_controle['etat_controle_bilan_passif'] = calculer_etat_controle_bilan_passif(
            bilan_passif_n, []
        )
        
        etats_controle['etat_controle_compte_resultat'] = calculer_etat_controle_compte_resultat(
            compte_resultat_n, []
        )
        
        # États de contrôle pour N-1
        etats_controle['etat_controle_bilan_actif_n1'] = calculer_etat_controle_bilan_actif(
            [], bilan_actif_n1
        )
        
        etats_controle['etat_controle_bilan_passif_n1'] = calculer_etat_controle_bilan_passif(
            [], bilan_passif_n1
        )
        
        etats_controle['etat_controle_compte_resultat_n1'] = calculer_etat_controle_compte_resultat(
            [], compte_resultat_n1
        )
        
        # État d'équilibre du bilan
        etats_controle['etat_equilibre_bilan'] = calculer_etat_equilibre_bilan(
            bilan_actif_n, bilan_passif_n, resultat_net_n,
            bilan_actif_n1, bilan_passif_n1, resultat_net_n1
        )
        
        # État de contrôle du sens des comptes
        balance_n_dict = balance_n.to_dict('records')
        balance_n1_dict = balance_n1.to_dict('records')
        
        # Convertir en format attendu
        balance_n_formatted = []
        for compte in balance_n_dict:
            balance_n_formatted.append({
                'numero': str(compte.get('Numéro', '')),
                'solde_debit': float(compte.get('Solde  Débit', 0) or 0),
                'solde_credit': float(compte.get('Solde Crédit', 0) or 0)
            })
        
        balance_n1_formatted = []
        for compte in balance_n1_dict:
            balance_n1_formatted.append({
                'numero': str(compte.get('Numéro', '')),
                'solde_debit': float(compte.get('Solde  Débit', 0) or 0),
                'solde_credit': float(compte.get('Solde Crédit', 0) or 0)
            })
        
        etats_controle['etat_controle_sens_comptes'] = calculer_etat_controle_sens_comptes(
            balance_n_formatted, balance_n1_formatted
        )
        
        print(f"✅ {len(etats_controle)} états de contrôle calculés")
        
        # 6. Générer le fichier HTML
        chemin_html = generer_html_complet(etats_controle)
        
        # 7. Ouvrir le fichier dans le navigateur
        print("\n🌐 Ouverture du fichier dans le navigateur...")
        import webbrowser
        webbrowser.open(f'file://{chemin_html}')
        
        print("\n" + "=" * 80)
        print("✅ TEST TERMINÉ AVEC SUCCÈS!")
        print("=" * 80)
        print(f"\n📍 Fichier HTML: {chemin_html}")
        print("\n📊 Résumé:")
        print(f"   • Balance N: {len(balance_n)} comptes")
        print(f"   • Balance N-1: {len(balance_n1)} comptes")
        print(f"   • États de contrôle: {len(etats_controle)}")
        print(f"   • Résultat Net N: {resultat_net_n:,.0f}".replace(',', ' '))
        print(f"   • Résultat Net N-1: {resultat_net_n1:,.0f}".replace(',', ' '))
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    main()
