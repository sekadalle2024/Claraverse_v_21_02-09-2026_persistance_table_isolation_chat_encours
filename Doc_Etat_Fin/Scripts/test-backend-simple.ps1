# Script de test simple du backend Etats Financiers

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST BACKEND - ETATS FINANCIERS" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que le fichier de balance existe
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
if (Test-Path $balanceFile) {
    Write-Host "[OK] Fichier de balance trouve" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Fichier de balance non trouve: $balanceFile" -ForegroundColor Red
    exit 1
}

# 2. Verifier que le backend est accessible
Write-Host "Verification du backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Backend non accessible. Demarrez-le avec: python py_backend/main.py" -ForegroundColor Red
    exit 1
}

# 3. Lire et encoder le fichier
Write-Host "Envoi de la requete..." -ForegroundColor Yellow
$fileBytes = [System.IO.File]::ReadAllBytes($balanceFile)
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)

$payload = @{
    file_base64 = $fileBase64
    filename = "P000 -BALANCE DEMO N_N-1_N-2.xls"
} | ConvertTo-Json

# 4. Envoyer la requete
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "[OK] Requete reussie (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Parser la reponse
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "[OK] Traitement reussi" -ForegroundColor Green
        Write-Host "   Message: $($result.message)" -ForegroundColor Gray
        
        if ($result.html) {
            Write-Host "[OK] HTML genere ($($result.html.Length) caracteres)" -ForegroundColor Green
            
            # Sauvegarder le HTML
            $outputFile = "$env:USERPROFILE\Desktop\test_etats_financiers_backend.html"
            $result.html | Out-File -FilePath $outputFile -Encoding UTF8
            Write-Host "[OK] HTML sauvegarde: $outputFile" -ForegroundColor Cyan
            
            # Verifier le contenu
            Write-Host ""
            Write-Host "Verification du contenu:" -ForegroundColor Yellow
            if ($result.html -match "BILAN - ACTIF") { Write-Host "  [OK] Bilan Actif present" -ForegroundColor Green }
            if ($result.html -match "BILAN - PASSIF") { Write-Host "  [OK] Bilan Passif present" -ForegroundColor Green }
            if ($result.html -match "COMPTE DE RESULTAT") { Write-Host "  [OK] Compte de Resultat present" -ForegroundColor Green }
            if ($result.html -match "EXERCICE N") { Write-Host "  [OK] Colonne N presente" -ForegroundColor Green }
            if ($result.html -match "EXERCICE N-1") { Write-Host "  [OK] Colonne N-1 presente" -ForegroundColor Green }
            
        } else {
            Write-Host "[ERREUR] HTML non genere" -ForegroundColor Red
        }
        
    } else {
        Write-Host "[ERREUR] Traitement echoue: $($result.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] TEST TERMINE" -ForegroundColor Green
Write-Host "Ouvrez le fichier HTML sur le bureau pour verifier l'affichage" -ForegroundColor Cyan
