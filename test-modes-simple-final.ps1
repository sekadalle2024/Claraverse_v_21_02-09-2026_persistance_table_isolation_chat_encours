# Script de verification finale des modes Document et Database
# Date : 10 avril 2026

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION FINALE - MODES DOCUMENT ET DATABASE" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

$filepath = "src/components/Clara_Components/DemarrerMenu.tsx"

# Verifier que le fichier existe
if (-not (Test-Path $filepath)) {
    Write-Host "ERREUR: Fichier non trouve: $filepath" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier: $filepath" -ForegroundColor Yellow
Write-Host ""

# Compter les modes
$doc = (Select-String -Path $filepath -Pattern "label: 'Mode Document'").Count
$db = (Select-String -Path $filepath -Pattern "label: 'Mode Database'").Count

Write-Host "RESULTATS :" -ForegroundColor Green
Write-Host "  Modes Document: $doc" -ForegroundColor White
Write-Host "  Modes Database: $db" -ForegroundColor White
Write-Host ""

# Verifier si le nombre est correct
if ($doc -eq 12 -and $db -eq 12) {
    Write-Host "SUCCES : Nombre de modes correct (12 de chaque type)" -ForegroundColor Green
} else {
    Write-Host "ATTENTION : Nombre de modes incorrect" -ForegroundColor Yellow
    Write-Host "  Attendu: 12 modes de chaque type" -ForegroundColor Yellow
    Write-Host "  Trouve: $doc Mode Document, $db Mode Database" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  DETAILS DES ETAPES" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PHASE DE PREPARATION (7 etapes) :" -ForegroundColor Yellow
Write-Host "  1. Collecte documentaire"
Write-Host "  2. Questionnaire prise de connaissance"
Write-Host "  3. Cartographie des processus"
Write-Host "  4. Cartographie des risques"
Write-Host "  5. Referentiel de controle interne"
Write-Host "  6. Rapport d'orientation"
Write-Host "  7. Programme de travail"
Write-Host ""

Write-Host "PHASE DE REALISATION (0 etape avec modes) :" -ForegroundColor Yellow
Write-Host "  - Feuille couverture (commande directe, pas de modes)"
Write-Host ""

Write-Host "PHASE DE CONCLUSION (5 etapes) :" -ForegroundColor Yellow
Write-Host "  1. Frap"
Write-Host "  2. Synthese des Frap"
Write-Host "  3. Rapport provisoire"
Write-Host "  4. Rapport final"
Write-Host "  5. Suivi des recos"
Write-Host ""

Write-Host "TOTAL : 12 etapes avec modes Document et Database" -ForegroundColor Green
Write-Host ""

# Verifier les variables dans les modes Database
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION DES VARIABLES MODE DATABASE" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

$router = (Select-String -Path $filepath -Pattern "\[Router\] = Database").Count
$user_id = (Select-String -Path $filepath -Pattern "\[User_id\] = ohada").Count
$database = (Select-String -Path $filepath -Pattern "\[Database\] = workspace_02").Count

Write-Host "Variables trouvees :" -ForegroundColor Yellow
Write-Host "  [Router] = Database : $router" -ForegroundColor White
Write-Host "  [User_id] = ohada : $user_id" -ForegroundColor White
Write-Host "  [Database] = workspace_02 : $database" -ForegroundColor White
Write-Host ""

if ($router -eq 12 -and $user_id -eq 12 -and $database -eq 12) {
    Write-Host "SUCCES : Toutes les variables sont presentes" -ForegroundColor Green
} else {
    Write-Host "ATTENTION : Variables manquantes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION TERMINEE" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
