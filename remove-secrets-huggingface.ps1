# Script pour retirer les secrets Hugging Face des fichiers de documentation
# 18 Avril 2026

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Nettoyage des secrets Hugging Face                            " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    "Doc backend huggings face/00_MISSION_ACCOMPLIE.txt",
    "Doc backend huggings face/COMMANDES_RAPIDES.txt"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Nettoyage de $file..." -ForegroundColor Yellow
        
        # Lire le contenu
        $content = Get-Content $file -Raw
        
        # Remplacer les tokens par des placeholders
        $content = $content -replace 'hf_[a-zA-Z0-9]{37}', '[VOTRE_TOKEN_HUGGINGFACE]'
        
        # Sauvegarder
        Set-Content -Path $file -Value $content -NoNewline
        
        Write-Host "  OK" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  Nettoyage termine                                              " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit --amend --no-edit" -ForegroundColor White
Write-Host "3. git push origin master --force" -ForegroundColor White
Write-Host ""
