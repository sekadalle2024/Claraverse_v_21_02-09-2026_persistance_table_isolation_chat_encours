# Test simple de l'endpoint etats-financiers
Write-Host "Test de l'endpoint etats-financiers..." -ForegroundColor Cyan

# Verifier que le fichier balance existe
$balanceFile = "py_backend\P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "ERREUR: Fichier $balanceFile non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier balance trouve: $balanceFile" -ForegroundColor Green

# Lire et encoder le fichier
Write-Host "Encodage du fichier en base64..." -ForegroundColor Gray
$balance = [Convert]::ToBase64String([IO.File]::ReadAllBytes($balanceFile))
Write-Host "Taille encodee: $($balance.Length) caracteres" -ForegroundColor Gray

# Preparer le body JSON
$body = @{
    file_base64 = $balance
    filename = $balanceFile
} | ConvertTo-Json -Depth 10

Write-Host "Envoi de la requete HTTP..." -ForegroundColor Gray
$startTime = Get-Date

try {
    $response = Invoke-RestMethod `
        -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 120
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "SUCCES!" -ForegroundColor Green
    Write-Host "Duree: $([math]::Round($duration, 2)) secondes" -ForegroundColor Cyan
    Write-Host "Success: $($response.success)" -ForegroundColor Cyan
    Write-Host "HTML genere: $($response.html.Length) caracteres" -ForegroundColor Cyan
    
    if ($duration -gt 30) {
        Write-Host ""
        Write-Host "ATTENTION: Le traitement prend plus de 30 secondes" -ForegroundColor Yellow
        Write-Host "Il faut ajouter un timeout au fetch() dans le frontend" -ForegroundColor Yellow
    }
    
} catch {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "ERREUR!" -ForegroundColor Red
    Write-Host "Duree avant erreur: $([math]::Round($duration, 2)) secondes" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -match "timeout|timed out") {
        Write-Host ""
        Write-Host "Le traitement prend trop de temps" -ForegroundColor Yellow
        Write-Host "Solution: Ajouter un timeout au fetch() dans le frontend" -ForegroundColor Yellow
    }
}
