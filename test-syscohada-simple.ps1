#!/usr/bin/env pwsh
# Test simple de la structure E-Syscohada révisé

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST STRUCTURE E-SYSCOHADA REVISE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$file = "src/components/Clara_Components/DemarrerMenu.tsx"

if (-not (Test-Path $file)) {
    Write-Host "ERREUR: Fichier non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture du fichier..." -ForegroundColor Cyan
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host ""
Write-Host "VERIFICATION DE LA STRUCTURE" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$passed = 0
$failed = 0

# Test 1: Logiciel existe
if ($content -match "e-syscohada-revise") {
    Write-Host "[OK] Logiciel E-Syscohada revise existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Logiciel E-Syscohada revise manquant" -ForegroundColor Red
    $failed++
}

# Test 2: Section Liasses fiscales
if ($content -match "liasses-fiscales") {
    Write-Host "[OK] Section Liasses fiscales existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Section Liasses fiscales manquante" -ForegroundColor Red
    $failed++
}

# Test 3: Étape Liasse normale
if ($content -match "etats-financiers-liasse-normale") {
    Write-Host "[OK] Etape Liasse normale existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Etape Liasse normale manquante" -ForegroundColor Red
    $failed++
}

# Test 4: Étape Liasse système minimal
if ($content -match "etats-financiers-liasse-systeme-minimal") {
    Write-Host "[OK] Etape Liasse systeme minimal existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Etape Liasse systeme minimal manquante" -ForegroundColor Red
    $failed++
}

# Test 5: Étape Liasse association
if ($content -match "etats-financiers-liasse-association") {
    Write-Host "[OK] Etape Liasse association existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Etape Liasse association manquante" -ForegroundColor Red
    $failed++
}

# Test 6: Commande Etat fin
if ($content -match "Command.*=.*Etat fin") {
    Write-Host "[OK] Commande 'Etat fin' existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Commande 'Etat fin' manquante" -ForegroundColor Red
    $failed++
}

# Test 7: Commande Liasse système minimal
if ($content -match "Command.*=.*Liasse système minimal") {
    Write-Host "[OK] Commande 'Liasse systeme minimal' existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Commande 'Liasse systeme minimal' manquante" -ForegroundColor Red
    $failed++
}

# Test 8: Commande Liasse association
if ($content -match "Command.*=.*Liasse association") {
    Write-Host "[OK] Commande 'Liasse association' existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Commande 'Liasse association' manquante" -ForegroundColor Red
    $failed++
}

# Test 9: Integration Base
if ($content -match "Integration.*=.*Base") {
    Write-Host "[OK] Integration 'Base' existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Integration 'Base' manquante" -ForegroundColor Red
    $failed++
}

# Test 10: Integration Affectation du resultat
if ($content -match "Integration.*=.*Affectation du resultat") {
    Write-Host "[OK] Integration 'Affectation du resultat' existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "[ERREUR] Integration 'Affectation du resultat' manquante" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUME" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests reussis: $passed" -ForegroundColor Green
Write-Host "Tests echoues: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "SUCCES: Tous les tests sont passes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Structure validee:" -ForegroundColor Cyan
    Write-Host "  E-Syscohada revise" -ForegroundColor White
    Write-Host "    -> Liasses fiscales" -ForegroundColor White
    Write-Host "       -> Liasse normale (2 modes)" -ForegroundColor Gray
    Write-Host "       -> Liasse systeme minimal (2 modes)" -ForegroundColor Gray
    Write-Host "       -> Liasse association (2 modes)" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "ERREUR: Certains tests ont echoue" -ForegroundColor Red
    exit 1
}
