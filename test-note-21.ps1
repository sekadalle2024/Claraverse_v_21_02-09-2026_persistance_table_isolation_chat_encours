#!/usr/bin/env pwsh
# Script de test pour la Note 21 - Achats de Marchandises

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTE 21 - ACHATS DE MARCHANDISES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Naviguer vers le dossier des scripts
$scriptDir = "py_backend/Doc calcul notes annexes/Scripts"
if (-not (Test-Path $scriptDir)) {
    Write-Host "✗ Dossier des scripts non trouvé: $scriptDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Navigation vers: $scriptDir" -ForegroundColor Yellow
Push-Location $scriptDir

try {
    # Vérifier que le fichier de balance existe
    $balanceFile = "../../P000 -BALANCE DEMO N_N-1_N-2.xlsx"
    if (-not (Test-Path $balanceFile)) {
        Write-Host "✗ Fichier de balance non trouvé: $balanceFile" -ForegroundColor Red
        Write-Host "  Veuillez placer le fichier de balance dans le dossier py_backend/" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ Fichier de balance trouvé" -ForegroundColor Green
    Write-Host ""
    
    # Exécuter le calculateur de la Note 21
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  EXÉCUTION DU CALCULATEUR NOTE 21" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    python calculer_note_21.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ CALCUL RÉUSSI" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        # Vérifier que les fichiers de sortie ont été créés
        $htmlFile = "../Tests/test_note_21.html"
        $traceFile = "../Tests/note_21_trace.json"
        
        if (Test-Path $htmlFile) {
            Write-Host "✓ Fichier HTML créé: $htmlFile" -ForegroundColor Green
            
            # Afficher la taille du fichier
            $fileSize = (Get-Item $htmlFile).Length
            Write-Host "  Taille: $fileSize octets" -ForegroundColor Gray
        } else {
            Write-Host "✗ Fichier HTML non créé" -ForegroundColor Red
        }
        
        if (Test-Path $traceFile) {
            Write-Host "✓ Fichier de trace créé: $traceFile" -ForegroundColor Green
            
            # Afficher la taille du fichier
            $fileSize = (Get-Item $traceFile).Length
            Write-Host "  Taille: $fileSize octets" -ForegroundColor Gray
        } else {
            Write-Host "✗ Fichier de trace non créé" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  PROCHAINES ÉTAPES" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Ouvrir le fichier HTML pour visualiser la note:" -ForegroundColor Yellow
        Write-Host "   start $htmlFile" -ForegroundColor White
        Write-Host ""
        Write-Host "2. Consulter la trace JSON pour les détails:" -ForegroundColor Yellow
        Write-Host "   cat $traceFile" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Lire le guide complet:" -ForegroundColor Yellow
        Write-Host "   cat ../Tests/QUICK_START_NOTE_21.md" -ForegroundColor White
        Write-Host ""
        
        # Proposer d'ouvrir le fichier HTML
        Write-Host "Voulez-vous ouvrir le fichier HTML maintenant? (O/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq "O" -or $response -eq "o") {
            Start-Process $htmlFile
            Write-Host "✓ Fichier HTML ouvert dans le navigateur" -ForegroundColor Green
        }
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ✗ ERREUR LORS DU CALCUL" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Consultez les messages d'erreur ci-dessus pour plus de détails." -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    
} finally {
    # Retourner au dossier d'origine
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TEST TERMINÉ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
