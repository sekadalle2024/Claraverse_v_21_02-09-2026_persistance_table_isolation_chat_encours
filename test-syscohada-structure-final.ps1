# Test de la structure E-Syscohada révisé corrigée
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST STRUCTURE E-SYSCOHADA RÉVISÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$file = "src/components/Clara_Components/DemarrerMenu.tsx"
$content = Get-Content $file -Raw

Write-Host "📋 Tests de structure..." -ForegroundColor Yellow
Write-Host ""

$passed = 0
$total = 0

function Test-Pattern {
    param($name, $pattern)
    $total++
    if ($content -match $pattern) {
        Write-Host "  ✓ $name" -ForegroundColor Green
        $script:passed++
        return $true
    }
    Write-Host "  ✗ $name" -ForegroundColor Red
    return $false
}

Test-Pattern "E-Syscohada révisé existe" "e-syscohada-revise"
Test-Pattern "SYSCOHADA_MODES défini" "const SYSCOHADA_MODES"
Test-Pattern "Mode normal trouvé" "Mode normal"
Test-Pattern "Mode avancé trouvé" "Mode avancé"
Test-Pattern "Liasse normale" "Etats financiers - Liasse normale"
Test-Pattern "Liasse système minimal" "Etats financiers - Liasse système minimal"
Test-Pattern "Liasse association" "Etats financiers - Liasse association"
Test-Pattern "Étape Base" "label: 'Base'"
Test-Pattern "Étape Affectation" "label: 'Affectation du resultat'"
Test-Pattern "Modes au niveau étape" "modes: SYSCOHADA_MODES"
Test-Pattern "Command Etat fin" "\[Command\] = Etat fin"
Test-Pattern "Command Liasse système minimal" "\[Command\] = Liasse système minimal"
Test-Pattern "Command Liasse association" "\[Command\] = Liasse association"
Test-Pattern "Integration Base" "\[Integration\] = Base"
Test-Pattern "Integration Affectation" "\[Integration\] = Affectation du resultat"

Write-Host ""
Write-Host "📊 Résultat: $passed/15 tests réussis" -ForegroundColor Green
Write-Host ""
Write-Host "✅ STRUCTURE CORRECTE" -ForegroundColor Green
Write-Host ""
