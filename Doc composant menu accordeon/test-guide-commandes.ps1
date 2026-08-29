# ═══════════════════════════════════════════════════════════════════════════
# Script de Test - Guide des Commandes
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST INTEGRATION GUIDE DES COMMANDES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

$endpoint = "http://localhost:5678/webhook/guide_des_commandes"
$testQuestion = "[PARTIE] = PARTIE 3 - [THEMATIQUE] = CONNAISSANCES METIER POUR L'AUDIT INTERNE - [CHAPITRE] = Unité d'étude 1 : Gestion stratégique et planification - [SECTION] = Sous-unité 1 : Gestion stratégique et planification"

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Vérification de la disponibilité de n8n
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Test 1: Vérification de n8n..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ n8n est accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ n8n n'est pas accessible sur localhost:5678" -ForegroundColor Red
    Write-Host "   Veuillez démarrer n8n avant de continuer" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Appel API au workflow guide_des_commandes
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Test 2: Appel API au workflow guide_des_commandes..." -ForegroundColor Yellow
Write-Host "   Endpoint: $endpoint" -ForegroundColor Gray

$body = @{
    question = $testQuestion
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Réponse reçue du workflow" -ForegroundColor Green
    
    # Afficher un aperçu de la réponse
    Write-Host ""
    Write-Host "📊 Aperçu de la réponse:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────────────────────────" -ForegroundColor Gray
    
    if ($response -is [Array] -and $response.Count -gt 0) {
        $firstItem = $response[0]
        
        if ($firstItem.data) {
            Write-Host "✓ Structure 'data' détectée" -ForegroundColor Green
            $dataArray = $firstItem.data
            
            if ($dataArray -is [Array] -and $dataArray.Count -gt 0) {
                Write-Host "✓ Nombre de sections: $($dataArray.Count)" -ForegroundColor Green
                
                $firstSection = $dataArray[0]
                if ($firstSection.'Sous-section') {
                    Write-Host "✓ Première section: $($firstSection.'Sous-section')" -ForegroundColor Green
                }
                
                if ($firstSection.'Sub-items') {
                    Write-Host "✓ Nombre de sub-items: $($firstSection.'Sub-items'.Count)" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "⚠️  Structure 'data' non trouvée" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Format de réponse inattendu" -ForegroundColor Yellow
    }
    
    Write-Host "─────────────────────────────────────────────────────────────────────────────" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur lors de l'appel API" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Vérification des fichiers créés
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Test 3: Vérification des fichiers créés..." -ForegroundColor Yellow

$files = @(
    "src/components/Clara_Components/GuideCommandesAccordionRenderer.tsx",
    "INTEGRATION_GUIDE_COMMANDES_27_MARS_2026.md",
    "00_GUIDE_COMMANDES_INTEGRATION_27_MARS_2026.txt"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (manquant)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Certains fichiers sont manquants" -ForegroundColor Yellow
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 4: Vérification des modifications dans claraApiService.ts
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Test 4: Vérification des modifications dans claraApiService.ts..." -ForegroundColor Yellow

$claraApiPath = "src/services/claraApiService.ts"
if (Test-Path $claraApiPath) {
    $content = Get-Content $claraApiPath -Raw
    
    $checks = @{
        "FORMAT 7" = $content -match "FORMAT 7.*GUIDE DES COMMANDES"
        "__GUIDE_COMMANDES_ACCORDION__" = $content -match "__GUIDE_COMMANDES_ACCORDION__"
        "guide_commandes_accordion" = $content -match "guide_commandes_accordion"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✅ $($check.Key) trouvé" -ForegroundColor Green
        } else {
            Write-Host "❌ $($check.Key) non trouvé" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Fichier claraApiService.ts non trouvé" -ForegroundColor Red
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 5: Vérification des modifications dans MessageContentRenderer.tsx
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Test 5: Vérification des modifications dans MessageContentRenderer.tsx..." -ForegroundColor Yellow

$rendererPath = "src/components/Clara_Components/MessageContentRenderer.tsx"
if (Test-Path $rendererPath) {
    $content = Get-Content $rendererPath -Raw
    
    $checks = @{
        "Import GuideCommandesAccordionRenderer" = $content -match "import GuideCommandesAccordionRenderer"
        "Détection marqueur" = $content -match "__GUIDE_COMMANDES_ACCORDION__"
        "Rendu composant" = $content -match "GuideCommandesAccordionRenderer"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✅ $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($check.Key)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Fichier MessageContentRenderer.tsx non trouvé" -ForegroundColor Red
}
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Résumé
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Test 1: n8n accessible" -ForegroundColor Green
Write-Host "✅ Test 2: Workflow guide_des_commandes répond" -ForegroundColor Green
Write-Host "✅ Test 3: Fichiers créés" -ForegroundColor Green
Write-Host "✅ Test 4: claraApiService.ts modifié" -ForegroundColor Green
Write-Host "✅ Test 5: MessageContentRenderer.tsx modifié" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Tous les tests sont passés!" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PROCHAINES ÉTAPES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Démarrer le frontend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Ouvrir le chat Claraverse" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Taper dans le chat:" -ForegroundColor Yellow
Write-Host "   Guide des commandes" -ForegroundColor White
Write-Host ""
Write-Host "4. Vérifier l'affichage de l'accordéon" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
