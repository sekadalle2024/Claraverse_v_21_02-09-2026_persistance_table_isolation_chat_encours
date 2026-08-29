# Template Script Insertion - Menu Contextuel
# Personnaliser les variables ci-dessous

# ============================================================================
# CONFIGURATION
# ============================================================================

$sourceFile = "public/menu_VOTRE_FEATURE_extension.js"
$targetFile = "public/menu.js"
$startLine = 10      # Premiere ligne a copier (index 0-based)
$endLine = 100       # Derniere ligne a copier (index 0-based)
$insertionMarker = "// === CALCULS ARITHM"  # Marqueur d'insertion
$sectionName = "VOTRE SECTION"

# ============================================================================
# SCRIPT (NE PAS MODIFIER)
# ============================================================================

Write-Host "Insertion $sectionName..." -ForegroundColor Cyan

# Verification fichiers
if (-not (Test-Path $sourceFile)) {
    Write-Host "ERREUR: Fichier source non trouve: $sourceFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $targetFile)) {
    Write-Host "ERREUR: Fichier cible non trouve: $targetFile" -ForegroundColor Red
    exit 1
}

# Backup
$backupFile = "$targetFile.backup"
Copy-Item $targetFile $backupFile -Force
Write-Host "Backup cree: $backupFile" -ForegroundColor Green

# Lire les fichiers
$sourceLines = Get-Content $sourceFile -Encoding UTF8
$targetContent = Get-Content $targetFile -Raw -Encoding UTF8

# Extraire les lignes
$methodLines = $sourceLines[$startLine..$endLine]
$methodsText = ($methodLines -join "`n").Trim()

# Trouver le point d'insertion
$idx = $targetContent.IndexOf($insertionMarker)

if ($idx -eq -1) {
    Write-Host "ERREUR: Marqueur d'insertion non trouve: $insertionMarker" -ForegroundColor Red
    Write-Host "Restauration du backup..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    exit 1
}

# Preparer l'insertion avec indentation
$insert = "`n    // === $sectionName ===`n`n    "
$insert += $methodsText -replace "`n", "`n    "
$insert += "`n`n"

# Inserer
$newContent = $targetContent.Insert($idx, $insert)

# Ecrire
try {
    [System.IO.File]::WriteAllText($targetFile, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "TERMINE: Methodes inserees avec succes!" -ForegroundColor Green
    Write-Host "Backup disponible: $backupFile" -ForegroundColor Yellow
    exit 0
} catch {
    Write-Host "ERREUR lors de l'ecriture: $_" -ForegroundColor Red
    Write-Host "Restauration du backup..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    exit 1
}
