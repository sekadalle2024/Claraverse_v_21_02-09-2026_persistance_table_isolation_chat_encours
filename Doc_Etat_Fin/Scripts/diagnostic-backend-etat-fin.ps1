# Diagnostic Backend "Etat fin" - Vérification détaillée
# Version: 1.0.0 - Diagnostic complet du workflow

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC BACKEND 'ETAT FIN'" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "http://127.0.0.1:5000"
$BALANCE_FILE = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
$OUTPUT_DIR = "$env:USERPROFILE\Desktop"

# Vérifier que le backend est opérationnel
Write-Host "Étape 1: Vérification du backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$BACKEND_URL/health" -UseBasicParsing -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "  OK: Backend opérationnel" -ForegroundColor Green
    } else {
        Write-Host "  ERREUR: Backend ne répond pas correctement" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERREUR: Backend non accessible" -ForegroundColor Red
    Write-Host "  Détails: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Démarrez le backend avec: .\start-claraverse-conda.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Lire le fichier et encoder en base64
Write-Host "Étape 2: Préparation du fichier..." -ForegroundColor Yellow
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $BALANCE_FILE))
$fileBase64 = [System.Convert]::ToBase64String($fileBytes)
Write-Host "  OK: Fichier encodé ($($fileBytes.Length) octets)" -ForegroundColor Green
Write-Host ""

# Préparer la requête JSON
$requestBody = @{
    file_base64 = $fileBase64
    filename = "P000 -BALANCE DEMO N_N-1_N-2.xls"
} | ConvertTo-Json

