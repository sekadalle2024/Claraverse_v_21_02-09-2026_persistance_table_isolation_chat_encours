#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test de l'API avec vérification des accordéons"""

import base64
import requests
import json

# Lire le fichier
with open("py_backend/BALANCES_N_N1_N2.xlsx", "rb") as f:
    file_content = f.read()

# Encoder en base64
file_base64 = base64.b64encode(file_content).decode('utf-8')

# Préparer la requête
payload = {
    "file_base64": file_base64,
    "filename": "BALANCES_N_N1_N2.xlsx"
}

print("📤 Envoi de la requête...")
response = requests.post(
    "http://127.0.0.1:5000/etats-financiers/process-excel",
    json=payload,
    headers={"Content-Type": "application/json"}
)

print(f"📥 Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    html = result.get("html", "")
    
    print(f"✅ HTML reçu: {len(html)} caractères")
    
    # Vérifier les patterns
    patterns = [
        ".section-header-ef",
        ".section-content-ef",
        "max-height: 0",
        "max-height: 10000px",
        "🏢 BILAN - ACTIF",
        "🏛️ BILAN - PASSIF",
        "📊 COMPTE DE RÉSULTAT",
        "💧 TABLEAU DES FLUX DE TRÉSORERIE",
        "📋 NOTES ANNEXES"
    ]
    
    print("\n🔍 Vérification des patterns:")
    all_found = True
    for pattern in patterns:
        if pattern in html:
            print(f"  ✅ {pattern}")
        else:
            print(f"  ❌ {pattern} MANQUANT")
            all_found = False
    
    if all_found:
        print("\n✅ TOUS LES PATTERNS PRÉSENTS!")
    else:
        print("\n❌ CERTAINS PATTERNS MANQUANTS")
    
    # Sauvegarder le HTML
    with open("test-api-output.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("\n📄 HTML sauvegardé dans: test-api-output.html")
    
else:
    print(f"❌ Erreur: {response.text}")
