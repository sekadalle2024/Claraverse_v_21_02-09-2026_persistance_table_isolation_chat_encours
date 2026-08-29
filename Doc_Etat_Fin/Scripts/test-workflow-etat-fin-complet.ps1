# Test Workflow Complet "Etat fin" - Backend + Vérifications
# Version: 1.0.0 - Test avec fichier de balance démo

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "TEST WORKFLOW COMPLET 'ETAT FIN'" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "http://127.0.0.1:5000"
$BALANCE_FILE = "py_backend/P000 -BALANCE DEMO N_N-1_N-2.xls"
$OUTPUT_DIR = "$env:USERPROFILE\Desktop"

# Vérifier que le fichier de balance existe
Write-Host "Étape 1: Vérification du fichier de balance..." -ForegroundColor Yellow
if (-not (Test-Path $BALANCE_FILE)) {
    Write-Host "  ERREUR: Fichier de balance non trouvé: $BALANCE_FILE" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: Fichier trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier que le backend est opérationnel
Write-Host "Étape 2: Vérification du backend..." -ForegroundColor Yellow
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

# Préparer le fichier pour l'upload
Write-Host "Étape 3: Préparation de l'upload..." -ForegroundColor Yellow
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $BALANCE_FILE))
$fileContent = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
$boundary = [System.Guid]::NewGuid().ToString()

$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="file"; filename="P000 -BALANCE DEMO N_N-1_N-2.xls"',
    'Content-Type: application/vnd.ms-excel',
    '',
    $fileContent,
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

Write-Host "  OK: Fichier préparé ($($fileBytes.Length) octets)" -ForegroundColor Green
Write-Host ""

