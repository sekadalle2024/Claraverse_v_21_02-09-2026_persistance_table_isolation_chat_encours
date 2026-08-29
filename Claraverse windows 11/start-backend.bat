@echo off
echo.
echo ================================================================
echo               DEMARRAGE BACKEND - CLARAVERSE
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

echo Demarrage du serveur backend...
echo.
echo URL Backend : http://localhost:8000
echo API Docs    : http://localhost:8000/docs
echo.
echo Pour arreter le serveur, appuyez sur Ctrl+C
echo.
echo ================================================================
echo.

cd py_backend
python main.py
