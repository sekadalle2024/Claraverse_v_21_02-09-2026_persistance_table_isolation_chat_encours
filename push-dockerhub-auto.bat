@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     PUSH AUTOMATIQUE VERS DOCKER HUB - E-AUDIT            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Configuration
set DOCKER_USERNAME=sekadalle
set DOCKER_TOKEN=[VOTRE_TOKEN_DOCKER_HUB]
set DOCKER_REPO=mes_images_docker

echo [1/4] Connexion à Docker Hub...
echo %DOCKER_TOKEN% | docker login -u %DOCKER_USERNAME% --password-stdin
if errorlevel 1 (
    echo ❌ ERREUR: Échec de la connexion
    pause
    exit /b 1
)
echo ✓ Connecté avec succès
echo.

echo [2/4] Construction des images...
echo.
echo    → Frontend...
docker build -f Dockerfile.frontend -t e-audit-frontend:latest . >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Échec build frontend
    docker build -f Dockerfile.frontend -t e-audit-frontend:latest .
    pause
    exit /b 1
)
echo    ✓ Frontend construit

echo    → Backend...
docker build -f Dockerfile.backend -t e-audit-backend:latest . >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Échec build backend
    docker build -f Dockerfile.backend -t e-audit-backend:latest .
    pause
    exit /b 1
)
echo    ✓ Backend construit
echo.

echo [3/4] Tag des images...
docker tag e-audit-frontend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
docker tag e-audit-backend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
docker tag e-audit-frontend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-latest
echo ✓ Images taguées
echo.

echo [4/4] Push vers Docker Hub...
echo.
echo    → Frontend...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
if errorlevel 1 (
    echo ❌ ERREUR: Échec push frontend
    pause
    exit /b 1
)
echo    ✓ Frontend poussé

echo    → Backend...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
if errorlevel 1 (
    echo ❌ ERREUR: Échec push backend
    pause
    exit /b 1
)
echo    ✓ Backend poussé

echo    → Latest...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-latest
if errorlevel 1 (
    echo ❌ ERREUR: Échec push latest
    pause
    exit /b 1
)
echo    ✓ Latest poussé
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✓ SUCCÈS COMPLET !                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Images disponibles sur Docker Hub:
echo   • %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
echo   • %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
echo   • %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-latest
echo.
echo Pour les utiliser ailleurs:
echo   docker pull %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
echo   docker pull %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
echo.
pause
