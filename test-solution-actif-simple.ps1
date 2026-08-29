# ═══════════════════════════════════════════════════════════════════════════════
# TEST SIMPLE: Vérification Solution ACTIF BRUT/AMORT/NET
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST SIMPLE: Solution ACTIF BRUT/AMORT/NET" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier que les fichiers existent
Write-Host "📁 ÉTAPE 1: Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$fichiers = @(
    "py_backend\calculer_actif_brut_amort.py",
    "py_backend\etats_financiers.py",
    "public\menu.js"
)

$tous_presents = $true
foreach ($fichier in $fichiers) {
    if (Test-Path $fichier) {
        Write-Host "   ✅ $fichier" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $fichier MANQUANT!" -ForegroundColor Red
        $tous_presents = $false
    }
}

if (-not $tous_presents) {
    Write-Host ""
    Write-Host "❌ ERREUR: Fichiers manquants!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les fichiers sont présents" -ForegroundColor Green
Write-Host ""

# Étape 2: Vérifier l'import dans etats_financiers.py
Write-Host "📝 ÉTAPE 2: Vérification de l'import..." -ForegroundColor Yellow
Write-Host ""

$contenu = Get-Content "py_backend\etats_financiers.py" -Raw
if ($contenu -match "from calculer_actif_brut_amort import enrichir_actif_avec_brut_amort") {
    Write-Host "   ✅ Import présent dans etats_financiers.py" -ForegroundColor Green
} else {
    Write-Host "   ❌ Import MANQUANT dans etats_financiers.py!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Ajoutez cette ligne après les autres imports:" -ForegroundColor Yellow
    Write-Host "   from calculer_actif_brut_amort import enrichir_actif_avec_brut_amort" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Étape 3: Vérifier l'appel de la fonction
Write-Host "📝 ÉTAPE 3: Vérification de l'appel de fonction..." -ForegroundColor Yellow
Write-Host ""

if ($contenu -match "enrichir_actif_avec_brut_amort\(") {
    Write-Host "   ✅ Fonction appelée dans etats_financiers.py" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fonction NON appelée dans etats_financiers.py!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 4: Test Python simple
Write-Host "🐍 ÉTAPE 4: Test Python simple..." -ForegroundColor Yellow
Write-Host ""

$testPython = @"
import sys
sys.path.insert(0, 'py_backend')

try:
    from calculer_actif_brut_amort import enrichir_actif_avec_brut_amort
    print('✅ Module importé avec succès')
    print('✅ Fonction enrichir_actif_avec_brut_amort disponible')
except Exception as e:
    print(f'❌ Erreur: {e}')
    sys.exit(1)
"@

$testPython | python -

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Module Python fonctionnel" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'import Python!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ TOUS LES TESTS SONT PASSÉS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ARRÊTER tous les serveurs (backend et frontend)" -ForegroundColor White
Write-Host "   - Fermer tous les terminaux" -ForegroundColor Gray
Write-Host "   - Ou Ctrl+C dans chaque terminal" -ForegroundColor Gray
Write-Host ""
Write-Host "2. VIDER le cache du navigateur" -ForegroundColor White
Write-Host "   - Appuyer sur Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "   - Cocher 'Images et fichiers en cache'" -ForegroundColor Gray
Write-Host "   - Cliquer sur 'Effacer les données'" -ForegroundColor Gray
Write-Host "   - Fermer complètement le navigateur (Alt+F4)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. REDÉMARRER le backend" -ForegroundColor White
Write-Host "   cd py_backend" -ForegroundColor Cyan
Write-Host "   python main.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. REDÉMARRER le frontend (dans un autre terminal)" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. TESTER dans le navigateur" -ForegroundColor White
Write-Host "   - Ouvrir http://localhost:5173/" -ForegroundColor Gray
Write-Host "   - Ouvrir la console (F12)" -ForegroundColor Gray
Write-Host "   - Envoyer 'Etat fin'" -ForegroundColor Gray
Write-Host "   - Uploader P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor Gray
Write-Host "   - Vérifier le tableau ACTIF (7 colonnes attendues)" -ForegroundColor Gray
Write-Host ""
Write-Host "6. VÉRIFIER dans la console" -ForegroundColor White
Write-Host "   Message attendu:" -ForegroundColor Gray
Write-Host "   '✅ [États Financiers] Utilisation du HTML généré par le backend'" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
