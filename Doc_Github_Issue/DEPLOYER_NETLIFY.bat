@echo off
REM Script de déploiement Netlify en un clic - ClaraVerse
REM Double-cliquez sur ce fichier pour déployer automatiquement

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   DEPLOIEMENT NETLIFY - CLARAVERSE
echo ========================================
echo.

REM Vérifier que PowerShell est disponible
where powershell >nul 2>&1
if errorlevel 1 (
    echo ERREUR: PowerShell n'est pas disponible
    pause
    exit /b 1
)

REM Lancer le script PowerShell de déploiement
echo Lancement du déploiement...
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "deploiement-netlify\deploy.ps1"

if errorlevel 1 (
    echo.
    echo ERREUR: Le déploiement a échoué
    echo Consultez deploiement-netlify\MEMO_PROBLEMES_SOLUTIONS.md
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE AVEC SUCCES !
echo ========================================
echo.
echo Site: https://prclaravi.netlify.app
echo Dashboard: https://app.netlify.com/projects/prclaravi
echo.
pause
