# Script PowerShell pour pousser la correction Rust Render
# Date: 17 Avril 2026
# Objectif: Pousser runtime.txt et requirements_render.txt modifié

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║     🚀 PUSH CORRECTION RUST RENDER - 17 AVRIL 2026       ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
$currentDir = Get-Location
Write-Host "📁 Dossier actuel: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Se positionner dans py_backend
Write-Host "📂 Changement vers py_backend..." -ForegroundColor Yellow
Set-Location py_backend

# Vérifier que les fichiers existent
Write-Host ""
Write-Host "🔍 Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$files = @("runtime.txt", "requirements_render.txt")
$allExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file manquant!" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "❌ Fichiers manquants! Arrêt du script." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Afficher le contenu de runtime.txt
Write-Host "📄 Contenu de runtime.txt:" -ForegroundColor Yellow
Get-Content runtime.txt
Write-Host ""

# Afficher les versions pydantic dans requirements_render.txt
Write-Host "📄 Versions pydantic dans requirements_render.txt:" -ForegroundColor Yellow
Get-Content requirements_render.txt | Select-String "pydantic"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Demander confirmation
Write-Host "⚠️  Voulez-vous pousser ces modifications sur GitHub?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Fichiers à pousser:" -ForegroundColor White
Write-Host "  • runtime.txt (nouveau)" -ForegroundColor White
Write-Host "  • requirements_render.txt (modifié)" -ForegroundColor White
Write-Host ""
$confirmation = Read-Host "Continuer? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée." -ForegroundColor Red
    Set-Location ..
    exit 0
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Git add
Write-Host "📦 Ajout des fichiers à git..." -ForegroundColor Yellow
git add runtime.txt requirements_render.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors de git add" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "  ✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Git commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
git commit -m "Fix: Force Python 3.11 and use pre-compiled pydantic wheels for Render" -m "Add runtime.txt to force Python 3.11.9 (stable version with pre-compiled wheels)" -m "Downgrade pydantic to 2.6.4 and pydantic-core to 2.16.3 (wheels available)" -m "Fixes Rust compilation error on Render (read-only filesystem)" -m "No code changes required, 100% compatible"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors de git commit" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "  ✅ Commit créé" -ForegroundColor Green
Write-Host ""

# Git push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors de git push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez manuellement:" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor White
    Set-Location ..
    exit 1
}

Write-Host "  ✅ Push réussi!" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 SUCCÈS!" -ForegroundColor Green
Write-Host ""
Write-Host "Les modifications ont été poussées sur GitHub:" -ForegroundColor White
Write-Host "  ✅ runtime.txt (Python 3.11.9)" -ForegroundColor Green
Write-Host "  ✅ requirements_render.txt (pydantic 2.6.4)" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 PROCHAINES ÉTAPES" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vérifier sur GitHub:" -ForegroundColor White
Write-Host "   https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Render va redéployer automatiquement (5-10 min)" -ForegroundColor White
Write-Host "   Ou redéployer manuellement:" -ForegroundColor White
Write-Host "   https://dashboard.render.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Vérifier les logs Render:" -ForegroundColor White
Write-Host "   Vous devriez voir:" -ForegroundColor White
Write-Host "   • Using Python version 3.11.9" -ForegroundColor Green
Write-Host "   • Successfully installed pydantic-2.6.4" -ForegroundColor Green
Write-Host "   • Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Retour au dossier parent
Set-Location ..

Write-Host "✅ Script terminé avec succès!" -ForegroundColor Green
Write-Host ""
