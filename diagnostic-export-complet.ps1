# Script de Diagnostic Complet - Export CAC et Rapports Audit
# 26 Mars 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC COMPLET - EXPORTS CLARAVERSE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que le backend est actif
Write-Host "1. Vérification du backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction Stop
    Write-Host "   ✅ Backend actif: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend non accessible!" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   ACTION: Démarrer le backend avec:" -ForegroundColor Yellow
    Write-Host "   .\start-claraverse-conda.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""

# 2. Vérifier les endpoints disponibles
Write-Host "2. Vérification des endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/export-synthese-cac-final",
    "/export-synthese-cac",
    "/api/word/export-synthese-cac"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000$endpoint" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $endpoint : Accessible" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "   ✅ $endpoint : Accessible (erreur validation attendue)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $endpoint : Non accessible" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 3. Tester l'export avec des données minimales
Write-Host "3. Test export avec données minimales..." -ForegroundColor Yellow

$testData = @{
    frap_points = @(
        @{
            metadata = @{
                etape = "Test"
                norme = "Test"
                methode = "Test"
                reference = "Test-001"
            }
            intitule = "Test FRAP"
            observation = "Observation test"
            constat = "Constat test"
            risque = "Risque test"
            recommandation = "Recommandation test"
        }
    )
    recos_revision_points = @()
    recos_controle_interne_points = @()
    date_rapport = (Get-Date -Format "yyyy-MM-dd")
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/export-synthese-cac-final" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData `
        -ErrorAction Stop
    
    Write-Host "   ✅ Export réussi!" -ForegroundColor Green
    Write-Host "   Fichier: $($response.filename)" -ForegroundColor Gray
    
    # Vérifier que le fichier existe
    if (Test-Path $response.filename) {
        $fileSize = (Get-Item $response.filename).Length
        Write-Host "   ✅ Fichier créé: $fileSize octets" -ForegroundColor Green
        
        if ($fileSize -lt 1000) {
            Write-Host "   ⚠️  Fichier très petit, probablement vide!" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Fichier non trouvé!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Export échoué!" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Vérifier le fichier menu.js
Write-Host "4. Vérification du fichier menu.js..." -ForegroundColor Yellow

if (Test-Path "public/menu.js") {
    $menuContent = Get-Content "public/menu.js" -Raw
    
    # Vérifier le sélecteur CSS
    if ($menuContent -match "div\.prose table") {
        Write-Host "   ✅ Sélecteur CSS corrigé présent" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Sélecteur CSS non corrigé!" -ForegroundColor Red
    }
    
    # Vérifier extractFullCellContent
    if ($menuContent -match "extractFullCellContent") {
        Write-Host "   ✅ Fonction extractFullCellContent présente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Fonction extractFullCellContent manquante!" -ForegroundColor Red
    }
    
    # Vérifier l'endpoint utilisé
    if ($menuContent -match "/export-synthese-cac-final") {
        Write-Host "   ✅ Endpoint /export-synthese-cac-final utilisé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Endpoint /export-synthese-cac-final non trouvé" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Fichier menu.js non trouvé!" -ForegroundColor Red
}

Write-Host ""

# 5. Instructions pour l'utilisateur
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS POUR TESTER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrir Claraverse dans le navigateur" -ForegroundColor White
Write-Host "2. Appuyer sur Ctrl+F5 pour rafraîchir" -ForegroundColor White
Write-Host "3. Ouvrir la console (F12)" -ForegroundColor White
Write-Host "4. Tenter l'export CAC" -ForegroundColor White
Write-Host "5. Copier TOUS les logs de la console" -ForegroundColor White
Write-Host ""
Write-Host "Logs à rechercher:" -ForegroundColor Yellow
Write-Host "  - [Export CAC] X table(s) Claraverse trouvée(s)" -ForegroundColor Gray
Write-Host "  - [Export CAC] Points collectés:" -ForegroundColor Gray
Write-Host "  - Erreurs éventuelles" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

