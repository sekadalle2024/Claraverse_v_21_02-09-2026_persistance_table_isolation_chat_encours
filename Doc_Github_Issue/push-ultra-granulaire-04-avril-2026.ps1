# Script de push ultra-granulaire - ClaraVerse V5 - 04 Avril 2026
# Division maximale pour eviter les timeouts

Write-Host "=== Push ClaraVerse Ultra-Granulaire ===" -ForegroundColor Cyan
Write-Host "Division en 10+ commits de petite taille" -ForegroundColor Yellow
Write-Host ""

# Fonction pour push avec retry
function Push-WithRetry {
    param([string]$message)
    
    Write-Host "Push: $message" -ForegroundColor Cyan
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Succes" -ForegroundColor Green
        return $true
    } else {
        Write-Host "X Echec - Nouvelle tentative..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        git push origin master
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK Succes (2e tentative)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "X Echec definitif" -ForegroundColor Red
            return $false
        }
    }
}

# Annuler le commit actuel
Write-Host "Etape 0: Annulation du commit actuel..." -ForegroundColor Yellow
git reset --soft HEAD~1
Write-Host ""

# Commit 1: src/components (sans Clara_Components)
Write-Host "Commit 1/12: src/components (base)..." -ForegroundColor Yellow
git add src/components/*.tsx src/components/*.ts src/components/*.css 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 1: Components Base"
if (-not (Push-WithRetry "Components Base")) { exit 1 }
Write-Host ""

# Commit 2: src/components/Clara_Components (partie 1)
Write-Host "Commit 2/12: Clara Components (1/2)..." -ForegroundColor Yellow
git add src/components/Clara_Components/A*.tsx src/components/Clara_Components/B*.tsx src/components/Clara_Components/C*.tsx src/components/Clara_Components/D*.tsx src/components/Clara_Components/E*.tsx src/components/Clara_Components/F*.tsx src/components/Clara_Components/G*.tsx 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 2: Clara Components A-G"
if (-not (Push-WithRetry "Clara Components 1")) { exit 1 }
Write-Host ""

# Commit 3: src/components/Clara_Components (partie 2)
Write-Host "Commit 3/12: Clara Components (2/2)..." -ForegroundColor Yellow
git add src/components/Clara_Components/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 3: Clara Components H-Z"
if (-not (Push-WithRetry "Clara Components 2")) { exit 1 }
Write-Host ""

# Commit 4: src/services
Write-Host "Commit 4/12: Services..." -ForegroundColor Yellow
git add src/services/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 4: Services"
if (-not (Push-WithRetry "Services")) { exit 1 }
Write-Host ""

# Commit 5: src/utils et src/types
Write-Host "Commit 5/12: Utils et Types..." -ForegroundColor Yellow
git add src/utils/ src/types/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 5: Utils et Types"
if (-not (Push-WithRetry "Utils Types")) { exit 1 }
Write-Host ""

# Commit 6: src/contexts et src/hooks
Write-Host "Commit 6/12: Contexts et Hooks..." -ForegroundColor Yellow
git add src/contexts/ src/hooks/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 6: Contexts et Hooks"
if (-not (Push-WithRetry "Contexts Hooks")) { exit 1 }
Write-Host ""

# Commit 7: Reste de src/
Write-Host "Commit 7/12: Reste de src/..." -ForegroundColor Yellow
git add src/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 7: Src Reste"
if (-not (Push-WithRetry "Src Reste")) { exit 1 }
Write-Host ""

# Commit 8: py_backend (partie 1 - scripts Python)
Write-Host "Commit 8/12: Backend Python (scripts)..." -ForegroundColor Yellow
git add py_backend/*.py 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 8: Backend Scripts"
if (-not (Push-WithRetry "Backend Scripts")) { exit 1 }
Write-Host ""

# Commit 9: py_backend (partie 2 - reste)
Write-Host "Commit 9/12: Backend Python (reste)..." -ForegroundColor Yellow
git add py_backend/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 9: Backend Reste"
if (-not (Push-WithRetry "Backend Reste")) { exit 1 }
Write-Host ""

# Commit 10: public/
Write-Host "Commit 10/12: Fichiers Publics..." -ForegroundColor Yellow
git add public/ 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 10: Public"
if (-not (Push-WithRetry "Public")) { exit 1 }
Write-Host ""

# Commit 11: Documentation
Write-Host "Commit 11/12: Documentation..." -ForegroundColor Yellow
git add *.md *.txt Doc* Manuel* 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 11: Documentation"
if (-not (Push-WithRetry "Documentation")) { exit 1 }
Write-Host ""

# Commit 12: Fichiers Restants
Write-Host "Commit 12/12: Fichiers Restants..." -ForegroundColor Yellow
git add . 2>$null
git commit -m "V5 - 04 Avril 2026 - Part 12: Fichiers Restants"
if (-not (Push-WithRetry "Fichiers Restants")) { exit 1 }
Write-Host ""

Write-Host "=== SUCCES COMPLET ===" -ForegroundColor Green
Write-Host "Tous les commits ont ete pousses avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale:" -ForegroundColor Cyan
git log --oneline -12
