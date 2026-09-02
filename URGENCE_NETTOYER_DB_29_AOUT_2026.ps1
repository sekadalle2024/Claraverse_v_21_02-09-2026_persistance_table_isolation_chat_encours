# 🚨 SCRIPT URGENCE - Nettoyage Complet
# Date: 29 août 2026
# Objectif: Supprimer contamination + forcer rebuild

Write-Host "🚨 URGENCE - Nettoyage Contamination" -ForegroundColor Red
Write-Host ""

# 1. Arrêter tous processus
Write-Host "1️⃣ Arrêt processus Node..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# 2. Supprimer cache et build
Write-Host "2️⃣ Suppression cache..." -ForegroundColor Yellow
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Rebuild complet
Write-Host "3️⃣ Rebuild TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ÉTAPES SUIVANTES:" -ForegroundColor Cyan
Write-Host "1. Lancer: npm run dev"
Write-Host "2. Dans navigateur: F12 → Application → Clear site data"
Write-Host "3. Recharger page (F5)"
Write-Host "4. Vérifier bouton 🔬 Contam → Doit dire '0 tables' ou très peu"
Write-Host ""
