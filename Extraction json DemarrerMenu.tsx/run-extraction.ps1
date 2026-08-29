# Script PowerShell pour extraire les données du Menu Démarrer
# Extraction JSON DemarrerMenu.tsx

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "EXTRACTION JSON DU MENU DÉMARRER - DemarrerMenu.tsx" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot
$sourceFile = Join-Path (Split-Path $scriptDir -Parent) "src\components\Clara_Components\DemarrerMenu.tsx"

Write-Host "Répertoire de travail: $scriptDir" -ForegroundColor Yellow
Write-Host "Fichier source: $sourceFile" -ForegroundColor Yellow
Write-Host ""

# Vérifier que le fichier source existe
if (-not (Test-Path $sourceFile)) {
    Write-Host "ERREUR: Le fichier source n'existe pas!" -ForegroundColor Red
    Write-Host "Chemin: $sourceFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Fichier source trouvé" -ForegroundColor Green
Write-Host ""

# Menu de choix
Write-Host "Choisissez la méthode d'extraction:" -ForegroundColor Cyan
Write-Host "1. Extraction avec Node.js (extract_menu_data.js)" -ForegroundColor White
Write-Host "2. Extraction avec Python (extract_menu.py)" -ForegroundColor White
Write-Host "3. Les deux méthodes" -ForegroundColor White
Write-Host "4. Afficher la structure existante" -ForegroundColor White
Write-Host "5. Quitter" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Extraction avec Node.js..." -ForegroundColor Yellow
        Write-Host ""
        
        if (Get-Command node -ErrorAction SilentlyContinue) {
            node "$scriptDir\extract_menu_data.js"
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ Extraction Node.js terminée avec succès" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "✗ Erreur lors de l'extraction Node.js" -ForegroundColor Red
            }
        } else {
            Write-Host "ERREUR: Node.js n'est pas installé" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Extraction avec Python..." -ForegroundColor Yellow
        Write-Host ""
        
        if (Get-Command python -ErrorAction SilentlyContinue) {
            python "$scriptDir\extract_menu.py"
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ Extraction Python terminée avec succès" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "✗ Erreur lors de l'extraction Python" -ForegroundColor Red
            }
        } else {
            Write-Host "ERREUR: Python n'est pas installé" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Extraction avec les deux méthodes..." -ForegroundColor Yellow
        Write-Host ""
        
        # Node.js
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Host "--- Extraction Node.js ---" -ForegroundColor Cyan
            node "$scriptDir\extract_menu_data.js"
            Write-Host ""
        } else {
            Write-Host "⚠ Node.js non disponible" -ForegroundColor Yellow
        }
        
        # Python
        if (Get-Command python -ErrorAction SilentlyContinue) {
            Write-Host "--- Extraction Python ---" -ForegroundColor Cyan
            python "$scriptDir\extract_menu.py"
            Write-Host ""
        } else {
            Write-Host "⚠ Python non disponible" -ForegroundColor Yellow
        }
        
        Write-Host "✓ Extractions terminées" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "Fichiers JSON existants:" -ForegroundColor Cyan
        Write-Host ""
        
        Get-ChildItem "$scriptDir\*.json" | ForEach-Object {
            Write-Host "  📄 $($_.Name)" -ForegroundColor White
            Write-Host "     Taille: $([math]::Round($_.Length / 1KB, 2)) KB" -ForegroundColor Gray
            Write-Host "     Modifié: $($_.LastWriteTime)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "Au revoir!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "TERMINÉ" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Afficher les fichiers générés
Write-Host "Fichiers générés:" -ForegroundColor Yellow
Get-ChildItem "$scriptDir\*.json" | ForEach-Object {
    Write-Host "  ✓ $($_.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour consulter les résultats:" -ForegroundColor Cyan
Write-Host "  cd '$scriptDir'" -ForegroundColor White
Write-Host "  cat suite_e_audit_structure.json" -ForegroundColor White
Write-Host ""
