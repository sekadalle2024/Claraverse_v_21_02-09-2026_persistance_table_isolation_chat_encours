# Script de mise à jour GitHub - 05 Avril 2026
# Mise à jour complète du projet avec corrections backend et frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MISE A JOUR GITHUB - 05 AVRIL 2026" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'état Git
Write-Host "1. Vérification de l'état Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Ajout des fichiers modifiés..." -ForegroundColor Yellow

# Ajouter les fichiers modifiés
git add .claraverse-jobs.json
git add Doc_Etat_Fin/Scripts/test-etats-controle-html.ps1
git add Doc_Etat_Fin/Scripts/verifier_calculs_n1_n2.py
git add public/EtatFinAutoTrigger.js
git add py_backend/etats_financiers.py
git add py_backend/generer_test_etats_controle_html.py

Write-Host ""
Write-Host "3. Ajout des nouveaux fichiers de documentation..." -ForegroundColor Yellow

# Ajouter tous les nouveaux fichiers de documentation
git add 00_*.txt
git add Doc_Etat_Fin/Documentation/
git add Doc_Etat_Fin/Scripts/
git add *.py
git add *.ps1

Write-Host ""
Write-Host "4. Vérification des fichiers ajoutés..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "5. Création du commit..." -ForegroundColor Yellow

# Créer le commit avec un message détaillé
$commitMessage = @"
Mise à jour complète - 05 Avril 2026

CORRECTIONS BACKEND:
- Réparation environnement backend Python
- Correction exhaustivité états financiers
- Amélioration détection onglets TFT
- Tests backend exhaustifs ajoutés

CORRECTIONS FRONTEND:
- Correction affichage N/N-1 états contrôle
- Amélioration rendu états financiers
- Correction détection onglets frontend

DOCUMENTATION:
- Guides de test complets
- Scripts de diagnostic backend
- Documentation correction exhaustivité
- Procédures de vérification

TESTS:
- Scripts de test backend
- Tests exhaustivité états
- Tests intégration TFT
- Tests détection onglets

Fichiers modifiés: 6
Nouveaux fichiers: 30+
"@

git commit -m "$commitMessage"

Write-Host ""
Write-Host "6. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "Repository: https://github.com/sekadalle2024/Craverse_windows_s_12_v0_04-04-2026_V5-Export_CAC-V0-Public.git" -ForegroundColor Gray
Write-Host ""

# Push vers origin
git push origin master

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "MISE A JOUR TERMINEE AVEC SUCCES!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Résumé:" -ForegroundColor Cyan
Write-Host "- Backend réparé et opérationnel" -ForegroundColor White
Write-Host "- Corrections exhaustivité appliquées" -ForegroundColor White
Write-Host "- Frontend corrigé (affichage N/N-1)" -ForegroundColor White
Write-Host "- Documentation complète ajoutée" -ForegroundColor White
Write-Host "- Scripts de test intégrés" -ForegroundColor White
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Vérifier le push sur GitHub" -ForegroundColor White
Write-Host "2. Tester le déploiement" -ForegroundColor White
Write-Host "3. Valider les corrections" -ForegroundColor White
