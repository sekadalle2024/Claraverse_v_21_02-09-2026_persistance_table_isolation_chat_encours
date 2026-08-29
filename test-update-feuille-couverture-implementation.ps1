# Script PowerShell: test-update-feuille-couverture-implementation.ps1
# Date: 11 Mai 2026
# Objectif: Executer le script de mise a jour pour Feuille de couverture Implementation

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "MISE A JOUR - Feuille de couverture Implementation (E-revision)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que Python est installe
Write-Host "Verification de Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Python detecte: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Python depuis: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Chemin du script Python
$scriptPath = "Doc menu demarrer/Scripts/update_feuille_couverture_implementation_e_revision.py"

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERREUR: Script non trouve: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Script: $scriptPath" -ForegroundColor Cyan
Write-Host ""

# Executer le script
Write-Host "Execution du script de mise a jour..." -ForegroundColor Yellow
Write-Host ""

python $scriptPath

Write-Host ""

# Verifier le resultat
if ($LASTEXITCODE -eq 0) {
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "SUCCES - Mise a jour terminee" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "   1. Relancer l'application: npm run dev" -ForegroundColor White
    Write-Host "   2. Ouvrir le menu Demarrer" -ForegroundColor White
    Write-Host "   3. Naviguer vers: E-revision > PLANIFICATION > Feuille de couverture Implementation" -ForegroundColor White
    Write-Host "   4. Tester les modes Normal et Demo" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host "   Doc menu demarrer/Documentation/UPDATE_FEUILLE_COUVERTURE_IMPLEMENTATION_E_REVISION_11_MAI_2026.md" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host "ERREUR - La mise a jour a echoue" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez verifier les messages d'erreur ci-dessus." -ForegroundColor Yellow
    Write-Host ""
}
