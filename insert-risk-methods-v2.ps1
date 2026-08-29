# Script v2 pour inserer les methodes d'evaluation des risques

$sourceFile = "public/menu_risk_evaluation_extension.js"
$targetFile = "public/menu.js"

Write-Host "Insertion v2..." -ForegroundColor Cyan

# Lire les fichiers
$extension = Get-Content $sourceFile -Raw -Encoding UTF8
$menu = Get-Content $targetFile -Raw -Encoding UTF8

# Extraire TOUT entre les marqueurs
$startMarker = "getMatrixAlpha3()"
$endMarker = "// === FIN DU FICHIER D'EXTENSION ==="

$startIdx = $extension.IndexOf($startMarker)
$endIdx = $extension.IndexOf($endMarker)

if ($startIdx -eq -1 -or $endIdx -eq -1) {
    Write-Host "Erreur: Marqueurs non trouves" -ForegroundColor Red
    exit 1
}

# Extraire les methodes completes
$methods = $extension.Substring($startIdx, $endIdx - $startIdx).Trim()

# Trouver le point d'insertion dans menu.js
$insertMarker = "    // === CALCULS ARITHM"
$insertIdx = $menu.IndexOf($insertMarker)

if ($insertIdx -eq -1) {
    Write-Host "Erreur: Point d'insertion non trouve" -ForegroundColor Red
    exit 1
}

# Preparer l'insertion avec indentation
$toInsert = "`n    // === EVALUATION DES RISQUES - MATRICES ===`n`n    "
$toInsert += $methods -replace "`n", "`n    "
$toInsert += "`n`n"

# Inserer
$newContent = $menu.Insert($insertIdx, $toInsert)

# Ecrire
[System.IO.File]::WriteAllText($targetFile, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "TERMINE!" -ForegroundColor Green
