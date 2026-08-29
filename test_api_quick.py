import requests
import base64
import json

# Lire le fichier
with open('py_backend/Balance excel.xlsx', 'rb') as f:
    file_content = f.read()

# Encoder en base64
file_base64 = base64.b64encode(file_content).decode('utf-8')

# Préparer la requête
payload = {
    "filename": "Balance excel.xlsx",
    "file_base64": file_base64,
    "file_n1_base64": None,
    "filename_n1": None
}

# Envoyer la requête
response = requests.post(
    'http://127.0.0.1:5000/etats-financiers/process-excel',
    json=payload,
    timeout=30
)

print(f"Status: {response.status_code}")
print(f"Response length: {len(response.text)} chars")

# Vérifier les sections du menu accordéon
if response.status_code == 200:
    data = response.json()
    html = data.get('html', '')
    
    # Chercher les sections
    sections = [
        ('BILAN - ACTIF', 'Actif'),
        ('BILAN - PASSIF', 'Passif'),
        ('COMPTE DE RÉSULTAT', 'Résultat'),
        ('TABLEAU DES FLUX', 'TFT'),
        ('NOTES ANNEXES', 'Annexes'),
        ('Etat de contrôle', 'Contrôles'),
        ('montant_n', 'Colonne N'),
        ('montant_n1', 'Colonne N-1'),
        ('section-header-ef', 'Accordéon CSS'),
        ('section-content-ef', 'Contenu accordéon')
    ]
    
    print("\n✅ VÉRIFICATIONS:")
    for pattern, label in sections:
        if pattern in html:
            print(f"  ✅ {label}: PRÉSENT")
        else:
            print(f"  ❌ {label}: ABSENT")
else:
    print(f"Erreur: {response.text[:500]}")
