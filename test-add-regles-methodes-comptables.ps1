# Script PowerShell pour ajouter l'étape "Règles et méthodes comptables" dans E-revision
# Date: 09 Mai 2026

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🚀 AJOUT RÈGLES ET MÉTHODES COMPTABLES - E-REVISION" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Informations:" -ForegroundColor Green
Write-Host "   • Logiciel: E-revision" -ForegroundColor White
Write-Host "   • Section: REVUE ANALYTIQUE" -ForegroundColor White
Write-Host "   • Position: Au-dessus de Lead balance" -ForegroundColor White
Write-Host "   • Modes: Normal et Demo" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Exécution du script Python..." -ForegroundColor Cyan
Write-Host ""

python "Doc menu demarrer/Scripts/add_regles_methodes_comptables_e_revision.py"

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "✅ SCRIPT TERMINÉ" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
