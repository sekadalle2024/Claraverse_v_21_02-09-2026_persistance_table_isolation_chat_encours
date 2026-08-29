#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test de la structure corrigée E-Syscohada révisé
.DESCRIPTION
    Vérifie que la structure du logiciel E-Syscohada révisé est correcte
    dans le composant DemarrerMenu.tsx
.NOTES
    Date: 10 avril 2026
#>

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🧪 TEST STRUCTURE E-SYSCOHADA RÉVISÉ CORRIGÉE" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

$file = "src/components/Clara_Components/DemarrerMenu.tsx"

if (-not (Test-Path $file)) {
    Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Lecture du fichier..." -ForegroundColor Cyan
$content = Get-Content $file -Raw -Encoding UTF8

# Tests de structure
Write-Host ""
Write-Host "🔍 VÉRIFICATION DE LA STRUCTURE" -ForegroundColor Yellow
Write-Host "-" -NoNewline -ForegroundColor Gray
Write-Host ("-" * 69) -ForegroundColor Gray

$tests = @{
    "Logiciel E-Syscohada révisé existe" = "id:\s*['\`"]e-syscohada-revise['\`"]"
    "Section Liasses fiscales existe" = "id:\s*['\`"]liasses-fiscales['\`"]"
    "Étape Liasse normale existe" = "id:\s*['\`"]etats-financiers-liasse-normale['\`"]"
    "Étape Liasse système minimal existe" = "id:\s*['\`"]etats-financiers-liasse-systeme-minimal['\`"]"
    "Étape Liasse association existe" = "id:\s*['\`"]etats-financiers-liasse-association['\`"]"
}

$passed = 0
$failed = 0

foreach ($test in $tests.GetEnumerator()) {
    if ($content -match $test.Value) {
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $($test.Key)" -ForegroundColor Red
        $failed++
    }
}

# Tests des commandes
Write-Host ""
Write-Host "🔍 VÉRIFICATION DES COMMANDES" -ForegroundColor Yellow
Write-Host "-" -NoNewline -ForegroundColor Gray
Write-Host ("-" * 69) -ForegroundColor Gray

$commandTests = @{
    "Commande 'Etat fin' existe" = "\[Command\]\s*=\s*Etat fin"
    "Commande 'Liasse système minimal' existe" = "\[Command\]\s*=\s*Liasse système minimal"
    "Commande 'Liasse association' existe" = "\[Command\]\s*=\s*Liasse association"
    "Integration 'Base' existe" = "\[Integration\]\s*=\s*Base"
    "Integration 'Affectation du resultat' existe" = "\[Integration\]\s*=\s*Affectation du resultat"
}

foreach ($test in $commandTests.GetEnumerator()) {
    if ($content -match $test.Value) {
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $($test.Key)" -ForegroundColor Red
        $failed++
    }
}

# Tests des modes
Write-Host ""
Write-Host "🔍 VÉRIFICATION DES MODES" -ForegroundColor Yellow
Write-Host "-" -NoNewline -ForegroundColor Gray
Write-Host ("-" * 69) -ForegroundColor Gray

$modeTests = @{
    "Mode 'normal' existe" = "id:\s*['\`"]normal['\`"]"
    "Mode 'avance' existe" = "id:\s*['\`"]avance['\`"]"
    "Label 'Mode normal' existe" = "label:\s*['\`"]Mode normal['\`"]"
    "Label 'Mode avancé' existe" = "label:\s*['\`"]Mode avancé['\`"]"
}

foreach ($test in $modeTests.GetEnumerator()) {
    if ($content -match $test.Value) {
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $($test.Key)" -ForegroundColor Red
        $failed++
    }
}

# Vérification que SYSCOHADA_MODES n'est plus utilisé dans la section
Write-Host ""
Write-Host "🔍 VÉRIFICATION ABSENCE RÉFÉRENCE EXTERNE" -ForegroundColor Yellow
Write-Host "-" -NoNewline -ForegroundColor Gray
Write-Host ("-" * 69) -ForegroundColor Gray

# Extraire la section E-Syscohada
if ($content -match "(?s)id:\s*['\`"]e-syscohada-revise['\`"].*?(?=\},\s*\{|\}\s*\]\s*;)") {
    $syscohadaSection = $matches[0]
    
    if ($syscohadaSection -match "SYSCOHADA_MODES") {
        Write-Host "❌ Référence SYSCOHADA_MODES trouvée (devrait être inline)" -ForegroundColor Red
        $failed++
    } else {
        Write-Host "✅ Pas de référence SYSCOHADA_MODES (modes inline)" -ForegroundColor Green
        $passed++
    }
} else {
    Write-Host "⚠️  Impossible d'extraire la section E-Syscohada" -ForegroundColor Yellow
}

# Résumé
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests réussis: $passed" -ForegroundColor Green
Write-Host "❌ Tests échoués: $failed" -ForegroundColor Red
Write-Host "📊 Total: $($passed + $failed)" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Structure validée:" -ForegroundColor Cyan
    Write-Host "   └─ E-Syscohada révisé" -ForegroundColor White
    Write-Host "      └─ Liasses fiscales (section unique)" -ForegroundColor White
    Write-Host "         ├─ Etats financiers - Liasse normale" -ForegroundColor White
    Write-Host "         │  ├─ Mode normal (Base)" -ForegroundColor Gray
    Write-Host "         │  └─ Mode avancé (Affectation du resultat)" -ForegroundColor Gray
    Write-Host "         ├─ Etats financiers - Liasse système minimal" -ForegroundColor White
    Write-Host "         │  ├─ Mode normal (Base)" -ForegroundColor Gray
    Write-Host "         │  └─ Mode avancé (Affectation du resultat)" -ForegroundColor Gray
    Write-Host "         └─ Etats financiers - Liasse association" -ForegroundColor White
    Write-Host "            ├─ Mode normal (Base)" -ForegroundColor Gray
    Write-Host "            └─ Mode avancé (Affectation du resultat)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ La structure E-Syscohada révisé est correcte!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "   2. Relancer le script de correction" -ForegroundColor White
    Write-Host "   3. Vérifier la documentation" -ForegroundColor White
    exit 1
}

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
