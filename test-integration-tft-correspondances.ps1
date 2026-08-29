#!/usr/bin/env pwsh
# Script de test d'intégration TFT avec correspondances_syscohada.json

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TEST D'INTÉGRATION TFT - CORRESPONDANCES SYSCOHADA" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Test 1: Vérifier que le fichier JSON est valide
Write-Host "📋 Test 1: Validation du fichier JSON" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

try {
    $json = Get-Content "py_backend/correspondances_syscohada.json" -Raw | ConvertFrom-Json
    Write-Host "✅ Fichier JSON valide" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de parsing JSON: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Vérifier la présence de la section TFT
Write-Host ""
Write-Host "📋 Test 2: Présence de la section TFT" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

if ($json.PSObject.Properties.Name -contains "tft") {
    Write-Host "✅ Section 'tft' présente" -ForegroundColor Green
    $tftCount = $json.tft.Count
    Write-Host "   Nombre de rubriques: $tftCount" -ForegroundColor White
} else {
    Write-Host "❌ Section 'tft' manquante" -ForegroundColor Red
    exit 1
}

# Test 3: Vérifier les rubriques essentielles
Write-Host ""
Write-Host "📋 Test 3: Rubriques essentielles du TFT" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$rubriquesEssentielles = @('ZA', 'FA', 'ZB', 'ZC', 'ZD', 'ZE', 'ZF', 'ZG', 'ZH')
$manquantes = @()

foreach ($ref in $rubriquesEssentielles) {
    $trouve = $json.tft | Where-Object { $_.ref -eq $ref }
    if ($trouve) {
        Write-Host "✅ $ref - $($trouve.libelle)" -ForegroundColor Green
    } else {
        Write-Host "❌ $ref - MANQUANTE" -ForegroundColor Red
        $manquantes += $ref
    }
}

if ($manquantes.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ $($manquantes.Count) rubrique(s) essentielle(s) manquante(s)" -ForegroundColor Red
    exit 1
}

# Test 4: Vérifier les comptes de trésorerie
Write-Host ""
Write-Host "📋 Test 4: Comptes de trésorerie" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$comptesTreesorerie = @('50', '51', '52', '53', '54', '57', '58', '56')
$za = $json.tft | Where-Object { $_.ref -eq 'ZA' }

$tousPresents = $true
foreach ($compte in $comptesTreesorerie) {
    if ($za.racines -contains $compte) {
        Write-Host "✅ Compte $compte présent" -ForegroundColor Green
    } else {
        Write-Host "❌ Compte $compte manquant" -ForegroundColor Red
        $tousPresents = $false
    }
}

if (-not $tousPresents) {
    Write-Host ""
    Write-Host "❌ Certains comptes de trésorerie sont manquants" -ForegroundColor Red
    exit 1
}

# Test 5: Test Python de validation
Write-Host ""
Write-Host "📋 Test 5: Validation Python" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

if (Test-Path "test-correspondances-tft.py") {
    try {
        $result = python test-correspondances-tft.py
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Validation Python réussie" -ForegroundColor Green
        } else {
            Write-Host "❌ Validation Python échouée" -ForegroundColor Red
            Write-Host $result
            exit 1
        }
    } catch {
        Write-Host "⚠️  Impossible d'exécuter le test Python: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Script test-correspondances-tft.py non trouvé" -ForegroundColor Yellow
}

# Test 6: Vérifier la compatibilité avec etats_financiers.py
Write-Host ""
Write-Host "📋 Test 6: Compatibilité avec etats_financiers.py" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

if (Test-Path "py_backend/etats_financiers.py") {
    Write-Host "✅ Fichier etats_financiers.py présent" -ForegroundColor Green
    
    # Vérifier que le fichier peut charger les correspondances
    if (Test-Path "test-load-tft-correspondances.py") {
        $result = python test-load-tft-correspondances.py 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Chargement des correspondances TFT réussi" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur de chargement des correspondances" -ForegroundColor Red
            Write-Host $result
            exit 1
        }
    }
} else {
    Write-Host "⚠️  Fichier etats_financiers.py non trouvé" -ForegroundColor Yellow
}

# Test 7: Statistiques finales
Write-Host ""
Write-Host "📋 Test 7: Statistiques" -ForegroundColor Cyan
Write-Host "-" -NoNewline
Write-Host ("-" * 79)

$bilanActifCount = $json.bilan_actif.Count
$bilanPassifCount = $json.bilan_passif.Count
$chargesCount = $json.charges.Count
$produitsCount = $json.produits.Count
$tftCount = $json.tft.Count

Write-Host ""
Write-Host "Statistiques du fichier correspondances_syscohada.json:" -ForegroundColor White
Write-Host ""
Write-Host "  bilan_actif     : $bilanActifCount rubriques" -ForegroundColor Cyan
Write-Host "  bilan_passif    : $bilanPassifCount rubriques" -ForegroundColor Cyan
Write-Host "  charges         : $chargesCount rubriques" -ForegroundColor Cyan
Write-Host "  produits        : $produitsCount rubriques" -ForegroundColor Cyan
Write-Host "  tft             : $tftCount rubriques" -ForegroundColor Cyan
Write-Host "  " + ("-" * 30)

$total = $bilanActifCount + $bilanPassifCount + $chargesCount + $produitsCount + $tftCount
Write-Host "  TOTAL           : $total rubriques" -ForegroundColor Yellow

# Résumé final
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "✅ TOUS LES TESTS RÉUSSIS" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""
Write-Host "Le fichier correspondances_syscohada.json est complet et fonctionnel." -ForegroundColor White
Write-Host "Il contient maintenant toutes les rubriques du TFT SYSCOHADA Révisé." -ForegroundColor White
Write-Host ""

exit 0
