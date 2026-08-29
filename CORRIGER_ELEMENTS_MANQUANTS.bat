@echo off
REM Script de correction des éléments manquants - Rebuild complet
REM Double-cliquez sur ce fichier pour forcer un rebuild complet

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   CORRECTION ELEMENTS MANQUANTS
echo ========================================
echo.
echo Ce script va forcer un rebuild complet
echo pour prendre en compte tous les changements.
echo.
echo Duree estimee: 8-10 minutes
echo.
pause

REM Vérifier que PowerShell est disponible
where powershell >nul 2>&1
if errorlevel 1 (
    echo ERREUR: PowerShell n'est pas disponible
    pause
    exit /b 1
)

REM Lancer le script PowerShell de rebuild complet
echo Lancement du rebuild complet...
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "deploiement-netlify\forcer-rebuild-complet.ps1"

if errorlevel 1 (
    echo.
    echo ERREUR: Le rebuild a echoue
    echo Consultez deploiement-netlify\MEMO_PROBLEMES_SOLUTIONS.md
    pause
    exit /b 1
)

echo.
echo ========================================
echo   REBUILD ET DEPLOIEMENT REUSSIS !
echo ========================================
echo.
echo Site: https://prclaravi.netlify.app
echo Dashboard: https://app.netlify.com/projects/prclaravi
echo.
echo Tous les changements ont ete pris en compte.
echo.
pause
