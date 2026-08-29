#!/usr/bin/env pwsh
# Test simple d'integration TFT

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TEST D'INTEGRATION TFT - CORRESPONDANCES SYSCOHADA" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: JSON valide
Write-Host "Test 1: Validation JSON..." -NoNewline
try {
    $json = Get-Content "py_backend/correspondances_syscohada.json" -Raw | ConvertFrom-Json
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " ERREUR" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Test 2: Section TFT presente
Write-Host "Test 2: Section TFT..." -NoNewline
if ($json.PSObject.Properties.Name -contains "tft") {
    $count = $json.tft.Count
    Write-Host " OK ($count rubriques)" -ForegroundColor Green
} else {
    Write-Host " MANQUANTE" -ForegroundColor Red
    exit 1
}

# Test 3: Rubriques essentielles
Write-Host "Test 3: Rubriques essentielles..." -NoNewline
$essentielles = @('ZA', 'FA', 'ZB', 'ZC', 'ZD', 'ZE', 'ZF', 'ZG', 'ZH')
$ok = $true
foreach ($ref in $essentielles) {
    $trouve = $json.tft | Where-Object { $_.ref -eq $ref }
    if (-not $trouve) {
        $ok = $false
        break
    }
}
if ($ok) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MANQUANTES" -ForegroundColor Red
    exit 1
}

# Test 4: Comptes tresorerie
Write-Host "Test 4: Comptes tresorerie..." -NoNewline
$za = $json.tft | Where-Object { $_.ref -eq 'ZA' }
$comptesOk = $true
foreach ($c in @('50', '51', '52', '53', '54', '57', '58', '56')) {
    if ($za.racines -notcontains $c) {
        $comptesOk = $false
        break
    }
}
if ($comptesOk) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " INCOMPLETS" -ForegroundColor Red
    exit 1
}

# Test 5: Validation Python
Write-Host "Test 5: Validation Python..." -NoNewline
if (Test-Path "test-tft-final.py") {
    $output = python test-tft-final.py 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
} else {
    Write-Host " SKIP" -ForegroundColor Yellow
}

# Test 6: Chargement Python
Write-Host "Test 6: Chargement Python..." -NoNewline
if (Test-Path "test-load-tft-correspondances.py") {
    $output = python test-load-tft-correspondances.py 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " ERREUR" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
} else {
    Write-Host " SKIP" -ForegroundColor Yellow
}

# Statistiques
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "STATISTIQUES" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  bilan_actif  : $($json.bilan_actif.Count) rubriques"
Write-Host "  bilan_passif : $($json.bilan_passif.Count) rubriques"
Write-Host "  charges      : $($json.charges.Count) rubriques"
Write-Host "  produits     : $($json.produits.Count) rubriques"
Write-Host "  tft          : $($json.tft.Count) rubriques"
Write-Host "  ------------------------------"
$total = $json.bilan_actif.Count + $json.bilan_passif.Count + $json.charges.Count + $json.produits.Count + $json.tft.Count
Write-Host "  TOTAL        : $total rubriques" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "TOUS LES TESTS REUSSIS" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

exit 0
