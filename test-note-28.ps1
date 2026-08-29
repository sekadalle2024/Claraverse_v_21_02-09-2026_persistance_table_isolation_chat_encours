# Script de test pour la Note 28 - Ventes de Marchandises
# Date: 27 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 28 - VENTES DE MARCHANDISES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Naviguer vers le dossier Scripts
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"
if (Test-Path $scriptDir) {
    Write-Host "Navigation vers: $scriptDir" -ForegroundColor Yellow
    Push-Location $scriptDir
} else {
    Write-Host "✗ Dossier Scripts introuvable: $scriptDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "../../P000 -BALANCE DEMO N_N-1_N-2.xlsx"
if (Test-Path $balanceFile) {
    Write-Host "✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
} else {
    Write-Host "⚠ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Yellow
    Write-Host "  Le script utilisera le chemin par défaut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXÉCUTION DU CALCUL NOTE 28" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Exécuter le script de calcul
try {
    python calculer_note_28.py
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ CALCUL RÉUSSI" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        # Vérifier les fichiers générés
        Write-Host "Vérification des fichiers générés:" -ForegroundColor Yellow
        
        $htmlFile = "../Tests/test_note_28.html"
        if (Test-Path $htmlFile) {
            $htmlSize = (Get-Item $htmlFile).Length
            Write-Host "  ✓ HTML généré: $htmlFile ($htmlSize octets)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ HTML non trouvé: $htmlFile" -ForegroundColor Red
        }
        
        $traceFile = "../Tests/note_28_trace.json"
        if (Test-Path $traceFile) {
            $traceSize = (Get-Item $traceFile).Length
            Write-Host "  ✓ Trace générée: $traceFile ($traceSize octets)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Trace non trouvée: $traceFile" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "Pour visualiser le résultat:" -ForegroundColor Cyan
        Write-Host "  1. Ouvrir: py_backend/Doc calcul notes annexes/Tests/test_note_28.html" -ForegroundColor White
        Write-Host "  2. Consulter: py_backend/Doc calcul notes annexes/Tests/note_28_trace.json" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ✗ ERREUR LORS DU CALCUL" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Code de sortie: $exitCode" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ EXCEPTION LORS DE L'EXÉCUTION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# Retourner au dossier d'origine
Pop-Location

Write-Host ""
Write-Host "Test terminé." -ForegroundColor Cyan
Write-Host ""
