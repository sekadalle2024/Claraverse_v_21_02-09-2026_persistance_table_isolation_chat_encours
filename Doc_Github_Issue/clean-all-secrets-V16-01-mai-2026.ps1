# Nettoyage global des secrets (Version V16 - 01 Mai 2026)
Write-Host "Nettoyage global des secrets (Google OAuth) - ClaraVerse V16..." -ForegroundColor Yellow

$idPattern = '(\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com)'
$secretPattern = '(GOCSPX-[a-zA-Z0-9_-]{28})'

# Liste des dossiers a ignorer absolument
$excludeDirs = @("node_modules", ".git", ".netlify", ".kiro", ".hypothesis", ".pytest_cache")

Write-Host "Collecte des fichiers (ceci peut prendre 1-2 minutes)..." -ForegroundColor Gray
$files = Get-ChildItem -Path . -Recurse | Where-Object { 
    $_.FullName -notmatch ($excludeDirs -join "|") -and 
    $_.Extension -in @(".txt", ".md", ".js", ".tsx", ".ts", ".json", ".html") 
}

foreach ($file in $files) {
    if ($file.Attributes -match "Directory") { continue }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ([string]::IsNullOrWhiteSpace($content)) { continue }

    if ($content -match $idPattern -or $content -match $secretPattern) {
        Write-Host "Nettoyage: $($file.FullName)" -ForegroundColor Cyan
        $content = $content -replace $idPattern, '[VOTRE_GOOGLE_CLIENT_ID]'
        $content = $content -replace $secretPattern, '[VOTRE_GOOGLE_CLIENT_SECRET]'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  OK" -ForegroundColor Green
    }
}

Write-Host "Nettoyage global V16 termine!" -ForegroundColor Green
