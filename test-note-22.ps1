# Script de test pour la Note 22 - Achats de Matières Premières
# Date: 26 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 22 - ACHATS DE MATIÈRES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est disponible
Write-Host "[1/4] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier de balance existe
Write-Host ""
Write-Host "[2/4] Vérification du fichier de balance..." -ForegroundColor Yellow
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xlsx"
if (Test-Path $balanceFile) {
    Write-Host "  ✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
} else {
    Write-Host "  ✗ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "  Veuillez placer le fichier de balance à la racine du projet" -ForegroundColor Yellow
    exit 1
}

# Exécuter le calcul de la Note 22
Write-Host ""
Write-Host "[3/4] Exécution du calcul de la Note 22..." -ForegroundColor Yellow
Write-Host ""

try {
    python "py_backend/Doc calcul notes annexes/Scripts/calculer_note_22.py" $balanceFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  ✓ Calcul de la Note 22 terminé avec succès" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  ✗ Erreur lors du calcul de la Note 22" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "  ✗ Erreur lors de l'exécution du script: $_" -ForegroundColor Red
    exit 1
}

# Vérifier que les fichiers de sortie ont été créés
Write-Host ""
Write-Host "[4/4] Vérification des fichiers de sortie..." -ForegroundColor Yellow

$htmlFile = "py_backend/Doc calcul notes annexes/Tests/test_note_22.html"
$traceFile = "py_backend/Doc calcul notes annexes/Tests/note_22_trace.json"

$allFilesExist = $true

if (Test-Path $htmlFile) {
    $htmlSize = (Get-Item $htmlFile).Length
    Write-Host "  ✓ Fichier HTML créé: $htmlFile ($htmlSize octets)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Fichier HTML non créé: $htmlFile" -ForegroundColor Red
    $allFilesExist = $false
}

if (Test-Path $traceFile) {
    $traceSize = (Get-Item $traceFile).Length
    Write-Host "  ✓ Fichier trace créé: $traceFile ($traceSize octets)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Fichier trace non créé: $traceFile" -ForegroundColor Red
    $allFilesExist = $false
}

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allFilesExist) {
    Write-Host "  ✓ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Fichiers générés:" -ForegroundColor Yellow
    Write-Host "  - HTML: $htmlFile" -ForegroundColor White
    Write-Host "  - Trace: $traceFile" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour visualiser la note, ouvrez le fichier HTML dans un navigateur:" -ForegroundColor Yellow
    Write-Host "  start $htmlFile" -ForegroundColor White
} else {
    Write-Host "  ✗ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Certains fichiers n'ont pas été créés. Vérifiez les erreurs ci-dessus." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
