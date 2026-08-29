# Test simple du webhook Programme controle comptes

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  TEST WEBHOOK - Programme controle comptes" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes"

Write-Host "URL du webhook: $webhookUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Envoi de la requete..." -ForegroundColor Yellow

try {
    $body = @{
        message = "Programme_controle_comptes"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host ""
    Write-Host "REPONSE RECUE:" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    
    # Afficher la structure JSON complete
    $jsonOutput = $response | ConvertTo-Json -Depth 10
    Write-Host $jsonOutput
    
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""
    
    # Analyser la structure
    Write-Host "ANALYSE DE LA STRUCTURE:" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    
    if ($response -is [Array]) {
        Write-Host "Type: Array" -ForegroundColor Yellow
        Write-Host "Nombre d'elements: $($response.Count)" -ForegroundColor Yellow
        
        if ($response.Count -gt 0) {
            $firstItem = $response[0]
            Write-Host ""
            Write-Host "Premier element:" -ForegroundColor Yellow
            Write-Host "  Type: $($firstItem.GetType().Name)" -ForegroundColor Gray
            
            $properties = $firstItem.PSObject.Properties.Name
            Write-Host "  Proprietes: $($properties -join ', ')" -ForegroundColor Gray
            
            # Verifier la presence de "data"
            if ($properties -contains "data") {
                Write-Host ""
                Write-Host "  SUCCES: Propriete 'data' trouvee directement!" -ForegroundColor Green
                Write-Host "  Structure: [{ data: {...} }]" -ForegroundColor Green
            }
            elseif ($properties -contains "json") {
                Write-Host ""
                Write-Host "  PROBLEME: Propriete 'json' trouvee!" -ForegroundColor Red
                Write-Host "  Structure: [{ json: {...} }]" -ForegroundColor Red
                
                if ($firstItem.json.PSObject.Properties.Name -contains "data") {
                    Write-Host "  La propriete 'data' est dans 'json'" -ForegroundColor Red
                    Write-Host "  Structure complete: [{ json: { data: {...} } }]" -ForegroundColor Red
                }
            }
            else {
                Write-Host ""
                Write-Host "  ATTENTION: Structure inattendue" -ForegroundColor Yellow
                Write-Host "  Proprietes trouvees: $($properties -join ', ')" -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "Type: Object (pas un Array)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Details:" -ForegroundColor Yellow
    Write-Host $_.Exception -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test termine." -ForegroundColor Cyan
