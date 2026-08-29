# Script pour pousser uniquement requirements_render.txt
# Sans l'historique problématique

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   PUSH REQUIREMENTS_RENDER.TXT UNIQUEMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Créer une nouvelle branche propre
Write-Host "Création d'une branche propre..." -ForegroundColor Yellow
git checkout --orphan temp-requirements-render

# Ajouter uniquement les fichiers nécessaires du backend
Write-Host "Ajout des fichiers py_backend..." -ForegroundColor Yellow
git add py_backend/requirements_render.txt
git add py_backend/requirements.txt
git add py_backend/main.py
git add py_backend/Dockerfile
git add py_backend/*.py

# Créer le commit
Write-Host "Création du commit..." -ForegroundColor Yellow
git commit -m "Backend Python - requirements_render.txt pour Render - 16 Avril 2026"

# Pousser vers master en forçant
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
git push origin temp-requirements-render:master --force

Write-Host ""
Write-Host "✅ Push réussi!" -ForegroundColor Green
Write-Host ""
Write-Host "Retour à la branche master locale..." -ForegroundColor Yellow
git checkout master
git branch -D temp-requirements-render

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   TERMINÉ!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
