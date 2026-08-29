# Test du diagnostic des sélecteurs CSS
# Date: 26 Mars 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DIAGNOSTIC SÉLECTEURS CSS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le script de diagnostic existe
Write-Host "1. Vérification du script de diagnostic..." -ForegroundColor Yellow
if (Test-Path "public/diagnostic-tables.js") {
    Write-Host "   ✅ Script trouvé: public/diagnostic-tables.js" -ForegroundColor Green
    
    # Afficher la taille du fichier
    $fileSize = (Get-Item "public/diagnostic-tables.js").Length
    Write-Host "   📊 Taille: $fileSize octets" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Script non trouvé!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier que le script est chargé dans index.html
Write-Host "2. Vérification du chargement dans index.html..." -ForegroundColor Yellow
$indexContent = Get-Content "index.html" -Raw
if ($indexContent -match "diagnostic-tables\.js") {
    Write-Host "   ✅ Script chargé dans index.html" -ForegroundColor Green
} else {
    Write-Host "   ❌ Script non chargé dans index.html!" -ForegroundColor Red
    Write-Host "   → Ajouter: <script src='/diagnostic-tables.js'></script>" -ForegroundColor Yellow
}

Write-Host ""

# Vérifier que menu.js existe
Write-Host "3. Vérification de menu.js..." -ForegroundColor Yellow
if (Test-Path "public/menu.js") {
    Write-Host "   ✅ Fichier trouvé: public/menu.js" -ForegroundColor Green
    
    # Chercher la fonction exportSyntheseCAC
    $menuContent = Get-Content "public/menu.js" -Raw
    if ($menuContent -match "exportSyntheseCAC") {
        Write-Host "   ✅ Fonction exportSyntheseCAC trouvée" -ForegroundColor Green
        
        # Chercher le sélecteur actuel
        if ($menuContent -match "CHAT_TABLES:\s*[`"']([^`"']+)[`"']") {
            $currentSelector = $matches[1]
            Write-Host "   📊 Sélecteur actuel: $currentSelector" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Fonction exportSyntheseCAC non trouvée!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier non trouvé!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Afficher les instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrir Claraverse dans le navigateur" -ForegroundColor White
Write-Host "2. Appuyer sur Ctrl+F5 (rafraîchissement forcé)" -ForegroundColor White
Write-Host "3. Attendre 3 secondes" -ForegroundColor White
Write-Host "4. Lire les 2 alertes qui s'affichent" -ForegroundColor White
Write-Host "5. Copier le contenu des alertes" -ForegroundColor White
Write-Host ""
Write-Host "Si les alertes ne s'affichent pas:" -ForegroundColor Yellow
Write-Host "1. Ouvrir la console (F12)" -ForegroundColor White
Write-Host "2. Taper: window.diagnosticTables()" -ForegroundColor White
Write-Host "3. Appuyer sur Entrée" -ForegroundColor White
Write-Host ""

# Afficher les fichiers de documentation
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DOCUMENTATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 00_LIRE_MAINTENANT_DIAGNOSTIC.txt" -ForegroundColor Green
Write-Host "📄 QUICK_START_DIAGNOSTIC_SELECTEURS.txt" -ForegroundColor Green
Write-Host "📄 00_DIAGNOSTIC_SELECTEURS_CSS.txt" -ForegroundColor Green
Write-Host "📄 INDEX_DIAGNOSTIC_SELECTEURS_26_MARS_2026.md" -ForegroundColor Green
Write-Host "📄 SYNTHESE_SESSION_DIAGNOSTIC_26_MARS_2026.md" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ VÉRIFICATIONS TERMINÉES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
