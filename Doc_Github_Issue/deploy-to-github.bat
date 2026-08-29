@echo off
REM Script de déploiement automatisé pour Windows
REM ClaraVerse - Sauvegarde sur GitHub

echo ========================================
echo   DEPLOIEMENT CLARAVERSE SUR GITHUB
echo ========================================
echo.

REM Étape 1: Vérification pré-déploiement
echo [1/6] Verification des assets...
node pre-deploy-check.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR: La verification a echoue!
    echo Veuillez corriger les problemes avant de continuer.
    pause
    exit /b 1
)

echo.
echo [2/6] Test du build local...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR: Le build a echoue!
    echo Verifiez les erreurs ci-dessus.
    pause
    exit /b 1
)

echo.
echo [3/6] Nettoyage des fichiers temporaires...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"

echo.
echo [4/6] Verification du statut Git...
git status

echo.
echo [5/6] Ajout des fichiers et commit...
git add .
git commit -m "✨ Mise a jour ClaraVerse - Version amelioree avec corrections assets"

echo.
echo [6/6] Push vers GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Tentative avec 'master' au lieu de 'main'...
    git push origin master
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERREUR: Le push a echoue!
        echo Essayez manuellement: git push -f origin main
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   DEPLOIEMENT REUSSI!
echo ========================================
echo.
echo Votre projet a ete sauvegarde sur:
echo https://github.com/sekadalle2024/claraverse_back-up_V2.git
echo.
pause
