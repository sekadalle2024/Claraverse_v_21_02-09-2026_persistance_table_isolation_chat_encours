# Test de l'intégration Template Orion - Méthodologie de Révision
# Ce script teste l'endpoint methodo_revision et vérifie la structure de la réponse

Write-Host "🧪 TEST TEMPLATE ORION - METHODOLOGIE DE REVISION" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "http://localhost:5678/webhook/methodo_revision"
$testQuestion = @{
    question = "[PARTIE] = PARTIE 3 - [THEMATIQUE] = CONNAISSANCES METIER POUR L'AUDIT INTERNE - [CHAPITRE] = Unité d'étude 1 : Gestion stratégique et planification - [SECTION] = Sous-unité 1 : Gestion stratégique et planification"
} | ConvertTo-Json

Write-Host "📍 Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Test 1: Vérifier que l'endpoint est accessible
Write-Host "Test 1: Vérification de l'accessibilité de l'endpoint..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -Body $testQuestion -ContentType "application/json" -TimeoutSec 120
    Write-Host "✅ Endpoint accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: L'endpoint n'est pas accessible" -ForegroundColor Red
    Write-Host "   Assurez-vous que n8n est démarré et que le workflow est actif" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Vérifier la structure de la réponse
Write-Host "Test 2: Vérification de la structure de la réponse..." -ForegroundColor Green
try {
    $jsonResponse = $response.Content | ConvertFrom-Json
    
    # Vérifier que c'est un array
    if ($jsonResponse -is [Array]) {
        Write-Host "✅ Réponse est un array" -ForegroundColor Green
        Write-Host "   Nombre de sections: $($jsonResponse.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ La réponse n'est pas un array" -ForegroundColor Red
        exit 1
    }
    
    # Vérifier la première section
    $firstSection = $jsonResponse[0]
    if ($firstSection.'Sous-section') {
        Write-Host "✅ Propriété 'Sous-section' trouvée" -ForegroundColor Green
        Write-Host "   Valeur: $($firstSection.'Sous-section')" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Propriété 'Sous-section' manquante" -ForegroundColor Red
        exit 1
    }
    
    if ($firstSection.'Sub-items') {
        Write-Host "✅ Propriété 'Sub-items' trouvée" -ForegroundColor Green
        Write-Host "   Nombre de sub-items: $($firstSection.'Sub-items'.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Propriété 'Sub-items' manquante" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'analyse de la réponse: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Vérifier la structure des items
Write-Host "Test 3: Vérification de la structure des items..." -ForegroundColor Green
try {
    $firstSubItem = $firstSection.'Sub-items'[0]
    $firstItem = $firstSubItem.Items[0]
    
    if ($firstItem.Rubrique) {
        Write-Host "✅ Propriété 'Rubrique' trouvée dans les items" -ForegroundColor Green
        Write-Host "   Exemple: $($firstItem.Rubrique)" -ForegroundColor Cyan
    }
    
    if ($firstItem.Contenu) {
        Write-Host "✅ Propriété 'Contenu' trouvée dans les items" -ForegroundColor Green
        $contenuPreview = if ($firstItem.Contenu.Length -gt 50) { 
            $firstItem.Contenu.Substring(0, 50) + "..." 
        } else { 
            $firstItem.Contenu 
        }
        Write-Host "   Aperçu: $contenuPreview" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "⚠️  Avertissement: Structure des items non standard" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Sauvegarder la réponse pour inspection
Write-Host "Test 4: Sauvegarde de la réponse pour inspection..." -ForegroundColor Green
$outputFile = "test-methodo-revision-response.json"
$response.Content | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "✅ Réponse sauvegardée dans: $outputFile" -ForegroundColor Green

Write-Host ""

# Résumé
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Tous les tests sont passés avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Ouvrir Claraverse dans le navigateur" -ForegroundColor White
Write-Host "   2. Envoyer le message: 'Methodo revision'" -ForegroundColor White
Write-Host "   3. Vérifier que l'accordéon s'affiche correctement" -ForegroundColor White
Write-Host ""
Write-Host "📄 Fichier de réponse: $outputFile" -ForegroundColor Cyan
Write-Host "📚 Documentation: INTEGRATION_METHODO_REVISION_TEMPLATE_ORION.md" -ForegroundColor Cyan
Write-Host ""
