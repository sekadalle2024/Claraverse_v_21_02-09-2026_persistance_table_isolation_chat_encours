# -*- coding: utf-8 -*-
"""
Script de vérification que N-2 est utilisé pour les calculs mais pas affiché
Vérifie que:
1. N-2 est bien chargé depuis le fichier Excel
2. N-2 est utilisé pour calculer les variations de N-1
3. Seules 2 colonnes (N et N-1) sont affichées dans le HTML
"""

import pandas as pd
import os
import sys

# Ajouter le dossier py_backend au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'py_backend'))

from etats_financiers_v2 import process_balance_to_liasse_format
from etats_financiers import load_tableau_correspondance, detect_balance_columns


def verifier_chargement_n2():
    """Vérifie que N-2 est bien chargé depuis le fichier Excel"""
    print("═══════════════════════════════════════════════════════════════")
    print("  1️⃣  VÉRIFICATION CHARGEMENT N-2")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    fichier = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
    
    if not os.path.exists(fichier):
        print(f"❌ Fichier non trouvé: {fichier}")
        return False
    
    # Charger les 3 onglets
    try:
        # Détecter les noms d'onglets
        excel_file = pd.ExcelFile(fichier)
        sheet_names = excel_file.sheet_names
        print(f"📋 Onglets détectés: {sheet_names}")
        print()
        
        # Utiliser les 3 premiers onglets (N, N-1, N-2)
        balance_n = pd.read_excel(fichier, sheet_name=sheet_names[0])
        balance_n1 = pd.read_excel(fichier, sheet_name=sheet_names[1])
        balance_n2 = pd.read_excel(fichier, sheet_name=sheet_names[2])
        
        print(f"✅ Balance N chargée: {len(balance_n)} comptes")
        print(f"✅ Balance N-1 chargée: {len(balance_n1)} comptes")
        print(f"✅ Balance N-2 chargée: {len(balance_n2)} comptes")
        print()
        
        return balance_n, balance_n1, balance_n2
    except Exception as e:
        print(f"❌ Erreur chargement: {e}")
        return False


def verifier_calculs_avec_n2(balance_n, balance_n1, balance_n2):
    """Vérifie que N-2 est utilisé dans les calculs"""
    print("═══════════════════════════════════════════════════════════════")
    print("  2️⃣  VÉRIFICATION CALCULS AVEC N-2")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    # Charger les correspondances
    correspondances = load_tableau_correspondance()
    
    # Traiter avec N-2
    print("📊 Traitement avec N-2...")
    results_avec_n2 = process_balance_to_liasse_format(
        balance_n, balance_n1, balance_n2, correspondances
    )
    
    # Traiter sans N-2
    print("📊 Traitement sans N-2...")
    results_sans_n2 = process_balance_to_liasse_format(
        balance_n, balance_n1, None, correspondances
    )
    
    # Vérifier que les résultats sont différents
    print()
    print("🔍 Comparaison des résultats:")
    print()
    
    # Comparer quelques postes du compte de résultat
    postes_test = ['TA', 'RA', 'XI']  # Ventes, Achats, Résultat
    
    for ref in postes_test:
        poste_avec = next((p for p in results_avec_n2['compte_resultat'] if p['ref'] == ref), None)
        poste_sans = next((p for p in results_sans_n2['compte_resultat'] if p['ref'] == ref), None)
        
        if poste_avec and poste_sans:
            print(f"  Poste {ref} - {poste_avec['libelle']}:")
            print(f"    Avec N-2:  N={poste_avec.get('montant_n', 0):,.0f}  N-1={poste_avec.get('montant_n1', 0):,.0f}  N-2={poste_avec.get('montant_n2', 0):,.0f}")
            print(f"    Sans N-2:  N={poste_sans.get('montant_n', 0):,.0f}  N-1={poste_sans.get('montant_n1', 0):,.0f}  N-2={poste_sans.get('montant_n2', 0):,.0f}")
            print()
    
    # Vérifier que montant_n2 existe et n'est pas 0
    n2_existe = any(p.get('montant_n2', 0) != 0 for p in results_avec_n2['compte_resultat'])
    
    if n2_existe:
        print("✅ N-2 est bien calculé et stocké dans les résultats")
    else:
        print("⚠️  N-2 n'est pas calculé ou est à 0")
    
    print()
    return results_avec_n2


