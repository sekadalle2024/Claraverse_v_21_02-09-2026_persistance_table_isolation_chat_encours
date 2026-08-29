# Script de test pour verifier l'ajout du Mode Document a E-controle pro
# Date : 10 avril 2026

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   TEST MODE DOCUMENT E-CONTROLE PRO" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$filePath = "src/components/Clara_Components/DemarrerMenu.tsx"

# Verifier que le fichier existe
if (-not (Test-Path $filePath)) {
    Write-Host "ERREUR : Fichier non trouve : $filePath" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier trouve : $filePath" -ForegroundColor Green
Write-Host ""

# Lire le contenu du fichier
$content = Get-Content $filePath -Raw

# Compter les occurrences de "Mode Document" dans E-controle
$modeDocumentMatches = Select-String -Path $filePath -Pattern "label: 'Mode Document'" -AllMatches
$count = $modeDocumentMatches.Matches.Count

Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "   VERIFICATION DES MODES DOCUMENT" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

Write-Host "Nombre de 'Mode Document' trouves : $count" -ForegroundColor Cyan

if ($count -eq 0) {
    Write-Host "Aucun Mode Document trouve dans E-controle pro" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACTION REQUISE :" -ForegroundColor Yellow
    Write-Host "Executez le script d'ajout :" -ForegroundColor White
    Write-Host '  python "Doc menu demarrer/Scripts/add_document_mode_e_controle_pro.py"' -ForegroundColor White
    exit 1
} elseif ($count -lt 9) {
    Write-Host "ATTENTION : Seulement $count Mode Document trouves (attendu : 9)" -ForegroundColor Yellow
} else {
    Write-Host "Tous les Mode Document ont ete ajoutes ($count)" -ForegroundColor Green
}

Write-Host ""
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "   VERIFICATION DE LA VARIABLE [Router]" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

# Verifier que [Router] = Document est present
$routerMatches = Select-String -Path $filePath -Pattern "\[Router\] = Document" -AllMatches
$routerCount = $routerMatches.Matches.Count

Write-Host "Nombre de '[Router] = Document' trouves : $routerCount" -ForegroundColor Cyan

if ($routerCount -ge 9) {
    Write-Host "Toutes les commandes contiennent [Router] = Document" -ForegroundColor Green
} else {
    Write-Host "Incoherence : $routerCount [Router] = Document trouves" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   RESUME" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if ($count -ge 9 -and $routerCount -ge 9) {
    Write-Host "TEST REUSSI : Mode Document ajoute avec succes a E-controle pro" -ForegroundColor Green
    Write-Host ""
    Write-Host "PROCHAINES ETAPES :" -ForegroundColor Yellow
    Write-Host "1. Tester dans l'application E-audit" -ForegroundColor White
    Write-Host "2. Verifier que le menu demarrer affiche 'Mode Document'" -ForegroundColor White
    Write-Host "3. Tester l'envoi de documents avec le workflow n8n" -ForegroundColor White
    exit 0
} else {
    Write-Host "TEST ECHOUE : Verifiez les erreurs ci-dessus" -ForegroundColor Red
    exit 1
}
