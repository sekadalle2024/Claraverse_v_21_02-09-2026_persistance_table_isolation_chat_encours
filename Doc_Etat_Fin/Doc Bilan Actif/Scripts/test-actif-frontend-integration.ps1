# ============================================================================
# Script de Test - Intégration Frontend ACTIF (BRUT, AMORT, NET)
# ============================================================================
# Date: 07 Avril 2026
# Objectif: Tester l'affichage des colonnes BRUT, AMORT ET DEPREC, NET dans le frontend
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   TEST INTEGRATION FRONTEND - ACTIF BRUT, AMORT, NET" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier les fichiers modifiés
Write-Host "📋 Étape 1: Vérification des fichiers modifiés..." -ForegroundColor Yellow
Write-Host ""

$fichiers = @(
    "public/menu.js",
    "py_backend/etats_financiers.py",
    "py_backend/calculer_actif_brut_amort.py"
)

$tousPresents = $true
foreach ($fichier in $fichiers) {
    if (Test-Path $fichier) {
        Write-Host "   ✅ $fichier" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $fichier MANQUANT" -ForegroundColor Red
        $tousPresents = $false
    }
}

if (-not $tousPresents) {
    Write-Host ""
    Write-Host "❌ Certains fichiers sont manquants. Arrêt du test." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les fichiers requis sont présents" -ForegroundColor Green
Write-Host ""

# Étape 2: Vérifier que le backend contient l'enrichissement
Write-Host "📋 Étape 2: Vérification de l'enrichissement backend..." -ForegroundColor Yellow
Write-Host ""

$backendContent = Get-Content "py_backend/etats_financiers.py" -Raw
if ($backendContent -match "enrichir_actif_avec_brut_amort") {
    Write-Host "   ✅ Import de enrichir_actif_avec_brut_amort trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Import de enrichir_actif_avec_brut_amort NON trouvé" -ForegroundColor Red
}

if ($backendContent -match "actif_enrichi = enrichir_actif_avec_brut_amort") {
    Write-Host "   ✅ Appel de enrichir_actif_avec_brut_amort trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Appel de enrichir_actif_avec_brut_amort NON trouvé" -ForegroundColor Red
}

if ($backendContent -match "'actif_detaille': actif_enrichi\['actif_detaille'\]") {
    Write-Host "   ✅ Retour de actif_detaille trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Retour de actif_detaille NON trouvé" -ForegroundColor Red
}

if ($backendContent -match "'actif_html': actif_enrichi\['html'\]") {
    Write-Host "   ✅ Retour de actif_html trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Retour de actif_html NON trouvé" -ForegroundColor Red
}

Write-Host ""

# Étape 3: Vérifier que le frontend utilise le HTML backend
Write-Host "📋 Étape 3: Vérification de l'utilisation du HTML backend..." -ForegroundColor Yellow
Write-Host ""

$frontendContent = Get-Content "public/menu.js" -Raw
if ($frontendContent -match "if \(result\.html\)") {
    Write-Host "   ✅ Détection de result.html trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Détection de result.html NON trouvée" -ForegroundColor Red
}

if ($frontendContent -match "container\.innerHTML = result\.html") {
    Write-Host "   ✅ Utilisation de result.html trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Utilisation de result.html NON trouvée" -ForegroundColor Red
}

if ($frontendContent -match "\.section-header-ef") {
    Write-Host "   ✅ Gestion des accordéons backend trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Gestion des accordéons backend NON trouvée" -ForegroundColor Red
}

Write-Host ""

# Étape 4: Instructions pour le test manuel
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS POUR LE TEST MANUEL" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Démarrer le backend:" -ForegroundColor Yellow
Write-Host "   cd py_backend" -ForegroundColor White
Write-Host "   conda activate claraverse_backend" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Démarrer le frontend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   (dans un autre terminal)" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Dans le navigateur:" -ForegroundColor Yellow
Write-Host "   a) Ouvrir l'application Claraverse" -ForegroundColor White
Write-Host "   b) Envoyer le message: Etat fin" -ForegroundColor White
Write-Host "   c) Uploader le fichier: P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  Vérifier l'affichage:" -ForegroundColor Yellow
Write-Host "   ✓ Le menu accordéon doit s'afficher" -ForegroundColor White
Write-Host "   ✓ La section BILAN ACTIF doit avoir 7 colonnes:" -ForegroundColor White
Write-Host "     - REF" -ForegroundColor Gray
Write-Host "     - ACTIF" -ForegroundColor Gray
Write-Host "     - NOTE" -ForegroundColor Gray
Write-Host "     - BRUT (exercice N)" -ForegroundColor Green
Write-Host "     - AMORT ET DEPREC (exercice N)" -ForegroundColor Green
Write-Host "     - NET (exercice N)" -ForegroundColor Green
Write-Host "     - NET (exercice N-1)" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Vérifier les valeurs:" -ForegroundColor Yellow
Write-Host "   ✓ Les colonnes BRUT et AMORT ET DEPREC doivent être renseignées" -ForegroundColor White
Write-Host "   ✓ NET = BRUT - AMORT ET DEPREC" -ForegroundColor White
Write-Host "   ✓ Les totalisations doivent être correctes" -ForegroundColor White
Write-Host ""

Write-Host "6️⃣  Ouvrir la console du navigateur (F12):" -ForegroundColor Yellow
Write-Host "   Rechercher les messages:" -ForegroundColor White
Write-Host "   ✓ '✅ [États Financiers] Utilisation du HTML généré par le backend'" -ForegroundColor Green
Write-Host "   ✓ '✅ [États Financiers] Accordéons activés (formats frontend et backend)'" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC EN CAS DE PROBLÈME" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si les colonnes BRUT et AMORT ne s'affichent pas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vérifier la console du navigateur:" -ForegroundColor White
Write-Host "   - Y a-t-il des erreurs JavaScript?" -ForegroundColor Gray
Write-Host "   - Le message 'Utilisation du HTML généré par le backend' apparaît-il?" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Vérifier la réponse du backend:" -ForegroundColor White
Write-Host "   - Ouvrir l'onglet Network (Réseau) dans les DevTools" -ForegroundColor Gray
Write-Host "   - Chercher la requête vers /etats-financiers/calculate" -ForegroundColor Gray
Write-Host "   - Vérifier que la réponse contient 'html' et 'actif_detaille'" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Vérifier les logs du backend:" -ForegroundColor White
Write-Host "   - Le message '📊 Enrichissement ACTIF avec colonnes BRUT, AMORT, NET...' apparaît-il?" -ForegroundColor Gray
Write-Host "   - Y a-t-il des erreurs Python?" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Tester le module isolément:" -ForegroundColor White
Write-Host "   .\test-actif-brut-amort.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   FICHIERS DE RÉFÉRENCE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "   Doc_Etat_Fin/Doc Bilan Actif/00_COMMENCER_ICI.txt" -ForegroundColor White
Write-Host "   Doc_Etat_Fin/Doc Bilan Actif/README.md" -ForegroundColor White
Write-Host "   Doc_Etat_Fin/Documentation/00_SOLUTION_ACTIF_BRUT_AMORT_07_AVRIL_2026.md" -ForegroundColor White
Write-Host ""

Write-Host "Captures d'écran de référence:" -ForegroundColor Yellow
Write-Host "   - ACTIF SYSCOHADA REVISE: Format attendu avec 7 colonnes" -ForegroundColor White
Write-Host "   - ACTIF MENU ACCORDEON: Ancien format avec seulement NET" -ForegroundColor White
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Vérification des fichiers terminée" -ForegroundColor Green
Write-Host "📋 Suivez les instructions ci-dessus pour le test manuel" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
