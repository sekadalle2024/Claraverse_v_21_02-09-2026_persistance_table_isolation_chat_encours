# Test simple de Lead balance dans E-revision
Write-Host "Test Lead balance dans E-revision" -ForegroundColor Cyan
Write-Host ""

$filePath = "src/components/Clara_Components/DemarrerMenu.tsx"

if (-not (Test-Path $filePath)) {
    Write-Host "Fichier non trouve: $filePath" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier trouve: $filePath" -ForegroundColor Green
$content = Get-Content $filePath -Raw

# Verifications
$checks = @(
    @{ Name = "ID lead-balance"; Pattern = "id: 'lead-balance'" },
    @{ Name = "Label Lead balance"; Pattern = "label: 'Lead balance'" },
    @{ Name = "Commande Activate"; Pattern = "Lead_balance = Activate" }
)

$allPassed = $true
foreach ($check in $checks) {
    if ($content -match [regex]::Escape($check.Pattern)) {
        Write-Host "OK - $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "ERREUR - $($check.Name)" -ForegroundColor Red
        $allPassed = $false
    }
}

# Verifier la position
$leadIndex = $content.IndexOf("id: 'lead-balance'")
$revueIndex = $content.IndexOf("id: 'revue-analytique-generale'")

if ($leadIndex -gt 0 -and $revueIndex -gt 0 -and $leadIndex -lt $revueIndex) {
    Write-Host "OK - Lead balance est avant Revue analytique generale" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Position incorrecte" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
if ($allPassed) {
    Write-Host "SUCCES - Tous les tests passes" -ForegroundColor Green
} else {
    Write-Host "ECHEC - Certains tests ont echoue" -ForegroundColor Red
}

exit $(if ($allPassed) { 0 } else { 1 })
