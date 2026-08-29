# Script PowerShell pour tester les corrections des problèmes 1 et 3
# Problème 1: Colonnes BRUT et AMORTISSEMENT
# Problème 3: TFT vierge

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST DES CORRECTIONS - PROBLÈMES 1 ET 3" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce script teste les corrections apportées pour:" -ForegroundColor Yellow
Write-Host "  - Problème 1: Colonnes BRUT et AMORTISSEMENT (Bilan ACTIF)" -ForegroundColor Yellow
Write-Host "  - Problème 3: TFT vierge" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-Host "❌ ERREUR: Répertoire py_backend non trouvé" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier de balance existe
if (-not (Test-Path "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls")) {
    Write-Host "❌ ERREUR: Fichier de balance non trouvé" -ForegroundColor Red
    Write-Host "   Fichier attendu: py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire py_backend
Push-Location py_backend

try {
    Write-Host "🚀 Exécution du script de test..." -ForegroundColor Green
    Write-Host ""
    
    # Exécuter le script Python
    python test_problemes_1_et_3.py
    
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    
    if ($exitCode -eq 0) {
        Write-Host "✅ TESTS TERMINÉS AVEC SUCCÈS" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Fichiers générés:" -ForegroundColor Yellow
        
        if (Test-Path "test_probleme_1_brut_amort.xlsx") {
            Write-Host "   ✅ test_probleme_1_brut_amort.xlsx" -ForegroundColor Green
            Write-Host "      → Vérifier colonnes E (BRUT), F (AMORT), G (NET N), H (NET N-1) dans ACTIF" -ForegroundColor Gray
        }
        
        if (Test-Path "test_probleme_3_tft.xlsx") {
            Write-Host "   ✅ test_probleme_3_tft.xlsx" -ForegroundColor Green
            Write-Host "      → Vérifier colonnes I (N) et K (N-1) dans TFT" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
        Write-Host "   1. Ouvrir les fichiers Excel générés" -ForegroundColor White
        Write-Host "   2. Vérifier manuellement que les colonnes sont remplies" -ForegroundColor White
        Write-Host "   3. Comparer avec le template vierge" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Si les colonnes sont remplies correctement:" -ForegroundColor Yellow
        Write-Host "   → Les corrections sont OPÉRATIONNELLES ✅" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Si les colonnes BRUT/AMORT sont vides:" -ForegroundColor Yellow
        Write-Host "   → Il faut aussi modifier etats_financiers_v2.py pour calculer ces valeurs" -ForegroundColor White
        Write-Host "   → Voir: Doc_Etat_Fin/Documentation/Double_Probleme_Export_Liasse/" -ForegroundColor White
        Write-Host "           02_ANALYSE_PROBLEMES_RESTANTS_06_AVRIL_2026.md" -ForegroundColor White
        
    } else {
        Write-Host "❌ TESTS TERMINÉS AVEC ERREURS" -ForegroundColor Red
        Write-Host "   Voir les détails ci-dessus" -ForegroundColor Red
    }
    
    Write-Host "================================================================================" -ForegroundColor Cyan
    
} finally {
    # Retourner au répertoire d'origine
    Pop-Location
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
