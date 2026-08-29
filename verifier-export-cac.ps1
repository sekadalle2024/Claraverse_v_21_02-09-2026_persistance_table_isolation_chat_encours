# Script de vérification rapide - Export Synthèse CAC
# Vérifie que tout est en place pour l'export

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   VÉRIFICATION EXPORT SYNTHÈSE CAC" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# 1. Vérifier le backend
Write-Host "1️⃣ Vérification du backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Backend actif sur http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend non accessible" -ForegroundColor Red
    Write-Host "      → Démarrez le backend avec: .\start-claraverse.ps1" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# 2. Vérifier le fichier backend
Write-Host "2️⃣ Vérification du fichier backend..." -ForegroundColor Yellow
$backendFile = "py_backend\export_synthese_cac_final.py"
if (Test-Path $backendFile) {
    Write-Host "   ✅ Fichier backend trouvé: $backendFile" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fichier backend manquant: $backendFile" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""

# 3. Vérifier le template Word
Write-Host "3️⃣ Vérification du template Word..." -ForegroundColor Yellow
$templateFile = "Doc export rapport\template final de [Export Synthese CAC].doc"
if (Test-Path $templateFile) {
    Write-Host "   ✅ Template Word trouvé: $templateFile" -ForegroundColor Green
    $templateSize = (Get-Item $templateFile).Length
    Write-Host "      Taille: $([math]::Round($templateSize / 1KB, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Template Word manquant: $templateFile" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""

# 4. Vérifier le fichier menu.js
Write-Host "4️⃣ Vérification du fichier menu.js..." -ForegroundColor Yellow
$menuFile = "public\menu.js"
if (Test-Path $menuFile) {
    Write-Host "   ✅ Fichier menu.js trouvé: $menuFile" -ForegroundColor Green
    
    # Vérifier que le sélecteur Claraverse est présent
    $menuContent = Get-Content $menuFile -Raw
    if ($menuContent -match "table\.min-w-full\.border\.border-gray-200") {
        Write-Host "   ✅ Sélecteur Claraverse présent dans menu.js" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Sélecteur Claraverse non trouvé dans menu.js" -ForegroundColor Yellow
        Write-Host "      → Le code n'a peut-être pas été mis à jour" -ForegroundColor Yellow
    }
    
    if ($menuContent -match "exportSyntheseCAC") {
        Write-Host "   ✅ Fonction exportSyntheseCAC présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Fonction exportSyntheseCAC manquante" -ForegroundColor Red
        $allOk = $false
    }
} else {
    Write-Host "   ❌ Fichier menu.js manquant: $menuFile" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""

# 5. Vérifier le script de test
Write-Host "5️⃣ Vérification du script de test..." -ForegroundColor Yellow
$testScript = "test-export-synthese-cac-final.ps1"
if (Test-Path $testScript) {
    Write-Host "   ✅ Script de test trouvé: $testScript" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Script de test manquant: $testScript" -ForegroundColor Yellow
}

Write-Host ""

# 6. Tester l'endpoint
Write-Host "6️⃣ Test de l'endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        frap_points = @()
        recos_revision_points = @()
        recos_controle_interne_points = @()
        date_rapport = "2026-03-25"
    }
    
    $jsonBody = $testData | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/word/export-synthese-cac-final" `
        -Method Post `
        -ContentType "application/json" `
        -Body $jsonBody `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Endpoint répond correctement (Status: 200)" -ForegroundColor Green
        Write-Host "      Taille de la réponse: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️ Endpoint répond avec status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Endpoint ne répond pas" -ForegroundColor Red
    Write-Host "      Erreur: $($_.Exception.Message)" -ForegroundColor Gray
    $allOk = $false
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allOk) {
    Write-Host ""
    Write-Host "✅ TOUT EST EN PLACE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Forcer le rechargement du frontend: Ctrl + Shift + R" -ForegroundColor White
    Write-Host "2. Tester avec le script: .\test-export-synthese-cac-final.ps1" -ForegroundColor White
    Write-Host "3. Ou générer des tables dans le chat et cliquer sur 'Export Synthèse CAC'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️ CERTAINS ÉLÉMENTS SONT MANQUANTS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vérifiez les éléments marqués ❌ ci-dessus" -ForegroundColor White
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
