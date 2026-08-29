# Script pour inserer les 22 methodes d'evaluation des risques dans menu.js

$sourceFile = "public/menu_risk_evaluation_extension.js"
$targetFile = "public/menu.js"
$backupFile = "public/menu.js.backup"

Write-Host "Insertion des methodes..." -ForegroundColor Cyan

# Backup
Copy-Item $targetFile $backupFile -Force

# Lire les fichiers
$extensionContent = Get-Content $sourceFile -Raw -Encoding UTF8
$menuContent = Get-Content $targetFile -Raw -Encoding UTF8

# Extraire les methodes
$lines = $extensionContent -split "`r?`n"
$methodLines = $lines[11..($lines.Length - 5)]
$methodsToInsert = ($methodLines -join "`n").Trim()

# Trouver le point d'insertion (avec accent)
$insertionMarker = "    // === CALCULS ARITHM"
$insertionIndex = $menuContent.IndexOf($insertionMarker)

if ($insertionIndex -eq -1) {
    Write-Host "Erreur: Point d'insertion non trouve" -ForegroundColor Red
    exit 1
}

# Preparer le contenu
$toInsert = "`n    // === EVALUATION DES RISQUES - MATRICES ===`n`n    "
$toInsert += $methodsToInsert -replace "`n", "`n    "
$toInsert += "`n`n"

# Inserer
$newContent = $menuContent.Insert($insertionIndex, $toInsert)

# Ecrire
[System.IO.File]::WriteAllText($targetFile, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "TERMINE: 22 methodes inserees!" -ForegroundColor Green
