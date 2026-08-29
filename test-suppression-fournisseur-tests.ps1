# ============================================================================
# Test de Suppression des Tests Fournisseur FF02, FF03, FF04
# E-revision - Programme de Contrôle
# Date: 16 Mai 2026
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "    TEST SUPPRESSION TESTS FOURNISSEUR FF02, FF03, FF04" -ForegroundColor Cyan
Write-Host "    E-revision - Programme de Contrôle" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$fichierCible = "src/components/Clara_Components/DemarrerMenu.tsx"
$testsPassed = 0
$testsFailed = 0

# Fonction pour afficher un résultat de test
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Gray
        }
        $script:testsPassed++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Yellow
        }
        $script:testsFailed++
    }
}

Write-Host "🔍 Vérification du fichier cible..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Vérifier que le fichier existe
if (Test-Path $fichierCible) {
    Test-Result "Fichier DemarrerMenu.tsx existe" $true "Chemin: $fichierCible"
} else {
    Test-Result "Fichier DemarrerMenu.tsx existe" $false "Fichier non trouvé: $fichierCible"
    Write-Host ""
    Write-Host "❌ ERREUR CRITIQUE: Impossible de continuer les tests" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Vérification des suppressions..." -ForegroundColor Yellow
Write-Host ""

# Lire le contenu du fichier
$content = Get-Content $fichierCible -Raw

# Test 2: Vérifier que FF02 Feuilles maîtresses n'existe plus
$ff02Feuilles = $content -match "fournisseurs-ff02[^-]"
Test-Result "FF02 Feuilles maîtresses-FOURNISSEURS supprimé" (-not $ff02Feuilles) `
    $(if (-not $ff02Feuilles) { "Test FF02 Feuilles maîtresses absent" } else { "Test FF02 Feuilles maîtresses encore présent" })

# Test 3: Vérifier que FF02 Travaux analytiques n'existe plus
$ff02Travaux = $content -match "fournisseurs-ff02-travaux"
Test-Result "FF02 Travaux analytiques -Fournisseurs supprimé" (-not $ff02Travaux) `
    $(if (-not $ff02Travaux) { "Test FF02 Travaux analytiques absent" } else { "Test FF02 Travaux analytiques encore présent" })

# Test 4: Vérifier que FF03 n'existe plus
$ff03 = $content -match "fournisseurs-ff03"
Test-Result "FF03 Revue du Contrôle interne supprimé" (-not $ff03) `
    $(if (-not $ff03) { "Test FF03 absent" } else { "Test FF03 encore présent" })

# Test 5: Vérifier que FF04 n'existe plus
$ff04 = $content -match "fournisseurs-ff04"
Test-Result "FF04 Revue des techniques comptables supprimé" (-not $ff04) `
    $(if (-not $ff04) { "Test FF04 absent" } else { "Test FF04 encore présent" })

Write-Host ""
Write-Host "🔍 Vérification de la structure..." -ForegroundColor Yellow
Write-Host ""

# Test 6: Vérifier que la section Fournisseur existe toujours
$sectionFournisseur = $content -match "cycle-fournisseur"
Test-Result "Section Fournisseur existe" $sectionFournisseur `
    $(if ($sectionFournisseur) { "Section cycle-fournisseur présente" } else { "Section cycle-fournisseur absente" })

# Test 7: Vérifier qu'il reste d'autres tests dans Fournisseur
$autresTests = $content -match "fournisseur.*FF465"
Test-Result "Autres tests Fournisseur préservés" $autresTests `
    $(if ($autresTests) { "Test FF465 (Rapprochement) présent" } else { "Aucun autre test trouvé" })

# Test 8: Vérifier qu'il n'y a pas de virgules doubles
$virgulesDoubles = $content -match ",\s*,"
Test-Result "Pas de virgules doubles" (-not $virgulesDoubles) `
    $(if (-not $virgulesDoubles) { "Structure propre" } else { "Virgules doubles détectées" })

# Test 9: Vérifier la structure JSON (basique)
$accoladesOuvrantes = ([regex]::Matches($content, "\{")).Count
$accoladesFermantes = ([regex]::Matches($content, "\}")).Count
$structureValide = $accoladesOuvrantes -eq $accoladesFermantes
Test-Result "Structure JSON équilibrée" $structureValide `
    $(if ($structureValide) { "Accolades: $accoladesOuvrantes ouvrantes, $accoladesFermantes fermantes" } else { "Déséquilibre: $accoladesOuvrantes ouvrantes, $accoladesFermantes fermantes" })

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "                         RÉSULTATS DES TESTS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Tests réussis: $testsPassed" -ForegroundColor Green
Write-Host "Tests échoués: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($testsPassed + $testsFailed)" -ForegroundColor Cyan

Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✅ TOUS LES TESTS SONT PASSÉS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les tests FF02, FF03, FF04 ont été supprimés avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Lancer l'application: npm run dev" -ForegroundColor Gray
    Write-Host "   2. Tester le menu Démarrer E-revision" -ForegroundColor Gray
    Write-Host "   3. Vérifier la section Fournisseur" -ForegroundColor Gray
    Write-Host "   4. Commit les changements" -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez vérifier les erreurs ci-dessus." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor Gray
    Write-Host "   2. Réexécuter le script de suppression si nécessaire" -ForegroundColor Gray
    Write-Host "   3. Consulter la documentation" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
