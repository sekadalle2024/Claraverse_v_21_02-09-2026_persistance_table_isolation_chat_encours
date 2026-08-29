# Test Export Synthese CAC - Simple
Write-Host "Test Export Synthese CAC FINAL" -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "Backend OK" -ForegroundColor Green
} catch {
    Write-Host "Backend not accessible" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Preparing test data..." -ForegroundColor Yellow

# Simple test data
$testData = @{
    frap_points = @(
        @{
            metadata = @{
                etape = "Frap"
                norme = "14.3 Evaluation des constats"
                methode = "Methode des constats d'audit"
                reference = "Frap-001"
            }
            intitule = "Perte de liasses de facturation"
            observation = "La procedure de gestion des ventes exige une numerotation sequentielle."
            constat = "Inexistence d'un rapprochement formalise"
            risque = "Risque de perte financiere directe"
            recommandation = "Rendre obligatoire le rapprochement hebdomadaire"
        }
    )
    recos_revision_points = @(
        @{
            metadata = @{
                etape = "Recommendations comptables"
                norme = "Norme ISA"
                methode = "Methode de la regularisation"
                reference = "Recos-001"
            }
            intitule = "Depenses de caisse non appuyees"
            description = "Nous avons mis en oeuvre une procedure de rapprochement."
            observation = "Le rapprochement fait ressortir un ecart de 600 000 FCFA."
            ajustement = "Nous proposons un ajustement pour sur-evaluation de charges."
            regularisation = "Debit du compte 571 000 - Caisse pour 600 000 FCFA TTC."
        }
    )
    recos_controle_interne_points = @(
        @{
            metadata = @{
                etape = "Recos controle interne"
                norme = "14.3 Evaluation"
                methode = "Methode des constats"
                reference = "CI-001"
            }
            intitule = "Absence de rapprochement bancaire"
            observation = "Toute entite doit effectuer un rapprochement bancaire mensuel."
            constat = "Inexistence de rapprochements bancaires formalises."
            risque = "Detournement d'actifs non detecte"
            recommandation = "Rendre obligatoire le rapprochement bancaire mensuel"
        }
    )
    date_rapport = "2026-03-25"
}

Write-Host "Data prepared" -ForegroundColor Green
Write-Host "  - FRAP: $($testData.frap_points.Count) point(s)" -ForegroundColor White
Write-Host "  - Recos Revision: $($testData.recos_revision_points.Count) point(s)" -ForegroundColor White
Write-Host "  - Recos CI: $($testData.recos_controle_interne_points.Count) point(s)" -ForegroundColor White

Write-Host ""
Write-Host "Calling endpoint /export-synthese-cac-final..." -ForegroundColor Yellow

try {
    $jsonBody = $testData | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/word/export-synthese-cac-final" `
        -Method Post `
        -ContentType "application/json" `
        -Body $jsonBody `
        -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Save file
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $filename = "synthese_cac_test_$timestamp.docx"
        $filepath = Join-Path (Get-Location) $filename
        
        [System.IO.File]::WriteAllBytes($filepath, $response.Content)
        
        Write-Host ""
        Write-Host "File generated:" -ForegroundColor Green
        Write-Host "  $filepath" -ForegroundColor White
        Write-Host ""
        Write-Host "File size: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Cyan
        
        # Open file
        Write-Host ""
        Write-Host "Opening file..." -ForegroundColor Yellow
        Start-Process $filepath
        
        Write-Host ""
        Write-Host "TEST SUCCESSFUL!" -ForegroundColor Green
        
    } else {
        Write-Host "Unexpected response (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
    
    exit 1
}

Write-Host ""
