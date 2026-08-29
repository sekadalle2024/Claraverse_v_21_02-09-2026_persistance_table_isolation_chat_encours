# Script PowerShell pour tester la génération des états de contrôle HTML
# Génère un fichier HTML de test sur le bureau avec les états de contrôle exhaustifs

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST GÉNÉRATION ÉTATS DE CONTRÔLE HTML" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est disponible
Write-Host "📋 Vérification de Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python trouvé: $($pythonCmd.Source)" -ForegroundColor Green
Write-Host ""

# Vérifier que le fichier de balance démo existe
$balanceFile = "py_backend\P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "❌ Fichier de balance démo non trouvé: $balanceFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Fichier de balance démo trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier que le script Python existe
$scriptPython = "py_backend\generer_test_etats_controle_html.py"
if (-not (Test-Path $scriptPython)) {
    Write-Host "❌ Script Python non trouvé: $scriptPython" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Script Python trouvé" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "🔄 Exécution du script de génération..." -ForegroundColor Yellow
Write-Host ""

try {
    python $scriptPython
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ GÉNÉRATION RÉUSSIE" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Fichier généré sur le bureau:" -ForegroundColor Cyan
        Write-Host "   test_etats_controle_html.html" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 Ouvrir le fichier pour vérifier:" -ForegroundColor Yellow
        Write-Host "   - Les 6 états de contrôle sont présents" -ForegroundColor White
        Write-Host "   - Chaque état affiche 2 colonnes (N et N-1)" -ForegroundColor White
        Write-Host "   - Les accordéons s'ouvrent et se ferment" -ForegroundColor White
        Write-Host "   - Les montants sont correctement formatés" -ForegroundColor White
        Write-Host ""
        
        # Proposer d'ouvrir le fichier
        $desktop = [Environment]::GetFolderPath("Desktop")
        $htmlFile = Join-Path $desktop "test_etats_controle_html.html"
        
        if (Test-Path $htmlFile) {
            $response = Read-Host "Voulez-vous ouvrir le fichier maintenant? (O/N)"
            if ($response -eq "O" -or $response -eq "o") {
                Start-Process $htmlFile
            }
        }
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'exécution du script Python" -ForegroundColor Red
        Write-Host "   Code de sortie: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution: $_" -ForegroundColor Red
    exit 1
}
