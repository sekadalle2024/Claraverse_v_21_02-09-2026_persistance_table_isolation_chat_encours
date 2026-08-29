# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT DE VÉRIFICATION : Synchronisation Backend/Frontend
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔍 VÉRIFICATION SYNCHRONISATION CLARAVERSE                             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$erreurs = 0
$avertissements = 0

# ═══════════════════════════════════════════════════════════════════════════
# 1. VÉRIFICATION FICHIERS FRONTEND
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "📁 VÉRIFICATION FICHIERS FRONTEND" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Vérifier backendConfig.js
if (Test-Path "public/backendConfig.js") {
    Write-Host "  ✅ public/backendConfig.js existe" -ForegroundColor Green
    
    # Vérifier le contenu
    $content = Get-Content "public/backendConfig.js" -Raw
    if ($content -match "window\.CLARA_BACKEND_URL") {
        Write-Host "  ✅ window.CLARA_BACKEND_URL défini" -ForegroundColor Green
    } else {
        Write-Host "  ❌ window.CLARA_BACKEND_URL manquant" -ForegroundColor Red
        $erreurs++
    }
} else {
    Write-Host "  ❌ public/backendConfig.js MANQUANT" -ForegroundColor Red
    $erreurs++
}

# Vérifier index.html
if (Test-Path "index.html") {
    Write-Host "  ✅ index.html existe" -ForegroundColor Green
    
    $indexContent = Get-Content "index.html" -Raw
    if ($indexContent -match 'src="/backendConfig\.js"') {
        Write-Host "  ✅ backendConfig.js chargé dans index.html" -ForegroundColor Green
    } else {
        Write-Host "  ❌ backendConfig.js NON chargé dans index.html" -ForegroundColor Red
        $erreurs++
    }
} else {
    Write-Host "  ❌ index.html MANQUANT" -ForegroundColor Red
    $erreurs++
}

# Vérifier LeadBalanceAutoTrigger.js
if (Test-Path "public/LeadBalanceAutoTrigger.js") {
    Write-Host "  ✅ public/LeadBalanceAutoTrigger.js existe" -ForegroundColor Green
    
    $leadContent = Get-Content "public/LeadBalanceAutoTrigger.js" -Raw
    if ($leadContent -match "window\.CLARA_BACKEND_URL") {
        Write-Host "  ✅ Utilise window.CLARA_BACKEND_URL" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  N'utilise pas window.CLARA_BACKEND_URL" -ForegroundColor Yellow
        $avertissements++
    }
} else {
    Write-Host "  ❌ public/LeadBalanceAutoTrigger.js MANQUANT" -ForegroundColor Red
    $erreurs++
}

# Vérifier EtatFinAutoTrigger.js
if (Test-Path "public/EtatFinAutoTrigger.js") {
    Write-Host "  ✅ public/EtatFinAutoTrigger.js existe" -ForegroundColor Green
    
    $etatContent = Get-Content "public/EtatFinAutoTrigger.js" -Raw
    if ($etatContent -match "window\.CLARA_BACKEND_URL") {
        Write-Host "  ✅ Utilise window.CLARA_BACKEND_URL" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  N'utilise pas window.CLARA_BACKEND_URL" -ForegroundColor Yellow
        $avertissements++
    }
} else {
    Write-Host "  ❌ public/EtatFinAutoTrigger.js MANQUANT" -ForegroundColor Red
    $erreurs++
}

# ═══════════════════════════════════════════════════════════════════════════
# 2. VÉRIFICATION FICHIERS BACKEND
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n📁 VÉRIFICATION FICHIERS BACKEND" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Vérifier main.py
if (Test-Path "py_backend/main.py") {
    Write-Host "  ✅ py_backend/main.py existe" -ForegroundColor Green
    
    $mainContent = Get-Content "py_backend/main.py" -Raw
    if ($mainContent -match "/etats-financiers/process-excel") {
        Write-Host "  ✅ Endpoint /etats-financiers/process-excel défini" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Endpoint /etats-financiers/process-excel MANQUANT" -ForegroundColor Red
        $erreurs++
    }
    
    if ($mainContent -match "Content-Disposition") {
        Write-Host "  ✅ Content-Disposition dans expose_headers" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Content-Disposition absent de expose_headers" -ForegroundColor Yellow
        $avertissements++
    }
} else {
    Write-Host "  ❌ py_backend/main.py MANQUANT" -ForegroundColor Red
    $erreurs++
}

# Vérifier etats_financiers.py
if (Test-Path "py_backend/etats_financiers.py") {
    Write-Host "  ✅ py_backend/etats_financiers.py existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ py_backend/etats_financiers.py MANQUANT" -ForegroundColor Red
    $erreurs++
}

# ═══════════════════════════════════════════════════════════════════════════
# 3. VÉRIFICATION GIT STATUS
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n📊 VÉRIFICATION GIT STATUS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

try {
    $gitStatus = git status --porcelain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        if ($gitStatus) {
            Write-Host "  ⚠️  Fichiers modifiés non commités :" -ForegroundColor Yellow
            $gitStatus | ForEach-Object {
                Write-Host "     $_" -ForegroundColor Gray
            }
            $avertissements++
        } else {
            Write-Host "  ✅ Aucun fichier modifié (working tree clean)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  Git non disponible ou pas un repo git" -ForegroundColor Yellow
        $avertissements++
    }
} catch {
    Write-Host "  ⚠️  Erreur lors de la vérification Git" -ForegroundColor Yellow
    $avertissements++
}

# ═══════════════════════════════════════════════════════════════════════════
# 4. TEST CONNEXION BACKEND LOCAL (OPTIONNEL)
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n🌐 TEST CONNEXION BACKEND LOCAL" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend local accessible (HTTP 200)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Backend local non accessible (normal si non démarré)" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════════════════════════════
# 5. RÉSUMÉ
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 RÉSUMÉ DE LA VÉRIFICATION                                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($erreurs -eq 0 -and $avertissements -eq 0) {
    Write-Host "  ✅ TOUT EST OK ! Prêt pour le commit et push" -ForegroundColor Green
    Write-Host "`n  Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "    1. git add ." -ForegroundColor Gray
    Write-Host "    2. git commit -m 'Fix: Intégration backendConfig.js'" -ForegroundColor Gray
    Write-Host "    3. git push origin main" -ForegroundColor Gray
} elseif ($erreurs -eq 0) {
    Write-Host "  ⚠️  $avertissements avertissement(s) détecté(s)" -ForegroundColor Yellow
    Write-Host "     Vous pouvez continuer, mais vérifiez les points ci-dessus" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ $erreurs erreur(s) critique(s) détectée(s)" -ForegroundColor Red
    Write-Host "     Corrigez les erreurs avant de continuer" -ForegroundColor Red
}

Write-Host "`n─────────────────────────────────────────────────────────────────────────`n" -ForegroundColor DarkGray

# Retourner le code d'erreur
if ($erreurs -gt 0) {
    exit 1
} else {
    exit 0
}
