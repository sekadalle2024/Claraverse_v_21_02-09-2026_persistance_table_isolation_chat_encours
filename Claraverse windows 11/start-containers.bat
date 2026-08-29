@echo off
REM Script Windows pour démarrer les conteneurs E-audit

echo ==========================================
echo   Demarrage E-audit (Claraverse)
echo ==========================================
echo.

echo [INFO] Demarrage des conteneurs Docker...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose up -d"

echo.
echo [INFO] Attente du demarrage des services...
timeout /t 15 /nobreak >nul

echo.
echo [INFO] Verification de l'etat...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose ps"

echo.
echo ==========================================
echo   E-audit est demarre!
echo ==========================================
echo.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo.
echo Pour voir les logs: wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose logs -f"
echo Pour arreter:      wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose down"
echo.
pause
