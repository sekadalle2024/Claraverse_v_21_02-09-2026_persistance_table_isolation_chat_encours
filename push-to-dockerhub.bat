@echo off
REM Script Windows pour publier les images E-audit sur Docker Hub
REM Compte: sekadalle

echo ==========================================
echo   Publication sur Docker Hub
echo   Compte: sekadalle
echo ==========================================
echo.

echo [INFO] Connexion a Docker Hub...
echo [INFO] Utilisez votre Personal Access Token comme mot de passe
echo [INFO] Token: [VOTRE_TOKEN_DOCKER_HUB]
echo.

REM Connexion à Docker Hub
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker login -u sekadalle"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Echec de la connexion a Docker Hub
    pause
    exit /b 1
)

echo.
echo [INFO] Tag des images...

REM Tag Frontend
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker tag claraverse-vfirebase-frontend sekadalle/e-audit:frontend-1.0.0"
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker tag claraverse-vfirebase-frontend sekadalle/e-audit:frontend-latest"

REM Tag Backend
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker tag claraverse-vfirebase-backend sekadalle/e-audit:backend-1.0.0"
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker tag claraverse-vfirebase-backend sekadalle/e-audit:backend-latest"

echo [INFO] Images taguees avec succes
echo.
echo [INFO] Publication des images sur Docker Hub...
echo [INFO] Cela peut prendre 5-10 minutes...
echo.

REM Push Frontend
echo [INFO] Push frontend:1.0.0...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker push sekadalle/e-audit:frontend-1.0.0"

echo [INFO] Push frontend:latest...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker push sekadalle/e-audit:frontend-latest"

REM Push Backend
echo [INFO] Push backend:1.0.0...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker push sekadalle/e-audit:backend-1.0.0"

echo [INFO] Push backend:latest...
wsl bash -c "cd /mnt/d/ClaraVerse-v\ firebase && docker push sekadalle/e-audit:backend-latest"

echo.
echo ==========================================
echo   Publication terminee!
echo ==========================================
echo.
echo Images publiees sur Docker Hub:
echo.
echo   Frontend:
echo     - sekadalle/e-audit:frontend-1.0.0
echo     - sekadalle/e-audit:frontend-latest
echo.
echo   Backend:
echo     - sekadalle/e-audit:backend-1.0.0
echo     - sekadalle/e-audit:backend-latest
echo.
echo Voir sur Docker Hub:
echo   https://hub.docker.com/r/sekadalle/e-audit
echo.
pause
