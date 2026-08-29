#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
# Test Case 49 - Programme de Travail - Endpoint n8n
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " TEST CASE 49 - Programme de Travail" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://fpb7ab9h.rpcl.app/webhook-test/integration"
$requestBody = @{
    question = "[Command] = /Programme de travail - [Processus] = facturation des ventes "
} | ConvertTo-Json

Write-Host "📍 Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host "📝 Requête:" -ForegroundColor Yellow
Write-Host $requestBody -ForegroundColor Gray
Write-Host ""

# Envoi de la requête
Write-Host "🚀 Envoi de la requête..." -ForegroundColor Green
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $endpoint `
        -Method Post `
        -ContentType "application/json" `
        -Body $requestBody `
        -TimeoutSec 300

    Write-Host "✅ Réponse reçue avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Structure de la réponse:" -ForegroundColor Cyan
    
    # Vérifier la structure
    if ($response -is [Array]) {
        Write-Host "   Type: Array" -ForegroundColor Gray
        Write-Host "   Longueur: $($response.Count)" -ForegroundColor Gray
        
        if ($response.Count -gt 0) {
            $firstItem = $response[0]
            Write-Host "   Premier élément:" -ForegroundColor Gray
            
            if ($firstItem.PSObject.Properties.Name -contains "output") {
                Write-Host "     ✓ Propriété 'output' trouvée" -ForegroundColor Green
                
                $outputPreview = $firstItem.output.Substring(0, [Math]::Min(200, $firstItem.output.Length))
                Write-Host "     Aperçu output (200 premiers caractères):" -ForegroundColor Gray
                Write-Host "     $outputPreview..." -ForegroundColor DarkGray
                
                # Vérifier la présence du format JSON dans markdown
                if ($firstItem.output -match '```json' -or $firstItem.output -match '`json') {
                    Write-Host "     ✓ Format JSON détecté dans bloc markdown" -ForegroundColor Green
                } else {
                    Write-Host "     ⚠️ Format JSON non détecté" -ForegroundColor Yellow
                }
            } else {
                Write-Host "     ❌ Propriété 'output' non trouvée" -ForegroundColor Red
                Write-Host "     Propriétés disponibles: $($firstItem.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   Type: $($response.GetType().Name)" -ForegroundColor Gray
        Write-Host "   Propriétés: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "📄 Réponse complète (fichier JSON):" -ForegroundColor Cyan
    $outputFile = "test-case49-response.json"
    $response | ConvertTo-Json -Depth 10 | Out-File $outputFile -Encoding UTF8
    Write-Host "   Fichier: $outputFile" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "✅ TEST RÉUSSI!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Ouvrir l'application Claraverse" -ForegroundColor Gray
    Write-Host "   2. Envoyer: /Programme de travail - facturation des ventes" -ForegroundColor Gray
    Write-Host "   3. Vérifier les logs de la console navigateur:" -ForegroundColor Gray
    Write-Host "      - Rechercher 'FORMAT CASE 49 DETECTE'" -ForegroundColor Gray
    Write-Host "      - Vérifier 'Backtick simple initial retiré'" -ForegroundColor Gray
    Write-Host "      - Confirmer 'JSON parsé avec succès'" -ForegroundColor Gray
    Write-Host "   4. Vérifier l'affichage des tableaux" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur lors de la requête:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        Write-Host "Détails HTTP:" -ForegroundColor Yellow
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        Write-Host "   Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
