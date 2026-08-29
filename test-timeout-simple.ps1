# Test Timeout ClaraAPI - Version Simple
# Date: 15 avril 2026

Write-Host "Test Timeout ClaraAPI" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Verification du fichier
Write-Host "1. Verification du fichier..." -ForegroundColor Yellow
$filePath = "src/services/claraApiService.ts"

if (Test-Path $filePath) {
    Write-Host "   OK: Fichier trouve" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Fichier non trouve" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verification du timeout
Write-Host "2. Verification du timeout..." -ForegroundColor Yellow

$content = Get-Content $filePath -Raw

if ($content -match 'private n8nTimeout = 3 \* 60 \* 1000') {
    Write-Host "   OK: Timeout configure a 3 minutes" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Timeout non configure correctement" -ForegroundColor Red
}

Write-Host ""

# Verification du message de notification
Write-Host "3. Verification du message de notification..." -ForegroundColor Yellow

$checks = @(
    "Notification système",
    "Nous sommes en surcharge de requêtes",
    "+225 05 44 13 07 98",
    "Informations techniques"
)

$allOk = $true
foreach ($check in $checks) {
    if ($content -match [regex]::Escape($check)) {
        Write-Host "   OK: $check" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: $check manquant" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
Write-Host "=====================" -ForegroundColor Cyan

if ($allOk) {
    Write-Host "SUCCES: Tous les tests sont passes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. npm run dev" -ForegroundColor White
    Write-Host "  2. Ouvrir console (F12)" -ForegroundColor White
    Write-Host "  3. Taper: claraApiService.getN8nTimeout()" -ForegroundColor White
    Write-Host "  4. Resultat attendu: 180000" -ForegroundColor White
} else {
    Write-Host "ERREUR: Certains tests ont echoue" -ForegroundColor Red
}

Write-Host ""