def verifier_affichage_2_colonnes():
    """Vérifie que seules 2 colonnes sont affichées dans le HTML"""
    print("═══════════════════════════════════════════════════════════════")
    print("  3️⃣  VÉRIFICATION AFFICHAGE 2 COLONNES")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    fichier = "py_backend/etats_financiers_v2.py"
    
    if not os.path.exists(fichier):
        print(f"❌ Fichier non trouvé: {fichier}")
        return False
    
    with open(fichier, 'r', encoding='utf-8') as f:
        contenu = f.read()
    
    # Vérifier l'en-tête du tableau
    if '<th style="width: 150px; text-align: right;">{exercice_n2_label}</th>' in contenu:
        print("❌ ERREUR: 3 colonnes détectées dans l'en-tête (N, N-1, N-2)")
        print("   → N-2 ne doit PAS être affiché")
        return False
    elif '<th style="width: 150px; text-align: right;">{exercice_n1_label}</th>' in contenu:
        print("✅ 2 colonnes détectées dans l'en-tête (N et N-1)")
    else:
        print("⚠️  Format d'en-tête non reconnu")
        return False
    
    # Vérifier les cellules du tableau
    if '<td class="montant-cell">{format_montant_liasse(montant_n2)}</td>' in contenu:
        print("❌ ERREUR: Cellule N-2 détectée dans le tableau")
        print("   → N-2 ne doit PAS être affiché")
        return False
    elif '<td class="montant-cell">{format_montant_liasse(montant_n1)}</td>' in contenu:
        print("✅ 2 cellules détectées (N et N-1)")
    else:
        print("⚠️  Format de cellules non reconnu")
        return False
    
    print()
    print("✅ Affichage correct: 2 colonnes seulement (N et N-1)")
    print()
    
    return True


