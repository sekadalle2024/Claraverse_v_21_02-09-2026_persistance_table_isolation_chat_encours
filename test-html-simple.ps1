# Test HTML simple
$desktop = [Environment]::GetFolderPath("Desktop")
$htmlFile = Get-ChildItem -Path $desktop -Filter "Etats_Financiers_Liasse_*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $htmlFile) {
    Write-Host "Aucun fichier trouve" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier: $($htmlFile.Name)" -ForegroundColor Yellow
$content = Get-Content $htmlFile.FullName -Raw

Write-Host ""
Write-Host "VERIFICATIONS:" -ForegroundColor Cyan
Write-Host ""

# Colonnes
if ($content -match "EXERCICE N-2") {
    Write-Host "X Colonne N-2 presente (devrait etre absente)" -ForegroundColor Red
} else {
    Write-Host "OK Colonne N-2 absente" -ForegroundColor Green
}

if ($content -match "EXERCICE N-1") {
    Write-Host "OK Colonne N-1 presente" -ForegroundColor Green
} else {
    Write-Host "X Colonne N-1 absente" -ForegroundColor Red
}

# TFT
if ($content -match "TABLEAU DES FLUX") {
    Write-Host "OK Section TFT presente" -ForegroundColor Green
} else {
    Write-Host "X Section TFT absente" -ForegroundColor Red
}

if ($content -match "CAFG|Autofinancement") {
    Write-Host "OK CAFG present" -ForegroundColor Green
} else {
    Write-Host "X CAFG absent" -ForegroundColor Red
}

# Annexes
if ($content -match "NOTES ANNEXES|ANNEXES") {
    Write-Host "OK Section ANNEXES presente" -ForegroundColor Green
} else {
    Write-Host "X Section ANNEXES absente" -ForegroundColor Red
}

# Totaux
if ($content -match "TOTAL GENERAL") {
    Write-Host "OK Totaux generaux presents" -ForegroundColor Green
} else {
    Write-Host "X Totaux generaux absents" -ForegroundColor Red
}

# Accordeons
$nbSections = ([regex]::Matches($content, "section-header-ef")).Count
Write-Host ""
Write-Host "Nombre de sections accordeon: $nbSections" -ForegroundColor White
Write-Host "Taille fichier: $([math]::Round($content.Length / 1024, 2)) KB" -ForegroundColor White

Write-Host ""
Write-Host "Ouvrir le fichier? (O/N)" -ForegroundColor Yellow
$reponse = Read-Host
if ($reponse -eq "O") {
    Start-Process $htmlFile.FullName
}
