# Test de l'endpoint /etats-financiers/process-excel avec PowerShell
# Sans passer par le navigateur

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 TEST ENDPOINT ÉTATS FINANCIERS AVEC POWERSHELL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier balance existe
$balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    Write-Host "❌ Fichier non trouvé: $balanceFile" -ForegroundColor Red
    Write-Host "   Assurez-vous que le fichier est dans le répertoire courant" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Fichier trouvé: $balanceFile" -ForegroundColor Green
$fileInfo = Get-Item $balanceFile
Write-Host "   Taille: $($fileInfo.Length) bytes ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Gray
Write-Host ""

# Encoder le fichier en base64
Write-Host "🔄 Encodage du fichier en base64..." -ForegroundColor Yellow
try {
    $balance = [Convert]::ToBase64String([IO.File]::ReadAllBytes($balanceFile))
    Write-Host "✅ Fichier encodé: $($balance.Length) caractères" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'encodage: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Créer le payload JSON
Write-Host "📦 Création du payload JSON..." -ForegroundColor Yellow
$body = @{
    file_base64 = $balance
    filename = $balanceFile
} | ConvertTo-Json -Depth 10

Write-Host "✅ Payload créé: $($body.Length) caractères" -ForegroundColor Green
Write-Host ""

# Envoyer la requête
$endpoint = "http://127.0.0.1:5000/etats-financiers/process-excel"
Write-Host "🌐 Envoi de la requête vers: $endpoint" -ForegroundColor Yellow
Write-Host "⏱️  Timeout: 120 secondes" -ForegroundColor Gray
Write-Host ""

try {
    $startTime = Get-Date
    
    $response = Invoke-RestMethod `
        -Uri $endpoint `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 120 `
        -ErrorAction Stop
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ SUCCÈS!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏱️  Durée: $([math]::Round($duration, 2)) secondes" -ForegroundColor Cyan
    Write-Host ""
    
    # Afficher les résultats
    Write-Host "📊 RÉSULTATS:" -ForegroundColor Cyan
    Write-Host "   Success: $($response.success)" -ForegroundColor $(if ($response.success) { "Green" } else { "Red" })
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    Write-Host ""
    
    if ($response.html) {
        Write-Host "   HTML généré: $($response.html.Length) caractères" -ForegroundColor Gray
        Write-Host "   HTML (premiers 200 caractères):" -ForegroundColor Gray
        Write-Host "   $($response.html.Substring(0, [Math]::Min(200, $response.html.Length)))..." -ForegroundColor DarkGray
    }
    Write-Host ""
    
    if ($response.results) {
        Write-Host "📈 TOTAUX:" -ForegroundColor Cyan
        if ($response.results.totaux) {
            Write-Host "   Actif: $($response.results.totaux.actif)" -ForegroundColor Gray
            Write-Host "   Passif: $($response.results.totaux.passif)" -ForegroundColor Gray
            Write-Host "   Charges: $($response.results.totaux.charges)" -ForegroundColor Gray
            Write-Host "   Produits: $($response.results.totaux.produits)" -ForegroundColor Gray
            Write-Host "   Résultat: $($response.results.totaux.resultat_net)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    Write-Host "✅ Le backend fonctionne correctement!" -ForegroundColor Green
    Write-Host "   Le problème 'failed to fetch' vient probablement:" -ForegroundColor Yellow
    Write-Host "   - D'un timeout côté navigateur" -ForegroundColor Yellow
    Write-Host "   - D'un problème CORS" -ForegroundColor Yellow
    Write-Host "   - D'une taille de réponse trop grande" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "❌ ERREUR!" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "⏱️  Durée avant erreur: $([math]::Round($duration, 2)) secondes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Type d'erreur: $($_.Exception.GetType().Name)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "🔍 DIAGNOSTIC:" -ForegroundColor Yellow
    if ($_.Exception.Message -match "timeout|timed out") {
        Write-Host "   → Le traitement prend trop de temps (> 120 secondes)" -ForegroundColor Yellow
        Write-Host "   → Vérifier les logs du backend pour voir où il bloque" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -match "connection|refused|reset") {
        Write-Host "   → Le backend n'est pas démarré ou n'est pas accessible" -ForegroundColor Yellow
        Write-Host "   → Vérifier: .\start-claraverse-conda.ps1" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -match "500|Internal Server Error") {
        Write-Host "   → Erreur dans le traitement backend" -ForegroundColor Yellow
        Write-Host "   → Voir les logs: Receive-Job -Id `$jobs.Backend -Keep" -ForegroundColor Yellow
    } else {
        Write-Host "   → Erreur inconnue, voir les détails ci-dessus" -ForegroundColor Yellow
    }
    Write-Host ""
    
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
