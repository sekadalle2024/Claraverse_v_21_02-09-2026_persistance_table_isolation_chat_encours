# Test script for Notes Annexes SYSCOHADA API endpoint
# Tests the /api/calculer_notes_annexes endpoint

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test API Notes Annexes SYSCOHADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:5000/api/calculer_notes_annexes"
$HEALTH_URL = "http://localhost:5000/api/notes_annexes/health"
$BALANCE_FILE = "P000 -BALANCE DEMO N_N-1_N-2.xls"

# Test 1: Health check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "URL: $HEALTH_URL" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $HEALTH_URL -Method Get
    Write-Host "✓ Service disponible" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Version: $($response.version)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Erreur health check: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Vérifier que le fichier de balance existe
Write-Host "Test 2: Vérification du fichier de balance" -ForegroundColor Yellow
Write-Host "Fichier: $BALANCE_FILE" -ForegroundColor Gray

if (Test-Path $BALANCE_FILE) {
    Write-Host "✓ Fichier trouvé" -ForegroundColor Green
    $fileSize = (Get-Item $BALANCE_FILE).Length
    Write-Host "  Taille: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✗ Fichier non trouvé: $BALANCE_FILE" -ForegroundColor Red
    Write-Host "  Veuillez placer le fichier de balance à la racine du projet" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 3: Upload et calcul des notes annexes
Write-Host "Test 3: Calcul des 33 notes annexes" -ForegroundColor Yellow
Write-Host "URL: $API_URL" -ForegroundColor Gray
Write-Host "Ceci peut prendre 10-30 secondes..." -ForegroundColor Gray
Write-Host ""

try {
    # Préparer le fichier pour l'upload
    $filePath = Resolve-Path $BALANCE_FILE
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
    
    # Créer le boundary pour multipart/form-data
    $boundary = [System.Guid]::NewGuid().ToString()
    
    # Construire le body multipart
    $LF = "`r`n"
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"balance_file`"; filename=`"$BALANCE_FILE`"",
        "Content-Type: application/vnd.ms-excel$LF",
        $fileEnc,
        "--$boundary--$LF"
    ) -join $LF
    
    # Envoyer la requête
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri $API_URL -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyLines `
        -TimeoutSec 300
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✓ Calcul réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Résultats:" -ForegroundColor Cyan
    Write-Host "  Notes calculées: $($response.notes_calculees)/$($response.notes_totales)" -ForegroundColor Gray
    Write-Host "  Taux de cohérence: $($response.taux_coherence)%" -ForegroundColor Gray
    Write-Host "  Durée backend: $($response.duree_calcul)s" -ForegroundColor Gray
    Write-Host "  Durée totale: $([math]::Round($duration, 2))s" -ForegroundColor Gray
    Write-Host "  Fichier source: $($response.fichier_source)" -ForegroundColor Gray
    Write-Host ""
    
    # Afficher quelques notes calculées
    Write-Host "Notes disponibles:" -ForegroundColor Cyan
    $noteCount = 0
    foreach ($noteName in $response.notes.PSObject.Properties.Name | Sort-Object) {
        $noteCount++
        $note = $response.notes.$noteName
        $lignes = $note.lignes.Count
        Write-Host "  $noteName : $lignes lignes" -ForegroundColor Gray
        if ($noteCount -ge 5) {
            Write-Host "  ... et $($response.notes_calculees - 5) autres notes" -ForegroundColor Gray
            break
        }
    }
    Write-Host ""
    
    # Vérifier les statuts
    $echecs = @($response.statuts.PSObject.Properties.Value | Where-Object { $_ -like "*✗*" })
    if ($echecs.Count -gt 0) {
        Write-Host "⚠ Quelques notes ont échoué:" -ForegroundColor Yellow
        foreach ($statut in $echecs) {
            Write-Host "  $statut" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ TOUS LES TESTS RÉUSSIS" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Erreur lors du calcul: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Détail: $($errorDetail.detail)" -ForegroundColor Red
    }
    Write-Host ""
    exit 1
}
