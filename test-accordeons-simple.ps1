# Test simple - Accordeons Cliquables
# Date: 05 Avril 2026

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST - ACCORDEONS CLIQUABLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test 1: Fichier JavaScript
Write-Host "Test 1: Fichier JavaScript" -ForegroundColor Yellow
$jsFile = "public/EtatsControleAccordeonHandler.js"
if (Test-Path $jsFile) {
    Write-Host "  OK - Fichier existe" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ECHEC - Fichier manquant" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Fonction globale
Write-Host "Test 2: Fonction globale" -ForegroundColor Yellow
if (Test-Path $jsFile) {
    $content = Get-Content $jsFile -Raw
    if ($content -match "window\.toggleSection\s*=\s*toggleSection") {
        Write-Host "  OK - window.toggleSection exposee" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ECHEC - Fonction non exposee" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 3: Script dans index.html
Write-Host "Test 3: Script dans index.html" -ForegroundColor Yellow
$indexFile = "index.html"
if (Test-Path $indexFile) {
    $content = Get-Content $indexFile -Raw
    if ($content -match "EtatsControleAccordeonHandler\.js") {
        Write-Host "  OK - Script charge dans index.html" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  ECHEC - Script non charge" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 4: Module Python
Write-Host "Test 4: Module Python backend" -ForegroundColor Yellow
$pyFile = "py_backend/etats_controle_exhaustifs_html.py"
if (Test-Path $pyFile) {
    Write-Host "  OK - Module Python existe" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ECHEC - Module manquant" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Documentation
Write-Host "Test 5: Documentation" -ForegroundColor Yellow
$docFile = "00_CORRECTION_ACCORDEONS_CLIQUABLES_05_AVRIL_2026.txt"
if (Test-Path $docFile) {
    Write-Host "  OK - Documentation existe" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ECHEC - Documentation manquante" -ForegroundColor Red
    $testsFailed++
}

# Resultat
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests reussis: $testsPassed" -ForegroundColor Green
Write-Host "Tests echoues: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "TOUS LES TESTS PASSENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "1. Demarrer l'application: npm run dev" -ForegroundColor White
    Write-Host "2. Tester manuellement les accordeons" -ForegroundColor White
    Write-Host "3. Voir: QUICK_TEST_ACCORDEONS_CLIQUABLES.txt" -ForegroundColor White
} else {
    Write-Host "CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host "Verifier les fichiers manquants" -ForegroundColor Yellow
}

Write-Host ""
