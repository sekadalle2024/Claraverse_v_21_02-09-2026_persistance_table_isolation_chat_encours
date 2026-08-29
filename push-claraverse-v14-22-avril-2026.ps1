#!/usr/bin/env pwsh
# Script de Push pour ClaraVerse V14 - 22 Avril 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_14_22-04-2026_V5_docker_zeabur_ok_switch_editeur.git

Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "║         SAUVEGARDE CLARAVERSE V14 - 22-04-2026 - SWITCH EDITEUR              ║" -ForegroundColor Cyan
Write-Host "║                                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration Git optimale pour gros fichiers
Write-Host "⚙️  Configuration Git optimale..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 2147483647
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config http.maxRequestBuffer 536870912
Write-Host "✓ Configuration appliquée" -ForegroundColor Green
Write-Host ""

# Vérifier l'état Git
Write-Host "📋 Vérification de l'état Git..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Fichiers modifiés détectés" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fichiers à sauvegarder:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
} else {
    Write-Host "✓ Aucune modification à sauvegarder" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Ajouter tous les fichiers
Write-Host "➕ Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V14 - 22-04-2026 - Switch Editeur + Tests Notes Annexes"
git commit -m "$commitMessage"
Write-Host "✓ Commit créé: $commitMessage" -ForegroundColor Green
Write-Host ""

# Changer le repository distant
Write-Host "🔄 Configuration du repository distant..." -ForegroundColor Yellow
$newRepo = "https://github.com/sekadalle2024/Claverse_windows__v_14_22-04-2026_V5_docker_zeabur_ok_switch_editeur.git"
Write-Host "Ancien repository:" -ForegroundColor Cyan
git remote -v
Write-Host ""
Write-Host "Changement vers le nouveau repository..." -ForegroundColor Yellow
git remote set-url origin $newRepo
Write-Host "✓ Repository mis à jour" -ForegroundColor Green
Write-Host ""
Write-Host "Nouveau repository:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# Vérifier la branche
Write-Host "🌿 Vérification de la branche..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "Branche actuelle: $branch" -ForegroundColor Cyan
Write-Host ""

# Push vers GitHub avec retry
Write-Host "🚀 Début du push vers GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Cela peut prendre plusieurs minutes pour un gros projet..." -ForegroundColor Yellow
Write-Host ""

$maxRetries = 3
$retryCount = 0
$success = $false

while ($retryCount -lt $maxRetries -and -not $success) {
    $retryCount++
    Write-Host "📤 Push tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
    
    $pushOutput = git push -u origin $branch 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Push réussi!" -ForegroundColor Green
        $success = $true
    } else {
        Write-Host "✗ Tentative $retryCount échouée" -ForegroundColor Red
        Write-Host "Erreur: $pushOutput" -ForegroundColor Red
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Attente de 15 secondes avant nouvelle tentative..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
}

Write-Host ""

if (-not $success) {
    Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                                                ║" -ForegroundColor Red
    Write-Host "║                    ✗ ÉCHEC APRÈS $maxRetries TENTATIVES                              ║" -ForegroundColor Red
    Write-Host "║                                                                                ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Utiliser le script de commits multiples: .\push-commits-multiples-v14.ps1" -ForegroundColor Cyan
    Write-Host "   2. Utiliser GitHub Desktop (recommandé pour gros projets)" -ForegroundColor Cyan
    Write-Host "   3. Vérifier votre connexion Internet et réessayer" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "║                    ✓ SAUVEGARDE RÉUSSIE AVEC SUCCÈS                           ║" -ForegroundColor Green
Write-Host "║                                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Vérification finale..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "📝 Derniers commits:" -ForegroundColor Cyan
git log -3 --oneline
Write-Host ""

Write-Host "🔗 Repository GitHub:" -ForegroundColor Cyan
Write-Host "$newRepo" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Votre projet ClaraVerse V14 est maintenant sauvegardé sur GitHub!" -ForegroundColor Green
Write-Host ""
