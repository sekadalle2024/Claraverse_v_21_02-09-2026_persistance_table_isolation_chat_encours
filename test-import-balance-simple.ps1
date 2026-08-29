# Script de test simple pour diagnostiquer l'erreur "failed to fetch"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST IMPORT BALANCE - DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ce script teste l'import d'une balance pour diagnostiquer l'erreur" -ForegroundColor Yellow
Write-Host ""

# Vérifier que le backend est accessible
Write-Host "Étape 1: Vérifier que le backend est accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NON accessible" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le backend avec: .\start-claraverse-conda.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Étape 2: Afficher les derniers logs du backend..." -ForegroundColor Yellow
Write-Host ""

try {
    $jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
    $backendLogs = Receive-Job -Id $jobs.Backend -Keep | Select-Object -Last 20
    
    if ($backendLogs) {
        Write-Host "Derniers logs du backend:" -ForegroundColor Cyan
        $backendLogs | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "⚠️  Aucun log disponible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de récupérer les logs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Gardez cette fenêtre ouverte" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Dans le navigateur (http://localhost:5173):" -ForegroundColor Yellow
Write-Host "   - Aller dans 'États Financiers'" -ForegroundColor Gray
Write-Host "   - Importer: py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Revenez ici et appuyez sur ENTRÉE pour voir les nouveaux logs" -ForegroundColor Yellow
Write-Host ""

Read-Host "Appuyez sur ENTRÉE après avoir importé la balance"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NOUVEAUX LOGS DU BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $jobs = Get-Content .claraverse-jobs.json | ConvertFrom-Json
    $newLogs = Receive-Job -Id $jobs.Backend -Keep | Select-Object -Last 50
    
    if ($newLogs) {
        $newLogs | ForEach-Object { 
            $line = $_
            if ($line -match "ERROR|Exception|Traceback|Failed|failed") {
                Write-Host $line -ForegroundColor Red
            } elseif ($line -match "✅|SUCCESS|Balances stockées") {
                Write-Host $line -ForegroundColor Green
            } elseif ($line -match "⚠️|WARNING|WARN") {
                Write-Host $line -ForegroundColor Yellow
            } else {
                Write-Host $line
            }
        }
    } else {
        Write-Host "⚠️  Aucun nouveau log" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération des logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALYSE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si vous voyez:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ '✅ Balances stockées dans le cache'" -ForegroundColor Green
Write-Host "   → L'import a réussi! L'erreur vient d'ailleurs" -ForegroundColor Gray
Write-Host ""
Write-Host "❌ 'ERROR' ou 'Exception' ou 'Traceback'" -ForegroundColor Red
Write-Host "   → Copiez le message d'erreur complet" -ForegroundColor Gray
Write-Host "   → Identifiez la ligne qui cause l'erreur" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Aucun log" -ForegroundColor Yellow
Write-Host "   → Le backend n'a pas reçu la requête" -ForegroundColor Gray
Write-Host "   → Vérifiez la console du navigateur (F12)" -ForegroundColor Gray
Write-Host ""

Write-Host "Pour plus d'aide, consultez:" -ForegroundColor Cyan
Write-Host "  00_ETAPE_SUIVANTE_DIAGNOSTIC_06_AVRIL_2026.txt" -ForegroundColor White
Write-Host ""
