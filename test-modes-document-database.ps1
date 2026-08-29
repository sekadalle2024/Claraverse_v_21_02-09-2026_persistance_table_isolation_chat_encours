#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de test pour vérifier l'ajout des modes Document et Database à E-audit pro

.DESCRIPTION
    Ce script vérifie que les modes [Mode Document] et [Mode Database] ont été 
    correctement ajoutés à toutes les étapes de mission d'E-audit pro.

.EXAMPLE
    .\test-modes-document-database.ps1
#>

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST DES MODES DOCUMENT ET DATABASE - E-AUDIT PRO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$filepath = "src/components/Clara_Components/DemarrerMenu.tsx"

# Vérifier que le fichier existe
if (-not (Test-Path $filepath)) {
    Write-Host "❌ Erreur : Fichier $filepath non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Fichier trouvé : $filepath" -ForegroundColor Green
Write-Host ""

# Test 1 : Compter les modes Document
Write-Host "Test 1 : Vérification des modes 'Mode Document'" -ForegroundColor Yellow
$documentModes = Select-String -Path $filepath -Pattern "label: 'Mode Document'"
$documentCount = $documentModes.Count
Write-Host "  Nombre de modes 'Mode Document' trouvés : $documentCount" -ForegroundColor White

if ($documentCount -eq 5) {
    Write-Host "  ✓ Test réussi : 5 modes Document trouvés" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu 5, trouvé $documentCount" -ForegroundColor Red
}
Write-Host ""

# Test 2 : Compter les modes Database
Write-Host "Test 2 : Vérification des modes 'Mode Database'" -ForegroundColor Yellow
$databaseModes = Select-String -Path $filepath -Pattern "label: 'Mode Database'"
$databaseCount = $databaseModes.Count
Write-Host "  Nombre de modes 'Mode Database' trouvés : $databaseCount" -ForegroundColor White

if ($databaseCount -eq 5) {
    Write-Host "  ✓ Test réussi : 5 modes Database trouvés" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu 5, trouvé $databaseCount" -ForegroundColor Red
}
Write-Host ""

# Test 3 : Vérifier les variables [Router] = Document
Write-Host "Test 3 : Vérification des variables [Router] = Document" -ForegroundColor Yellow
$routerDocuments = Select-String -Path $filepath -Pattern "\[Router\] = Document"
$routerDocCount = $routerDocuments.Count
Write-Host "  Nombre de variables [Router] = Document trouvées : $routerDocCount" -ForegroundColor White

if ($routerDocCount -eq 5) {
    Write-Host "  ✓ Test réussi : 5 variables [Router] = Document trouvées" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu 5, trouvé $routerDocCount" -ForegroundColor Red
}
Write-Host ""

# Test 4 : Vérifier les variables [Router] = Database
Write-Host "Test 4 : Vérification des variables [Router] = Database" -ForegroundColor Yellow
$routerDatabases = Select-String -Path $filepath -Pattern "\[Router\] = Database"
$routerDbCount = $routerDatabases.Count
Write-Host "  Nombre de variables [Router] = Database trouvées : $routerDbCount" -ForegroundColor White

if ($routerDbCount -ge 5) {
    Write-Host "  ✓ Test réussi : $routerDbCount variables [Router] = Database trouvées" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu au moins 5, trouvé $routerDbCount" -ForegroundColor Red
}
Write-Host ""

# Test 5 : Vérifier les variables [User_id] = ohada
Write-Host "Test 5 : Vérification des variables [User_id] = ohada" -ForegroundColor Yellow
$userIds = Select-String -Path $filepath -Pattern "\[User_id\] = ohada"
$userIdCount = $userIds.Count
Write-Host "  Nombre de variables [User_id] = ohada trouvées : $userIdCount" -ForegroundColor White

if ($userIdCount -ge 5) {
    Write-Host "  ✓ Test réussi : $userIdCount variables [User_id] = ohada trouvées" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu au moins 5, trouvé $userIdCount" -ForegroundColor Red
}
Write-Host ""

# Test 6 : Vérifier les variables [Database] = workspace_02
Write-Host "Test 6 : Vérification des variables [Database] = workspace_02" -ForegroundColor Yellow
$databases = Select-String -Path $filepath -Pattern "\[Database\] = workspace_02"
$databaseVarCount = $databases.Count
Write-Host "  Nombre de variables [Database] = workspace_02 trouvées : $databaseVarCount" -ForegroundColor White

if ($databaseVarCount -ge 5) {
    Write-Host "  ✓ Test réussi : $databaseVarCount variables [Database] = workspace_02 trouvées" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Attendu au moins 5, trouvé $databaseVarCount" -ForegroundColor Red
}
Write-Host ""

# Test 7 : Vérifier que les variables sont avant [Nb de lignes]
Write-Host "Test 7 : Vérification du positionnement des variables" -ForegroundColor Yellow
$content = Get-Content $filepath -Raw

# Vérifier un exemple de Mode Document
if ($content -match '\[Router\] = Document\s*\n\[Nb de lignes\]') {
    Write-Host "  ✓ Test réussi : [Router] = Document est bien positionné avant [Nb de lignes]" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : [Router] = Document n'est pas correctement positionné" -ForegroundColor Red
}

# Vérifier un exemple de Mode Database
if ($content -match '\[Router\] = Database\s*\n\[User_id\] = ohada\s*\n\[Database\] = workspace_02\s*\n\[Nb de lignes\]') {
    Write-Host "  ✓ Test réussi : Variables du Mode Database sont bien positionnées avant [Nb de lignes]" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test échoué : Variables du Mode Database ne sont pas correctement positionnées" -ForegroundColor Red
}
Write-Host ""

# Résumé
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$totalTests = 7
$passedTests = 0

if ($documentCount -eq 5) { $passedTests++ }
if ($databaseCount -eq 5) { $passedTests++ }
if ($routerDocCount -eq 5) { $passedTests++ }
if ($routerDbCount -ge 5) { $passedTests++ }
if ($userIdCount -ge 5) { $passedTests++ }
if ($databaseVarCount -ge 5) { $passedTests++ }
if ($content -match '\[Router\] = Document\s*\n\[Nb de lignes\]' -and 
    $content -match '\[Router\] = Database\s*\n\[User_id\] = ohada\s*\n\[Database\] = workspace_02\s*\n\[Nb de lignes\]') { 
    $passedTests++ 
}

Write-Host "Tests réussis : $passedTests / $totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✓ TOUS LES TESTS SONT RÉUSSIS !" -ForegroundColor Green
    Write-Host "Les modes Document et Database ont été correctement ajoutés à E-audit pro." -ForegroundColor Green
} else {
    Write-Host "⚠ Certains tests ont échoué" -ForegroundColor Yellow
    Write-Host "Veuillez vérifier les résultats ci-dessus." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
