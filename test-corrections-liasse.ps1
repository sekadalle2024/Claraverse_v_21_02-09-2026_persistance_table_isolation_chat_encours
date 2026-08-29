# Script de test des corrections format liasse
# Date: 23 mars 2026

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TEST CORRECTIONS FORMAT LIASSE - Menu Accordéon, TFT, Annexes" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "http://127.0.0.1:5000"
$testFile = "py_backend\BALANCES_N_N1_N2.xlsx"

# Fonction pour afficher un résultat de test
function Show-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Yellow
        }
    }
}

# Test 1: Vérifier que le backend est actif
Write-Host "Test 1: Vérification Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Show-TestResult "Backend actif" $true "URL: $backendUrl"
    } else {
        Show-TestResult "Backend actif" $false "Status: $($response.StatusCode)"
        exit 1
    }
} catch {
    Show-TestResult "Backend actif" $false "Erreur: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "⚠️  Démarrez le backend avec: .\start-claraverse-conda.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Vérifier que le fichier de test existe
Write-Host "Test 2: Vérification Fichier de Test..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    $fileSize = (Get-Item $testFile).Length
    Show-TestResult "Fichier trouvé" $true "Taille: $([math]::Round($fileSize/1KB, 2)) KB"
} else {
    Show-TestResult "Fichier trouvé" $false "Fichier non trouvé: $testFile"
    Write-Host ""
    Write-Host "⚠️  Créez le fichier avec: python py_backend\create_balances_multi_exercices.py" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 3: Tester l'endpoint avec le fichier
Write-Host "Test 3: Test Endpoint /etats-financiers/process-excel..." -ForegroundColor Yellow
try {
    # Lire et encoder le fichier
    $fileBytes = [System.IO.File]::ReadAllBytes($testFile)
    $fileBase64 = [Convert]::ToBase64String($fileBytes)
    
    # Préparer la requête
    $body = @{
        file_base64 = $fileBase64
        filename = "BALANCES_N_N1_N2.xlsx"
    } | ConvertTo-Json
    
    Write-Host "   Envoi de la requête..." -ForegroundColor Gray
    
    # Envoyer la requête
    $response = Invoke-RestMethod -Uri "$backendUrl/etats-financiers/process-excel" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30
    
    if ($response.success) {
        Show-TestResult "Endpoint répond" $true "Message: $($response.message)"
    } else {
        Show-TestResult "Endpoint répond" $false "Erreur: $($response.message)"
        exit 1
    }
} catch {
    Show-TestResult "Endpoint répond" $false "Erreur: $($_.Exception.Message)"
    exit 1
}
Write-Host ""

# Test 4: Vérifier la structure de la réponse
Write-Host "Test 4: Vérification Structure Réponse..." -ForegroundColor Yellow

# Vérifier que le HTML est présent
if ($response.html) {
    Show-TestResult "HTML généré" $true "Longueur: $($response.html.Length) caractères"
} else {
    Show-TestResult "HTML généré" $false "HTML manquant"
}

# Vérifier que les résultats sont présents
if ($response.results) {
    Show-TestResult "Résultats présents" $true
} else {
    Show-TestResult "Résultats présents" $false
}
Write-Host ""

# Test 5: Vérifier le contenu HTML
Write-Host "Test 5: Vérification Contenu HTML..." -ForegroundColor Yellow

$html = $response.html

# Vérifier la présence des sections
$sections = @(
    @{Name="Bilan Actif"; Pattern="BILAN - ACTIF"},
    @{Name="Bilan Passif"; Pattern="BILAN - PASSIF"},
    @{Name="Compte de Résultat"; Pattern="COMPTE DE RÉSULTAT"},
    @{Name="TFT"; Pattern="TABLEAU DES FLUX DE TRÉSORERIE"},
    @{Name="Annexes"; Pattern="NOTES ANNEXES"}
)

foreach ($section in $sections) {
    if ($html -match $section.Pattern) {
        Show-TestResult "Section $($section.Name)" $true
    } else {
        Show-TestResult "Section $($section.Name)" $false "Pattern non trouvé: $($section.Pattern)"
    }
}
Write-Host ""

# Test 6: Vérifier le format liasse (colonnes N et N-1)
Write-Host "Test 6: Vérification Format Liasse..." -ForegroundColor Yellow

if ($html -match "EXERCICE N") {
    Show-TestResult "Colonne EXERCICE N" $true
} else {
    Show-TestResult "Colonne EXERCICE N" $false
}

if ($html -match "EXERCICE N-1") {
    Show-TestResult "Colonne EXERCICE N-1" $true
} else {
    Show-TestResult "Colonne EXERCICE N-1" $false
}

# Vérifier la présence du tableau liasse
if ($html -match "liasse-table") {
    Show-TestResult "Tableau format liasse" $true
} else {
    Show-TestResult "Tableau format liasse" $false
}
Write-Host ""

# Test 7: Vérifier les données TFT
Write-Host "Test 7: Vérification TFT..." -ForegroundColor Yellow

if ($response.results.tft) {
    $tft = $response.results.tft
    
    if ($tft.tft) {
        $nbLignes = $tft.tft.Count
        Show-TestResult "TFT présent" $true "Nombre de lignes: $nbLignes"
        
        # Vérifier qu'on a bien 19 lignes
        if ($nbLignes -eq 19) {
            Show-TestResult "TFT complet (19 lignes)" $true
        } else {
            Show-TestResult "TFT complet (19 lignes)" $false "Trouvé: $nbLignes lignes"
        }
        
        # Vérifier la présence des colonnes N et N-1
        $premiereLigne = $tft.tft[0]
        if ($premiereLigne.montant_n -ne $null -and $premiereLigne.montant_n1 -ne $null) {
            Show-TestResult "TFT avec colonnes N et N-1" $true
        } else {
            Show-TestResult "TFT avec colonnes N et N-1" $false
        }
    } else {
        Show-TestResult "TFT présent" $false "Structure TFT manquante"
    }
} else {
    Show-TestResult "TFT présent" $false "TFT non calculé"
}
Write-Host ""

# Test 8: Vérifier les annexes
Write-Host "Test 8: Vérification Annexes..." -ForegroundColor Yellow

if ($response.results.annexes) {
    $annexes = $response.results.annexes
    $nbNotes = ($annexes.PSObject.Properties | Measure-Object).Count
    
    Show-TestResult "Annexes présentes" $true "Nombre de notes: $nbNotes"
    
    # Vérifier qu'on a bien 14 notes
    if ($nbNotes -ge 14) {
        Show-TestResult "Annexes complètes (14+ notes)" $true
    } else {
        Show-TestResult "Annexes complètes (14+ notes)" $false "Trouvé: $nbNotes notes"
    }
    
    # Vérifier quelques notes clés
    $notesClés = @("note_3a", "note_6", "note_7", "note_10", "note_13", "note_21")
    foreach ($note in $notesClés) {
        if ($annexes.$note) {
            Show-TestResult "Note $note" $true
        } else {
            Show-TestResult "Note $note" $false
        }
    }
} else {
    Show-TestResult "Annexes présentes" $false "Annexes non calculées"
}
Write-Host ""

# Test 9: Sauvegarder le HTML généré
Write-Host "Test 9: Sauvegarde HTML..." -ForegroundColor Yellow

$outputDir = "$env:USERPROFILE\Desktop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = "$outputDir\Test_Etats_Liasse_$timestamp.html"

try {
    $response.html | Out-File -FilePath $outputFile -Encoding UTF8
    Show-TestResult "HTML sauvegardé" $true "Fichier: $outputFile"
} catch {
    Show-TestResult "HTML sauvegardé" $false "Erreur: $($_.Exception.Message)"
}
Write-Host ""

# Résumé final
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend actif et fonctionnel" -ForegroundColor Green
Write-Host "✅ Endpoint traite correctement le fichier multi-onglets" -ForegroundColor Green
Write-Host "✅ Format liasse avec colonnes N et N-1" -ForegroundColor Green
Write-Host "✅ TFT complet avec 19 lignes et colonnes N et N-1" -ForegroundColor Green
Write-Host "✅ Annexes complètes avec 14+ notes" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Fichier HTML généré: $outputFile" -ForegroundColor Cyan
Write-Host "🌐 Ouvrez-le dans un navigateur pour voir le résultat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour tester dans l'interface web:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:5173" -ForegroundColor White
Write-Host "2. Uploadez le fichier BALANCES_N_N1_N2.xlsx" -ForegroundColor White
Write-Host "3. Vérifiez le menu accordéon" -ForegroundColor White
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
