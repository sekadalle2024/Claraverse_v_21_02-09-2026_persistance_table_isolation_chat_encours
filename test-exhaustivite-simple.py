#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de test simple pour vérifier l'exhaustivité des états financiers
"""
import urllib.request
import urllib.error
import base64
import json
from datetime import datetime
import re
import os
import webbrowser

print("=" * 80)
print("TEST EXHAUSTIVITE ETATS FINANCIERS")
print("=" * 80)
print()

# 1. Vérifier le backend
print("1. Vérification du backend...")
try:
    req = urllib.request.Request("http://127.0.0.1:5000/health")
    with urllib.request.urlopen(req, timeout=5) as response:
        print("   OK Backend operationnel")
except Exception as e:
    print(f"   ERREUR Backend non accessible: {e}")
    exit(1)

# 2. Charger le fichier de balance
balance_file = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
print(f"\n2. Chargement du fichier: {balance_file}")
try:
    with open(balance_file, "rb") as f:
        file_bytes = f.read()
    file_base64 = base64.b64encode(file_bytes).decode('utf-8')
    print(f"   OK Fichier encode: {len(file_bytes)} bytes")
except Exception as e:
    print(f"   ERREUR: {e}")
    exit(1)

# 3. Envoyer la requête
print("\n3. Envoi de la requete au backend...")
try:
    payload = {
        "filename": "P000 -BALANCE DEMO N_N-1_N-2.xls",
        "file_base64": file_base64
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        "http://127.0.0.1:5000/etats-financiers/process-excel",
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        print(f"   OK Requete reussie (Status: {response.status})")
        response_data = response.read().decode('utf-8')
        
except urllib.error.HTTPError as e:
    print(f"   ERREUR HTTP {e.code}")
    print(f"   Reponse: {e.read().decode('utf-8')}")
    exit(1)
except Exception as e:
    print(f"   ERREUR: {e}")
    exit(1)

# 4. Analyser la réponse
print("\n4. Analyse de la reponse...")
try:
    result = json.loads(response_data)
    html = result.get('html', '')
    
    # Sauvegarder le HTML
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(os.path.expanduser("~"), "Desktop", f"diagnostic_exhaustivite_{timestamp}.html")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"   OK HTML sauvegarde: {output_file}")
    
    # Compter les sections
    sections = len(re.findall(r'<div class="etats-fin-section"', html))
    
    print(f"\n   SECTIONS TROUVEES: {sections}")
    
    # Extraire les titres
    titres = re.findall(r'<div class="section-header-ef[^"]*"[^>]*>([^<]+)</div>', html)
    
    print("\n   SECTIONS DETECTEES:")
    for i, titre in enumerate(titres, 1):
        print(f"   {i}. {titre.strip()}")
    
    print("\n   SECTIONS ATTENDUES (11):")
    attendues = [
        "BILAN - ACTIF",
        "BILAN - PASSIF",
        "COMPTE DE RESULTAT",
        "TABLEAU DES FLUX DE TRESORERIE",
        "NOTES ANNEXES",
        "Etat de controle Bilan Actif",
        "Etat de controle Bilan Passif",
        "Etat de controle Compte de Resultat",
        "Etat de controle TFT",
        "Etat de controle Sens des Comptes",
        "Etat d'equilibre Bilan"
    ]
    for i, titre in enumerate(attendues, 1):
        print(f"   {i}. {titre}")
    
    print()
    if sections == 11:
        print("   SUCCES: Toutes les sections sont presentes!")
    else:
        print(f"   PROBLEME: {sections} sections au lieu de 11")
        print(f"   Sections manquantes: {11 - sections}")
    
    # Ouvrir le fichier
    print(f"\n5. Ouverture du fichier HTML...")
    webbrowser.open(output_file)
    print("   OK Fichier ouvert dans le navigateur")
    
except Exception as e:
    print(f"   ERREUR: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print()
print("=" * 80)
print("TEST TERMINE")
print("=" * 80)
