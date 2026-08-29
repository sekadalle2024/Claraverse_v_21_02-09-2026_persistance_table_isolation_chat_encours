# Script de test pour la Note 29 - Ventes de Produits Finis
# Ce script teste le calculateur de la Note 29

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 29 - VENTES DE PRODUITS FINIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier Scripts
Write-Host ""
Write-Host "Navigation vers le dossier Scripts..." -ForegroundColor Yellow
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"

if (-not (Test-Path $scriptDir)) {
    Write-Host "✗ Dossier Scripts non trouvé: $scriptDir" -ForegroundColor Red
    exit 1
}

Set-Location $scriptDir
Write-Host "✓ Dossier Scripts trouvé" -ForegroundColor Green

# Vérifier que le fichier de balance existe
Write-Host ""
Write-Host "Vérification du fichier de balance..." -ForegroundColor Yellow
$balanceFile = "../../P000 -BALANCE DEMO N_N-1_N-2.xlsx"

if (-not (Test-Path $balanceFile)) {
    Write-Host "✗ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "  Veuillez placer le fichier de balance à la racine du projet" -ForegroundColor Yellow
    Set-Location ../../..
    exit 1
}

Write-Host "✓ Fichier de balance trouvé" -ForegroundColor Green

# Exécuter le calculateur
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXÉCUTION DU CALCULATEUR NOTE 29" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python calculer_note_29.py

$exitCode = $LASTEXITCODE

# Retourner au dossier racine
Set-Location ../../..

# Vérifier les fichiers générés
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VÉRIFICATION DES FICHIERS GÉNÉRÉS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFile = "py_backend/Doc calcul notes annexes/Tests/test_note_29.html"
$traceFile = "py_backend/Doc calcul notes annexes/Tests/note_29_trace.json"

if (Test-Path $htmlFile) {
    $htmlSize = (Get-Item $htmlFile).Length
    Write-Host "✓ Fichier HTML généré: $htmlFile ($htmlSize octets)" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier HTML non généré: $htmlFile" -ForegroundColor Red
}

if (Test-Path $traceFile) {
    $traceSize = (Get-Item $traceFile).Length
    Write-Host "✓ Fichier de trace généré: $traceFile ($traceSize octets)" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier de trace non généré: $traceFile" -ForegroundColor Red
}

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DU TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "✓ Test réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. Ouvrir le fichier HTML dans un navigateur:" -ForegroundColor White
    Write-Host "     $htmlFile" -ForegroundColor Cyan
    Write-Host "  2. Consulter le fichier de trace pour l'audit:" -ForegroundColor White
    Write-Host "     $traceFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Proposer d'ouvrir le fichier HTML
    $response = Read-Host "Voulez-vous ouvrir le fichier HTML maintenant? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Start-Process $htmlFile
    }
} else {
    Write-Host "✗ Test échoué (code de sortie: $exitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Consultez les messages d'erreur ci-dessus pour plus de détails." -ForegroundColor Yellow
}

Write-Host ""
