# Script de test exhaustivite des etats financiers
# Test avec le fichier de balance demo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST EXHAUSTIVITE ETATS FINANCIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que le backend est demarre
Write-Host "1. Verification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -Method GET -TimeoutSec 5
    Write-Host "   OK Backend operationnel" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR Backend non accessible sur http://127.0.0.1:5000" -ForegroundColor Red
    Write-Host "   Demarrez le backend avec: cd py_backend ; python main.py" -ForegroundColor Yellow
    exit 1
}

# Chemin du fichier de balance demo
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"

if (-not (Test-Path $balanceFile)) {
    Write-Host "   ERREUR Fichier de balance non trouve: $balanceFile" -ForegroundColor Red
    exit 1
}

Write-Host "   OK Fichier de balance trouve" -ForegroundColor Green
Write-Host ""

# Encoder le fichier en base64
Write-Host "2. Encodage du fichier..." -ForegroundColor Yellow
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $balanceFile))
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)
Write-Host "   OK Fichier encode: $($fileBytes.Length) bytes" -ForegroundColor Green
Write-Host ""

# Preparer la requete
$body = @{
    filename = "P000 -BALANCE DEMO N_N-1_N-2.xls"
    file_base64 = $fileBase64
} | ConvertTo-Json

# Envoyer la requete
Write-Host "3. Envoi de la requete au backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30
    
    Write-Host "   OK Requete reussie (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Parser la reponse
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "4. Analyse de la reponse..." -ForegroundColor Yellow
    
    # Sauvegarder le HTML
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $outputFile = "$env:USERPROFILE\Desktop\diagnostic_exhaustivite_$timestamp.html"
    $result.html | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host "   OK HTML sauvegarde: $outputFile" -ForegroundColor Green
    
    # Analyser le HTML
    $html = $result.html
    
    # Compter les sections
    $sections = ([regex]::Matches($html, '<div class="etats-fin-section"')).Count
    Write-Host ""
    Write-Host "   SECTIONS TROUVEES: $sections" -ForegroundColor Cyan
    
    # Chercher les titres de sections
    $titres = [regex]::Matches($html, '<div class="section-header-ef[^"]*"[^>]*>([^<]+)</div>') | ForEach-Object { $_.Groups[1].Value.Trim() }
    
    Write-Host ""
    Write-Host "   SECTIONS DETECTEES:" -ForegroundColor White
    $i = 1
    foreach ($titre in $titres) {
        Write-Host "   $i. $titre" -ForegroundColor White
        $i++
    }
    
    Write-Host ""
    Write-Host "   SECTIONS ATTENDUES (11):" -ForegroundColor Yellow
    Write-Host "   1. BILAN - ACTIF" -ForegroundColor Gray
    Write-Host "   2. BILAN - PASSIF" -ForegroundColor Gray
    Write-Host "   3. COMPTE DE RESULTAT" -ForegroundColor Gray
    Write-Host "   4. TABLEAU DES FLUX DE TRESORERIE" -ForegroundColor Gray
    Write-Host "   5. NOTES ANNEXES" -ForegroundColor Gray
    Write-Host "   6. Etat de controle Bilan Actif" -ForegroundColor Gray
    Write-Host "   7. Etat de controle Bilan Passif" -ForegroundColor Gray
    Write-Host "   8. Etat de controle Compte de Resultat" -ForegroundColor Gray
    Write-Host "   9. Etat de controle TFT" -ForegroundColor Gray
    Write-Host "   10. Etat de controle Sens des Comptes" -ForegroundColor Gray
    Write-Host "   11. Etat d'equilibre Bilan" -ForegroundColor Gray
    
    Write-Host ""
    if ($sections -eq 11) {
        Write-Host "   SUCCES: Toutes les sections sont presentes!" -ForegroundColor Green
    } else {
        Write-Host "   PROBLEME: $sections sections au lieu de 11" -ForegroundColor Red
        Write-Host "   Sections manquantes: $($11 - $sections)" -ForegroundColor Red
    }
    
    # Ouvrir le fichier HTML
    Write-Host ""
    Write-Host "5. Ouverture du fichier HTML..." -ForegroundColor Yellow
    Start-Process $outputFile
    Write-Host "   OK Fichier ouvert dans le navigateur" -ForegroundColor Green
    
} catch {
    Write-Host "   ERREUR lors de la requete" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "   Reponse du serveur:" -ForegroundColor Yellow
        Write-Host "   $responseBody" -ForegroundColor Gray
    }
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST TERMINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
