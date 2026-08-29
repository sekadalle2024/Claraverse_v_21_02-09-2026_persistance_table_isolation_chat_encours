# ========================================
# SCRIPT SAUVEGARDE CLARAVERSE V18 GITHUB
# Date: 27 Aout 2026
# ========================================

$ErrorActionPreference = "Stop"

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_18_27-08-2026_Wide_sceren.git"
$maxRetries = 3
$timeoutMinutes = 15

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE CLARAVERSE V18 SUR GITHUB" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verification repo Git
if (-not (Test-Path ".git")) {
    Write-Host "[ERREUR] Pas de dépôt Git. Initialisation..." -ForegroundColor Red
    git init
    git remote add origin $repoUrl
    Write-Host "[OK] Dépôt Git initialisé" -ForegroundColor Green
}

# Configuration Git optimale
Write-Host "[CONFIG] Optimisation Git pour gros projet..." -ForegroundColor Cyan
git config http.postBuffer 524288000
git config http.lowSpeedLimit 1000
git config http.lowSpeedTime 60
git config pack.windowMemory 256m
git config pack.packSizeLimit 256m
git config core.compression 0
Write-Host "[OK] Configuration Git optimisée" -ForegroundColor Green
Write-Host ""

# Fonction push avec retry
function Push-WithRetry {
    param($message, $retry = 1)
    
    $success = $false
    $attempt = 0
    
    while (-not $success -and $attempt -lt $maxRetries) {
        $attempt++
        Write-Host ""
        Write-Host "[$retry/6] Tentative $attempt/$maxRetries - $message" -ForegroundColor Yellow
        
        try {
            git push -u origin main --timeout=$($timeoutMinutes * 60)
            $success = $true
            Write-Host "[OK] Push réussi!" -ForegroundColor Green
        }
        catch {
            Write-Host "[ERREUR] Echec tentative $attempt" -ForegroundColor Red
            if ($attempt -lt $maxRetries) {
                Write-Host "Nouvelle tentative dans 5 secondes..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
    
    return $success
}

# PARTIE 1: Code React/TypeScript (src/)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 1/6: CODE REACT/TYPESCRIPT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add src/
git add public/clara*.* public/menu*.* public/*Auto*.* public/*Accordion*.* public/ExportLiasseHandler.js public/EditeurAutoTrigger.js
git commit -m "Sauvegarde V18 - Partie 1/6: Code React et fichiers Clara (27 aout 2026)"

if (-not (Push-WithRetry "Code React/TypeScript" 1)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 1" -ForegroundColor Red
    exit 1
}

# PARTIE 2: Backend Python (py_backend/)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 2/6: BACKEND PYTHON" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add py_backend/ -f
git commit -m "Sauvegarde V18 - Partie 2/6: Backend Python complet (27 aout 2026)"

if (-not (Push-WithRetry "Backend Python" 2)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 2" -ForegroundColor Red
    exit 1
}

# PARTIE 3: Fichiers publics restants
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 3/6: FICHIERS PUBLICS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add public/
git commit -m "Sauvegarde V18 - Partie 3/6: Fichiers publics (27 aout 2026)"

if (-not (Push-WithRetry "Fichiers publics" 3)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 3" -ForegroundColor Red
    exit 1
}

# PARTIE 4: Documentation principale
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 4/6: DOCUMENTATION PRINCIPALE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add "Doc backend github/" "Doc backend switch/" "Doc_Etat_Fin/" "Doc_Lead_Balance/" "Doc menu demarrer/" -f
git commit -m "Sauvegarde V18 - Partie 4/6: Documentation principale (27 aout 2026)"

if (-not (Push-WithRetry "Documentation principale" 4)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 4" -ForegroundColor Red
    exit 1
}

# PARTIE 5: Autres docs et markdown
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 5/6: AUTRES DOCS + MARKDOWN" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add "Doc*/" "Manuel E-audit/" *.md -f
git commit -m "Sauvegarde V18 - Partie 5/6: Autres docs et markdown (27 aout 2026)"

if (-not (Push-WithRetry "Autres docs et markdown" 5)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 5" -ForegroundColor Red
    exit 1
}

# PARTIE 6: Configuration et reste
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PARTIE 6/6: CONFIGURATION + RESTE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

git add .
git commit -m "Sauvegarde V18 - Partie 6/6: Configuration et fichiers restants (27 aout 2026)"

if (-not (Push-WithRetry "Configuration et reste" 6)) {
    Write-Host "[ERREUR] Impossible de pousser Partie 6" -ForegroundColor Red
    exit 1
}

# Succès final
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  SUCCES: SAUVEGARDE COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository GitHub:" -ForegroundColor Cyan
Write-Host "   $repoUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "[OK] Tous vos fichiers sont sauvegardes sur GitHub!" -ForegroundColor Green
Write-Host ""
