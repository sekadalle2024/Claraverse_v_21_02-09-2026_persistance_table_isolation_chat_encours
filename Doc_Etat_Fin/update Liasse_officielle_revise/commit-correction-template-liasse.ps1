# ================================================================================
# SCRIPT DE COMMIT - CORRECTION TEMPLATE LIASSE
# 08 Avril 2026
# ================================================================================

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "COMMIT - Correction Template Liasse" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ ERREUR: Pas dans un dépôt Git" -ForegroundColor Red
    Write-Host "   Exécutez ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Fichiers modifiés/créés:" -ForegroundColor Yellow
Write-Host ""

# Lister les fichiers
$files = @(
    "py_backend/export_liasse.py",
    "test-template-liasse-revise.ps1",
    "00_SOLUTION_TEMPLATE_LIASSE_REVISE_08_AVRIL_2026.txt",
    "QUICK_START_CORRECTION_TEMPLATE_LIASSE.txt",
    "00_COMMENCER_ICI_SOLUTION_ACTIF_08_AVRIL_2026.txt",
    "COMMIT_MESSAGE_CORRECTION_TEMPLATE_LIASSE.txt",
    "00_INDEX_SOLUTION_TEMPLATE_LIASSE_08_AVRIL_2026.md",
    "00_LIRE_MAINTENANT_SOLUTION_LIASSE_08_AVRIL_2026.txt",
    "commit-correction-template-liasse.ps1"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file (non trouvé)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "ACTIONS DISPONIBLES" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Ajouter les fichiers au staging:" -ForegroundColor Yellow
Write-Host "   git add py_backend/export_liasse.py" -ForegroundColor White
Write-Host "   git add test-template-liasse-revise.ps1" -ForegroundColor White
Write-Host "   git add 00_*.txt 00_*.md" -ForegroundColor White
Write-Host "   git add QUICK_START_*.txt COMMIT_MESSAGE_*.txt" -ForegroundColor White
Write-Host "   git add commit-correction-template-liasse.ps1" -ForegroundColor White
Write-Host ""

Write-Host "2. Voir le statut:" -ForegroundColor Yellow
Write-Host "   git status" -ForegroundColor White
Write-Host ""

Write-Host "3. Commiter avec le message préparé:" -ForegroundColor Yellow
Write-Host "   git commit -F COMMIT_MESSAGE_CORRECTION_TEMPLATE_LIASSE.txt" -ForegroundColor White
Write-Host ""

Write-Host "4. Ou commiter avec un message court:" -ForegroundColor Yellow
Write-Host "   git commit -m 'fix(export): Utiliser Liasse_officielle_revise.xlsx comme template'" -ForegroundColor White
Write-Host ""

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "COMMANDES RAPIDES" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
$response = Read-Host "Voulez-vous ajouter les fichiers au staging maintenant? (o/n)"

if ($response -eq "o" -or $response -eq "O" -or $response -eq "oui") {
    Write-Host ""
    Write-Host "📦 Ajout des fichiers au staging..." -ForegroundColor Yellow
    
    git add py_backend/export_liasse.py
    git add test-template-liasse-revise.ps1
    git add 00_SOLUTION_TEMPLATE_LIASSE_REVISE_08_AVRIL_2026.txt
    git add QUICK_START_CORRECTION_TEMPLATE_LIASSE.txt
    git add 00_COMMENCER_ICI_SOLUTION_ACTIF_08_AVRIL_2026.txt
    git add COMMIT_MESSAGE_CORRECTION_TEMPLATE_LIASSE.txt
    git add 00_INDEX_SOLUTION_TEMPLATE_LIASSE_08_AVRIL_2026.md
    git add 00_LIRE_MAINTENANT_SOLUTION_LIASSE_08_AVRIL_2026.txt
    git add commit-correction-template-liasse.ps1
    
    Write-Host ""
    Write-Host "✅ Fichiers ajoutés au staging" -ForegroundColor Green
    Write-Host ""
    
    # Afficher le statut
    Write-Host "📊 Statut Git:" -ForegroundColor Yellow
    git status --short
    
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "PROCHAINE ÉTAPE" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour commiter, exécutez:" -ForegroundColor Yellow
    Write-Host "   git commit -F COMMIT_MESSAGE_CORRECTION_TEMPLATE_LIASSE.txt" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou:" -ForegroundColor Yellow
    Write-Host "   git commit -m 'fix(export): Utiliser Liasse_officielle_revise.xlsx'" -ForegroundColor White
    Write-Host ""
    
    # Demander si on veut commiter maintenant
    $commitNow = Read-Host "Voulez-vous commiter maintenant? (o/n)"
    
    if ($commitNow -eq "o" -or $commitNow -eq "O" -or $commitNow -eq "oui") {
        Write-Host ""
        Write-Host "💾 Création du commit..." -ForegroundColor Yellow
        
        git commit -F COMMIT_MESSAGE_CORRECTION_TEMPLATE_LIASSE.txt
        
        Write-Host ""
        Write-Host "✅ Commit créé avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Pour pousser vers GitHub:" -ForegroundColor Yellow
        Write-Host "   git push origin main" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⏸️  Commit annulé. Les fichiers restent dans le staging." -ForegroundColor Yellow
        Write-Host ""
    }
    
} else {
    Write-Host ""
    Write-Host "⏸️  Opération annulée. Aucun fichier ajouté." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
