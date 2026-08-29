# Script PowerShell pour tester le calculateur de la Note 3C
# Immobilisations Financières

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 3C - IMMOBILISATIONS FINANCIÈRES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Chemin vers le fichier de balance de démonstration
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"

# Vérifier que le fichier de balance existe
if (-not (Test-Path $balanceFile)) {
    Write-Host "❌ Erreur: Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "   Veuillez placer le fichier de balance à la racine du projet." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
Write-Host ""

# Chemin vers le script Python
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_3c.py"

# Vérifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Erreur: Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Chemins de sortie
$outputHtml = "py_backend/Doc calcul notes annexes/Tests/test_note_3c.html"
$outputTrace = "py_backend/Doc calcul notes annexes/Tests/trace_note_3c.json"

Write-Host "📊 Exécution du calcul de la Note 3C..." -ForegroundColor Cyan
Write-Host ""

# Exécuter le script Python
python $scriptPath $balanceFile --output-html $outputHtml --output-trace $outputTrace
$exitCode = $LASTEXITCODE

Write-Host ""

# Vérifier le résultat
if ($exitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Vérifier que les fichiers de sortie ont été créés
    if (Test-Path $outputHtml) {
        Write-Host "✓ Fichier HTML créé: $outputHtml" -ForegroundColor Green
        $htmlSize = (Get-Item $outputHtml).Length
        Write-Host "  Taille: $htmlSize octets" -ForegroundColor Gray
    }
    
    if (Test-Path $outputTrace) {
        Write-Host "✓ Fichier de trace créé: $outputTrace" -ForegroundColor Green
        $traceSize = (Get-Item $outputTrace).Length
        Write-Host "  Taille: $traceSize octets" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Pour visualiser le résultat, ouvrez:" -ForegroundColor Cyan
    Write-Host "  $outputHtml" -ForegroundColor White
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Code de sortie: $exitCode" -ForegroundColor Red
    exit $exitCode
}

Write-Host ""
