# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 TEST DES IMPORTS DU BACKEND - ÉTATS DE CONTRÔLE
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TEST DES IMPORTS - ÉTATS DE CONTRÔLE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Aller dans le répertoire py_backend
Set-Location py_backend

Write-Host "📦 Test des imports du module etats_controle_exhaustifs..." -ForegroundColor Yellow
Write-Host ""

# Créer un script Python de test
$testScript = @"
import sys
print("🔍 Test des imports...")
print("")

try:
    from etats_controle_exhaustifs import (
        calculer_etat_controle_bilan_actif_n,
        calculer_etat_controle_bilan_actif_n1,
        calculer_etat_controle_bilan_actif_variation,
        calculer_etat_controle_bilan_passif_n,
        calculer_etat_controle_bilan_passif_n1,
        calculer_etat_controle_bilan_passif_variation,
        calculer_etat_controle_compte_resultat_n,
        calculer_etat_controle_compte_resultat_n1,
        calculer_etat_controle_compte_resultat_variation,
        calculer_etat_controle_tft_n,
        calculer_etat_controle_tft_n1,
        calculer_etat_controle_tft_variation,
        calculer_etat_controle_sens_comptes_n,
        calculer_etat_controle_sens_comptes_n1,
        calculer_etat_equilibre_bilan_n,
        calculer_etat_equilibre_bilan_n1,
        format_montant_controle
    )
    print("✅ Tous les imports sont corrects!")
    print("")
    print("📊 Fonctions disponibles:")
    print("   1. calculer_etat_controle_bilan_actif_n")
    print("   2. calculer_etat_controle_bilan_actif_n1")
    print("   3. calculer_etat_controle_bilan_actif_variation")
    print("   4. calculer_etat_controle_bilan_passif_n")
    print("   5. calculer_etat_controle_bilan_passif_n1")
    print("   6. calculer_etat_controle_bilan_passif_variation")
    print("   7. calculer_etat_controle_compte_resultat_n")
    print("   8. calculer_etat_controle_compte_resultat_n1")
    print("   9. calculer_etat_controle_compte_resultat_variation")
    print("   10. calculer_etat_controle_tft_n")
    print("   11. calculer_etat_controle_tft_n1")
    print("   12. calculer_etat_controle_tft_variation")
    print("   13. calculer_etat_controle_sens_comptes_n")
    print("   14. calculer_etat_controle_sens_comptes_n1")
    print("   15. calculer_etat_equilibre_bilan_n")
    print("   16. calculer_etat_equilibre_bilan_n1")
    print("   + format_montant_controle (utilitaire)")
    print("")
    sys.exit(0)
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
    print("")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erreur inattendue: {e}")
    print("")
    sys.exit(1)
"@

# Sauvegarder le script de test
$testScript | Out-File -FilePath "test_imports_etats_controle.py" -Encoding UTF8

# Exécuter le test
Write-Host "🚀 Exécution du test..." -ForegroundColor Yellow
python test_imports_etats_controle.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ TEST RÉUSSI - TOUS LES IMPORTS SONT CORRECTS" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ❌ TEST ÉCHOUÉ - VÉRIFIER LES IMPORTS" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
}

# Nettoyer
Remove-Item "test_imports_etats_controle.py" -ErrorAction SilentlyContinue

# Retourner à la racine
Set-Location ..

Write-Host ""
Write-Host "📝 Pour plus d'informations, voir:" -ForegroundColor Cyan
Write-Host "   00_CORRECTION_IMPORTS_ETATS_CONTROLE_05_AVRIL_2026.txt" -ForegroundColor White
Write-Host ""
