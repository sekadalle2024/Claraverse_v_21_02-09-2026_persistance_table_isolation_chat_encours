"""
Test d'intégration frontend pour vérifier l'affichage ACTIF BRUT/AMORT/NET
Date: 07 Avril 2026
"""

import sys
import os

# Ajouter le chemin du backend
sys.path.insert(0, 'py_backend')

print("🧪 TEST INTEGRATION FRONTEND - ACTIF BRUT/AMORT/NET")
print("=" * 60)

# 1. Test backend: vérifier que le HTML est généré correctement
print("\n📊 ÉTAPE 1: Test backend Python")
print("Vérification que calculer_actif_brut_amort.py génère le HTML...")

try:
    from calculer_actif_brut_amort import generer_html_actif_detaille
    
    # Données de test minimales
    actif_test = {
        'AA': {
            'ref': 'AA',
            'libelle': 'Charges immobilisées',
            'brut': 1000000,
            'amort_deprec': 200000,
            'net': 800000,
            'comptes_brut': [],
            'comptes_amort': []
        },
        'AZ': {
            'ref': 'AZ',
            'libelle': 'TOTAL ACTIF IMMOBILISÉ',
            'brut': 1000000,
            'amort_deprec': 200000,
            'net': 800000,
            'comptes_brut': [],
            'comptes_amort': []
        }
    }
    
    html = generer_html_actif_detaille(actif_test)
    
    # Vérifier que le HTML contient les colonnes attendues
    if 'BRUT' in html and 'AMORT ET DEPREC' in html and 'NET' in html:
        print('✅ HTML backend contient les 3 colonnes: BRUT, AMORT ET DEPREC, NET')
        print(f'📏 Longueur HTML: {len(html)} caractères')
        
        # Vérifier la structure du tableau
        if '<table class="actif-table">' in html:
            print('✅ Structure de tableau correcte')
        
        # Vérifier les en-têtes
        if '<th class="montant-col">BRUT</th>' in html:
            print('✅ En-tête BRUT présent')
        if '<th class="montant-col">AMORT ET DEPREC</th>' in html:
            print('✅ En-tête AMORT ET DEPREC présent')
        if '<th class="montant-col">NET</th>' in html:
            print('✅ En-tête NET présent')
            
    else:
        print('❌ ERREUR: Colonnes manquantes dans le HTML')
        sys.exit(1)
        
except Exception as e:
    print(f'❌ Erreur lors du test backend: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 2. Vérifier que menu.js utilise result.html
print("\n📊 ÉTAPE 2: Vérification menu.js")
print("Recherche de la logique d'utilisation de result.html...")

try:
    with open('public/menu.js', 'r', encoding='utf-8') as f:
        menu_js_content = f.read()
    
    if 'if (result.html)' in menu_js_content:
        print('✅ menu.js vérifie result.html')
        if 'container.innerHTML = result.html' in menu_js_content:
            print('✅ menu.js utilise result.html directement')
        else:
            print('⚠️ menu.js ne semble pas utiliser result.html correctement')
    else:
        print('❌ menu.js ne vérifie pas result.html')
        
except Exception as e:
    print(f'⚠️ Erreur lors de la lecture de menu.js: {e}')

# 3. Vérifier que etats_financiers.py retourne actif_html
print("\n📊 ÉTAPE 3: Vérification etats_financiers.py")
print("Recherche de actif_html dans le retour...")

try:
    with open('py_backend/etats_financiers.py', 'r', encoding='utf-8') as f:
        etats_fin_content = f.read()
    
    if "'actif_html': actif_enrichi['html']" in etats_fin_content:
        print('✅ etats_financiers.py retourne actif_html')
    else:
        print('⚠️ etats_financiers.py pourrait ne pas retourner actif_html')
    
    if "html = results['actif_html']" in etats_fin_content or "results['actif_html']" in etats_fin_content:
        print('✅ etats_financiers.py utilise actif_html')
    else:
        print('⚠️ etats_financiers.py pourrait ne pas utiliser actif_html')
        
except Exception as e:
    print(f'⚠️ Erreur lors de la lecture de etats_financiers.py: {e}')

# 4. Instructions pour test manuel
print("\n📊 ÉTAPE 4: Test manuel requis")
print("""
Pour tester l'affichage complet:

1. Démarrer le backend:
   cd py_backend
   python main.py

2. Démarrer le frontend:
   npm run dev

3. Dans le navigateur:
   - Ouvrir la console (F12)
   - Envoyer le message: "Etat fin"
   - Uploader le fichier: P000 -BALANCE DEMO N_N-1_N-2.xls
   
4. Vérifier dans la console:
   - Message: "✅ [États Financiers] Utilisation du HTML généré par le backend"
   - Vérifier que result.html contient les colonnes BRUT, AMORT, NET
   
5. Vérifier visuellement:
   - L'accordéon "BILAN - ACTIF" doit afficher 7 colonnes:
     REF | ACTIF | NOTE | BRUT | AMORT ET DEPREC | NET | NET N-1
""")

print("\n✅ Tests automatiques terminés")
print("⚠️ Test manuel requis pour vérifier l'affichage complet")
