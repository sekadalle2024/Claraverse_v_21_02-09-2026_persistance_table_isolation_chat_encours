# Test du webhook Programme contrôle comptes
# Pour diagnostiquer la structure exacte retournée

$url = "https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes"

$body = @{
    question = "Programme_controle_comptes"
} | ConvertTo-Json

Write-Host "🧪 Test du webhook Programme contrôle comptes..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ Réponse reçue" -ForegroundColor Green
    Write-Host ""
    
    # Afficher la structure
    Write-Host "📊 STRUCTURE DE LA RÉPONSE:" -ForegroundColor Yellow
    Write-Host "Type: $($response.GetType().Name)" -ForegroundColor Gray
    
    if ($response -is [Array]) {
        Write-Host "  → Array de $($response.Count) élément(s)" -ForegroundColor Gray
        
        if ($response.Count -gt 0) {
            $firstItem = $response[0]
            Write-Host "  → Premier élément type: $($firstItem.GetType().Name)" -ForegroundColor Gray
            
            if ($firstItem.PSObject.Properties.Name -contains 'data') {
                Write-Host "  → ✅ Propriété 'data' trouvée" -ForegroundColor Green
                
                $data = $firstItem.data
                Write-Host "  → Type de data: $($data.GetType().Name)" -ForegroundColor Gray
                
                if ($data.PSObject.Properties.Name) {
                    Write-Host "  → Clés dans data:" -ForegroundColor Gray
                    $data.PSObject.Properties.Name | ForEach-Object {
                        Write-Host "    • $_" -ForegroundColor Cyan
                    }
                }
            } else {
                Write-Host "  → ❌ Propriété 'data' NON trouvée" -ForegroundColor Red
                Write-Host "  → Propriétés disponibles:" -ForegroundColor Gray
                $firstItem.PSObject.Properties.Name | ForEach-Object {
                    Write-Host "    • $_" -ForegroundColor Cyan
                }
            }
        }
    } else {
        Write-Host "  → Objet (non-array)" -ForegroundColor Gray
        Write-Host "  → Propriétés:" -ForegroundColor Gray
        $response.PSObject.Properties.Name | ForEach-Object {
            Write-Host "    • $_" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
    Write-Host "📄 RÉPONSE COMPLÈTE (JSON):" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test terminé" -ForegroundColor Green
