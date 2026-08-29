@echo off
echo.
echo ================================================================
echo          DEMARRAGE COMPLET - CLARAVERSE
echo          Frontend + Backend
echo ================================================================
echo.

if not exist "venv_claraverse\Scripts\activate.bat" (
    echo Environnement virtuel non trouve!
    echo.
    echo Veuillez d'abord creer l'environnement avec:
    echo   python -m venv venv_claraverse
    echo   venv_claraverse\Scripts\activate.bat
    echo   cd py_backend
    echo   pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo Activation de l'environnement virtuel Python...
call venv_claraverse\Scripts\activate.bat

echo Demarrage des serveurs...
echo.
echo Frontend : http://localhost:5173
echo Backend  : http://localhost:8000
echo API Docs : http://localhost:8000/docs
echo.
echo Pour arreter les serveurs, appuyez sur Ctrl+C
echo.
echo ================================================================
echo.

npm run dev:full
