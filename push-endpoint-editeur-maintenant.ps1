# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 PUSH ENDPOINT EDITEUR VERS GITHUB ET ZEABUR
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 PUSH ENDPOINT EDITEUR VERS GITHUB" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1: VÉRIFIER LE COMMIT
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 ÉTAPE 1: Vérification du commit" -ForegroundColor Yellow
Write-Host ""

$commitInfo = git log -1 --oneline
Write-Host "  Dernier commit: $commitInfo" -ForegroundColor White
Write-Host ""

# Vérifier que endpoint_editeur.py est dans le commit
$fileInCommit = git diff-tree --no-commit-id --name-only -r HEAD | Select-String "endpoint_editeur.py"

if ($fileInCommit) {
    Write-Host "  ✅ endpoint_editeur.py est dans le commit" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "  ❌ endpoint_editeur.py n'est PAS dans le commit" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Arrêt du script." -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2: PUSH VERS GITHUB
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 ÉTAPE 2: Push vers GitHub" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Exécution: git push origin master" -ForegroundColor Gray
Write-Host ""

try {
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  ✅ Push réussi vers GitHub" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "  ❌ Erreur lors du push" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "  ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3: ATTENDRE LE DÉPLOIEMENT ZEABUR
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 ÉTAPE 3: Attente du déploiement Zeabur" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Zeabur va automatiquement détecter le nouveau commit" -ForegroundColor White
Write-Host "  et redéployer le backend." -ForegroundColor White
Write-Host ""
Write-Host "  ⏳ Attente de 30 secondes..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 30

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4: TESTER L'ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "📋 ÉTAPE 4: Test de l'endpoint" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Test 1: Health Check" -ForegroundColor Cyan
Write-Host "  ────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/health" -Method Get -ErrorAction Stop
    
    Write-Host "  ✅ SUCCÈS - Health Check" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Réponse:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    
} catch {
    Write-Host "  ❌ ÉCHEC - Health Check" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  ⚠️  Le déploiement peut prendre plus de temps." -ForegroundColor Yellow
    Write-Host "     Attendez 1-2 minutes et réessayez." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "  Test 2: Endpoint Process" -ForegroundColor Cyan
Write-Host "  ────────────────────────" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        command = "editeur"
        message = "test depuis PowerShell"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://pybackend.zeabur.app/editeur/process" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "  ✅ SUCCÈS - Endpoint Process" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Réponse:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    
} catch {
    Write-Host "  ❌ ÉCHEC - Endpoint Process" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# ─────────────────────────────────────────────────────────────────────────────
# RÉSUMÉ
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Commit poussé vers GitHub" -ForegroundColor Green
Write-Host "  ⏳ Zeabur redéploie automatiquement" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Si les tests échouent:" -ForegroundColor White
Write-Host "  • Attendez 1-2 minutes pour le déploiement" -ForegroundColor Gray
Write-Host "  • Vérifiez les logs Zeabur" -ForegroundColor Gray
Write-Host "  • Réexécutez: .\test-endpoint-editeur-zeabur.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  Si les tests réussissent:" -ForegroundColor White
Write-Host "  • Testez sur le frontend: https://prclaravi.netlify.app" -ForegroundColor Gray
Write-Host "  • Envoyez un message contenant editeur" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
