# ═══════════════════════════════════════════════════════════════════════
# TEST CASE 49 - DATA ANALYST ALÉATOIRE SIMPLE
# ═══════════════════════════════════════════════════════════════════════
# Description: Test du nouveau case 49 avec condition "Data analyst" + "Aléatoire simple"
# Endpoint: http://127.0.0.1:500
# Date: 08 Juillet 2026
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        TEST CASE 49 - DATA ANALYST ALÉATOIRE SIMPLE           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────────────
# 1. VÉRIFICATION DE L'ENDPOINT N8N
# ─────────────────────────────────────────────────────────────────────
Write-Host "📡 Vérification de l'endpoint n8n..." -ForegroundColor Yellow
Write-Host "   Endpoint: http://127.0.0.1:500" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:500" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Endpoint accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Endpoint non accessible. Vérifiez que n8n est démarré sur le port 500." -ForegroundColor Yellow
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────────────────────
# 2. TEST DU CASE 49 - CONDITION 1: "Programme de travail"
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n📋 Test Case 49 - Condition 1: Programme de travail" -ForegroundColor Yellow

$testData1 = @{
    question = "Générer un Programme de travail pour l'audit"
} | ConvertTo-Json

Write-Host "   Message test: 'Générer un Programme de travail pour l'audit'" -ForegroundColor Gray
Write-Host "   Endpoint attendu: https://fpb7ab9h.rpcl.app/webhook-test/integration" -ForegroundColor Gray

# ─────────────────────────────────────────────────────────────────────
# 3. TEST DU CASE 49 - CONDITION 2: "Data analyst" + "Aléatoire simple"
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n📊 Test Case 49 - Condition 2: Data analyst + Aléatoire simple" -ForegroundColor Yellow

$testData2 = @{
    question = "Data analyst Aléatoire simple"
} | ConvertTo-Json

Write-Host "   Message test: 'Data analyst Aléatoire simple'" -ForegroundColor Gray
Write-Host "   Endpoint attendu: http://127.0.0.1:500" -ForegroundColor Gray

# Test de l'endpoint
try {
    Write-Host "`n🔄 Envoi de la requête test..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:500" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testData2 `
        -TimeoutSec 30
    
    Write-Host "✅ Requête réussie !" -ForegroundColor Green
    Write-Host "`n📄 Réponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur lors de la requête" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────────────────────
# 4. VARIATIONS DE TEST
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n🧪 Variations de test" -ForegroundColor Yellow

$variations = @(
    "Data analyst Aléatoire simple",
    "Je veux utiliser Data analyst avec Aléatoire simple",
    "Créer une analyse Data analyst en mode Aléatoire simple"
)

foreach ($variation in $variations) {
    Write-Host "`n   📝 Test: '$variation'" -ForegroundColor Gray
    Write-Host "      ✓ Devrait déclencher le Case 49 (endpoint: http://127.0.0.1:500)" -ForegroundColor DarkGray
}

# ─────────────────────────────────────────────────────────────────────
# 5. RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                         RÉSUMÉ DU TEST                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📌 CASE 49 - CONFIGURATION" -ForegroundColor Yellow
Write-Host "   • Condition 1: 'Programme de travail'" -ForegroundColor Gray
Write-Host "     → Endpoint: https://fpb7ab9h.rpcl.app/webhook-test/integration" -ForegroundColor Gray
Write-Host ""
Write-Host "   • Condition 2: 'Data analyst' ET 'Aléatoire simple'" -ForegroundColor Gray
Write-Host "     → Endpoint: http://127.0.0.1:500" -ForegroundColor Gray

Write-Host "`n📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "   1. Vérifier que n8n est démarré sur le port 500" -ForegroundColor Gray
Write-Host "   2. Configurer le workflow n8n pour l'endpoint" -ForegroundColor Gray
Write-Host "   3. Tester dans l'application Claraverse" -ForegroundColor Gray
Write-Host "   4. Valider les réponses reçues" -ForegroundColor Gray

Write-Host "`n✅ Test terminé !`n" -ForegroundColor Green
