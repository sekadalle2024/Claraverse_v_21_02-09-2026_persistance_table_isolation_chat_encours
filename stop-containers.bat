@echo off
REM Script Windows pour arrêter les conteneurs E-audit

echo ==========================================
echo   Arret E-audit (Claraverse)
echo ==========================================
echo.

echo [INFO] Arret des conteneurs Docker...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose down"

echo.
echo [INFO] Conteneurs arretes avec succes!
echo.
echo Pour redemarrer: start-containers.bat
echo.
pause
