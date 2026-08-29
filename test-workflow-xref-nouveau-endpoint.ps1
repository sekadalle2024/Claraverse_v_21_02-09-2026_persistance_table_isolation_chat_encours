# ═══════════════════════════════════════════════════════════════════
# TEST WORKFLOW N8N - NOUVEAU ENDPOINT CROSS REFERENCE
# ═══════════════════════════════════════════════════════════════════
# Date: 28 avril 2026
# Objectif: Tester le nouveau endpoint n8n pour X-Ref documentaire
# ═══════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST WORKFLOW N8N - CROSS REFERENCE DOCUMENTAIRE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://n8nsqlite.zeabur.app/webhook/cross_reference"
$testCases = @(
    @{
        name = "Test 1: AFRILAND"
        index = "[I30]-AFRILAND"
    }
)

Write-Host "🔧 Configuration" -ForegroundColor Yellow
Write-Host "   Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "   Nombre de tests: $($testCases.Count)" -ForegroundColor Gray
Write-Host ""

# Fonction de test
function Test-XRefEndpoint {
    param(
        [string]$TestName,
        [string]$Index
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "🧪 $TestName" -ForegroundColor Cyan
    Write-Host "   Index: $Index" -ForegroundColor Gray
    Write-Host ""
    
    # Préparer le body
    $body = @{
        question = "[index] = $Index"
        dossier = "Dossier CAC"
    } | ConvertTo-Json
    
    Write-Host "📤 Requête:" -ForegroundColor Yellow
    Write-Host $body -ForegroundColor Gray
    Write-Host ""
    
    try {
        # Envoyer la requête
        Write-Host "⏳ Envoi de la requête..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri $endpoint `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 30
        
        Write-Host "✅ Réponse reçue" -ForegroundColor Green
        Write-Host ""
        Write-Host "📥 Réponse:" -ForegroundColor Yellow
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
        Write-Host ""
        
        # Vérifier la structure de la réponse
        if ($response.success) {
            Write-Host "✅ SUCCESS: true" -ForegroundColor Green
            
            if ($response.file) {
                Write-Host "✅ Fichier trouvé:" -ForegroundColor Green
                Write-Host "   - File ID: $($response.file.fileId)" -ForegroundColor Gray
                Write-Host "   - File Name: $($response.file.fileName)" -ForegroundColor Gray
                Write-Host "   - File URL: $($response.file.fileUrl)" -ForegroundColor Gray
                Write-Host "   - MIME Type: $($response.file.mimeType)" -ForegroundColor Gray
            } else {
                Write-Host "⚠️  Pas d'informations sur le fichier" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ SUCCESS: false" -ForegroundColor Red
            if ($response.message) {
                Write-Host "   Message: $($response.message)" -ForegroundColor Red
            }
        }
        
        return $true
        
    } catch {
        Write-Host "❌ Erreur lors de la requête" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        
        if ($_.Exception.Response) {
            Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
        }
        
        return $false
    }
}

# Exécuter les tests
Write-Host "🚀 Démarrage des tests" -ForegroundColor Green
Write-Host ""

$results = @()

foreach ($test in $testCases) {
    $success = Test-XRefEndpoint -TestName $test.name -Index $test.index
    $results += @{
        name = $test.name
        success = $success
    }
    
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Résumé
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$successCount = ($results | Where-Object { $_.success }).Count
$totalCount = $results.Count

foreach ($result in $results) {
    $status = if ($result.success) { "✅ RÉUSSI" } else { "❌ ÉCHOUÉ" }
    $color = if ($result.success) { "Green" } else { "Red" }
    Write-Host "$status - $($result.name)" -ForegroundColor $color
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 Score: $successCount/$totalCount tests réussis" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "🎉 Tous les tests sont passés avec succès!" -ForegroundColor Green
    Write-Host "✅ Le nouveau endpoint n8n fonctionne correctement" -ForegroundColor Green
} else {
    Write-Host "⚠️  Certains tests ont échoué" -ForegroundColor Yellow
    Write-Host "🔍 Vérifiez la configuration du workflow n8n" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   FIN DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
