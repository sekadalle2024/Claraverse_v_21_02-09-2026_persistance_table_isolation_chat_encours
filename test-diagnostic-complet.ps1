# Script de diagnostic complet pour l'erreur "failed to fetch"
# Exécute tous les tests automatiquement et génère un rapport

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 DIAGNOSTIC COMPLET - FAILED TO FETCH" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$results = @{
    backend_running = $false
    backend_accessible = $false
    python_test_success = $false
    http_test_success = $false
    imports_ok = $false
    errors = @()
    warnings = @()
    recommendations = @()
}

# ═══════════════════════════════════════════════════════════════════════════
# TEST 1: VÉRIFIER QUE LE BACKEND EST DÉMARRÉ
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 1: BACKEND DÉMARRÉ?" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

try {
    if (Test-Path ".claraverse-jobs.json") {
        $jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
        $backendJob = Get-Job -Id $jobs.Backend -ErrorAction SilentlyContinue
        
        if ($backendJob -and $backendJob.State -eq "Running") {
            Write-Host "✅ Backend démarré (Job ID: $($jobs.Backend))" -ForegroundColor Green
            $results.backend_running = $true
        } else {
            Write-Host "❌ Backend non démarré ou crashé" -ForegroundColor Red
            $results.errors += "Backend non démarré"
            $results.recommendations += "Exécuter: .\start-claraverse-conda.ps1"
        }
    } else {
        Write-Host "❌ Fichier .claraverse-jobs.json non trouvé" -ForegroundColor Red
        $results.errors += "Fichier jobs non trouvé"
        $results.recommendations += "Exécuter: .\start-claraverse-conda.ps1"
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
    $results.errors += "Erreur vérification backend: $_"
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# TEST 2: VÉRIFIER QUE LE BACKEND EST ACCESSIBLE
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 2: BACKEND ACCESSIBLE?" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/docs" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible sur http://127.0.0.1:5000" -ForegroundColor Green
        $results.backend_accessible = $true
    }
} catch {
    Write-Host "❌ Backend non accessible: $_" -ForegroundColor Red
    $results.errors += "Backend non accessible"
    if ($results.backend_running) {
        $results.recommendations += "Le backend est démarré mais n'écoute pas sur le port 5000"
        $results.recommendations += "Vérifier les logs: Receive-Job -Id `$jobs.Backend -Keep"
    }
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# TEST 3: TEST PYTHON DIRECT (sans HTTP)
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 3: TEST PYTHON DIRECT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "py_backend/test_direct_import.py") {
    try {
        Write-Host "🔄 Exécution du test Python..." -ForegroundColor Gray
        $pythonOutput = python py_backend/test_direct_import.py 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Test Python réussi" -ForegroundColor Green
            $results.python_test_success = $true
            
            # Afficher les dernières lignes du résultat
            $pythonOutput | Select-Object -Last 10 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Test Python échoué" -ForegroundColor Red
            $results.errors += "Test Python échoué"
            
            # Afficher les erreurs
            $pythonOutput | Select-Object -Last 20 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
            
            # Analyser les erreurs
            if ($pythonOutput -match "ModuleNotFoundError|ImportError") {
                $results.recommendations += "Module Python manquant. Exécuter: cd py_backend; pip install -r requirements.txt"
            }
            if ($pythonOutput -match "FileNotFoundError") {
                $results.recommendations += "Fichier manquant. Vérifier que P000 -BALANCE DEMO N_N-1_N-2.xls existe"
            }
        }
    } catch {
        Write-Host "❌ Erreur lors de l'exécution: $_" -ForegroundColor Red
        $results.errors += "Erreur exécution test Python: $_"
    }
} else {
    Write-Host "⚠️ Fichier test_direct_import.py non trouvé" -ForegroundColor Yellow
    $results.warnings += "Fichier test Python non trouvé"
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# TEST 4: TEST HTTP (avec curl/PowerShell)
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 4: TEST HTTP" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

if ($results.backend_accessible -and (Test-Path "P000 -BALANCE DEMO N_N-1_N-2.xls")) {
    try {
        Write-Host "🔄 Envoi de la requête HTTP..." -ForegroundColor Gray
        
        $balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xls"
        $balance = [Convert]::ToBase64String([IO.File]::ReadAllBytes($balanceFile))
        $body = @{
            file_base64 = $balance
            filename = $balanceFile
        } | ConvertTo-Json -Depth 10
        
        $startTime = Get-Date
        $response = Invoke-RestMethod `
            -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 120 `
            -ErrorAction Stop
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "✅ Test HTTP réussi" -ForegroundColor Green
        Write-Host "   Durée: $([math]::Round($duration, 2)) secondes" -ForegroundColor Gray
        Write-Host "   Success: $($response.success)" -ForegroundColor Gray
        Write-Host "   HTML: $($response.html.Length) caractères" -ForegroundColor Gray
        
        $results.http_test_success = $true
        
        if ($duration > 30) {
            $results.warnings += "Le traitement prend $([math]::Round($duration, 0)) secondes (> 30s)"
            $results.recommendations += "Ajouter un timeout au fetch cote frontend"
        }
        
        if ($response.html.Length > 1000000) {
            $results.warnings += "HTML très volumineux: $($response.html.Length) caractères"
            $results.recommendations += "Envisager de compresser ou paginer les résultats"
        }
        
    } catch {
        Write-Host "❌ Test HTTP échoué: $_" -ForegroundColor Red
        $results.errors += "Test HTTP échoué: $_"
        
        if ($_.Exception.Message -match "timeout|timed out") {
            $results.recommendations += "Le traitement prend trop de temps. Ajouter un timeout au fetch"
        } elseif ($_.Exception.Message -match "500") {
            $results.recommendations += "Erreur serveur. Voir les logs: Receive-Job -Id `$jobs.Backend -Keep"
        }
    }
} else {
    Write-Host "⏭️ Test HTTP ignoré (backend non accessible ou fichier manquant)" -ForegroundColor Yellow
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# TEST 5: VÉRIFIER LES IMPORTS PYTHON
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 5: IMPORTS PYTHON" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "py_backend/test_imports.py") {
    try {
        Write-Host "🔄 Vérification des imports..." -ForegroundColor Gray
        $importOutput = python py_backend/test_imports.py 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tous les imports sont OK" -ForegroundColor Green
            $results.imports_ok = $true
        } else {
            Write-Host "❌ Certains imports échouent" -ForegroundColor Red
            $results.errors += "Imports Python échouent"
            $importOutput | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
            $results.recommendations += "Installer les dépendances: cd py_backend; pip install -r requirements.txt"
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Fichier test_imports.py non trouvé" -ForegroundColor Yellow
}
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RAPPORT FINAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "RÉSULTATS DES TESTS:" -ForegroundColor White
Write-Host "   Backend démarré:      $(if ($results.backend_running) { '✅' } else { '❌' })" -ForegroundColor $(if ($results.backend_running) { "Green" } else { "Red" })
Write-Host "   Backend accessible:   $(if ($results.backend_accessible) { '✅' } else { '❌' })" -ForegroundColor $(if ($results.backend_accessible) { "Green" } else { "Red" })
Write-Host "   Test Python:          $(if ($results.python_test_success) { '✅' } else { '❌' })" -ForegroundColor $(if ($results.python_test_success) { "Green" } else { "Red" })
Write-Host "   Test HTTP:            $(if ($results.http_test_success) { '✅' } else { '❌' })" -ForegroundColor $(if ($results.http_test_success) { "Green" } else { "Red" })
Write-Host "   Imports Python:       $(if ($results.imports_ok) { '✅' } else { '❌' })" -ForegroundColor $(if ($results.imports_ok) { "Green" } else { "Red" })
Write-Host ""

if ($results.errors.Count -gt 0) {
    Write-Host "❌ ERREURS DÉTECTÉES:" -ForegroundColor Red
    $results.errors | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Red
    }
    Write-Host ""
}

if ($results.warnings.Count -gt 0) {
    Write-Host "⚠️ AVERTISSEMENTS:" -ForegroundColor Yellow
    $results.warnings | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($results.recommendations.Count -gt 0) {
    Write-Host "💡 RECOMMANDATIONS:" -ForegroundColor Cyan
    $results.recommendations | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Cyan
    }
    Write-Host ""
}

# Diagnostic final
Write-Host "🎯 DIAGNOSTIC:" -ForegroundColor White
if ($results.http_test_success) {
    Write-Host "   ✅ Le backend fonctionne parfaitement!" -ForegroundColor Green
    Write-Host "   Le problème 'failed to fetch' vient du frontend:" -ForegroundColor Yellow
    Write-Host "   - Timeout du navigateur" -ForegroundColor Yellow
    Write-Host "   - Problème CORS" -ForegroundColor Yellow
    Write-Host "   - Cache du navigateur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Solution: Exécuter .\fix-fetch-timeout.ps1" -ForegroundColor Cyan
    Write-Host "   Puis rafraîchir le navigateur (Ctrl+F5)" -ForegroundColor Cyan
} elseif ($results.python_test_success -and -not $results.http_test_success) {
    Write-Host "   ⚠️ Le traitement Python fonctionne mais pas via HTTP" -ForegroundColor Yellow
    Write-Host "   Problème probable:" -ForegroundColor Yellow
    Write-Host "   - Backend non accessible" -ForegroundColor Yellow
    Write-Host "   - Timeout HTTP" -ForegroundColor Yellow
    Write-Host "   - Erreur dans la sérialisation JSON" -ForegroundColor Yellow
} elseif (-not $results.backend_running) {
    Write-Host "   ❌ Le backend n'est pas démarré" -ForegroundColor Red
    Write-Host "   Solution: .\start-claraverse-conda.ps1" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Erreur dans le traitement Python" -ForegroundColor Red
    Write-Host "   Voir les logs: Receive-Job -Id `$jobs.Backend -Keep" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
