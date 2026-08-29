# ═══════════════════════════════════════════════════════════════════════════════
# Script PowerShell - Test États de Contrôle N et N-1
# ═══════════════════════════════════════════════════════════════════════════════
# Date: 04 Avril 2026
# Objectif: Tester les états de contrôle avec la balance de démonstration
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST ÉTATS DE CONTRÔLE N ET N-1" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "py_backend")) {
    Write-Host "❌ ERREUR: Répertoire py_backend non trouvé" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Vérifier l'existence du fichier de balance
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "❌ ERREUR: Fichier de balance non trouvé" -ForegroundColor Red
    Write-Host "   Fichier attendu: $balanceFile" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Fichier de balance trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier l'existence du script Python
$scriptPython = "py_backend/test_etats_controle_n_n1.py"
if (-not (Test-Path $scriptPython)) {
    Write-Host "❌ ERREUR: Script Python non trouvé" -ForegroundColor Red
    Write-Host "   Fichier attendu: $scriptPython" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Script Python trouvé" -ForegroundColor Green
Write-Host ""

# Afficher les informations
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📋 INFORMATIONS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Fichier de balance:" -ForegroundColor Yellow
Write-Host "   $balanceFile" -ForegroundColor White
Write-Host ""
Write-Host "🐍 Script Python:" -ForegroundColor Yellow
Write-Host "   $scriptPython" -ForegroundColor White
Write-Host ""
Write-Host "📊 États de contrôle à générer:" -ForegroundColor Yellow
Write-Host "   1. Bilan Actif N" -ForegroundColor White
Write-Host "   2. Bilan Actif N-1" -ForegroundColor White
Write-Host "   3. Bilan Passif N" -ForegroundColor White
Write-Host "   4. Bilan Passif N-1" -ForegroundColor White
Write-Host "   5. Compte de Résultat N" -ForegroundColor White
Write-Host "   6. Compte de Résultat N-1" -ForegroundColor White
Write-Host "   7. Sens des Comptes" -ForegroundColor White
Write-Host "   8. Équilibre du Bilan" -ForegroundColor White
Write-Host ""

# Demander confirmation
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
$confirmation = Read-Host "Voulez-vous lancer le test ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Test annulé" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 LANCEMENT DU TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Exécuter le script Python avec conda
Write-Host "🐍 Exécution du script Python..." -ForegroundColor Cyan
Write-Host ""

try {
    # Changer de répertoire vers py_backend
    Push-Location py_backend
    
    # Exécuter avec conda
    conda run -n claraverse_backend python test_etats_controle_n_n1.py
    
    $exitCode = $LASTEXITCODE
    
    # Revenir au répertoire initial
    Pop-Location
    
    Write-Host ""
    
    if ($exitCode -eq 0) {
        Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  ✅ TEST TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📍 Le fichier HTML a été généré sur votre bureau" -ForegroundColor Green
        Write-Host "🌐 Le fichier devrait s'ouvrir automatiquement dans votre navigateur" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "  ❌ ERREUR LORS DU TEST" -ForegroundColor Red
        Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Vérifier les messages d'erreur ci-dessus" -ForegroundColor Yellow
        Write-Host ""
    }
    
} catch {
    Pop-Location
    Write-Host ""
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
