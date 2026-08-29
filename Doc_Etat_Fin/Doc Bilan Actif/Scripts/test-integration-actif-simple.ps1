# Test Integration Frontend ACTIF (BRUT, AMORT, NET)
# Date: 07 Avril 2026

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST INTEGRATION FRONTEND - ACTIF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verification des fichiers
Write-Host "Verification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$fichiers = @(
    "public/menu.js",
    "py_backend/etats_financiers.py",
    "py_backend/calculer_actif_brut_amort.py"
)

$ok = $true
foreach ($f in $fichiers) {
    if (Test-Path $f) {
        Write-Host "  OK: $f" -ForegroundColor Green
    } else {
        Write-Host "  MANQUANT: $f" -ForegroundColor Red
        $ok = $false
    }
}

Write-Host ""

if (-not $ok) {
    Write-Host "ERREUR: Fichiers manquants" -ForegroundColor Red
    exit 1
}

# Verification du contenu
Write-Host "Verification du contenu..." -ForegroundColor Yellow
Write-Host ""

$menuContent = Get-Content "public/menu.js" -Raw
$backendContent = Get-Content "py_backend/etats_financiers.py" -Raw

# Backend
if ($backendContent -match "enrichir_actif_avec_brut_amort") {
    Write-Host "  OK: Backend utilise enrichir_actif_avec_brut_amort" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Backend n'utilise pas enrichir_actif_avec_brut_amort" -ForegroundColor Red
}

if ($backendContent -match "'actif_html': actif_enrichi\['html'\]") {
    Write-Host "  OK: Backend retourne actif_html" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Backend ne retourne pas actif_html" -ForegroundColor Red
}

# Frontend
if ($menuContent -match "if \(result\.html\)") {
    Write-Host "  OK: Frontend detecte result.html" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Frontend ne detecte pas result.html" -ForegroundColor Red
}

if ($menuContent -match "container\.innerHTML = result\.html") {
    Write-Host "  OK: Frontend utilise result.html" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Frontend n'utilise pas result.html" -ForegroundColor Red
}

if ($menuContent -match "\.section-header-ef") {
    Write-Host "  OK: Frontend gere les accordeons backend" -ForegroundColor Green
} else {
    Write-Host "  ERREUR: Frontend ne gere pas les accordeons backend" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS TEST MANUEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Demarrer le backend:" -ForegroundColor Yellow
Write-Host "   cd py_backend" -ForegroundColor White
Write-Host "   conda activate claraverse_backend" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor White
Write-Host ""

Write-Host "2. Demarrer le frontend:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "3. Dans le navigateur:" -ForegroundColor Yellow
Write-Host "   - Envoyer: Etat fin" -ForegroundColor White
Write-Host "   - Uploader: P000 -BALANCE DEMO N_N-1_N-2.xls" -ForegroundColor White
Write-Host ""

Write-Host "4. Verifier:" -ForegroundColor Yellow
Write-Host "   - 7 colonnes dans BILAN ACTIF" -ForegroundColor White
Write-Host "   - Colonnes BRUT et AMORT renseignees" -ForegroundColor White
Write-Host "   - NET = BRUT - AMORT" -ForegroundColor White
Write-Host ""

Write-Host "5. Console navigateur (F12):" -ForegroundColor Yellow
Write-Host "   - Chercher: Utilisation du HTML genere par le backend" -ForegroundColor White
Write-Host "   - Chercher: Accordeons actives" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification terminee" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
