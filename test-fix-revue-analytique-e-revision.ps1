# Script PowerShell pour tester la modification de la section REVUE ANALYTIQUE - E-revision
# Date : 09 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "🔧 MODIFICATION SECTION REVUE ANALYTIQUE - E-REVISION" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python détecté : $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Modifications à effectuer :" -ForegroundColor Yellow
Write-Host "   1. Modifier le mode [Normal]" -ForegroundColor White
Write-Host "      [Command] : Revue analytique" -ForegroundColor Gray
Write-Host "      [Processus] : Trésorerie" -ForegroundColor Gray
Write-Host "      [Données de base] = pièce jointe" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Ajouter le mode [Demo]" -ForegroundColor White
Write-Host "      [Command] : Revue analytique" -ForegroundColor Gray
Write-Host "      [Processus] : Trésorerie" -ForegroundColor Gray
Write-Host "      [Données de base] = pièce jointe" -ForegroundColor Gray
Write-Host "      [Demo] = Activate" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Supprimer le mode [Avancé]" -ForegroundColor White
Write-Host ""

# Demander confirmation
Write-Host "⚠️  Cette opération va modifier le fichier DemarrerMenu.tsx" -ForegroundColor Yellow
$confirmation = Read-Host "Voulez-vous continuer ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée par l'utilisateur" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Exécution du script Python..." -ForegroundColor Cyan
Write-Host ""

# Exécuter le script Python
python "Doc menu demarrer/Scripts/fix_revue_analytique_e_revision.py"

$exitCode = $LASTEXITCODE

Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host "✅ MODIFICATION TERMINÉE AVEC SUCCÈS" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host ("=" * 79) -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Vérifier la compilation : npm run build" -ForegroundColor White
    Write-Host "   2. Démarrer l'application : npm run dev" -ForegroundColor White
    Write-Host "   3. Tester le menu : E-revision > Revue analytique" -ForegroundColor White
    Write-Host "   4. Vérifier les 4 modes : Normal, Demo, Methodo revision, Guide des commandes" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host "❌ ERREUR LORS DE LA MODIFICATION" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host ("=" * 79) -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Vérifier les messages d'erreur ci-dessus" -ForegroundColor Yellow
    Write-Host ""
}

exit $exitCode
