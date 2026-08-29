@echo off
REM Script Windows pour mettre à jour les conteneurs E-audit après modification du code

echo ==========================================
echo   Mise a jour E-audit (Claraverse)
echo ==========================================
echo.

echo [INFO] Arret des conteneurs...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose down"

echo.
echo [INFO] Rebuild des images Docker...
echo [INFO] Cela peut prendre 5-10 minutes...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose build"

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
echo   Mise a jour terminee!
echo ==========================================
echo.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo.
echo Pour voir les logs: wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker compose logs -f"
echo.
pause
