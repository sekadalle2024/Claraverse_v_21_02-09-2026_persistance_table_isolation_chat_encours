# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 TEST ENDPOINT EDITEUR SUR ZEABUR
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TEST ENDPOINT EDITEUR SUR ZEABUR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# TEST 1: HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 TEST 1: Health Check" -ForegroundColor Yellow
Write-Host ""
Write-Host "  URL: https://pybackend.zeabur.app/editeur/health" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/health" -Method Get -ErrorAction Stop
    
    Write-Host "  ✅ SUCCÈS - Health Check" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Réponse:" -ForegroundColor Cyan
    Write-Host "  ────────" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "  ❌ ÉCHEC - Health Check" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
# TEST 2: ENDPOINT PROCESS
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 TEST 2: Endpoint Process" -ForegroundColor Yellow
Write-Host ""
Write-Host "  URL: https://pybackend.zeabur.app/editeur/process" -ForegroundColor Gray
Write-Host "  Method: POST" -ForegroundColor Gray
Write-Host "  Body: {command: 'editeur', message: 'test'}" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        command = "editeur"
        message = "test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/process" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "  ✅ SUCCÈS - Endpoint Process" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Réponse:" -ForegroundColor Cyan
    Write-Host "  ────────" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "  ❌ ÉCHEC - Endpoint Process" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host ""
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# TEST 3: VÉRIFIER SWAGGER
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 TEST 3: Vérification Swagger" -ForegroundColor Yellow
Write-Host ""
Write-Host "  URL: https://pybackend.zeabur.app/docs" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://pybackend.zeabur.app/docs" -Method Get -ErrorAction Stop
    
    if ($response.Content -match "editeur") {
        Write-Host "  ✅ SUCCÈS - Endpoint visible dans Swagger" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "  ⚠️  ATTENTION - Endpoint NON visible dans Swagger" -ForegroundColor Yellow
        Write-Host "     (Ceci est normal si le tag n'est pas configuré)" -ForegroundColor Gray
        Write-Host ""
    }
    
} catch {
    Write-Host "  ❌ ÉCHEC - Impossible d'accéder à Swagger" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
# TEST 4: VÉRIFIER OPENAPI.JSON
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 TEST 4: Vérification OpenAPI JSON" -ForegroundColor Yellow
Write-Host ""
Write-Host "  URL: https://pybackend.zeabur.app/openapi.json" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/openapi.json" -Method Get -ErrorAction Stop
    
    # Chercher l'endpoint editeur dans les paths
    if ($response.paths.PSObject.Properties.Name -match "/editeur") {
        Write-Host "  ✅ SUCCÈS - Endpoint présent dans OpenAPI" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Endpoints trouvés:" -ForegroundColor Cyan
        Write-Host "  ──────────────────" -ForegroundColor Gray
        $response.paths.PSObject.Properties.Name | Where-Object { $_ -match "/editeur" } | ForEach-Object {
            Write-Host "    • $_" -ForegroundColor White
        }
        Write-Host ""
    } else {
        Write-Host "  ❌ ÉCHEC - Endpoint NON présent dans OpenAPI" -ForegroundColor Red
        Write-Host ""
    }
    
} catch {
    Write-Host "  ❌ ÉCHEC - Impossible d'accéder à OpenAPI JSON" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Si les tests 1 et 2 sont ✅ SUCCÈS:" -ForegroundColor White
Write-Host "  → L'endpoint fonctionne correctement" -ForegroundColor Green
Write-Host "  → Le problème 404 est résolu" -ForegroundColor Green
Write-Host ""
Write-Host "  Si le test 3 est ⚠️  ATTENTION:" -ForegroundColor White
Write-Host "  → C'est NORMAL si le tag n'est pas configuré" -ForegroundColor Yellow
Write-Host "  → L'endpoint fonctionne quand même" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Si le test 4 est ✅ SUCCÈS:" -ForegroundColor White
Write-Host "  → L'endpoint est bien enregistré dans FastAPI" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
