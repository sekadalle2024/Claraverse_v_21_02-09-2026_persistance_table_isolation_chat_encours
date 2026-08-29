# Script de vérification des fichiers volumineux
# Identifie les fichiers qui pourraient ralentir le déploiement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION FICHIERS VOLUMINEUX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier les fichiers > 10 MB dans src
Write-Host "[1/3] Fichiers de plus de 10 MB dans src..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Path "../src" -Recurse -File | Where-Object { $_.Length -gt 10MB }
if ($largeFiles.Count -eq 0) {
    Write-Host "  OK Aucun fichier de plus de 10 MB" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION Fichiers volumineux detectes:" -ForegroundColor Yellow
    $largeFiles | Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}} | Format-Table -AutoSize
}

# 2. Verifier les fichiers > 5 MB dans public
Write-Host ""
Write-Host "[2/3] Fichiers de plus de 5 MB dans public..." -ForegroundColor Yellow
$mediumFiles = Get-ChildItem -Path "../public" -Recurse -File 2>$null | Where-Object { $_.Length -gt 5MB }
if ($mediumFiles.Count -eq 0) {
    Write-Host "  OK Aucun fichier de plus de 5 MB" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION Fichiers volumineux detectes:" -ForegroundColor Yellow
    $mediumFiles | Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}} | Format-Table -AutoSize
}

# 3. Verifier la taille totale du dossier src
Write-Host ""
Write-Host "[3/3] Taille totale du dossier src..." -ForegroundColor Yellow
$srcSize = (Get-ChildItem -Path "../src" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Taille totale: $([math]::Round($srcSize, 1)) MB" -ForegroundColor Green

# Resume
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Taille du dossier src : $([math]::Round($srcSize, 1)) MB" -ForegroundColor Green
Write-Host "Fichiers de plus de 10 MB : $($largeFiles.Count)" -ForegroundColor Green
Write-Host "Fichiers de plus de 5 MB : $($mediumFiles.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "OK Aucun probleme detecte pour le deploiement" -ForegroundColor Green
