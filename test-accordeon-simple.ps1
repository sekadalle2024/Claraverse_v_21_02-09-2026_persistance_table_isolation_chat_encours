# Test simple CSS accordeons
Write-Host "Test CSS Accordeons" -ForegroundColor Cyan

# Test 1: Verifier le fichier
$file = "py_backend/etats_financiers_v2.py"
$content = Get-Content $file -Raw

if ($content -match "\.section-header-ef") {
    Write-Host "OK: CSS accordeon present" -ForegroundColor Green
} else {
    Write-Host "ERREUR: CSS accordeon manquant" -ForegroundColor Red
}

# Test 2: Import Python
Write-Host "Test import Python..." -ForegroundColor Yellow
& conda run -n claraverse_backend python -c "import sys; sys.path.insert(0, 'py_backend'); from etats_financiers_v2 import generate_css_liasse; css = generate_css_liasse(); assert '.section-header-ef' in css; print('OK: CSS correct')"