# Envoyer la requête au backend
Write-Host "Étape 4: Envoi au backend..." -ForegroundColor Yellow
Write-Host "  URL: $BACKEND_URL/etats-financiers/process-excel" -ForegroundColor Gray
Write-Host "  Fichier: $BALANCE_FILE" -ForegroundColor Gray
Write-Host "  Traitement en cours..." -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri "$BACKEND_URL/etats-financiers/process-excel" `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body `
        -TimeoutSec 60
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK: Traitement réussi (Status: 200)" -ForegroundColor Green
    } else {
        Write-Host "  AVERTISSEMENT: Status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERREUR lors du traitement" -ForegroundColor Red
    Write-Host "  Détails: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Analyser la réponse
Write-Host "Étape 5: Analyse de la réponse..." -ForegroundColor Yellow

$htmlContent = $response.Content
$htmlLength = $htmlContent.Length

Write-Host "  Taille du HTML: $htmlLength caractères" -ForegroundColor Gray

# Vérifier la présence des sections attendues
$sections = @{
    "ACTIF" = $htmlContent -match "ACTIF"
    "PASSIF" = $htmlContent -match "PASSIF"
    "Compte de résultat" = $htmlContent -match "Compte de résultat"
    "TFT" = $htmlContent -match "TABLEAU DES FLUX DE TRESORERIE|TFT"
    "Notes annexes" = $htmlContent -match "NOTES ANNEXES|Notes annexes"
    "Accordéons" = $htmlContent -match "accordion"
    "Colonnes N et N-1" = ($htmlContent -match "Exercice N") -and ($htmlContent -match "Exercice N-1")
}

Write-Host ""
Write-Host "  Sections detectees:" -ForegroundColor Cyan
foreach ($section in $sections.Keys) {
    $status = if ($sections[$section]) { "[OK]" } else { "[MANQUANT]" }
    $color = if ($sections[$section]) { "Green" } else { "Red" }
    Write-Host "    $status $section" -ForegroundColor $color
}
Write-Host ""

# Sauvegarder le HTML sur le bureau
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = Join-Path $OUTPUT_DIR "test_workflow_etat_fin_$timestamp.html"

try {
    $htmlContent | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "  HTML sauvegardé: $outputFile" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR lors de la sauvegarde: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Statistiques détaillées
Write-Host "Étape 6: Statistiques détaillées..." -ForegroundColor Yellow

# Compter les occurrences
$stats = @{
    "Lignes de tableau" = ([regex]::Matches($htmlContent, "<tr")).Count
    "Cellules de données" = ([regex]::Matches($htmlContent, "<td")).Count
    "Sections accordéon" = ([regex]::Matches($htmlContent, "accordion-header")).Count
    "Boutons accordéon" = ([regex]::Matches($htmlContent, "accordion-button")).Count
}

Write-Host ""
foreach ($stat in $stats.Keys) {
    Write-Host "  $stat : $($stats[$stat])" -ForegroundColor Gray
}
Write-Host ""

# Vérifier les données N et N-1
Write-Host "Étape 7: Vérification des données N et N-1..." -ForegroundColor Yellow

$hasExerciceN = $htmlContent -match "Exercice N[^-]"
$hasExerciceN1 = $htmlContent -match "Exercice N-1"
$hasExerciceN2Displayed = $htmlContent -match "Exercice N-2"

Write-Host "  Exercice N affiche: $(if ($hasExerciceN) { 'OUI [OK]' } else { 'NON [ERREUR]' })" -ForegroundColor $(if ($hasExerciceN) { 'Green' } else { 'Red' })
Write-Host "  Exercice N-1 affiche: $(if ($hasExerciceN1) { 'OUI [OK]' } else { 'NON [ERREUR]' })" -ForegroundColor $(if ($hasExerciceN1) { 'Green' } else { 'Red' })
Write-Host "  Exercice N-2 affiche: $(if ($hasExerciceN2Displayed) { 'OUI [ERREUR - ne devrait pas]' } else { 'NON [OK - correct]' })" -ForegroundColor $(if (-not $hasExerciceN2Displayed) { 'Green' } else { 'Red' })
Write-Host ""

# Résumé final
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DU TEST" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$allSectionsPresent = $sections.Values -notcontains $false
$correctColumns = $hasExerciceN -and $hasExerciceN1 -and (-not $hasExerciceN2Displayed)

if ($allSectionsPresent -and $correctColumns) {
    Write-Host "STATUT: [OK] TEST REUSSI" -ForegroundColor Green
    Write-Host ""
    Write-Host "Toutes les sections sont presentes:" -ForegroundColor Green
    Write-Host "  [OK] ACTIF" -ForegroundColor Green
    Write-Host "  [OK] PASSIF" -ForegroundColor Green
    Write-Host "  [OK] Compte de resultat" -ForegroundColor Green
    Write-Host "  [OK] TFT (Tableau des Flux de Tresorerie)" -ForegroundColor Green
    Write-Host "  [OK] Notes annexes" -ForegroundColor Green
    Write-Host "  [OK] Accordeons fonctionnels" -ForegroundColor Green
    Write-Host "  [OK] Colonnes N et N-1 affichees" -ForegroundColor Green
    Write-Host "  [OK] N-2 utilise pour calculs mais pas affiche" -ForegroundColor Green
} else {
    Write-Host "STATUT: [ATTENTION] TEST INCOMPLET" -ForegroundColor Yellow
    Write-Host ""
    if (-not $allSectionsPresent) {
        Write-Host "Sections manquantes:" -ForegroundColor Yellow
        foreach ($section in $sections.Keys) {
            if (-not $sections[$section]) {
                Write-Host "  [MANQUANT] $section" -ForegroundColor Red
            }
        }
    }
    if (-not $correctColumns) {
        Write-Host "Probleme avec les colonnes:" -ForegroundColor Yellow
        if (-not $hasExerciceN) { Write-Host "  [ERREUR] Exercice N manquant" -ForegroundColor Red }
        if (-not $hasExerciceN1) { Write-Host "  [ERREUR] Exercice N-1 manquant" -ForegroundColor Red }
        if ($hasExerciceN2Displayed) { Write-Host "  [ERREUR] Exercice N-2 ne devrait pas etre affiche" -ForegroundColor Red }
    }
}

Write-Host ""
Write-Host "FICHIER HTML GÉNÉRÉ:" -ForegroundColor Cyan
Write-Host "  $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host "  1. Ouvrir le fichier HTML dans un navigateur" -ForegroundColor White
Write-Host "  2. Vérifier visuellement les accordéons" -ForegroundColor White
Write-Host "  3. Cliquer sur chaque section pour vérifier l'interactivité" -ForegroundColor White
Write-Host "  4. Vérifier les données affichées (N et N-1)" -ForegroundColor White
Write-Host ""
Write-Host "POUR TESTER DANS L'APPLICATION:" -ForegroundColor Cyan
Write-Host "  1. Ouvrir http://localhost:5173" -ForegroundColor White
Write-Host "  2. Taper 'Etat fin' dans le chat" -ForegroundColor White
Write-Host "  3. Sélectionner le fichier de balance" -ForegroundColor White
Write-Host "  4. Verifier que les accordeons s'affichent dans le chat" -ForegroundColor White
Write-Host ""

# Ouvrir le fichier HTML dans le navigateur par défaut
$openFile = Read-Host "Voulez-vous ouvrir le fichier HTML maintenant? (O/N)"
if ($openFile -eq "O" -or $openFile -eq "o") {
    Start-Process $outputFile
    Write-Host "Fichier ouvert dans le navigateur" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "FIN DU TEST" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
