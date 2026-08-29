# Script de Verification Post-Insertion
# Verifie que les methodes ont ete correctement inserees dans menu.js

param(
    [Parameter(Mandatory=$true)]
    [string[]]$MethodNames
)

$targetFile = "public/menu.js"

Write-Host "Verification de l'integration..." -ForegroundColor Cyan

# Verifier que le fichier existe
if (-not (Test-Path $targetFile)) {
    Write-Host "ERREUR: Fichier non trouve: $targetFile" -ForegroundColor Red
    exit 1
}

# Lire le contenu
$content = Get-Content $targetFile -Raw -Encoding UTF8

# Verifier chaque methode
$allFound = $true
$foundCount = 0

foreach ($method in $MethodNames) {
    $pattern = [regex]::Escape($method)
    
    if ($content -match $pattern) {
        Write-Host "  OK: $method trouve" -ForegroundColor Green
        $foundCount++
    } else {
        Write-Host "  ERREUR: $method NON TROUVE" -ForegroundColor Red
        $allFound = $false
    }
}

# Resultat final
Write-Host ""
if ($allFound) {
    Write-Host "VERIFICATION REUSSIE: $foundCount/$($MethodNames.Count) methodes trouvees" -ForegroundColor Green
    exit 0
} else {
    Write-Host "VERIFICATION ECHOUEE: $foundCount/$($MethodNames.Count) methodes trouvees" -ForegroundColor Red
    exit 1
}
