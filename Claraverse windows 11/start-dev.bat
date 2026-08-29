@echo off
echo ========================================
echo   Demarrage E-AUDIT (Frontend + Backend)
echo ========================================
echo.

:: Verifier si Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

:: Installer les dependances Python si necessaire
echo [1/3] Verification des dependances Python...
cd py_backend
pip install -q pandas numpy fastapi uvicorn pydantic PyPDF2 python-dotenv python-multipart beautifulsoup4 python-docx 2>nul
cd ..

:: Demarrer le backend Python en arriere-plan
echo [2/3] Demarrage du backend Python (port 5000)...
start "Backend Python E-AUDIT" cmd /c "cd py_backend && python main.py"

:: Attendre 3 secondes que le backend demarre (compatible Windows)
ping -n 4 127.0.0.1 >nul 2>&1

:: Demarrer le frontend
echo [3/3] Demarrage du frontend Vite...
echo.
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend : http://localhost:5000
echo ========================================
echo.

npm run dev
