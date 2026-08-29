@echo off
echo ═══════════════════════════════════════════════════════════════
echo   🧹 NETTOYAGE DU CACHE - MODIFICATIONS GROK
echo ═══════════════════════════════════════════════════════════════
echo.

echo 📋 Étape 1: Suppression du cache Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Cache Vite supprimé
) else (
    echo ℹ️  Pas de cache Vite trouvé
)
echo.

echo 📋 Étape 2: Suppression du dossier dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Dossier dist supprimé
) else (
    echo ℹ️  Pas de dossier dist trouvé
)
echo.

echo 📋 Étape 3: Suppression du cache npm (optionnel)...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Cache npm supprimé
) else (
    echo ℹ️  Pas de cache npm trouvé
)
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ✅ NETTOYAGE TERMINÉ
echo ═══════════════════════════════════════════════════════════════
echo.
echo 💡 PROCHAINES ÉTAPES:
echo    1. Redémarrer le serveur: npm run dev
echo    2. Rafraîchir le navigateur: Ctrl+Shift+R
echo.
echo ═══════════════════════════════════════════════════════════════

pause
