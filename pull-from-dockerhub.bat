@echo off
REM Script Windows pour récupérer les images E-audit depuis Docker Hub
REM Compte: sekadalle

echo ==========================================
echo   Pull depuis Docker Hub - E-audit
echo   Compte: sekadalle
echo ==========================================
echo.

echo [INFO] Demarrage de Docker...
wsl bash -c "sudo service docker start"
timeout /t 3 /nobreak >nul

echo.
echo [INFO] Connexion a Docker Hub (optionnel pour images publiques)...
wsl bash -c "docker login -u sekadalle"

echo.
echo ==========================================
echo   Pull Frontend
echo ==========================================
echo.
echo [INFO] Telechargement de l'image frontend...
wsl bash -c "docker pull sekadalle/mes_images_docker:e-audit-frontend"

echo.
echo ==========================================
echo   Pull Backend
echo ==========================================
echo.
echo [INFO] Telechargement de l'image backend...
wsl bash -c "docker pull sekadalle/mes_images_docker:e-audit-backend"

echo.
echo [INFO] Renommage des images pour docker-compose...
wsl bash -c "docker tag sekadalle/mes_images_docker:e-audit-frontend claraverse-vfirebase-frontend"
wsl bash -c "docker tag sekadalle/mes_images_docker:e-audit-backend claraverse-vfirebase-backend"

echo.
echo ==========================================
echo   Pull termine!
echo ==========================================
echo.
echo Images disponibles localement:
wsl bash -c "docker images | grep -E 'claraverse|sekadalle'"
echo.
echo Vous pouvez maintenant demarrer avec: start-containers.bat
echo.
pause