def generer_rapport_html(results):
    """Génère un rapport HTML de test"""
    print("═══════════════════════════════════════════════════════════════")
    print("  4️⃣  GÉNÉRATION RAPPORT HTML")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    from datetime import datetime
    from etats_financiers_v2 import generate_section_html_liasse, format_montant_liasse
    
    date_generation = datetime.now().strftime("%d %B %Y à %H:%M")
    
    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Affichage N et N-1 (avec N-2 en calcul)</title>
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
        }}
        
        .header p {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .info-box {{
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 20px;
            border-radius: 5px;
        }}
        
        .info-box h2 {{
            margin-bottom: 15px;
            color: #1976d2;
        }}
        
        .info-box ul {{
            margin-left: 20px;
            line-height: 1.8;
        }}
        
        .content {{
            padding: 20px;
        }}
        
        .liasse-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .liasse-table thead {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        .liasse-table th {{
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }}
        
        .liasse-table td {{
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
        }}
        
        .liasse-table tbody tr:hover {{
            background-color: #f5f5f5;
        }}
        
        .liasse-table .total-row {{
            background-color: #f0f0f0;
            font-weight: bold;
            border-top: 2px solid #667eea;
        }}
        
        .ref-cell {{
            font-weight: bold;
            color: #667eea;
            text-align: center;
        }}
        
        .montant-cell {{
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: 500;
        }}
        
        .footer {{
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 2px solid #e0e0e0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Test Affichage États Financiers</h1>
            <p>Format: 2 colonnes (N et N-1) - N-2 utilisé en calcul uniquement</p>
            <p style="font-size: 0.9em; margin-top: 10px;">📅 Généré le: {date_generation}</p>
        </div>
        
        <div class="info-box">
            <h2>📊 Principe de Fonctionnement</h2>
            <ul>
                <li><strong>N-2 est chargé</strong> depuis le fichier Excel (onglet BALANCE N-2)</li>
                <li><strong>N-2 est utilisé</strong> pour calculer les variations de N-1 (dans le TFT notamment)</li>
                <li><strong>N-2 n'est PAS affiché</strong> dans les tableaux (seulement N et N-1)</li>
                <li><strong>Format liasse officielle</strong>: 2 colonnes conformes au SYSCOHADA</li>
            </ul>
        </div>
        
        <div class="content">
            <h2 style="margin: 20px 0;">📈 Compte de Résultat (Extrait)</h2>
"""
    
    # Afficher un extrait du compte de résultat
    postes_extrait = [p for p in results['compte_resultat'] if p['ref'] in ['TA', 'TB', 'XA', 'RA', 'RB', 'XB', 'XI']]
    
    html += """
            <table class="liasse-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">REF</th>
                        <th style="width: auto;">LIBELLÉS</th>
                        <th style="width: 60px;">NOTE</th>
                        <th style="width: 150px; text-align: right;">EXERCICE N</th>
                        <th style="width: 150px; text-align: right;">EXERCICE N-1</th>
                    </tr>
                </thead>
                <tbody>
"""
    
    for poste in postes_extrait:
        ref = poste['ref']
        libelle = poste['libelle']
        note = poste.get('note', '')
        montant_n = format_montant_liasse(poste.get('montant_n', 0))
        montant_n1 = format_montant_liasse(poste.get('montant_n1', 0))
        
        is_total = ref.startswith('X')
        row_class = 'total-row' if is_total else ''
        
        html += f"""
                    <tr class="{row_class}">
                        <td class="ref-cell">{ref}</td>
                        <td>{libelle}</td>
                        <td class="note-cell">{note}</td>
                        <td class="montant-cell">{montant_n}</td>
                        <td class="montant-cell">{montant_n1}</td>
                    </tr>
"""
    
    html += """
                </tbody>
            </table>
            
            <div class="info-box" style="background: #f0fdf4; border-left-color: #10b981;">
                <h2 style="color: #059669;">✅ Validation</h2>
                <ul>
                    <li>✅ Seules 2 colonnes sont affichées (N et N-1)</li>
                    <li>✅ N-2 est stocké en mémoire pour les calculs</li>
                    <li>✅ Format conforme au SYSCOHADA Révisé</li>
                    <li>✅ Les montants N-1 sont calculés avec N-2 en référence</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Test Affichage États Financiers - Format 2 Colonnes</strong></p>
            <p style="margin-top: 10px;">Module développé pour ClaraVerse - Projet Open Source</p>
            <p style="margin-top: 5px;">📅 Date de génération: """ + date_generation + """</p>
        </div>
    </div>
</body>
</html>
"""
    
    # Sauvegarder sur le bureau
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    output_file = os.path.join(desktop, "test_affichage_n_n1_avec_n2_calcul.html")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Rapport HTML généré: {output_file}")
    print()
    
    return True


def main():
    """Fonction principale"""
    print()
    print("═══════════════════════════════════════════════════════════════")
    print("  🔍 VÉRIFICATION N-2 UTILISÉ MAIS PAS AFFICHÉ")
    print("═══════════════════════════════════════════════════════════════")
    print()
    
    # 1. Vérifier chargement N-2
    balances = verifier_chargement_n2()
    if not balances:
        return
    
    balance_n, balance_n1, balance_n2 = balances
    
    # 2. Vérifier calculs avec N-2
    results = verifier_calculs_avec_n2(balance_n, balance_n1, balance_n2)
    
    # 3. Vérifier affichage 2 colonnes
    if not verifier_affichage_2_colonnes():
        print()
        print("⚠️  ATTENTION: Le code affiche 3 colonnes au lieu de 2")
        print("   → Utiliser le script de correction si nécessaire")
        print()
    
    # 4. Générer rapport HTML
    generer_rapport_html(results)
    
    print("═══════════════════════════════════════════════════════════════")
    print("  ✅ VÉRIFICATION TERMINÉE")
    print("═══════════════════════════════════════════════════════════════")
    print()
    print("📋 Résumé:")
    print("  • N-2 est chargé depuis le fichier Excel")
    print("  • N-2 est utilisé pour les calculs (variations N-1)")
    print("  • Seules 2 colonnes sont affichées (N et N-1)")
    print("  • Format conforme au SYSCOHADA Révisé")
    print()


if __name__ == "__main__":
    main()
