# Script PowerShell pour tester le calculateur de la Note 8 - Capital
# Date: 25 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 8 - CAPITAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que Python est installe
Write-Host "Verification de Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "OK Python detecte: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Chemin vers le script
$scriptPath = "py_backend/Doc calcul notes annexes/Scripts/calculer_note_8.py"

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERREUR: Le script $scriptPath n existe pas" -ForegroundColor Red
    exit 1
}
Write-Host "OK Script trouve: $scriptPath" -ForegroundColor Green
Write-Host ""

# Executer le script
Write-Host "Execution du calcul de la Note 8..." -ForegroundColor Yellow
Write-Host ""

python $scriptPath "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"

# Verifier le code de sortie
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  OK TEST REUSSI" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Verifier que le fichier HTML a ete cree
    $htmlPath = "py_backend/Doc calcul notes annexes/Tests/test_note_8.html"
    if (Test-Path $htmlPath) {
        Write-Host "OK Fichier HTML cree: $htmlPath" -ForegroundColor Green
        
        # Afficher la taille du fichier
        $fileSize = (Get-Item $htmlPath).Length
        Write-Host "  Taille: $fileSize octets" -ForegroundColor Gray
    } else {
        Write-Host "ATTENTION Fichier HTML non trouve: $htmlPath" -ForegroundColor Yellow
    }
    
    # Verifier que le fichier de trace a ete cree
    $tracePath = "py_backend/Doc calcul notes annexes/Tests/trace_note_8.json"
    if (Test-Path $tracePath) {
        Write-Host "OK Fichier de trace cree: $tracePath" -ForegroundColor Green
        
        # Afficher la taille du fichier
        $fileSize = (Get-Item $tracePath).Length
        Write-Host "  Taille: $fileSize octets" -ForegroundColor Gray
    } else {
        Write-Host "ATTENTION Fichier de trace non trouve: $tracePath" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Pour visualiser le resultat, ouvrez:" -ForegroundColor Cyan
    Write-Host "  $htmlPath" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERREUR TEST ECHOUE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Code de sortie: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host ""
