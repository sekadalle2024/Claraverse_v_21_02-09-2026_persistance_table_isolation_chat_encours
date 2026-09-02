# Script de Push ClaraVerse V21 - Version Simplifiée
# 02 Septembre 2026

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V21 vers GitHub - Commits Multiples           " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = "https://github.com/sekadalle2024/Claraverse_v_21_02-09-2026_persistance_table_isolation_chat_encours"
$branche = "main"

# Fonction push avec retry
function PushWithRetry {
    param([string]$msg)
    
    for ($i = 1; $i -le 3; $i++) {
        Write-Host "  Tentative $i/3..." -ForegroundColor Gray
        git push origin $branche 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Push reussi!" -ForegroundColor Green
            return $true
        }
        
        if ($i -lt 3) {
            Write-Host "  Erreur, retry dans 10s..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
    
    Write-Host "  ❌ Push echoue" -ForegroundColor Red
    return $false
}

# Configuration
Write-Host "Configuration Git..." -ForegroundColor Yellow
git config core.compression 0
git config http.postBuffer 1048576000
git config http.lowSpeedTime 999999
git config http.lowSpeedLimit 0
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"

# Remote
Write-Host "Configuration repository..." -ForegroundColor Yellow
git remote set-url origin $repoUrl 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $repoUrl
}

# Branche
$currentBranch = git branch --show-current
if ($currentBranch -ne $branche) {
    Write-Host "Changement vers branche $branche..." -ForegroundColor Yellow
    git checkout -b $branche 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branche 2>&1 | Out-Null
    }
}

Write-Host ""
Write-Host "Debut du push en 6 parties..." -ForegroundColor Cyan
Write-Host ""

# Partie 1
Write-Host "Partie 1/6: Code Source..." -ForegroundColor Cyan
git add src/ 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 1: Code Source" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Code Source")) { exit 1 }
}

# Partie 2
Write-Host ""
Write-Host "Partie 2/6: Backend..." -ForegroundColor Cyan
git add py_backend/ 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 2: Backend" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Backend")) { exit 1 }
}

# Partie 3
Write-Host ""
Write-Host "Partie 3/6: Public..." -ForegroundColor Cyan
git add public/ 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 3: Public" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Public")) { exit 1 }
}

# Partie 4
Write-Host ""
Write-Host "Partie 4/6: Documentation principale..." -ForegroundColor Cyan
git add "Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/" "Doc papier de travail javascript/" "Doc Systeme persistance chat/" 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 4: Documentation principale" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Documentation")) { exit 1 }
}

# Partie 5
Write-Host ""
Write-Host "Partie 5/6: Documentations diverses..." -ForegroundColor Cyan
git add *.md *.txt "Doc_Github_Issue/" "Doc Koyeb deploy/" "Doc backend github/" "deploiement-netlify/" "Doc cross ref documentaire menu/" "Doc_Heatmap_Risque/" "Doc_AIONUI/" 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 5: Docs diverses" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Docs diverses")) { exit 1 }
}

# Partie 6
Write-Host ""
Write-Host "Partie 6/6: Configuration et restants..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
$result = git commit -m "V21 - Partie 6: Configuration" 2>&1
if ($result -notmatch "nothing to commit") {
    if (-not (PushWithRetry "Configuration")) { exit 1 }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "           ✅ PUSH TERMINE AVEC SUCCES                           " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
Write-Host ""
git status
