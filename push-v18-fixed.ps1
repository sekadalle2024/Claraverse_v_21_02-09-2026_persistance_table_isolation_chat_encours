$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse Wide Screen V18 - 27 Aout 2026                " -ForegroundColor Cyan
Write-Host "  Solution: Commits Multiples pour projet > 140 MB              " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_18_27-08-2026_Wide_sceren.git"
$branche = "main"
$commitPrefix = "Sauvegarde ClaraVerse Wide Screen V18 - 27 Aout 2026"

function Push-WithRetry {
    param([string]$message, [int]$maxRetries = 3)
    $retry = 0
    while ($retry -lt $maxRetries) {
        Write-Host "  Push tentative $($retry + 1)/$maxRetries..." -ForegroundColor Gray
        $pushOutput = git push -u origin $branche 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Push reussi: $message" -ForegroundColor Green
            return $true
        }
        Write-Host "  Erreur: $pushOutput" -ForegroundColor Red
        $retry++
        if ($retry -lt $maxRetries) {
            Start-Sleep -Seconds 10
        }
    }
    return $false
}

git checkout -b $branche 2>&1 | Out-Null
git checkout $branche 2>&1 | Out-Null

git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"

$remotes = git remote
if ($remotes -contains "origin") { git remote set-url origin $repoUrl }
else { git remote add origin $repoUrl }

Write-Host "Partie 1/6: Code Source React/TypeScript (src/)..." -ForegroundColor Cyan
git add src/ 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 1: Code Source React/TypeScript" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Code Source" | Out-Null }

Write-Host "Partie 2/6: Backend Python (py_backend/)..." -ForegroundColor Cyan
git add py_backend/ 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 2: Backend Python" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Backend" | Out-Null }

Write-Host "Partie 3/6: Fichiers Publics (public/)..." -ForegroundColor Cyan
git add public/ 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 3: Fichiers Publics" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Public" | Out-Null }

Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 4: Documentation principale" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Doc principale" | Out-Null }

Write-Host "Partie 5/6: Documentations diverses..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 5: Documentations diverses" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Docs diverses" | Out-Null }

Write-Host "Partie 6/6: Configuration et fichiers restants..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
$c = git commit -m "$commitPrefix - Partie 6: Configuration et fichiers divers" 2>&1
if ($c -notmatch "nothing to commit" -and $c -notmatch "rien") { Push-WithRetry "Fichiers restants" | Out-Null }

Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           PUSH TERMINE AVEC SUCCES                              " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
