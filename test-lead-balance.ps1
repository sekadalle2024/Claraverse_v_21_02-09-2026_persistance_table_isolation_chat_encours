# Script de Test Lead Balance
# Version: 1.0.0

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TEST LEAD BALANCE - DIAGNOSTIC COMPLET" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Vérifier que le script existe
Write-Host "Test 1: Vérification du fichier LeadBalanceAutoTrigger.js..." -NoNewline
if (Test-Path "public/LeadBalanceAutoTrigger.js") {
    Write-Host " OK" -ForegroundColor Green
    $scriptSize = (Get-Item "public/LeadBalanceAutoTrigger.js").Length
    Write-Host "   Taille: $scriptSize octets" -ForegroundColor Gray
} else {
    Write-Host " ERREUR - Fichier non trouvé!" -ForegroundColor Red
    exit 1
}

# Test 2: Vérifier que le script est chargé dans index.html
Write-Host "Test 2: Vérification du chargement dans index.html..." -NoNewline
$indexContent = Get-Content "index.html" -Raw
if ($indexContent -match "LeadBalanceAutoTrigger\.js") {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR - Script non chargé!" -ForegroundColor Red
    Write-Host "   Ajoutez cette ligne dans index.html:" -ForegroundColor Yellow
    Write-Host '   <script src="/LeadBalanceAutoTrigger.js"></script>' -ForegroundColor White
    exit 1
}

# Test 3: Vérifier claraApiService.ts
Write-Host "Test 3: Vérification de claraApiService.ts..." -NoNewline
$serviceContent = Get-Content "src/services/claraApiService.ts" -Raw
if ($serviceContent -match "SENTINEL_LEAD_BALANCE") {
    Write-Host " OK" -ForegroundColor Green
    if ($serviceContent -match "auto_trigger_upload") {
        Write-Host "   Type: auto_trigger_upload (CORRECT)" -ForegroundColor Green
    } else {
        Write-Host "   Type: lead_balance_trigger (ANCIEN)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ERREUR - Sentinelle non trouvée!" -ForegroundColor Red
    exit 1
}

# Test 4: Vérifier l'environnement conda
Write-Host "Test 4: Vérification de l'environnement conda..." -NoNewline
try {
    $condaEnvs = conda env list 2>&1
    if ($condaEnvs -match "claraverse_backend") {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR - Environnement non trouvé!" -ForegroundColor Red
        Write-Host "   Exécutez: .\setup-backend-env.ps1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host " ERREUR - Conda non installé!" -ForegroundColor Red
    exit 1
}

# Test 5: Vérifier les dépendances Python
Write-Host "Test 5: Vérification des dépendances Python..." -NoNewline
$packages = conda run -n claraverse_backend pip list 2>&1
if ($packages -match "fastapi" -and $packages -match "pandas") {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " ERREUR - Dépendances manquantes!" -ForegroundColor Red
    Write-Host "   Exécutez: conda run -n claraverse_backend pip install -r py_backend/requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Test 6: Vérifier que les ports sont libres
Write-Host "Test 6: Vérification des ports..." -NoNewline
$port5000 = netstat -ano | Select-String ":5000" -Quiet
$port5173 = netstat -ano | Select-String ":5173" -Quiet

if (-not $port5000 -and -not $port5173) {
    Write-Host " OK (ports libres)" -ForegroundColor Green
} else {
    Write-Host " ATTENTION" -ForegroundColor Yellow
    if ($port5000) {
        Write-Host "   Port 5000 (backend) occupé" -ForegroundColor Yellow
    }
    if ($port5173) {
        Write-Host "   Port 5173 (frontend) occupé" -ForegroundColor Yellow
    }
}

# Test 7: Vérifier le fichier de test
Write-Host "Test 7: Vérification du fichier de test..." -NoNewline
if (Test-Path "py_backend/P000 -BALANCE DEMO.xls") {
    Write-Host " OK" -ForegroundColor Green
    $fileSize = (Get-Item "py_backend/P000 -BALANCE DEMO.xls").Length
    Write-Host "   Taille: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host " ATTENTION - Fichier de test non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Tous les tests de base sont passés!" -ForegroundColor Green
Write-Host ""

Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Démarrer le backend:" -ForegroundColor White
Write-Host "   conda activate claraverse_backend" -ForegroundColor Cyan
Write-Host "   cd py_backend" -ForegroundColor Cyan
Write-Host "   python main.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Dans un autre terminal, démarrer le frontend:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Ouvrir le navigateur:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Ouvrir la console (F12) et taper:" -ForegroundColor White
Write-Host "   LeadBalanceAutoTrigger.version" -ForegroundColor Cyan
Write-Host "   (Résultat attendu: '3.0.0')" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Dans le chat, taper:" -ForegroundColor White
Write-Host "   Lead_balance" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Observer:" -ForegroundColor White
Write-Host "   - Table apparaît" -ForegroundColor Gray
Write-Host "   - Dialogue s'ouvre automatiquement (300ms)" -ForegroundColor Gray
Write-Host "   - Sélectionner le fichier Excel" -ForegroundColor Gray
Write-Host "   - Résultats affichés" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "DEBUGGING" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si le dialogue ne s'ouvre pas, dans la console du navigateur:" -ForegroundColor Yellow
Write-Host "   LeadBalanceAutoTrigger.test()" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si le backend ne répond pas:" -ForegroundColor Yellow
Write-Host "   curl http://127.0.0.1:5000/health" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pour voir les logs backend:" -ForegroundColor Yellow
Write-Host "   (Regarder le terminal où python main.py est lancé)" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation complète:" -ForegroundColor Yellow
Write-Host "   DIAGNOSTIC_LEAD_BALANCE.md" -ForegroundColor Cyan
Write-Host "   Doc_Lead_Balance/TEST_INTEGRATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
