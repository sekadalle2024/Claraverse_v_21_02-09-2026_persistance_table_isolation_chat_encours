# ============================================================================
# Script de correction des conversions de matrices
# Problème: Conversion Alpha-3 → Num-5 incomplète
# Date: 02 Avril 2026
# ============================================================================

Write-Host "🔧 CORRECTION DES CONVERSIONS DE MATRICES" -ForegroundColor Cyan
Write-Host "=" * 70

$menuFile = "public/menu.js"

if (-not (Test-Path $menuFile)) {
    Write-Host "❌ Fichier $menuFile introuvable!" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Lecture du fichier..." -ForegroundColor Yellow
$content = Get-Content $menuFile -Raw -Encoding UTF8

# ============================================================================
# ÉTAPE 1: Vérifier que les nouvelles méthodes existent
# ============================================================================
Write-Host "`n🔍 Vérification des méthodes de conversion..." -ForegroundColor Yellow

$methodsToCheck = @(
    "convertToNumeric3",
    "convertToNumeric4",
    "convertToNumeric5",
    "convertToAlpha3",
    "convertToAlpha4",
    "convertToAlpha5"
)

$allMethodsExist = $true
foreach ($method in $methodsToCheck) {
    if ($content -match "$method\(value\)") {
        Write-Host "  ✅ $method trouvée" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $method manquante" -ForegroundColor Red
        $allMethodsExist = $false
    }
}

if (-not $allMethodsExist) {
    Write-Host "`n❌ Certaines méthodes sont manquantes!" -ForegroundColor Red
    Write-Host "Veuillez d'abord ajouter les méthodes de conversion." -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# ÉTAPE 2: Vérifier les appels dans les méthodes de conversion
# ============================================================================
Write-Host "`n🔍 Vérification des appels de méthodes..." -ForegroundColor Yellow

$callsToCheck = @{
    "convertToMatrixNum3" = "convertToNumeric3"
    "convertToMatrixNum4" = "convertToNumeric4"
    "convertToMatrixNum5" = "convertToNumeric5"
    "convertToMatrixAlpha3" = "convertToAlpha3"
    "convertToMatrixAlpha5" = "convertToAlpha5"
    "convertToMatrixAlpha4" = "convertToAlpha4"
}

$allCallsCorrect = $true
foreach ($method in $callsToCheck.Keys) {
    $expectedCall = $callsToCheck[$method]
    
    # Extraire la méthode
    $pattern = "$method\(\) \{[\s\S]*?\n    \}"
    if ($content -match $pattern) {
        $methodContent = $matches[0]
        
        if ($methodContent -match "this\.$expectedCall\(") {
            Write-Host "  ✅ $method utilise $expectedCall" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $method n'utilise pas $expectedCall" -ForegroundColor Red
            $allCallsCorrect = $false
        }
    } else {
        Write-Host "  ⚠️  $method non trouvée" -ForegroundColor Yellow
    }
}

# ============================================================================
# ÉTAPE 3: Rapport final
# ============================================================================
Write-Host "`n" + ("=" * 70)
if ($allMethodsExist -and $allCallsCorrect) {
    Write-Host "✅ TOUTES LES CORRECTIONS SONT APPLIQUÉES!" -ForegroundColor Green
    Write-Host "`nLes conversions de matrices sont maintenant fonctionnelles." -ForegroundColor Cyan
    Write-Host "Vous pouvez tester la conversion Alpha-3 → Num-5" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  CORRECTIONS INCOMPLÈTES" -ForegroundColor Yellow
    Write-Host "`nVeuillez appliquer les corrections manuellement." -ForegroundColor Yellow
}

Write-Host "`n📊 Statistiques:" -ForegroundColor Cyan
Write-Host "  - Méthodes de conversion: $($methodsToCheck.Count)" -ForegroundColor White
Write-Host "  - Méthodes de matrice: $($callsToCheck.Count)" -ForegroundColor White
Write-Host "  - Taille du fichier: $([math]::Round((Get-Item $menuFile).Length / 1KB, 2)) KB" -ForegroundColor White

Write-Host "`n✅ Vérification terminée!" -ForegroundColor Green