# Envoyer la requête
Write-Host "Étape 3: Envoi au backend..." -ForegroundColor Yellow
Write-Host "  URL: $BACKEND_URL/etats-financiers/process-excel" -ForegroundColor Gray
Write-Host "  Traitement en cours..." -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$BACKEND_URL/etats-financiers/process-excel" `
        -Method Post `
        -ContentType "application/json" `
        -Body $requestBody `
        -TimeoutSec 120
    
    Write-Host "  OK: Traitement réussi" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR lors du traitement" -ForegroundColor Red
    Write-Host "  Détails: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Message d'erreur: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Analyser la réponse
Write-Host "Étape 4: Analyse de la réponse..." -ForegroundColor Yellow

if ($response.success) {
    Write-Host "  OK: success = true" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: success = false" -ForegroundColor Red
}

Write-Host "  Message: $($response.message)" -ForegroundColor Gray
Write-Host ""

# Vérifier le HTML
$htmlContent = $response.html
$htmlLength = $htmlContent.Length

Write-Host "  Taille du HTML: $htmlLength caractères" -ForegroundColor Gray
Write-Host ""

# Vérifier la présence des sections
Write-Host "Etape 5: Verification des sections..." -ForegroundColor Yellow

$sections = @{
    "BILAN - ACTIF" = $htmlContent -match "BILAN - ACTIF"
    "BILAN - PASSIF" = $htmlContent -match "BILAN - PASSIF"
    "COMPTE DE RESULTAT" = $htmlContent -match "COMPTE DE RESULTAT"
    "TFT" = $htmlContent -match "TABLEAU DES FLUX DE TRESORERIE|TFT"
    "NOTES ANNEXES" = $htmlContent -match "NOTES ANNEXES"
    "Etats de controle" = $htmlContent -match "Etat de controle|ETATS DE CONTROLE"
}

Write-Host ""
foreach ($section in $sections.Keys) {
    $status = if ($sections[$section]) { "[OK]" } else { "[MANQUANT]" }
    $color = if ($sections[$section]) { "Green" } else { "Red" }
    Write-Host "  $status $section" -ForegroundColor $color
}
Write-Host ""

# Verifier les colonnes
Write-Host "Etape 6: Verification des colonnes..." -ForegroundColor Yellow

$hasExerciceN = $htmlContent -match "EXERCICE N[^-]"
$hasExerciceN1 = $htmlContent -match "EXERCICE N-1"
$hasExerciceN2 = $htmlContent -match "EXERCICE N-2"

Write-Host "  Exercice N: $(if ($hasExerciceN) { 'OUI [OK]' } else { 'NON [ERREUR]' })" -ForegroundColor $(if ($hasExerciceN) { 'Green' } else { 'Red' })
Write-Host "  Exercice N-1: $(if ($hasExerciceN1) { 'OUI [OK]' } else { 'NON [ERREUR]' })" -ForegroundColor $(if ($hasExerciceN1) { 'Green' } else { 'Red' })
Write-Host "  Exercice N-2: $(if ($hasExerciceN2) { 'OUI [ERREUR]' } else { 'NON [OK]' })" -ForegroundColor $(if (-not $hasExerciceN2) { 'Green' } else { 'Red' })
Write-Host ""

# Compter les accordeons
Write-Host "Etape 7: Comptage des accordeons..." -ForegroundColor Yellow

$nbAccordeons = ([regex]::Matches($htmlContent, "section-header-ef")).Count
Write-Host "  Nombre d'accordeons: $nbAccordeons" -ForegroundColor Gray

$expectedSections = @(
    "BILAN - ACTIF",
    "BILAN - PASSIF",
    "COMPTE DE RESULTAT",
    "TFT",
    "NOTES ANNEXES"
)

Write-Host "  Sections attendues: $($expectedSections.Count)" -ForegroundColor Gray
Write-Host ""

if ($nbAccordeons -ge $expectedSections.Count) {
    Write-Host "  OK: Nombre d'accordeons suffisant" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION: Nombre d'accordeons insuffisant" -ForegroundColor Yellow
    Write-Host "  Attendu: $($expectedSections.Count), Trouve: $nbAccordeons" -ForegroundColor Yellow
}
Write-Host ""

# Sauvegarder le HTML
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = Join-Path $OUTPUT_DIR "diagnostic_etat_fin_$timestamp.html"

try {
    $htmlContent | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "  HTML sauvegardé: $outputFile" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR lors de la sauvegarde: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Resumer
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "RESUME DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$allSectionsPresent = $sections.Values -notcontains $false
$correctColumns = $hasExerciceN -and $hasExerciceN1 -and (-not $hasExerciceN2)

if ($allSectionsPresent -and $correctColumns) {
    Write-Host "STATUT: [OK] TOUT EST CORRECT" -ForegroundColor Green
    Write-Host ""
    Write-Host "Toutes les sections sont presentes:" -ForegroundColor Green
    foreach ($section in $sections.Keys) {
        Write-Host "  [OK] $section" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Colonnes correctes:" -ForegroundColor Green
    Write-Host "  [OK] Exercice N affiche" -ForegroundColor Green
    Write-Host "  [OK] Exercice N-1 affiche" -ForegroundColor Green
    Write-Host "  [OK] Exercice N-2 non affiche (utilise en calcul)" -ForegroundColor Green
} else {
    Write-Host "STATUT: [ATTENTION] PROBLEMES DETECTES" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $allSectionsPresent) {
        Write-Host "Sections manquantes:" -ForegroundColor Yellow
        foreach ($section in $sections.Keys) {
            if (-not $sections[$section]) {
                Write-Host "  [MANQUANT] $section" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
    
    if (-not $correctColumns) {
        Write-Host "Problemes avec les colonnes:" -ForegroundColor Yellow
        if (-not $hasExerciceN) { Write-Host "  [ERREUR] Exercice N manquant" -ForegroundColor Red }
        if (-not $hasExerciceN1) { Write-Host "  [ERREUR] Exercice N-1 manquant" -ForegroundColor Red }
        if ($hasExerciceN2) { Write-Host "  [ERREUR] Exercice N-2 ne devrait pas etre affiche" -ForegroundColor Red }
        Write-Host ""
    }
}

Write-Host "FICHIER HTML GÉNÉRÉ:" -ForegroundColor Cyan
Write-Host "  $outputFile" -ForegroundColor White
Write-Host ""

# Ouvrir le fichier
$openFile = Read-Host "Voulez-vous ouvrir le fichier HTML maintenant? (O/N)"
if ($openFile -eq "O" -or $openFile -eq "o") {
    Start-Process $outputFile
    Write-Host "Fichier ouvert dans le navigateur" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "FIN DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
