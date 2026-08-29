# Script de test pour vérifier que N-2 est utilisé mais pas affiché
# Vérifie que seules 2 colonnes (N et N-1) sont affichées

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST AFFICHAGE N ET N-1 (avec N-2 en calcul)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-Host "❌ Erreur: Dossier py_backend non trouvé" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le fichier de balance existe
if (-not (Test-Path "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls")) {
    Write-Host "❌ Erreur: Fichier de balance non trouvé" -ForegroundColor Red
    Write-Host "   Fichier attendu: py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Fichiers trouvés" -ForegroundColor Green
Write-Host ""

# Lancer le script Python
Write-Host "🚀 Lancement de la vérification..." -ForegroundColor Cyan
Write-Host ""

try {
    conda run -n claraverse_backend python Doc_Etat_Fin/Scripts/verifier_calculs_n1_n2.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ VÉRIFICATION RÉUSSIE" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "📄 Un rapport HTML a été généré sur votre bureau" -ForegroundColor Cyan
        Write-Host "   Nom: test_affichage_n_n1_avec_n2_calcul.html" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  Des problèmes ont été détectés" -ForegroundColor Yellow
        Write-Host "   Consultez les messages ci-dessus pour plus de détails" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
