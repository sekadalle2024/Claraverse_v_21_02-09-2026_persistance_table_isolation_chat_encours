# ═══════════════════════════════════════════════════════════
# VERIFICATION FICHIERS GITHUB BACKEND - 17 AVRIL 2026
# ═══════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICATION FICHIERS SUR GITHUB BACKEND" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$repo = "sekadalle2024/Back-end-python-V0_03_03_2026"

Write-Host "Repository: $repo" -ForegroundColor Yellow
Write-Host ""

# ───────────────────────────────────────────────────────────
# 1. VERIFICATION runtime.txt
# ───────────────────────────────────────────────────────────

Write-Host "1. Verification runtime.txt..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/runtime.txt"
    Write-Host "   ✓ runtime.txt EXISTE sur GitHub!" -ForegroundColor Green
    $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    Write-Host "   Contenu: $content" -ForegroundColor Cyan
} catch {
    Write-Host "   ✗ runtime.txt NON TROUVE!" -ForegroundColor Red
}

Write-Host ""

# ───────────────────────────────────────────────────────────
# 2. VERIFICATION requirements_render.txt
# ───────────────────────────────────────────────────────────

Write-Host "2. Verification requirements_render.txt..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/requirements_render.txt"
    Write-Host "   ✓ requirements_render.txt EXISTE sur GitHub!" -ForegroundColor Green
    Write-Host "   Taille: $($response.size) octets" -ForegroundColor Cyan
} catch {
    Write-Host "   ✗ requirements_render.txt NON TROUVE!" -ForegroundColor Red
}

Write-Host ""

# ───────────────────────────────────────────────────────────
# 3. VERIFICATION main.py
# ───────────────────────────────────────────────────────────

Write-Host "3. Verification main.py..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/main.py"
    Write-Host "   ✓ main.py EXISTE sur GitHub!" -ForegroundColor Green
    Write-Host "   Taille: $($response.size) octets" -ForegroundColor Cyan
} catch {
    Write-Host "   ✗ main.py NON TROUVE!" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICATION TERMINEE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "PROCHAINES ETAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifier sur GitHub (avec rafraichissement):" -ForegroundColor White
Write-Host "   https://github.com/$repo" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Rafraichir sans cache: Ctrl + F5" -ForegroundColor White
Write-Host ""
Write-Host "3. Verifier le dashboard Render:" -ForegroundColor White
Write-Host "   https://dashboard.render.com/" -ForegroundColor Cyan
Write-Host ""
