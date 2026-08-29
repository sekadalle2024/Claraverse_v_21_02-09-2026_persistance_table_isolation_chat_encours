# Nettoyage complet des secrets
Write-Host "Nettoyage de tous les secrets..." -ForegroundColor Yellow

$files = @(
    "Doc cross ref documentaire menu/00_COMMENCER_ICI_WORKFLOW_HTTP_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_GUIDE_CREATION_MANUELLE_N8N_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_SOLUTION_PYTHON_NATIF_N8N_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_WORKFLOW_CORRIGE_V2_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_WORKFLOW_PYTHON_NATIF_PRET_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_RECOMMANDATION_FINALE_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_SOLUTION_FINALE_CODE_V3_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/00_SOLUTION_HTTP_REQUEST_COMPLETE_12_AVRIL_2026.txt",
    "Doc cross ref documentaire menu/QUICK_START_V2.txt",
    "Doc cross ref documentaire menu/SYNTHESE_FINALE_WORKFLOW_HTTP_12_AVRIL_2026.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Nettoyage: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        $content = $content -replace '(\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com)', '[VOTRE_GOOGLE_CLIENT_ID]'
        $content = $content -replace '(GOCSPX-[a-zA-Z0-9_-]{28})', '[VOTRE_GOOGLE_CLIENT_SECRET]'
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "OK" -ForegroundColor Green
    }
}

Write-Host "Termine!" -ForegroundColor Green
