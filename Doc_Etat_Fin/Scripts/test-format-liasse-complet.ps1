# Script de test pour le format liasse officielle complet
# Teste l'endpoint avec les 2 balances (N et N-1)

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST FORMAT LIASSE OFFICIELLE - ENDPOINT COMPLET" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Configuration
$BACKEND_URL = "http://localhost:5000"
$EXCEL_FILE_N = "py_backend/BALANCES_N_N1_N2.xlsx"
$SHEET_N = "Balance N (2024)"
$SHEET_N1 = "Balance N-1 (2023)"
$OUTPUT_DIR = "$env:USERPROFILE\Desktop"
$OUTPUT_FILE = "Etats_Financiers_Format_Liasse_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"

# Vérifier que le fichier Excel existe
if (-not (Test-Path $EXCEL_FILE_N)) {
    Write-Host "❌ Fichier Excel non trouvé: $EXCEL_FILE_N" -ForegroundColor Red
    exit 1
}

Write-Host "1. Préparation des fichiers..." -ForegroundColor Yellow
Write-Host "   📂 Fichier Excel: $EXCEL_FILE_N"
Write-Host "   📊 Onglet N: $SHEET_N"
Write-Host "   📊 Onglet N-1: $SHEET_N1"
Write-Host ""

# Charger le module Excel
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $workbook = $excel.Workbooks.Open((Resolve-Path $EXCEL_FILE_N).Path)
    
    # Exporter Balance N
    Write-Host "2. Export Balance N..." -ForegroundColor Yellow
    $worksheet_n = $workbook.Worksheets.Item($SHEET_N)
    $temp_file_n = [System.IO.Path]::GetTempFileName() + ".xlsx"
    $worksheet_n.Copy()
    $excel.ActiveWorkbook.SaveAs($temp_file_n)
    $excel.ActiveWorkbook.Close()
    Write-Host "   ✅ Balance N exportée: $temp_file_n"
    
    # Exporter Balance N-1
    Write-Host "3. Export Balance N-1..." -ForegroundColor Yellow
    $worksheet_n1 = $workbook.Worksheets.Item($SHEET_N1)
    $temp_file_n1 = [System.IO.Path]::GetTempFileName() + ".xlsx"
    $worksheet_n1.Copy()
    $excel.ActiveWorkbook.SaveAs($temp_file_n1)
    $excel.ActiveWorkbook.Close()
    Write-Host "   ✅ Balance N-1 exportée: $temp_file_n1"
    
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    
} catch {
    Write-Host "❌ Erreur lors de l'export Excel: $_" -ForegroundColor Red
    exit 1
}

# Encoder les fichiers en base64
Write-Host ""
Write-Host "4. Encodage des fichiers en base64..." -ForegroundColor Yellow
try {
    $bytes_n = [System.IO.File]::ReadAllBytes($temp_file_n)
    $base64_n = [System.Convert]::ToBase64String($bytes_n)
    Write-Host "   ✅ Balance N encodée: $($base64_n.Length) caractères"
    
    $bytes_n1 = [System.IO.File]::ReadAllBytes($temp_file_n1)
    $base64_n1 = [System.Convert]::ToBase64String($bytes_n1)
    Write-Host "   ✅ Balance N-1 encodée: $($base64_n1.Length) caractères"
} catch {
    Write-Host "❌ Erreur lors de l'encodage: $_" -ForegroundColor Red
    exit 1
}

# Préparer la requête JSON
Write-Host ""
Write-Host "5. Préparation de la requête API..." -ForegroundColor Yellow
$requestBody = @{
    file_base64 = $base64_n
    filename = "Balance_N_2024.xlsx"
    file_n1_base64 = $base64_n1
    filename_n1 = "Balance_N1_2023.xlsx"
} | ConvertTo-Json

Write-Host "   ✅ Requête préparée"

# Envoyer la requête à l'API
Write-Host ""
Write-Host "6. Envoi de la requête à l'API..." -ForegroundColor Yellow
Write-Host "   🌐 URL: $BACKEND_URL/etats-financiers/process-excel"

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/etats-financiers/process-excel" `
        -Method Post `
        -Body $requestBody `
        -ContentType "application/json" `
        -TimeoutSec 120
    
    Write-Host "   ✅ Réponse reçue" -ForegroundColor Green
    Write-Host "   📝 Message: $($response.message)" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Erreur API: $_" -ForegroundColor Red
    Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Red
    
    # Nettoyer les fichiers temporaires
    Remove-Item $temp_file_n -ErrorAction SilentlyContinue
    Remove-Item $temp_file_n1 -ErrorAction SilentlyContinue
    exit 1
}

# Sauvegarder le HTML
Write-Host ""
Write-Host "7. Sauvegarde du fichier HTML..." -ForegroundColor Yellow
try {
    $html_content = $response.html
    $output_path = Join-Path $OUTPUT_DIR $OUTPUT_FILE
    
    # Créer le HTML complet
    $full_html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>États Financiers - Format Liasse Officielle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
    $html_content
</body>
</html>
"@
    
    [System.IO.File]::WriteAllText($output_path, $full_html, [System.Text.Encoding]::UTF8)
    Write-Host "   ✅ Fichier sauvegardé: $output_path" -ForegroundColor Green
    
    # Afficher les statistiques
    if ($response.results) {
        Write-Host ""
        Write-Host "8. Statistiques:" -ForegroundColor Yellow
        
        if ($response.results.compte_resultat) {
            Write-Host "   📊 Compte de Résultat: $($response.results.compte_resultat.Count) postes"
        }
        if ($response.results.bilan_actif) {
            Write-Host "   🏢 Bilan Actif: $($response.results.bilan_actif.Count) postes"
        }
        if ($response.results.bilan_passif) {
            Write-Host "   🏛️ Bilan Passif: $($response.results.bilan_passif.Count) postes"
        }
        if ($response.results.tft) {
            Write-Host "   💰 TFT: Calculé"
        }
        if ($response.results.annexes) {
            Write-Host "   📋 Annexes: Calculées"
        }
    }
    
    # Ouvrir le fichier
    Write-Host ""
    Write-Host "9. Ouverture du fichier..." -ForegroundColor Yellow
    Start-Process $output_path
    Write-Host "   ✅ Fichier ouvert dans le navigateur" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Erreur lors de la sauvegarde: $_" -ForegroundColor Red
}

# Nettoyer les fichiers temporaires
Write-Host ""
Write-Host "10. Nettoyage..." -ForegroundColor Yellow
Remove-Item $temp_file_n -ErrorAction SilentlyContinue
Remove-Item $temp_file_n1 -ErrorAction SilentlyContinue
Write-Host "   ✅ Fichiers temporaires supprimés"

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "✅ TEST TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Fichier généré: $output_path" -ForegroundColor Cyan
Write-Host ""
