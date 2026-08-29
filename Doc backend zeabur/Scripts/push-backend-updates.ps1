# 🚀 SCRIPT DE DÉPLOIEMENT GÉNÉRAL - BACKEND PYTHON (ZEABUR)
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Objectif: Pousser toutes les modifications du backend vers GitHub
#           pour déclencher le redéploiement automatique sur Zeabur.
# 
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "🚀 Préparation du push backend vers Zeabur..." -ForegroundColor Cyan

# 1. Ajout des fichiers modifiés
Write-Host "📋 Ajout des fichiers..." -ForegroundColor Yellow
git add py_backend/requirements.txt
git add py_backend/requirements_render.txt
git add py_backend/Dockerfile
git add py_backend/main.py
git add py_backend/export_synthese_cac_final.py
git add public/menu.js

# 2. Création du commit
$commitMsg = "fix: résolution build uvloop et standardisation routes word"
Write-Host "💾 Création du commit: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

# 3. Push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Succès ! Attendez 3-5 minutes pour le rebuild Zeabur." -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du push." -ForegroundColor Red
}
