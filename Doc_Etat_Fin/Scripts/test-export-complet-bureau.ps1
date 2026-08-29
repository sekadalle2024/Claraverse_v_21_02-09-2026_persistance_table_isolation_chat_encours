# Script PowerShell - Export Complet Etats Financiers sur le Bureau
# Utilise BALANCES_N_N1_N2.xlsx

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "           EXPORT COMPLET ETATS FINANCIERS SUR LE BUREAU" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier l'existence du fichier
$balanceFile = "py_backend\BALANCES_N_N1_N2.xlsx"
if (-not (Test-Path $balanceFile)) {
    Write-Host "[ERREUR] Fichier non trouve: $balanceFile" -ForegroundColor Red
    Write-Host "   Veuillez creer ce fichier avec les onglets: Balance N, Balance N-1, Balance N-2" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Fichier trouve: $balanceFile" -ForegroundColor Green
Write-Host ""

# Executer le test des etats financiers
Write-Host "[INFO] Generation des etats financiers..." -ForegroundColor Yellow
cd py_backend
python test_etats_financiers_standalone.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Erreur lors de la generation" -ForegroundColor Red
    cd ..
    exit 1
}

Write-Host ""
Write-Host "[OK] Etats financiers generes avec succes!" -ForegroundColor Green
Write-Host ""

# Copier le fichier HTML sur le bureau
$desktop = [Environment]::GetFolderPath("Desktop")
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = Join-Path $desktop "Etats_Financiers_Complet_$timestamp.html"

# Chercher le fichier HTML genere
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($htmlFiles) {
    Copy-Item $htmlFiles.FullName $outputFile
    Write-Host "[EXPORT] Fichier copie sur le Bureau:" -ForegroundColor Cyan
    Write-Host "   Fichier: $outputFile" -ForegroundColor White
    $fileSize = [math]::Round((Get-Item $outputFile).Length / 1KB, 1)
    Write-Host "   Taille: $fileSize KB" -ForegroundColor White
    Write-Host ""
    
    # Ouvrir le fichier
    Write-Host "[INFO] Ouverture du fichier..." -ForegroundColor Yellow
    Start-Process $outputFile
} else {
    Write-Host "[ATTENTION] Aucun fichier HTML trouve" -ForegroundColor Yellow
}

cd ..

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                           EXPORT TERMINE" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le fichier contient:" -ForegroundColor Yellow
Write-Host "  [OK] Bilan (Actif + Passif)" -ForegroundColor White
Write-Host "  [OK] Compte de Resultat (Charges + Produits)" -ForegroundColor White
Write-Host "  [OK] Resultat Net" -ForegroundColor White
Write-Host "  [OK] Tableau des Flux de Tresorerie (si N-1 disponible)" -ForegroundColor White
Write-Host "  [OK] Etats de Controle" -ForegroundColor White
Write-Host "  [OK] Annexes calculables" -ForegroundColor White
Write-Host ""
