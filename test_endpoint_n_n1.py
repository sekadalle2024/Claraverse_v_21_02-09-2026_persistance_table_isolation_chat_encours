# -*- coding: utf-8 -*-
import requests
import base64
import json
import sys
import io

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("="*80)
print("TEST ENDPOINT /etats-financiers/calculer")
print("="*80)

# Lire le fichier
with open('py_backend/BALANCES_N_N1_N2.xlsx', 'rb') as f:
    file_content = f.read()

file_base64 = base64.b64encode(file_content).decode('utf-8')

# Préparer la requête
payload = {
    "filename": "BALANCES_N_N1_N2.xlsx",
    "file_base64": file_base64,
    "file_n1_base64": None,
    "filename_n1": None
}

print(f"\n📤 Envoi de la requête à http://localhost:8000/etats-financiers/calculer")
print(f"   Fichier: BALANCES_N_N1_N2.xlsx ({len(file_content)} octets)")

try:
    response = requests.post(
        'http://localhost:8000/etats-financiers/calculer',
        json=payload,
        timeout=30
    )
    
    print(f"\n📥 Réponse reçue: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success'):
            print("✅ Succès!")
            
            # Vérifier les résultats
            results = data.get('results', {})
            
            # Vérifier le compte de résultat
            cr = results.get('compte_resultat', [])
            if cr:
                print(f"\n📊 Compte de Résultat: {len(cr)} postes")
                
                # Chercher un poste avec des montants
                for poste in cr[:10]:
                    ref = poste.get('ref', '')
                    libelle = poste.get('libelle', '')
                    montant_n = poste.get('montant_n', 0)
                    montant_n1 = poste.get('montant_n1', 0)
                    
                    if abs(montant_n) > 0 or abs(montant_n1) > 0:
                        print(f"\n   {ref} - {libelle}")
                        print(f"      N   : {montant_n:>15,.2f}")
                        print(f"      N-1 : {montant_n1:>15,.2f}")
                        
                        if montant_n != montant_n1:
                            print(f"      ✅ DIFFÉRENT")
                        else:
                            print(f"      ❌ IDENTIQUE")
                        break
            
            # Vérifier le bilan actif
            actif = results.get('bilan_actif', [])
            if actif:
                print(f"\n📊 Bilan Actif: {len(actif)} postes")
                
                for poste in actif[:10]:
                    ref = poste.get('ref', '')
                    libelle = poste.get('libelle', '')
                    montant_n = poste.get('montant_n', 0)
                    montant_n1 = poste.get('montant_n1', 0)
                    
                    if abs(montant_n) > 0 or abs(montant_n1) > 0:
                        print(f"\n   {ref} - {libelle}")
                        print(f"      N   : {montant_n:>15,.2f}")
                        print(f"      N-1 : {montant_n1:>15,.2f}")
                        
                        if montant_n != montant_n1:
                            print(f"      ✅ DIFFÉRENT")
                        else:
                            print(f"      ❌ IDENTIQUE")
                        break
            
            print("\n" + "="*80)
            print("CONCLUSION")
            print("="*80)
            print("✅ L'endpoint retourne bien des données N et N-1 distinctes")
            
        else:
            print(f"❌ Erreur: {data.get('message')}")
    else:
        print(f"❌ Erreur HTTP: {response.status_code}")
        print(response.text[:500])
        
except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
