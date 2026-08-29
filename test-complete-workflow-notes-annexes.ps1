# Test complet du workflow des notes annexes SYSCOHADA
# Task 30.1: Test complete workflow with real balance file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLET WORKFLOW NOTES ANNEXES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que le fichier de balance existe
$balanceFile = "py_backend\P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "ERREUR: Fichier de balance introuvable: $balanceFile" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Fichier de balance trouve: $balanceFile" -ForegroundColor Green
Write-Host ""

# Creer le dossier Tests s'il n'existe pas
$testsDir = "py_backend\Doc calcul notes annexes\Tests"
if (-not (Test-Path $testsDir)) {
    New-Item -ItemType Directory -Path $testsDir -Force | Out-Null
    Write-Host "[OK] Dossier Tests cree" -ForegroundColor Green
}

# Nettoyer les anciens fichiers de test
Write-Host "Nettoyage des anciens fichiers de test..." -ForegroundColor Yellow
Remove-Item "$testsDir\test_note_*.html" -ErrorAction SilentlyContinue
Remove-Item "$testsDir\trace_note_*.json" -ErrorAction SilentlyContinue
Remove-Item "$testsDir\rapport_*.html" -ErrorAction SilentlyContinue
Remove-Item "$testsDir\Notes_Annexes_*.xlsx" -ErrorAction SilentlyContinue
Write-Host "[OK] Nettoyage termine" -ForegroundColor Green
Write-Host ""

# Executer l'orchestrateur principal
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXECUTION DE L'ORCHESTRATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Executer en mode sequentiel par defaut
python "py_backend\Doc calcul notes annexes\calcul_notes_annexes_main.py" --balance "$balanceFile"

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION DES RESULTATS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier les fichiers HTML generes
$htmlFiles = Get-ChildItem "$testsDir\test_note_*.html" -ErrorAction SilentlyContinue
Write-Host "Fichiers HTML generes: $($htmlFiles.Count)" -ForegroundColor $(if ($htmlFiles.Count -gt 0) { "Green" } else { "Red" })

if ($htmlFiles.Count -gt 0) {
    Write-Host "  Exemples:" -ForegroundColor Gray
    $htmlFiles | Select-Object -First 5 | ForEach-Object {
        Write-Host "    - $($_.Name)" -ForegroundColor Gray
    }
}

# Verifier l'export Excel
$excelFiles = Get-ChildItem "$testsDir\Notes_Annexes_*.xlsx" -ErrorAction SilentlyContinue
Write-Host "Fichiers Excel generes: $($excelFiles.Count)" -ForegroundColor $(if ($excelFiles.Count -gt 0) { "Green" } else { "Red" })

if ($excelFiles.Count -gt 0) {
    $excelFiles | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  - $($_.Name) ($size KB)" -ForegroundColor Gray
    }
}

# Verifier le rapport de coherence
$coherenceReport = "$testsDir\rapport_coherence.html"
if (Test-Path $coherenceReport) {
    Write-Host "[OK] Rapport de coherence genere" -ForegroundColor Green
    
    # Extraire le taux de coherence du rapport
    $content = Get-Content $coherenceReport -Raw
    if ($content -match "Taux de coherence global.*?(\d+\.?\d*)%") {
        $tauxCoherence = [double]$matches[1]
        Write-Host "  Taux de coherence: $tauxCoherence%" -ForegroundColor $(if ($tauxCoherence -ge 95) { "Green" } else { "Yellow" })
        
        if ($tauxCoherence -lt 95) {
            Write-Host "  [WARN] Taux de coherence inferieur a 95%" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[FAIL] Rapport de coherence non trouve" -ForegroundColor Red
}

# Verifier les fichiers de trace
$traceFiles = Get-ChildItem "$testsDir\trace_note_*.json" -ErrorAction SilentlyContinue
Write-Host "Fichiers de trace generes: $($traceFiles.Count)" -ForegroundColor $(if ($traceFiles.Count -gt 0) { "Green" } else { "Red" })

# Verifier le rapport recapitulatif
$recapReport = "$testsDir\rapport_recapitulatif.html"
if (Test-Path $recapReport) {
    Write-Host "[OK] Rapport recapitulatif genere" -ForegroundColor Green
    
    # Extraire les statistiques du rapport
    $content = Get-Content $recapReport -Raw
    if ($content -match "(\d+)</h3>\s*<p>Notes Calculees") {
        $notesCalculees = $matches[1]
        Write-Host "  Notes calculees: $notesCalculees/33" -ForegroundColor $(if ([int]$notesCalculees -eq 33) { "Green" } else { "Yellow" })
    }
} else {
    Write-Host "[FAIL] Rapport recapitulatif non trouve" -ForegroundColor Red
}

# Verifier les logs
$logsDir = "py_backend\Doc calcul notes annexes\Logs"
if (Test-Path $logsDir) {
    Write-Host "[OK] Dossier Logs cree" -ForegroundColor Green
    
    $logFiles = Get-ChildItem "$logsDir\*.log" -ErrorAction SilentlyContinue
    Write-Host "  Fichiers de log: $($logFiles.Count)" -ForegroundColor Gray
    
    # Afficher les dernieres lignes du log principal
    $mainLog = "$logsDir\calcul_notes_annexes.log"
    if (Test-Path $mainLog) {
        Write-Host ""
        Write-Host "Dernieres lignes du log principal:" -ForegroundColor Yellow
        Get-Content $mainLog -Tail 10 | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUME DU TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Duree totale: $([math]::Round($duration, 2))s" -ForegroundColor $(if ($duration -lt 30) { "Green" } else { "Yellow" })

if ($duration -lt 30) {
    Write-Host "[OK] Contrainte de performance respectee (inferieur a 30s)" -ForegroundColor Green
} else {
    Write-Host "[WARN] Contrainte de performance non respectee (superieur ou egal a 30s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Fichiers generes dans: $testsDir" -ForegroundColor Cyan
Write-Host ""

# Resume des verifications
$checks = @(
    @{ Name = "Fichiers HTML"; Status = $htmlFiles.Count -gt 0 }
    @{ Name = "Export Excel"; Status = $excelFiles.Count -gt 0 }
    @{ Name = "Rapport coherence"; Status = Test-Path $coherenceReport }
    @{ Name = "Fichiers trace"; Status = $traceFiles.Count -gt 0 }
    @{ Name = "Rapport recapitulatif"; Status = Test-Path $recapReport }
    @{ Name = "Performance inferieur a 30s"; Status = $duration -lt 30 }
)

Write-Host "VERIFICATIONS:" -ForegroundColor Cyan
foreach ($check in $checks) {
    $symbol = if ($check.Status) { "[OK]" } else { "[FAIL]" }
    $color = if ($check.Status) { "Green" } else { "Red" }
    Write-Host "  $symbol $($check.Name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST TERMINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Retourner le code de sortie approprie
$allPassed = $checks | Where-Object { -not $_.Status } | Measure-Object | Select-Object -ExpandProperty Count
exit $allPassed
