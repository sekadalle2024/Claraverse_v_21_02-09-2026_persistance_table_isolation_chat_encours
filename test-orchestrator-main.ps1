# Script de test pour l'orchestrateur principal
# Test rapide du calcul des notes annexes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Orchestrateur Principal" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xls"
Write-Host "Vérification du fichier de balance..." -ForegroundColor Yellow
if (Test-Path $balanceFile) {
    Write-Host "✓ Fichier de balance trouvé: $balanceFile" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "  Assurez-vous que le fichier est à la racine du projet" -ForegroundColor Yellow
}

Write-Host ""

# Exécuter l'orchestrateur
Write-Host "Exécution de l'orchestrateur..." -ForegroundColor Yellow
Write-Host "Cela peut prendre jusqu'à 30 secondes..." -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date

try {
    python "py_backend/Doc calcul notes annexes/calcul_notes_annexes_main.py"
    $exitCode = $LASTEXITCODE
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Résultats du Test" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($exitCode -eq 0) {
        Write-Host "✓ Orchestrateur exécuté avec succès" -ForegroundColor Green
    } else {
        Write-Host "✗ Erreur lors de l'exécution (code: $exitCode)" -ForegroundColor Red
    }
    
    Write-Host "Durée d'exécution: $([math]::Round($duration, 2))s" -ForegroundColor Cyan
    
    if ($duration -lt 30) {
        Write-Host "✓ Contrainte de performance respectée (< 30s)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Contrainte de performance non respectée (> 30s)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Vérifier les fichiers générés
    Write-Host "Vérification des fichiers générés..." -ForegroundColor Yellow
    
    $testsDir = "py_backend/Doc calcul notes annexes/Tests"
    
    $fichiers = @(
        @{Nom="rapport_recapitulatif.html"; Description="Rapport récapitulatif"},
        @{Nom="rapport_coherence.html"; Description="Rapport de cohérence"}
    )
    
    foreach ($fichier in $fichiers) {
        $chemin = Join-Path $testsDir $fichier.Nom
        if (Test-Path $chemin) {
            Write-Host "  ✓ $($fichier.Description): $($fichier.Nom)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($fichier.Description) non trouvé" -ForegroundColor Red
        }
    }
    
    # Chercher le fichier Excel
    $excelFiles = Get-ChildItem -Path $testsDir -Filter "Notes_Annexes_Calculees_*.xlsx" -ErrorAction SilentlyContinue
    if ($excelFiles) {
        Write-Host "  ✓ Export Excel: $($excelFiles[0].Name)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Export Excel non trouvé" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Vérifier les logs
    Write-Host "Vérification des logs..." -ForegroundColor Yellow
    
    $logsDir = "py_backend/Doc calcul notes annexes/Logs"
    
    $logs = @(
        "calcul_notes_annexes.log",
        "calcul_notes_warnings.log",
        "calcul_notes_errors.log"
    )
    
    foreach ($log in $logs) {
        $chemin = Join-Path $logsDir $log
        if (Test-Path $chemin) {
            $taille = (Get-Item $chemin).Length
            Write-Host "  ✓ $log ($taille octets)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $log non trouvé" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Pour voir les résultats détaillés:" -ForegroundColor Cyan
    Write-Host "  - Rapport récapitulatif: $testsDir/rapport_recapitulatif.html" -ForegroundColor White
    Write-Host "  - Rapport de cohérence: $testsDir/rapport_coherence.html" -ForegroundColor White
    Write-Host "  - Logs: $logsDir/" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "✗ Erreur lors de l'exécution: $_" -ForegroundColor Red
    exit 1
}
