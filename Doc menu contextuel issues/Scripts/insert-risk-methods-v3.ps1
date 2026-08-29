# Script v3 - Copie directe des lignes

$targetFile = "public/menu.js"
$sourceFile = "public/menu_risk_evaluation_extension.js"

Write-Host "Insertion v3..." -ForegroundColor Cyan

# Lire
$sourceLines = Get-Content $sourceFile -Encoding UTF8
$targetContent = Get-Content $targetFile -Raw -Encoding UTF8

# Prendre les lignes 11 a 849 (index 10 a 848)
$methodLines = $sourceLines[10..848]
$methodsText = ($methodLines -join "`n").Trim()

# Point d'insertion
$marker = "    // === CALCULS ARITHM"
$idx = $targetContent.IndexOf($marker)

if ($idx -eq -1) {
    Write-Host "Erreur" -ForegroundColor Red
    exit 1
}

# Inserer avec indentation
$insert = "`n    // === EVALUATION DES RISQUES ===`n`n    "
$insert += $methodsText -replace "`n", "`n    "
$insert += "`n`n"

$newContent = $targetContent.Insert($idx, $insert)

# Ecrire
[System.IO.File]::WriteAllText($targetFile, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "TERMINE - 22 methodes inserees!" -ForegroundColor Green
