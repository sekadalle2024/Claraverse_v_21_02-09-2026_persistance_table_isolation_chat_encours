# Script de test pour ajouter E-CIA EXAM PART 3
# Date: 09 Juillet 2026

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 Ajout de E-CIA EXAM PART 3 au Menu Démarrer" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "🔍 Vérification de Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Write-Host "📝 Exécution du script Python..." -ForegroundColor Yellow
Write-Host ""

python "Doc menu demarrer/Scripts/add_e_cia_exam_part3.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script exécuté avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Vérifier le fichier modifié" -ForegroundColor White
    Write-Host "   2. Tester l'application localement" -ForegroundColor White
    Write-Host "   3. Vérifier que E-CIA EXAM PART 3 apparaît dans le menu" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'exécution du script" -ForegroundColor Red
    exit 1
}
