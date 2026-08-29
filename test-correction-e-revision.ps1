# Script de test pour verifier les corrections E-revision
# Date : 15 Avril 2026

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DES CORRECTIONS E-REVISION - DemarrerMenu.tsx" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$fichier = "src/components/Clara_Components/DemarrerMenu.tsx"
$erreurs = 0
$succes = 0

Write-Host "Fichier teste : $fichier" -ForegroundColor Yellow
Write-Host ""

# Test 1 : Verifier que Mode cours n'existe plus
Write-Host "Test 1 : Verification absence de 'Mode cours'..." -ForegroundColor Yellow
$modeCours = Select-String -Path $fichier -Pattern "Mode cours" -Quiet
if ($modeCours) {
    Write-Host "   ECHEC : 'Mode cours' trouve dans le fichier" -ForegroundColor Red
    $erreurs++
} else {
    Write-Host "   SUCCES : 'Mode cours' n'existe plus" -ForegroundColor Green
    $succes++
}
Write-Host ""

# Test 2 : Verifier que Mode normal existe
Write-Host "Test 2 : Verification presence de 'Mode normal'..." -ForegroundColor Yellow
$modeNormal = Select-String -Path $fichier -Pattern "label: 'Mode normal'" -Quiet
if ($modeNormal) {
    Write-Host "   SUCCES : 'Mode normal' trouve dans le fichier" -ForegroundColor Green
    $succes++
} else {
    Write-Host "   ECHEC : 'Mode normal' non trouve" -ForegroundColor Red
    $erreurs++
}
Write-Host ""

# Test 3 : Verifier que [Guide Methodo] n'existe plus
Write-Host "Test 3 : Verification absence de '[Guide Methodo]'..." -ForegroundColor Yellow
$guideMethodo = Select-String -Path $fichier -Pattern "\[Guide Methodo\]" -Quiet
if ($guideMethodo) {
    Write-Host "   ECHEC : '[Guide Methodo]' trouve dans le fichier" -ForegroundColor Red
    $erreurs++
} else {
    Write-Host "   SUCCES : '[Guide Methodo]' n'existe plus" -ForegroundColor Green
    $succes++
}
Write-Host ""

# Test 4 : Verifier que - [Methodo audit] : Activate existe
Write-Host "Test 4 : Verification presence de '- [Methodo audit] : Activate'..." -ForegroundColor Yellow
$methodoAudit = Select-String -Path $fichier -Pattern "- \[Methodo audit\] : Activate" -Quiet
if ($methodoAudit) {
    Write-Host "   SUCCES : '- [Methodo audit] : Activate' trouve" -ForegroundColor Green
    $succes++
} else {
    Write-Host "   ECHEC : '- [Methodo audit] : Activate' non trouve" -ForegroundColor Red
    $erreurs++
}
Write-Host ""

# Test 5 : Verifier la structure de la constante MODES
Write-Host "Test 5 : Verification structure de MODES..." -ForegroundColor Yellow
$modesStructure = Select-String -Path $fichier -Pattern "const MODES: ModeItem\[\] = \[" -Quiet
if ($modesStructure) {
    Write-Host "   SUCCES : Structure MODES correcte" -ForegroundColor Green
    $succes++
} else {
    Write-Host "   ECHEC : Structure MODES incorrecte" -ForegroundColor Red
    $erreurs++
}
Write-Host ""

# Resume des tests
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "RESUME DES TESTS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests reussis : $succes" -ForegroundColor Green
Write-Host "Tests echoues : $erreurs" -ForegroundColor Red
Write-Host ""

if ($erreurs -eq 0) {
    Write-Host "TOUS LES TESTS SONT PASSES AVEC SUCCES !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes recommandees :" -ForegroundColor Yellow
    Write-Host "   1. npm run build     - Compiler le projet" -ForegroundColor White
    Write-Host "   2. npm run dev       - Tester l'interface" -ForegroundColor White
    Write-Host "   3. Tester le menu Demarrer dans l'application" -ForegroundColor White
    Write-Host "   4. Verifier la generation des commandes" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions recommandees :" -ForegroundColor Yellow
    Write-Host "   1. Verifier le fichier manuellement" -ForegroundColor White
    Write-Host "   2. Consulter la documentation" -ForegroundColor White
    Write-Host "   3. Executer le script de correction si necessaire" -ForegroundColor White
    Write-Host ""
    exit 1
}
