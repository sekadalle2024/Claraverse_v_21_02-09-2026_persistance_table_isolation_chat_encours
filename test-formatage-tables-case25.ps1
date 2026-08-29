# ═══════════════════════════════════════════════════════════════════════════
# TEST FORMATAGE TABLES 2-6 CASE 25
# Date: 29 Mars 2026 - 21h30
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST FORMATAGE TABLES 2-6 CASE 25" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter le serveur
Write-Host "ÉTAPE 1: Arrêt du serveur..." -ForegroundColor Yellow
.\stop-claraverse.ps1

Start-Sleep -Seconds 2

# Étape 2: Démarrer le serveur
Write-Host ""
Write-Host "ÉTAPE 2: Démarrage du serveur..." -ForegroundColor Yellow
.\start-claraverse.ps1

Start-Sleep -Seconds 5

# Étape 3: Ouvrir le frontend
Write-Host ""
Write-Host "ÉTAPE 3: Ouverture du frontend..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  SERVEUR DÉMARRÉ - PRÊT POUR LES TESTS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "MESSAGE DE TEST À ENVOYER:" -ForegroundColor Cyan
Write-Host ""
Write-Host "[Command] : Recos contrôle interne comptable" -ForegroundColor White
Write-Host "[Cycle] : trésorerie" -ForegroundColor White
Write-Host "[test] : AA010" -ForegroundColor White
Write-Host "[Anomalie] = Absence de contrôles inopinés de la caisse" -ForegroundColor White
Write-Host ""
Write-Host "VÉRIFICATIONS À FAIRE:" -ForegroundColor Cyan
Write-Host "1. Ouvrir la console du navigateur (F12)" -ForegroundColor White
Write-Host "2. Envoyer le message ci-dessus" -ForegroundColor White
Write-Host "3. Vérifier que les 6 tables s'affichent" -ForegroundColor White
Write-Host "4. Vérifier que les en-têtes sont EN GRAS:" -ForegroundColor White
Write-Host "   - Table 2: Intitule (EN GRAS)" -ForegroundColor White
Write-Host "   - Table 3: Observation (EN GRAS)" -ForegroundColor White
Write-Host "   - Table 4: Constat (EN GRAS)" -ForegroundColor White
Write-Host "   - Table 5: Risque (EN GRAS)" -ForegroundColor White
Write-Host "   - Table 6: Recommendation (EN GRAS)" -ForegroundColor White
Write-Host ""
Write-Host "LOGS À CHERCHER DANS LA CONSOLE (F12):" -ForegroundColor Cyan
Write-Host "✅ Table 1 générée (XXX caractères)" -ForegroundColor White
Write-Host "✅ Table 2 générée (Tableau Markdown)" -ForegroundColor White
Write-Host "✅ Table 3 générée (Tableau Markdown)" -ForegroundColor White
Write-Host "✅ Table 4 générée (Tableau Markdown)" -ForegroundColor White
Write-Host "✅ Table 5 générée (Tableau Markdown)" -ForegroundColor White
Write-Host "✅ Table 6 générée (Tableau Markdown)" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
