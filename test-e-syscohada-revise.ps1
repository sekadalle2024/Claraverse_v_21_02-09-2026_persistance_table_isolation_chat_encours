# Script de test pour verifier l'ajout de E-Syscohada revise
# Date: 10 Avril 2026

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  TEST - E-SYSCOHADA REVISE" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$file = "src/components/Clara_Components/DemarrerMenu.tsx"

Write-Host "Verification du fichier DemarrerMenu.tsx..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Verifier que SYSCOHADA_MODES existe
Write-Host "Test 1: Verification de SYSCOHADA_MODES..." -ForegroundColor White
$syscohadaModes = Select-String -Path $file -Pattern "const SYSCOHADA_MODES" -Quiet
if ($syscohadaModes) {
    Write-Host "  OK SYSCOHADA_MODES trouve" -ForegroundColor Green
} else {
    Write-Host "  ERREUR SYSCOHADA_MODES non trouve" -ForegroundColor Red
}

# Test 2: Verifier que les 2 modes existent
Write-Host "Test 2: Verification des modes..." -ForegroundColor White
$modeNormal = Select-String -Path $file -Pattern "id: 'normal', label: 'Mode normal'" -Quiet
$modeAvance = Select-String -Path $file -Pattern "id: 'avance', label: 'Mode avanc" -Quiet
if ($modeNormal -and $modeAvance) {
    Write-Host "  OK Mode normal et Mode avance trouves" -ForegroundColor Green
} else {
    Write-Host "  ERREUR Modes manquants" -ForegroundColor Red
}

# Test 3: Verifier que E-Syscohada revise existe
Write-Host "Test 3: Verification de E-Syscohada revise..." -ForegroundColor White
$syscohada = Select-String -Path $file -Pattern "id: 'e-syscohada-revise'" -Quiet
if ($syscohada) {
    Write-Host "  OK E-Syscohada revise trouve" -ForegroundColor Green
} else {
    Write-Host "  ERREUR E-Syscohada revise non trouve" -ForegroundColor Red
}

# Test 4: Verifier les 3 phases
Write-Host "Test 4: Verification des phases..." -ForegroundColor White
$liasseNormale = Select-String -Path $file -Pattern "etats-financiers-liasse-normale" -Quiet
$liasseMinimal = Select-String -Path $file -Pattern "etats-financiers-liasse-systeme-minimal" -Quiet
$liasseAssociation = Select-String -Path $file -Pattern "etats-financiers-liasse-association" -Quiet
if ($liasseNormale -and $liasseMinimal -and $liasseAssociation) {
    Write-Host "  OK Les 3 phases trouvees" -ForegroundColor Green
    Write-Host "     - Liasse normale" -ForegroundColor Gray
    Write-Host "     - Liasse systeme minimal" -ForegroundColor Gray
    Write-Host "     - Liasse association" -ForegroundColor Gray
} else {
    Write-Host "  ERREUR Phases manquantes" -ForegroundColor Red
}

# Test 5: Verifier les commandes
Write-Host "Test 5: Verification des commandes..." -ForegroundColor White
$cmdEtatFin = Select-String -Path $file -Pattern "\[Command\] = Etat fin" -Quiet
$cmdLiasseMinimal = Select-String -Path $file -Pattern "\[Command\] = Liasse syst" -Quiet
$cmdLiasseAssociation = Select-String -Path $file -Pattern "\[Command\] = Liasse association" -Quiet
if ($cmdEtatFin -and $cmdLiasseMinimal -and $cmdLiasseAssociation) {
    Write-Host "  OK Toutes les commandes trouvees" -ForegroundColor Green
    Write-Host "     - [Command] = Etat fin" -ForegroundColor Gray
    Write-Host "     - [Command] = Liasse systeme minimal" -ForegroundColor Gray
    Write-Host "     - [Command] = Liasse association" -ForegroundColor Gray
} else {
    Write-Host "  ERREUR Commandes manquantes" -ForegroundColor Red
}

# Test 6: Verifier les integrations
Write-Host "Test 6: Verification des integrations..." -ForegroundColor White
$integBase = Select-String -Path $file -Pattern "\[Integration\] = Base" -Quiet
$integAffectation = Select-String -Path $file -Pattern "\[Integration\] = Affectation du resultat" -Quiet
if ($integBase -and $integAffectation) {
    Write-Host "  OK Les 2 types d'integration trouves" -ForegroundColor Green
    Write-Host "     - Base" -ForegroundColor Gray
    Write-Host "     - Affectation du resultat" -ForegroundColor Gray
} else {
    Write-Host "  ERREUR Integrations manquantes" -ForegroundColor Red
}

# Test 7: Compter les occurrences
Write-Host "Test 7: Statistiques..." -ForegroundColor White
$countBase = (Select-String -Path $file -Pattern "id: 'base'" -AllMatches).Matches.Count
$countAffectation = (Select-String -Path $file -Pattern "id: 'affectation-resultat'" -AllMatches).Matches.Count
Write-Host "  Etapes 'Base' trouvees: $countBase" -ForegroundColor Cyan
Write-Host "  Etapes 'Affectation du resultat' trouvees: $countAffectation" -ForegroundColor Cyan

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  RESUME DES TESTS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$allTests = $syscohadaModes -and $modeNormal -and $modeAvance -and $syscohada -and 
            $liasseNormale -and $liasseMinimal -and $liasseAssociation -and 
            $cmdEtatFin -and $cmdLiasseMinimal -and $cmdLiasseAssociation -and 
            $integBase -and $integAffectation

if ($allTests) {
    Write-Host "TOUS LES TESTS REUSSIS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "E-Syscohada revise a ete ajoute avec succes." -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Compiler le projet: npm run build" -ForegroundColor White
    Write-Host "  2. Tester l'interface utilisateur" -ForegroundColor White
    Write-Host "  3. Verifier que les commandes fonctionnent" -ForegroundColor White
} else {
    Write-Host "CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifiez les erreurs ci-dessus et relancez le script d'ajout." -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
