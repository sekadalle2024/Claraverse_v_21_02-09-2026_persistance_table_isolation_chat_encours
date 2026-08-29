# Test d'intégration frontend pour vérifier l'affichage ACTIF BRUT/AMORT/NET
# Date: 07 Avril 2026

Write-Host "🧪 TEST INTEGRATION FRONTEND - ACTIF BRUT/AMORT/NET" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Vérifier que le backend génère le HTML enrichi
Write-Host "`n📊 ÉTAPE 1: Test backend Python" -ForegroundColor Yellow
Write-Host "Vérification que calculer_actif_brut_amort.py génère le HTML..."

python -c @"
import sys
sys.path.insert(0, 'py_backend')
from calculer_actif_brut_amort import generer_html_actif_detaille

# Données de test minimales
actif_test = {
    'AA': {'ref': 'AA', 'libelle': 'Charges immobilisées', 'brut': 1000000, 'amort_deprec': 200000, 'net': 800000, 'comptes_brut': [], 'comptes_amort': []},
    'AZ': {'ref': 'AZ', 'libelle': 'TOTAL ACTIF IMMOBILISÉ', 'brut': 1000000, 'amort_deprec': 200000, 'net': 800000, 'comptes_brut': [], 'comptes_amort': []}
}

html = generer_html_actif_detaille(actif_test)

# Vérifier que le HTML contient les colonnes attendues
if 'BRUT' in html and 'AMORT ET DEPREC' in html and 'NET' in html:
    print('✅ HTML backend contient les 3 colonnes: BRUT, AMORT ET DEPREC, NET')
    print(f'📏 Longueur HTML: {len(html)} caractères')
else:
    print('❌ ERREUR: Colonnes manquantes dans le HTML')
    sys.exit(1)
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Test backend échoué" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que menu.js utilise result.html
Write-Host "`n📊 ÉTAPE 2: Vérification menu.js" -ForegroundColor Yellow
Write-Host "Recherche de la logique d'utilisation de result.html..."

$menuJsContent = Get-Content "public/menu.js" -Raw
if ($menuJsContent -match "if \(result\.html\)") {
    Write-Host "✅ menu.js vérifie result.html" -ForegroundColor Green
    if ($menuJsContent -match "container\.innerHTML = result\.html") {
        Write-Host "✅ menu.js utilise result.html directement" -ForegroundColor Green
    } else {
        Write-Host "⚠️ menu.js ne semble pas utiliser result.html correctement" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ menu.js ne vérifie pas result.html" -ForegroundColor Red
}

# 3. Vérifier que etats_financiers.py retourne actif_html
Write-Host "`n📊 ÉTAPE 3: Vérification etats_financiers.py" -ForegroundColor Yellow
Write-Host "Recherche de actif_html dans le retour..."

$etatsFinContent = Get-Content "py_backend/etats_financiers.py" -Raw
if ($etatsFinContent -match "'actif_html': actif_enrichi\['html'\]") {
    Write-Host "✅ etats_financiers.py retourne actif_html" -ForegroundColor Green
} else {
    Write-Host "⚠️ etats_financiers.py pourrait ne pas retourner actif_html" -ForegroundColor Yellow
}

if ($etatsFinContent -match "html = results\['actif_html'\]") {
    Write-Host "✅ etats_financiers.py utilise actif_html dans generate_etats_financiers_html" -ForegroundColor Green
} else {
    Write-Host "⚠️ etats_financiers.py pourrait ne pas utiliser actif_html" -ForegroundColor Yellow
}

# 4. Instructions pour test manuel
Write-Host "`n📊 ÉTAPE 4: Test manuel requis" -ForegroundColor Yellow
Write-Host @"

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

"@

Write-Host "`n✅ Tests automatiques terminés" -ForegroundColor Green
Write-Host "⚠️ Test manuel requis pour vérifier l'affichage complet" -ForegroundColor Yellow
