# Test de vérification du CSS des accordéons dans generate_css_liasse()
# Date: 23 mars 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST CSS ACCORDÉONS - Format Liasse" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Vérifier que le CSS des accordéons est présent dans etats_financiers_v2.py
Write-Host "Test 1: CSS accordéons dans etats_financiers_v2.py" -ForegroundColor Yellow
$file = "py_backend/etats_financiers_v2.py"
$content = Get-Content $file -Raw

$patterns = @(
    ".section-header-ef",
    ".section-content-ef",
    ".etats-fin-section",
    "max-height: 0",
    "max-height: 10000px",
    "transform: rotate\(90deg\)"
)

$allFound = $true
foreach ($pattern in $patterns) {
    if ($content -match [regex]::Escape($pattern)) {
        Write-Host "  ✅ Pattern trouvé: $pattern" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Pattern manquant: $pattern" -ForegroundColor Red
        $allFound = $false
    }
}

if ($allFound) {
    Write-Host "  ✅ TOUS LES PATTERNS CSS TROUVÉS" -ForegroundColor Green
} else {
    Write-Host "  ❌ CERTAINS PATTERNS MANQUANTS" -ForegroundColor Red
}

Write-Host ""

# Test 2: Vérifier que le module est importable
Write-Host "Test 2: Import du module etats_financiers_v2" -ForegroundColor Yellow
try {
    & conda run -n claraverse_backend python -c "import sys; sys.path.insert(0, 'py_backend'); from etats_financiers_v2 import generate_css_liasse; css = generate_css_liasse(); print('✅ Module importé'); print(f'✅ CSS généré: {len(css)} caractères'); assert '.section-header-ef' in css, 'CSS accordéon manquant'; print('✅ CSS accordéon présent')"
    Write-Host "  ✅ Module importable et CSS correct" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur d'import: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Tester l'endpoint avec un fichier
Write-Host "Test 3: Test de l'endpoint avec BALANCES_N_N1_N2.xlsx" -ForegroundColor Yellow

if (Test-Path "py_backend/BALANCES_N_N1_N2.xlsx") {
    Write-Host "  📁 Fichier trouvé: BALANCES_N_N1_N2.xlsx" -ForegroundColor Green
    
    # Lire le fichier et l'encoder en base64
    $fileBytes = [System.IO.File]::ReadAllBytes("py_backend/BALANCES_N_N1_N2.xlsx")
    $fileBase64 = [System.Convert]::ToBase64String($fileBytes)
    
    # Créer le JSON
    $json = @{
        file_base64 = $fileBase64
        filename = "BALANCES_N_N1_N2.xlsx"
    } | ConvertTo-Json
    
    # Envoyer la requête
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
            -Method Post `
            -ContentType "application/json" `
            -Body $json
        
        Write-Host "  ✅ Endpoint répond: Status 200" -ForegroundColor Green
        
        # Vérifier le HTML
        if ($response.html) {
            $html = $response.html
            Write-Host "  ✅ HTML reçu: $($html.Length) caractères" -ForegroundColor Green
            
            # Vérifier les patterns dans le HTML
            $htmlPatterns = @(
                ".section-header-ef",
                ".section-content-ef",
                "max-height: 0",
                "max-height: 10000px",
                "🏢 BILAN - ACTIF",
                "🏛️ BILAN - PASSIF",
                "📊 COMPTE DE RÉSULTAT",
                "💧 TABLEAU DES FLUX DE TRÉSORERIE",
                "📋 NOTES ANNEXES"
            )
            
            $htmlAllFound = $true
            foreach ($pattern in $htmlPatterns) {
                if ($html -match [regex]::Escape($pattern)) {
                    Write-Host "    ✅ $pattern" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ $pattern MANQUANT" -ForegroundColor Red
                    $htmlAllFound = $false
                }
            }
            
            if ($htmlAllFound) {
                Write-Host "  ✅ TOUS LES ÉLÉMENTS PRÉSENTS DANS LE HTML" -ForegroundColor Green
            } else {
                Write-Host "  ❌ CERTAINS ÉLÉMENTS MANQUANTS" -ForegroundColor Red
            }
            
            # Sauvegarder le HTML pour inspection
            $html | Out-File "test-accordeon-output.html" -Encoding UTF8
            Write-Host "  📄 HTML sauvegardé dans: test-accordeon-output.html" -ForegroundColor Cyan
            
        } else {
            Write-Host "  ❌ Pas de HTML dans la réponse" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ❌ Erreur endpoint: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host "  ❌ Fichier non trouvé: py_backend/BALANCES_N_N1_N2.xlsx" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIN DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
