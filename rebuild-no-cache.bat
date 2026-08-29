@echo off
REM Script Windows pour rebuild complet sans cache (si problème)

echo ==========================================
echo   Rebuild COMPLET E-audit (sans cache)
echo ==========================================
echo.

echo [ATTENTION] Rebuild sans cache - peut prendre 10-15 minutes
echo.
pause

echo [INFO] Arret des conteneurs...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose down"

echo.
echo [INFO] Rebuild SANS CACHE des images Docker...
echo [INFO] Cela va prendre du temps...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose build --no-cache"

echo.
echo [INFO] Redemarrage des conteneurs...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose up -d"

echo.
echo [INFO] Attente du demarrage...
timeout /t 15 /nobreak >nul

echo.
echo [INFO] Verification de l'etat...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose ps"

echo.
echo ==========================================
echo   Rebuild complet termine!
echo ==========================================
echo.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo.
pause
