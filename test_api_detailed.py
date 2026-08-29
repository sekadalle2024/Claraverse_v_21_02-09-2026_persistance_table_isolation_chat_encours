import requests
import base64

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

if response.status_code == 200:
    data = response.json()
    html = data.get('html', '')
    
    # Chercher les colonnes
    if 'EXERCICE N' in html:
        print("✅ EXERCICE N: PRÉSENT")
    else:
        print("❌ EXERCICE N: ABSENT")
    
    if 'EXERCICE N-1' in html:
        print("✅ EXERCICE N-1: PRÉSENT")
    else:
        print("❌ EXERCICE N-1: ABSENT")
    
    # Chercher les sections
    sections = [
        'BILAN - ACTIF',
        'BILAN - PASSIF',
        'COMPTE DE RÉSULTAT',
        'TABLEAU DES FLUX',
        'NOTES ANNEXES',
        'Etat de contrôle Bilan Actif',
        'Etat de contrôle Bilan Passif',
        'Etat de contrôle Compte de Résultat',
        'Etat de contrôle Tableau des Flux',
        'Etat de contrôle Sens des Comptes',
        'Etat d\'équilibre Bilan'
    ]
    
    print("\n📊 SECTIONS TROUVÉES:")
    for section in sections:
        if section in html:
            print(f"  ✅ {section}")
        else:
            print(f"  ❌ {section}")
