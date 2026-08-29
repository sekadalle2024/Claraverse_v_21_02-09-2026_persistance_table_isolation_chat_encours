# Script pour corriger l'emplacement des methodes dans menu.js
Write-Host "Correction de l'emplacement des methodes..." -ForegroundColor Cyan

$menuFile = "public/menu.js"
$content = Get-Content $menuFile -Raw -Encoding UTF8

# Trouver la position de la fin de l'IIFE
$endIIFE = $content.LastIndexOf("});")
if ($endIIFE -gt 0) {
    # Garder seulement jusqu'a la fin de l'IIFE
    $content = $content.Substring(0, $endIIFE + 3)
    
    # Sauvegarder
    $content | Set-Content $menuFile -Encoding UTF8 -NoNewline
    
    Write-Host "Methodes mal placees supprimees" -ForegroundColor Green
} else {
    Write-Host "Impossible de trouver la fin de l'IIFE" -ForegroundColor Red
}
