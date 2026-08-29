# Test des états de contrôle exhaustifs
Write-Host "Test des États de Contrôle Exhaustifs" -ForegroundColor Cyan
Write-Host ""

# Lire et encoder le fichier
$fileBytes = [System.IO.File]::ReadAllBytes("py_backend/BALANCES_N_N1_N2.xlsx")
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)

$json = @{
    file_base64 = $fileBase64
    filename = "BALANCES_N_N1_N2.xlsx"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" -Method Post -ContentType "application/json" -Body $json -UseBasicParsing
    
    $html = $response.html
    Write-Host "HTML généré: $($html.Length) caractères" -ForegroundColor Green
    Write-Host ""
    
    # Vérifier les états de contrôle
    $etats_controle = @(
        "etat_controle_bilan_actif",
        "etat_controle_bilan_passif",
        "etat_controle_compte_resultat",
        "etat_controle_tft",
        "etat_controle_sens_comptes",
        "etat_equilibre_bilan"
    )
    
    Write-Host "Vérification des états de contrôle:" -ForegroundColor Yellow
    $count = 0
    foreach ($etat in $etats_controle) {
        if ($html -like "*$etat*") {
            Write-Host "  ✅ $etat" -ForegroundColor Green
            $count++
        } else {
            Write-Host "  ❌ $etat MANQUANT" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Résumé:" -ForegroundColor Cyan
    Write-Host "  ✅ $count / $($etats_controle.Count) états de contrôle présents" -ForegroundColor Green
    
    if ($count -eq $etats_controle.Count) {
        Write-Host "  ✅ TOUS LES ÉTATS DE CONTRÔLE PRÉSENTS!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}
