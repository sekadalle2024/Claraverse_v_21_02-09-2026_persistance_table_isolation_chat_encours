# ═══════════════════════════════════════════════════════════════════════════
# Script de test pour l'endpoint Heatmap Risque
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST ENDPOINT HEATMAP RISQUE - CASE 34" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$endpoint = "https://t22wtwxl.rpcld.app/webhook/heatmap_risque"
$question = "heatmap"

Write-Host "📍 Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host "📝 Question: $question" -ForegroundColor Yellow
Write-Host ""

# Préparer le body
$body = @{
    question = $question
} | ConvertTo-Json

Write-Host "📦 Body de la requête:" -ForegroundColor Green
Write-Host $body -ForegroundColor Gray
Write-Host ""

# Effectuer la requête
Write-Host "🚀 Envoi de la requête..." -ForegroundColor Cyan
$startTime = Get-Date

try {
    $response = Invoke-RestMethod -Uri $endpoint `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 120

    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✅ Réponse reçue en $([math]::Round($duration, 2)) secondes" -ForegroundColor Green
    Write-Host ""

    # Analyser la réponse
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ANALYSE DE LA RÉPONSE" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    # Vérifier la structure
    if ($response -is [Array]) {
        Write-Host "✓ Format: Array" -ForegroundColor Green
        Write-Host "✓ Nombre d'éléments: $($response.Count)" -ForegroundColor Green
        
        if ($response.Count -gt 0 -and $response[0].data) {
            Write-Host "✓ Propriété 'data' trouvée" -ForegroundColor Green
            
            $dataKeys = $response[0].data.PSObject.Properties.Name
            Write-Host "✓ Clés dans 'data': $($dataKeys -join ', ')" -ForegroundColor Green
            
            # Chercher la clé de cartographie
            $cartographieKey = $dataKeys | Where-Object { 
                $_ -like "*etape*" -and $_ -like "*cartographie*" 
            }
            
            if ($cartographieKey) {
                Write-Host "✓ Clé cartographie trouvée: $cartographieKey" -ForegroundColor Green
                
                $tables = $response[0].data.$cartographieKey
                if ($tables -is [Array]) {
                    Write-Host "✓ Nombre de tables: $($tables.Count)" -ForegroundColor Green
                    
                    if ($tables.Count -ge 2) {
                        # Analyser table 1 (en-tête)
                        $table1Key = ($tables[0].PSObject.Properties.Name)[0]
                        $table1Data = $tables[0].$table1Key
                        
                        Write-Host ""
                        Write-Host "📋 TABLE 1 (En-tête):" -ForegroundColor Yellow
                        Write-Host "   Clé: $table1Key" -ForegroundColor Gray
                        Write-Host "   Type: $($table1Data.GetType().Name)" -ForegroundColor Gray
                        if ($table1Data -is [PSCustomObject]) {
                            $table1Data.PSObject.Properties | ForEach-Object {
                                Write-Host "   - $($_.Name): $($_.Value)" -ForegroundColor Gray
                            }
                        }
                        
                        # Analyser table 2 (risques)
                        $table2Key = ($tables[1].PSObject.Properties.Name)[0]
                        $table2Data = $tables[1].$table2Key
                        
                        Write-Host ""
                        Write-Host "📊 TABLE 2 (Risques):" -ForegroundColor Yellow
                        Write-Host "   Clé: $table2Key" -ForegroundColor Gray
                        Write-Host "   Type: $($table2Data.GetType().Name)" -ForegroundColor Gray
                        
                        if ($table2Data -is [Array]) {
                            Write-Host "   Nombre de risques: $($table2Data.Count)" -ForegroundColor Gray
                            
                            # Analyser la répartition des criticités
                            $criticites = @{}
                            $table2Data | ForEach-Object {
                                $crit = $_.Criticite
                                if ($criticites.ContainsKey($crit)) {
                                    $criticites[$crit]++
                                } else {
                                    $criticites[$crit] = 1
                                }
                            }
                            
                            Write-Host ""
                            Write-Host "   Répartition par criticité:" -ForegroundColor Cyan
                            $criticites.GetEnumerator() | Sort-Object Name | ForEach-Object {
                                $color = switch ($_.Key) {
                                    "Élevé" { "Red" }
                                    "Moyen" { "Yellow" }
                                    "Faible" { "Green" }
                                    default { "Gray" }
                                }
                                Write-Host "   - $($_.Key): $($_.Value) risques" -ForegroundColor $color
                            }
                            
                            # Afficher un exemple de risque
                            if ($table2Data.Count -gt 0) {
                                Write-Host ""
                                Write-Host "   Exemple de risque (n°1):" -ForegroundColor Cyan
                                $risque1 = $table2Data[0]
                                Write-Host "   - N°: $($risque1.no)" -ForegroundColor Gray
                                Write-Host "   - Risque: $($risque1.Risques.Substring(0, [Math]::Min(60, $risque1.Risques.Length)))..." -ForegroundColor Gray
                                Write-Host "   - Probabilité: $($risque1.Probabilite)" -ForegroundColor Gray
                                Write-Host "   - Impact: $($risque1.Impact)" -ForegroundColor Gray
                                Write-Host "   - Criticité: $($risque1.Criticite)" -ForegroundColor Gray
                            }
                        }
                    } else {
                        Write-Host "⚠ Nombre de tables insuffisant (attendu: >= 2, reçu: $($tables.Count))" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "⚠ Les tables ne sont pas un array" -ForegroundColor Yellow
                }
            } else {
                Write-Host "⚠ Clé de cartographie non trouvée" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ Propriété 'data' non trouvée" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Format inattendu (pas un array)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  RÉPONSE COMPLÈTE (JSON)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    Write-Host ""

    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  RÉSULTAT: ✅ TEST RÉUSSI" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

} catch {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "❌ Erreur après $([math]::Round($duration, 2)) secondes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Message d'erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        Write-Host "Code de statut: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  RÉSULTAT: ❌ TEST ÉCHOUÉ" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
