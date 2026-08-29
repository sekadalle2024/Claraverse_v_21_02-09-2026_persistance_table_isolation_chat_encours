# ============================================
# Script de Sauvegarde ClaraVerse V5
# Date: 05 Avril 2026
# Repository: Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SAUVEGARDE CLARAVERSE V5 - 05 AVRIL 2026" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier l'état actuel
Write-Host "[1/5] Vérification de l'état Git..." -ForegroundColor Yellow
git status
Write-Host ""

# Étape 2: Ajouter tous les fichiers
Write-Host "[2/5] Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Fichiers ajoutés avec succès" -ForegroundColor Green
} else {
    Write-Host "✗ Erreur lors de l'ajout des fichiers" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 3: Créer le commit
Write-Host "[3/5] Création du commit..." -ForegroundColor Yellow
$commitMessage = "Sauvegarde ClaraVerse V5 - 05 Avril 2026

Modifications principales:
- Intégration complète des 16 états de contrôle exhaustifs
- Correction du format des états de contrôle (structure + exhaustivité)
- Amélioration de l'affichage frontend des états financiers
- Correction des onglets Balance et détection TFT
- Backend réparé et opérationnel
- Documentation complète mise à jour

Composants modifiés:
- py_backend/etats_controle_exhaustifs.py
- py_backend/html_etats_controle.py
- src/components/Clara_Components/EtatsControleAccordionRenderer.tsx
- Doc_Etat_Fin/ (documentation complète)

Tests effectués:
- Workflow complet états financiers validé
- Format exhaustif backend vérifié
- Affichage frontend corrigé
- Intégration menu accordéon testée"

git commit -m "$commitMessage"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "✗ Erreur lors de la création du commit" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Étape 4: Vérifier la connexion au repository
Write-Host "[4/5] Vérification de la connexion au repository..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# Étape 5: Push vers GitHub
Write-Host "[5/5] Envoi vers GitHub..." -ForegroundColor Yellow
Write-Host "Repository: https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor Cyan
Write-Host "Branche: master" -ForegroundColor Cyan
Write-Host ""
Write-Host "Exécution du push..." -ForegroundColor Yellow

git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SAUVEGARDE RÉUSSIE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre projet ClaraVerse V5 a été sauvegardé avec succès sur GitHub" -ForegroundColor Green
    Write-Host "URL: https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez:" -ForegroundColor Yellow
    Write-Host "1. Votre connexion Internet" -ForegroundColor Yellow
    Write-Host "2. Vos identifiants GitHub" -ForegroundColor Yellow
    Write-Host "3. Les permissions sur le repository" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour réessayer manuellement:" -ForegroundColor Yellow
    Write-Host "git push -u origin master" -ForegroundColor Cyan
    exit 1
}
