# Script de push fragmenté ClaraVerse V16 (Définitif)
# Date: 01 Mai 2026
# Repository: https://github.com/sekadalle2024/Claverse_windows__v_16_01-05-2026_V5_docker_zeabur_ok_switch_editeur-.git

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Push ClaraVerse V16 en Commits Multiples (Chunk Strategy)       " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Configuration
$repoUrl = "https://github.com/sekadalle2024/Claverse_windows__v_16_01-05-2026_V5_docker_zeabur_ok_switch_editeur-.git"
$branche = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branche)) { $branche = "master" }
$commitPrefix = "Sauvegarde ClaraVerse V16 - 01 Mai 2026"

# Configuration Git optimale
git config core.compression 0
git config http.postBuffer 1048576000

# Vérifier le remote
git remote set-url origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) { git remote add origin $repoUrl }

# Fonction pour push avec retry
function Push-WithRetry {
    param([string]$chunkName)
    for ($i = 1; $i -le 3; $i++) {
        Write-Host "  Push [$chunkName] tentative $i/3..." -ForegroundColor Gray
        git push origin $branche
        if ($LASTEXITCODE -eq 0) { return $true }
        Start-Sleep -Seconds 5
    }
    return $false
}

Write-Host "Debut du push par chunks..." -ForegroundColor Cyan

# Chunks
$chunks = @(
    @{ Name = "src"; Path = "src/" },
    @{ Name = "py_backend"; Path = "py_backend/" },
    @{ Name = "Docs Dossiers"; Path = '"Doc menu demarrer/" "Doc export rapport/" "Doc_Lead_Balance/" "Doc_Etat_Fin/"' },
    @{ Name = "Docs Fichiers"; Path = "*.md *.txt Doc_Github_Issue/ 'Doc backend github/'" },
    @{ Name = "Reste"; Path = "." }
)

foreach ($chunk in $chunks) {
    Write-Host "`nChunk: $($chunk.Name)..." -ForegroundColor Yellow
    Invoke-Expression "git add $($chunk.Path) 2>`$null"
    git commit -m "$commitPrefix - $($chunk.Name)"
    if ($LASTEXITCODE -eq 0) {
        if (-not (Push-WithRetry $chunk.Name)) { exit 1 }
    } else {
        Write-Host "  Rien a commiter." -ForegroundColor Gray
    }
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "           SAUVEGARDE V16 TERMINEE AVEC SUCCES                   " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
