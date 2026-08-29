# ========================================
#  PUSH RUNTIME.TXT VERS GITHUB BACKEND
#  17 AVRIL 2026 - FIX IMMEDIAT
# ========================================

Write-Host ""
Write-Host "========================================"
Write-Host "  PUSH RUNTIME.TXT - FIX IMMEDIAT"
Write-Host "========================================"
Write-Host ""

# 1. Navigation vers py_backend
Write-Host "1. Navigation vers py_backend/..."
Set-Location -Path "py_backend"

if (Test-Path "runtime.txt") {
    Write-Host "   OK runtime.txt trouve" -ForegroundColor Green
    $runtimeContent = Get-Content "runtime.txt"
    Write-Host "   Contenu: $runtimeContent" -ForegroundColor Cyan
} else {
    Write-Host "   ERREUR: runtime.txt non trouve!" -ForegroundColor Red
    exit 1
}

if (Test-Path "requirements_render.txt") {
    Write-Host "   OK requirements_render.txt trouve" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: requirements_render.txt non trouve!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verification du repository Git
Write-Host "2. Verification du repository Git..."
$remoteUrl = git remote get-url origin
Write-Host "   Repository: $remoteUrl" -ForegroundColor Cyan

if ($remoteUrl -notlike "*Back-end-python*") {
    Write-Host "   ERREUR: Mauvais repository!" -ForegroundColor Red
    Write-Host "   Attendu: Back-end-python-V0_03_03_2026" -ForegroundColor Yellow
    Write-Host "   Trouve: $remoteUrl" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 3. Statut Git
Write-Host "3. Statut Git..."
git status --short

Write-Host ""

# 4. Ajout des fichiers
Write-Host "4. Ajout des fichiers a Git..."
git add runtime.txt
git add requirements_render.txt
Write-Host "   OK Fichiers ajoutes" -ForegroundColor Green

Write-Host ""

# 5. Verification des fichiers staged
Write-Host "5. Verification des fichiers staged..."
$stagedFiles = git diff --cached --name-only
Write-Host "   Fichiers staged:" -ForegroundColor Cyan
$stagedFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Cyan }

Write-Host ""

# 6. Creation du commit
Write-Host "6. Creation du commit..."
$commitMessage = "Fix: Ajout runtime.txt et requirements_render.txt pour Python 3.11.9"
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Commit cree" -ForegroundColor Green
} else {
    Write-Host "   Note: Aucun changement a commiter ou erreur" -ForegroundColor Yellow
}

Write-Host ""

# 7. Push vers GitHub
Write-Host "7. Push vers GitHub..."
$branch = git branch --show-current
Write-Host "   Branche: $branch" -ForegroundColor Cyan

git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  OK PUSH REUSSI!"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "PROCHAINES ETAPES:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. VERIFIER SUR GITHUB (2 MIN)"
    Write-Host "   URL: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026"
    Write-Host ""
    Write-Host "   Verifier que ces fichiers sont A LA RACINE:"
    Write-Host "   - runtime.txt"
    Write-Host "   - requirements_render.txt"
    Write-Host ""
    Write-Host "2. ATTENDRE RENDER (5-10 MIN)"
    Write-Host "   Dashboard: https://dashboard.render.com/"
    Write-Host ""
    Write-Host "3. VERIFIER LES LOGS RENDER"
    Write-Host "   Doit afficher:"
    Write-Host "   - Using Python version 3.11.9"
    Write-Host "   - Successfully installed pydantic-2.6.4"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  ERREUR LORS DU PUSH"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Verifier:" -ForegroundColor Yellow
    Write-Host "- Connexion internet"
    Write-Host "- Authentification GitHub"
    Write-Host "- Permissions sur le repository"
    Write-Host ""
}

# Retour au repertoire racine
Set-Location -Path ".."

Write-Host ""
Write-Host "Script termine."
Write-Host ""
