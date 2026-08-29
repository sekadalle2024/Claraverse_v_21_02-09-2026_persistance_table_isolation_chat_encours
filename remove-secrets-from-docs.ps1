# Script pour supprimer les secrets des fichiers de documentation
Write-Host "Suppression des secrets des fichiers de documentation..." -ForegroundColor Yellow

$files = @(
    "Doc cross ref documentaire menu/00_COMMENCER_ICI_WORKFLOW_HTTP_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_GUIDE_CREATION_MANUELLE_N8N_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_SOLUTION_PYTHON_NATIF_N8N_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_WORKFLOW_CORRIGE_V2_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_WORKFLOW_PYTHON_NATIF_PRET_12_AVRIL_2026.txt"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Traitement de $file..." -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        
        # Remplacer les OAuth Client ID et Secret par des placeholders
        $content = $content -replace '(\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com)', '[VOTRE_GOOGLE_CLIENT_ID]'
        $content = $content -replace '(GOCSPX-[a-zA-Z0-9_-]{28})', '[VOTRE_GOOGLE_CLIENT_SECRET]'
        
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✓ $file nettoyé" -ForegroundColor Green
    }
}

Write-Host "`nNettoyage termine!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant faire:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit --amend --no-edit" -ForegroundColor White
Write-Host "  git push -u origin master" -ForegroundColor White
