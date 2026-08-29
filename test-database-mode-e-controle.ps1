# Script de test pour l'ajout du Mode Database a E-controle
# Date: 10 Avril 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test: Ajout Mode Database a E-controle" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que le fichier DemarrerMenu.tsx existe
Write-Host "1. Verification du fichier DemarrerMenu.tsx..." -ForegroundColor Yellow
$fichier = "src/components/Clara_Components/DemarrerMenu.tsx"

if (Test-Path $fichier) {
    Write-Host "   OK Fichier trouve" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Fichier non trouve: $fichier" -ForegroundColor Red
    exit 1
}

# 2. Creer une sauvegarde
Write-Host ""
Write-Host "2. Creation d'une sauvegarde..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backup = "$fichier.backup_database_mode_$timestamp"
Copy-Item $fichier $backup
Write-Host "   OK Sauvegarde creee: $backup" -ForegroundColor Green

# 3. Executer le script Python
Write-Host ""
Write-Host "3. Execution du script Python..." -ForegroundColor Yellow
$script = "Doc menu demarrer/Scripts/add_database_mode_e_controle.py"

if (Test-Path $script) {
    python $script
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Script execute avec succes" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR lors de l'execution du script" -ForegroundColor Red
        Write-Host "   Restauration de la sauvegarde..." -ForegroundColor Yellow
        Copy-Item $backup $fichier -Force
        exit 1
    }
} else {
    Write-Host "   ERREUR Script non trouve: $script" -ForegroundColor Red
    exit 1
}

# 4. Verifier les modifications
Write-Host ""
Write-Host "4. Verification des modifications..." -ForegroundColor Yellow

# Compter les occurrences de "Mode Database" dans E-controle
$content = Get-Content $fichier -Raw

# Extraire la section E-controle
$pattern = "(?s)id: 'e-controle'.*?(?=id: 'e-cia-exam-part1'|id: 'e-carto'|$)"
if ($content -match $pattern) {
    $section = $matches[0]
    $database_modes = ([regex]::Matches($section, "label: 'Mode Database'")).Count
    
    Write-Host "   OK Nombre de 'Mode Database' ajoutes: $database_modes" -ForegroundColor Green
    
    if ($database_modes -gt 0) {
        Write-Host "   OK Mode Database ajoute avec succes!" -ForegroundColor Green
    } else {
        Write-Host "   ATTENTION Aucun Mode Database trouve" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ATTENTION Section E-controle non trouvee" -ForegroundColor Yellow
}

# 5. Afficher un exemple de modification
Write-Host ""
Write-Host "5. Exemple de modification:" -ForegroundColor Yellow
Write-Host ""

# Extraire un exemple de mode Database
$dbPattern = "(?s)\{\s+id: 'database',\s+label: 'Mode Database',\s+command: ``([^``]+)``\s+\}"
if ($content -match $dbPattern) {
    $example = $matches[1]
    $lines = $example -split "`n" | Select-Object -First 10
    
    foreach ($line in $lines) {
        Write-Host "   $line" -ForegroundColor Cyan
    }
    
    if ($example.Split("`n").Count -gt 10) {
        Write-Host "   ..." -ForegroundColor Gray
    }
}

# 6. Verifier la syntaxe TypeScript
Write-Host ""
Write-Host "6. Verification de la syntaxe..." -ForegroundColor Yellow

# Compter les accolades
$open_braces = ([regex]::Matches($content, "\{")).Count
$close_braces = ([regex]::Matches($content, "\}")).Count

if ($open_braces -eq $close_braces) {
    Write-Host "   OK Accolades equilibrees ($open_braces ouvertures, $close_braces fermetures)" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Accolades desequilibrees ($open_braces ouvertures, $close_braces fermetures)" -ForegroundColor Red
}

# 7. Resume
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resume" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Fichier modifie: $fichier" -ForegroundColor Green
Write-Host "OK Sauvegarde: $backup" -ForegroundColor Green
Write-Host "OK Modes Database ajoutes: $database_modes" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "  1. Verifier visuellement les modifications" -ForegroundColor White
Write-Host "  2. Tester l'interface du bouton demarrer" -ForegroundColor White
Write-Host "  3. Commit les modifications si OK" -ForegroundColor White
Write-Host ""
