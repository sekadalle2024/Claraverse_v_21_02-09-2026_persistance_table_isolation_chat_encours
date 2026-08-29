# Script de comparaison entre la version locale et Netlify
# Identifie les différences

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPARAISON LOCAL vs NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier le build local
Write-Host "[1/4] Vérification du build local..." -ForegroundColor Yellow

if (-not (Test-Path "../dist")) {
    Write-Host "  ✗ Dossier dist non trouvé" -ForegroundColor Red
    Write-Host "  Exécutez d'abord: npm run build" -ForegroundColor Yellow
    exit 1
}

$distSize = (Get-ChildItem -Path "../dist" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Path "../dist" -Recurse -File -ErrorAction SilentlyContinue).Count

Write-Host "  Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor Green
Write-Host "  Fichiers: $fileCount" -ForegroundColor Green

# Étape 2: Lister les fichiers dans dist/
Write-Host ""
Write-Host "[2/4] Fichiers dans dist/..." -ForegroundColor Yellow

$distFiles = Get-ChildItem -Path "../dist" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 20
Write-Host "  Premiers 20 fichiers:" -ForegroundColor Gray
foreach ($file in $distFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").Replace("\", "/")
    Write-Host "    $relativePath" -ForegroundColor Gray
}

# Étape 3: Vérifier les fichiers essentiels
Write-Host ""
Write-Host "[3/4] Vérification des fichiers essentiels..." -ForegroundColor Yellow

$essentialFiles = @(
    "../dist/index.html",
    "../dist/assets",
    "../dist/_headers",
    "../dist/vercel.json"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file manquant" -ForegroundColor Red
    }
}

# Étape 4: Vérifier les variables d'environnement Netlify
Write-Host ""
Write-Host "[4/4] Variables d'environnement Netlify..." -ForegroundColor Yellow

netlify env:list 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Variables d'environnement listées ci-dessus" -ForegroundColor Green
} else {
    Write-Host "  ✗ Impossible de lister les variables" -ForegroundColor Red
    Write-Host "  Authentifiez-vous: netlify login" -ForegroundColor Yellow
}

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build local:" -ForegroundColor Yellow
Write-Host "  Taille: $([math]::Round($distSize, 1)) MB" -ForegroundColor White
Write-Host "  Fichiers: $fileCount" -ForegroundColor White
Write-Host ""
Write-Host "Pour forcer un rebuild complet:" -ForegroundColor Yellow
Write-Host "  .\forcer-rebuild-complet.ps1" -ForegroundColor Cyan
Write-Host ""
