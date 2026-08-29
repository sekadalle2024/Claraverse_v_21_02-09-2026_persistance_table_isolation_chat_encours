# ========================================
#  VERIFIER FICHIERS SUR GITHUB
#  17 AVRIL 2026
# ========================================

Write-Host ""
Write-Host "========================================"
Write-Host "  VERIFICATION FICHIERS GITHUB"
Write-Host "========================================"
Write-Host ""

$owner = "sekadalle2024"
$repo = "Back-end-python-V0_03_03_2026"
$apiUrl = "https://api.github.com/repos/$owner/$repo/contents"

Write-Host "Repository: $repo" -ForegroundColor Cyan
Write-Host "URL API: $apiUrl" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Recuperation de la liste des fichiers..." -ForegroundColor Yellow
    
    # Utiliser Invoke-WebRequest au lieu de curl pour éviter les problèmes
    $webResponse = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
    $response = $webResponse.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "FICHIERS A LA RACINE DU REPOSITORY:" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    
    $runtimeFound = $false
    $requirementsRenderFound = $false
    $mainFound = $false
    
    foreach ($item in $response) {
        $icon = if ($item.type -eq "dir") { "[DIR]" } else { "[FILE]" }
        Write-Host "$icon $($item.name)" -ForegroundColor $(if ($item.type -eq "dir") { "Blue" } else { "White" })
        
        if ($item.name -eq "runtime.txt") { $runtimeFound = $true }
        if ($item.name -eq "requirements_render.txt") { $requirementsRenderFound = $true }
        if ($item.name -eq "main.py") { $mainFound = $true }
    }
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  VERIFICATION DES FICHIERS CLES"
    Write-Host "========================================"
    Write-Host ""
    
    if ($runtimeFound) {
        Write-Host "[OK] runtime.txt PRESENT" -ForegroundColor Green
    } else {
        Write-Host "[MANQUANT] runtime.txt NON TROUVE" -ForegroundColor Red
    }
    
    if ($requirementsRenderFound) {
        Write-Host "[OK] requirements_render.txt PRESENT" -ForegroundColor Green
    } else {
        Write-Host "[MANQUANT] requirements_render.txt NON TROUVE" -ForegroundColor Red
    }
    
    if ($mainFound) {
        Write-Host "[OK] main.py PRESENT" -ForegroundColor Green
    } else {
        Write-Host "[MANQUANT] main.py NON TROUVE" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($runtimeFound -and $requirementsRenderFound -and $mainFound) {
        Write-Host "========================================"
        Write-Host "  TOUS LES FICHIERS SONT PRESENTS!"
        Write-Host "========================================"
        Write-Host ""
        Write-Host "Les fichiers sont bien sur GitHub backend." -ForegroundColor Green
        Write-Host ""
        Write-Host "PROCHAINES ETAPES:" -ForegroundColor Cyan
        Write-Host "1. Aller sur Render: https://dashboard.render.com/" -ForegroundColor White
        Write-Host "2. Verifier les logs de build" -ForegroundColor White
        Write-Host "3. Chercher 'Using Python version 3.11.9'" -ForegroundColor White
    } else {
        Write-Host "========================================"
        Write-Host "  FICHIERS MANQUANTS!"
        Write-Host "========================================"
        Write-Host ""
        Write-Host "Certains fichiers ne sont pas sur GitHub." -ForegroundColor Red
        Write-Host "Executer le script de push:" -ForegroundColor Yellow
        Write-Host ".\Doc` render` deploy\push-runtime-fix-maintenant.ps1" -ForegroundColor White
    }
    
} catch {
    Write-Host "ERREUR lors de la recuperation des fichiers:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION ALTERNATIVE:" -ForegroundColor Yellow
    Write-Host "Ouvrir ce lien dans votre navigateur:" -ForegroundColor White
    Write-Host "https://github.com/$owner/$repo" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Script termine."
Write-Host ""
