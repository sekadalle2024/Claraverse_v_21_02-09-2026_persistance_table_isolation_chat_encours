# Test webhook avec les bons paramètres

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  TEST WEBHOOK - Programme controle comptes (avec paramètres)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes"

Write-Host "URL du webhook: $webhookUrl" -ForegroundColor Yellow
Write-Host ""

# Paramètres attendus par le workflow (avec crochets comme dans n8n)
$body = @{
    "[Command]" = "Programme_controle_comptes"
    "[Processus]" = "Trésorerie"
    "[Niveau de risque R]" = 1
    "[Assertion]" = "Validité"
} | ConvertTo-Json

Write-Host "Paramètres envoyés:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""
Write-Host "Envoi de la requête..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host ""
    Write-Host "REPONSE RECUE:" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    
    # Afficher la structure JSON complète
    $jsonOutput = $response | ConvertTo-Json -Depth 10
    Write-Host $jsonOutput
    
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""
    
    # Analyser la structure
    Write-Host "ANALYSE DE LA STRUCTURE:" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    
    if ($response -is [Array]) {
        Write-Host "✅ Type: Array" -ForegroundColor Green
        Write-Host "   Nombre d'éléments: $($response.Count)" -ForegroundColor Yellow
        
        if ($response.Count -gt 0) {
            $firstItem = $response[0]
            Write-Host ""
            Write-Host "Premier élément:" -ForegroundColor Yellow
            Write-Host "  Type: $($firstItem.GetType().Name)" -ForegroundColor Gray
            
            $properties = $firstItem.PSObject.Properties.Name
            Write-Host "  Propriétés: $($properties -join ', ')" -ForegroundColor Gray
            
            # Vérifier la présence de "data"
            if ($properties -contains "data") {
                Write-Host ""
                Write-Host "  ✅ SUCCES: Propriété 'data' trouvée!" -ForegroundColor Green
                Write-Host "  Structure: [{ data: {...} }]" -ForegroundColor Green
                Write-Host ""
                Write-Host "  Clés dans 'data':" -ForegroundColor Yellow
                $dataKeys = $firstItem.data.PSObject.Properties.Name
                foreach ($key in $dataKeys) {
                    Write-Host "    - $key" -ForegroundColor Gray
                }
            }
        }
    }
    else {
        Write-Host "✅ Type: Object (pas un Array)" -ForegroundColor Green
        
        $properties = $response.PSObject.Properties.Name
        Write-Host "   Propriétés: $($properties -join ', ')" -ForegroundColor Yellow
        
        # Vérifier la présence de "data"
        if ($properties -contains "data") {
            Write-Host ""
            Write-Host "  ✅ SUCCES: Propriété 'data' trouvée!" -ForegroundColor Green
            Write-Host "  Structure: { data: {...} }" -ForegroundColor Green
            Write-Host ""
            Write-Host "  Clés dans 'data':" -ForegroundColor Yellow
            $dataKeys = $response.data.PSObject.Properties.Name
            foreach ($key in $dataKeys) {
                Write-Host "    - $key" -ForegroundColor Gray
            }
        }
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
Write-Host "Test terminé." -ForegroundColor Cyan
