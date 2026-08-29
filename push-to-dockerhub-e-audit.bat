@echo off
echo ========================================
echo Push E-Audit vers Docker Hub
echo ========================================
echo.

REM Configuration
set DOCKER_USERNAME=sekadalle
set DOCKER_REPO=mes_images_docker
set IMAGE_TAG=e-audit-latest

echo Etape 1: Connexion a Docker Hub...
echo Username: %DOCKER_USERNAME%
echo.
echo Utilisation du token d'acces automatique...
type docker-token.txt | docker login -u %DOCKER_USERNAME% --password-stdin
if errorlevel 1 (
    echo ERREUR: Echec de la connexion a Docker Hub
    echo Verifiez que le fichier docker-token.txt existe
    pause
    exit /b 1
)

echo.
echo Etape 2: Construction des images Docker...
echo.

REM Build Frontend
echo Construction de l'image Frontend...
docker build -f Dockerfile.frontend -t e-audit-frontend:latest .
if errorlevel 1 (
    echo ERREUR: Echec de la construction du frontend
    pause
    exit /b 1
)

REM Build Backend
echo Construction de l'image Backend...
docker build -f Dockerfile.backend -t e-audit-backend:latest .
if errorlevel 1 (
    echo ERREUR: Echec de la construction du backend
    pause
    exit /b 1
)

echo.
echo Etape 3: Tag des images pour Docker Hub...
echo.

REM Tag Frontend
docker tag e-audit-frontend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
if errorlevel 1 (
    echo ERREUR: Echec du tag frontend
    pause
    exit /b 1
)

REM Tag Backend
docker tag e-audit-backend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
if errorlevel 1 (
    echo ERREUR: Echec du tag backend
    pause
    exit /b 1
)

REM Tag avec version latest
docker tag e-audit-frontend:latest %DOCKER_USERNAME%/%DOCKER_REPO%:%IMAGE_TAG%
if errorlevel 1 (
    echo ERREUR: Echec du tag latest
    pause
    exit /b 1
)

echo.
echo Etape 4: Push des images vers Docker Hub...
echo.

REM Push Frontend
echo Push de l'image Frontend...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
if errorlevel 1 (
    echo ERREUR: Echec du push frontend
    pause
    exit /b 1
)

REM Push Backend
echo Push de l'image Backend...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
if errorlevel 1 (
    echo ERREUR: Echec du push backend
    pause
    exit /b 1
)

REM Push Latest
echo Push de l'image Latest...
docker push %DOCKER_USERNAME%/%DOCKER_REPO%:%IMAGE_TAG%
if errorlevel 1 (
    echo ERREUR: Echec du push latest
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCES! Images poussees vers Docker Hub
echo ========================================
echo.
echo Images disponibles:
echo - %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
echo - %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
echo - %DOCKER_USERNAME%/%DOCKER_REPO%:%IMAGE_TAG%
echo.
echo Pour les utiliser:
echo docker pull %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-frontend
echo docker pull %DOCKER_USERNAME%/%DOCKER_REPO%:e-audit-backend
echo.
pause
