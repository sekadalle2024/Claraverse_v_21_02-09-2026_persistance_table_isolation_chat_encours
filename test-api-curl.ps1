# Test API avec curl
Write-Host "Test API avec fichier BALANCES_N_N1_N2.xlsx" -ForegroundColor Cyan

# Lire et encoder le fichier
$fileBytes = [System.IO.File]::ReadAllBytes("py_backend/BALANCES_N_N1_N2.xlsx")
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)

# Creer le JSON
$json = @{
    file_base64 = $fileBase64
    filename = "BALANCES_N_N1_N2.xlsx"
} | ConvertTo-Json -Depth 10

# Envoyer la requete
Write-Host "Envoi de la requete..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" -Method Post -ContentType "application/json" -Body $json -UseBasicParsing
    
    Write-Host "Status: 200 OK" -ForegroundColor Green
    
    $html = $response.html
    Write-Host "HTML recu: $($html.Length) caracteres" -ForegroundColor Green
    
    # Verifier les patterns
    $patterns = @(
        ".section-header-ef",
        ".section-content-ef",
        "max-height: 0",
        "BILAN - ACTIF",
        "BILAN - PASSIF",
        "COMPTE DE RESULTAT",
        "TABLEAU DES FLUX",
        "NOTES ANNEXES"
    )
    
    Write-Host "`nVerification des patterns:" -ForegroundColor Yellow
    $allFound = $true
    foreach ($pattern in $patterns) {
        if ($html -like "*$pattern*") {
            Write-Host "  OK: $pattern" -ForegroundColor Green
        } else {
            Write-Host "  MANQUANT: $pattern" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    if ($allFound) {
        Write-Host "`nTOUS LES PATTERNS PRESENTS!" -ForegroundColor Green
    } else {
        Write-Host "`nCERTAINS PATTERNS MANQUANTS" -ForegroundColor Red
    }
    
    # Sauvegarder
    $html | Out-File "test-api-output.html" -Encoding UTF8
    Write-Host "`nHTML sauvegarde dans: test-api-output.html" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
}
