#!/usr/bin/env pwsh
# Script de test pour la suppression des tests Immobilisations DD02, DD04, DD03
# Date: 17 Mai 2026

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST SUPPRESSION IMMOBILISATIONS DD02, DD04, DD03 - E-REVISION" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour verifier si un test existe
function Test-TestExists {
    param(
        [string]$TestId,
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    # Utiliser une regex plus precise pour eviter les faux positifs
    $pattern = "id:\s*[`"']$TestId[`"']"
    return $content -match $pattern
}

# Chemin du fichier
$filePath = "src/components/Clara_Components/DemarrerMenu.tsx"

Write-Host "Fichier teste: $filePath" -ForegroundColor Yellow
Write-Host ""

# Tests a verifier (doivent etre absents)
$testsToCheck = @(
    @{
        Id = "immobilisations-dd02-travaux-analytiques"
        Name = "DD02 - Travaux analytiques -Immo"
    },
    @{
        Id = "immobilisations-dd02"
        Name = "DD02 - Feuilles maitresses-IMMOBILISATIONS"
    },
    @{
        Id = "immobilisations-dd04"
        Name = "DD04 - Revue des techniques comptables"
    },
    @{
        Id = "immobilisations-dd03"
        Name = "DD03 - Revue du Controle interne"
    }
)

Write-Host "Verification de la suppression des tests..." -ForegroundColor Yellow
Write-Host ""

$allTestsPassed = $true

foreach ($test in $testsToCheck) {
    $exists = Test-TestExists -TestId $test.Id -FilePath $filePath
    
    if ($exists) {
        Write-Host "ECHEC: $($test.Name) existe encore (ID: $($test.Id))" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-Host "SUCCES: $($test.Name) a ete supprime (ID: $($test.Id))" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "TOUS LES TESTS SONT PASSES" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les 4 tests Immobilisations ont ete supprimes avec succes:" -ForegroundColor Green
    Write-Host "  - DD02 Travaux analytiques -Immo" -ForegroundColor Green
    Write-Host "  - DD02 Feuilles maitresses-IMMOBILISATIONS" -ForegroundColor Green
    Write-Host "  - DD04 Revue des techniques comptables" -ForegroundColor Green
    Write-Host "  - DD03 Revue du Controle interne" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Tester l'application: npm run dev" -ForegroundColor White
    Write-Host "  2. Verifier visuellement le menu Demarrer" -ForegroundColor White
    Write-Host "  3. Commit les changements" -ForegroundColor White
    exit 0
} else {
    Write-Host "CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Certains tests n'ont pas ete supprimes correctement." -ForegroundColor Red
    Write-Host "Veuillez verifier le fichier DemarrerMenu.tsx" -ForegroundColor Red
    exit 1
}

Write-Host "================================================================================" -ForegroundColor Cyan
