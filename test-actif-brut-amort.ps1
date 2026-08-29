# Script PowerShell pour tester le calcul ACTIF avec BRUT, AMORT, NET
# Date: 07 Avril 2026

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST - Calcul ACTIF BRUT, AMORT, NET" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier de balance existe
$balanceFile = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
if (-not (Test-Path $balanceFile)) {
    $balanceFile = "P000 -BALANCE DEMO N_N-1_N-2.xls"
    if (-not (Test-Path $balanceFile)) {
        Write-Host "ERREUR: Fichier 'P000 -BALANCE DEMO N_N-1_N-2.xls' non trouvé" -ForegroundColor Red
        Write-Host "Cherché dans: py_backend/ et répertoire courant" -ForegroundColor Yellow
        exit 1
    }
}

# Vérifier que le fichier de correspondances existe
if (-not (Test-Path "py_backend/correspondances_syscohada.json")) {
    Write-Host "ERREUR: Fichier 'py_backend/correspondances_syscohada.json' non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "Fichiers requis trouvés" -ForegroundColor Green
Write-Host ""

# Activer l'environnement conda
Write-Host "Activation de l'environnement conda..." -ForegroundColor Yellow
conda activate claraverse_backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Impossible d'activer l'environnement conda" -ForegroundColor Red
    exit 1
}

Write-Host "Environnement activé" -ForegroundColor Green
Write-Host ""

# Exécuter le script de test
Write-Host "Exécution du test..." -ForegroundColor Yellow
Write-Host ""

python test_actif_brut_amort.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "TEST REUSSI" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le fichier HTML a été généré et ouvert dans votre navigateur" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "TEST ECHOUE" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
