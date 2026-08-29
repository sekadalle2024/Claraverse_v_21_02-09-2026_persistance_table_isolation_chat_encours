# Script de test pour "Ouvrir X-Ref documentaire"
# Test du workflow n8n et de l'intégration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Ouvrir X-Ref documentaire" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://hkj0631c.rpcl.app/webhook/cross_reference"
$testCases = @(
    @{
        index = "[I1]-Lead sheet trésorerie"
        dossier = "Dossier CAC"
        description = "Test document PDF"
    },
    @{
        index = "[I20]-Proces verbal inventaire de caisse"
        dossier = "Dossier CAC"
        description = "Test document Word"
    },
    @{
        index = "[I150]-Balances generale"
        dossier = "Dossier CAC"
        description = "Test document Excel"
    },
    @{
        index = "[I999]-Document inexistant"
        dossier = "Dossier CAC"
        description = "Test document non trouvé"
    }
)

# Fonction de test
function Test-XRefEndpoint {
    param(
        [string]$Index,
        [string]$Dossier,
        [string]$Description
    )
    
    Write-Host "Test: $Description" -ForegroundColor Yellow
    Write-Host "  Index: $Index" -ForegroundColor Gray
    Write-Host "  Dossier: $Dossier" -ForegroundColor Gray
    
    $body = @{
        index = $Index
        dossier = $Dossier
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "  ✅ SUCCESS" -ForegroundColor Green
            Write-Host "  Fichier trouvé: $($response.file.name)" -ForegroundColor Green
            Write-Host "  Type: $($response.file.mimeType)" -ForegroundColor Gray
            Write-Host "  ID: $($response.file.id)" -ForegroundColor Gray
            Write-Host "  Lien: $($response.file.webViewLink)" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠️  Document non trouvé" -ForegroundColor Yellow
            Write-Host "  Message: $($response.message)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ❌ ERREUR" -ForegroundColor Red
        Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Vérifier la connectivité
Write-Host "1. Vérification de la connectivité..." -ForegroundColor Cyan
try {
    $ping = Test-Connection -ComputerName "hkj0631c.rpcl.app" -Count 1 -Quiet
    if ($ping) {
        Write-Host "  ✅ Serveur accessible" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Serveur non accessible" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "  ⚠️  Impossible de vérifier la connectivité" -ForegroundColor Yellow
}
Write-Host ""

# Exécuter les tests
Write-Host "2. Exécution des tests..." -ForegroundColor Cyan
Write-Host ""

$testNumber = 1
foreach ($test in $testCases) {
    Write-Host "Test $testNumber/$($testCases.Count)" -ForegroundColor Magenta
    Test-XRefEndpoint -Index $test.index -Dossier $test.dossier -Description $test.description
    $testNumber++
    Start-Sleep -Seconds 1
}

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests terminés" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Vérifier que les documents existent dans Google Drive" -ForegroundColor Gray
Write-Host "2. Tester l'intégration dans Claraverse" -ForegroundColor Gray
Write-Host "3. Vérifier l'affichage dans la barre latérale" -ForegroundColor Gray
Write-Host ""

# Test OPTIONS (CORS)
Write-Host "3. Test CORS (OPTIONS)..." -ForegroundColor Cyan
try {
    $headers = @{
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
        "Origin" = "http://localhost:5173"
    }
    
    $response = Invoke-WebRequest -Uri $endpoint -Method Options -Headers $headers -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ CORS configuré correctement" -ForegroundColor Green
        Write-Host "  Headers:" -ForegroundColor Gray
        $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
            Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "  ⚠️  Erreur CORS: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "✅ Script de test terminé" -ForegroundColor Green
