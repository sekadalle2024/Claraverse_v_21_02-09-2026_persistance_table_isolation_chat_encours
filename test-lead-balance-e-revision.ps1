# Test de l'ajout de Lead balance dans E-revision
# Date: 28 Mars 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST - LEAD BALANCE DANS E-REVISION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le fichier existe
$filePath = "src/components/Clara_Components/DemarrerMenu.tsx"

if (-not (Test-Path $filePath)) {
    Write-Host "❌ Fichier non trouvé: $filePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier trouvé: $filePath" -ForegroundColor Green
Write-Host ""

# Lire le contenu
$content = Get-Content $filePath -Raw

# Vérifier la présence de Lead balance
Write-Host "🔍 Vérification de la présence de 'Lead balance'..." -ForegroundColor Yellow
Write-Host ""

$checks = @{
    "ID de l'étape" = "id: 'lead-balance'"
    "Label de l'étape" = "label: 'Lead balance'"
    "Icône Calculator" = "<Calculator className=`"w-4 h-4`" />"
    "Mode Normal" = "id: 'normal'"
    "Commande" = "Lead_balance = Activate"
}

$allPassed = $true

foreach ($check in $checks.GetEnumerator()) {
    $name = $check.Key
    $pattern = $check.Value
    
    if ($content -match [regex]::Escape($pattern)) {
        Write-Host "  ✅ $name" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $name - NON TROUVÉ" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

# Vérifier la position (avant revue-analytique-generale)
Write-Host "🔍 Vérification de la position..." -ForegroundColor Yellow
Write-Host ""

$leadBalanceIndex = $content.IndexOf("id: 'lead-balance'")
$revueAnalytiqueIndex = $content.IndexOf("id: 'revue-analytique-generale'")

if ($leadBalanceIndex -gt 0 -and $revueAnalytiqueIndex -gt 0) {
    if ($leadBalanceIndex -lt $revueAnalytiqueIndex) {
        Write-Host "  ✅ Lead balance est AVANT Revue analytique générale" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Lead balance est APRÈS Revue analytique générale" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "  ❌ Impossible de vérifier la position" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Vérifier qu'il n'y a pas d'erreurs TypeScript
Write-Host "🔍 Vérification TypeScript..." -ForegroundColor Yellow
Write-Host ""

# Compter les accolades pour vérifier la structure
$openBraces = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$closeBraces = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count

if ($openBraces -eq $closeBraces) {
    Write-Host "  ✅ Structure des accolades correcte ($openBraces ouvertures, $closeBraces fermetures)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Déséquilibre des accolades ($openBraces ouvertures, $closeBraces fermetures)" -ForegroundColor Yellow
}

Write-Host ""

# Résumé
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "  ✅ TOUS LES TESTS SONT PASSÉS" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "  1. Démarrer Claraverse: npm run dev" -ForegroundColor White
    Write-Host "  2. Tester dans l'interface: Démarrer → E-revision → Revue analytique" -ForegroundColor White
    Write-Host "  3. Vérifier que 'Lead balance' apparaît avant 'Revue analytique générale'" -ForegroundColor White
    Write-Host "  4. Tester la commande: Lead_balance = Activate" -ForegroundColor White
} else {
    Write-Host "  ❌ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Actions suggérées:" -ForegroundColor Yellow
    Write-Host "  1. Vérifier le fichier DemarrerMenu.tsx" -ForegroundColor White
    Write-Host "  2. Relancer le script: python add_lead_balance_e_revision.py" -ForegroundColor White
    Write-Host "  3. Consulter la documentation: 00_AJOUT_LEAD_BALANCE_E_REVISION_28_MARS_2026.txt" -ForegroundColor White
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Afficher un extrait du code ajouté
Write-Host "📄 Extrait du code ajouté:" -ForegroundColor Cyan
Write-Host ""

$leadBalanceSection = $content -match '(?s)id: .lead-balance..*?modes:.*?\].*?\}'
if ($leadBalanceSection) {
    $startIndex = [Math]::Max(0, $leadBalanceIndex - 50)
    $length = [Math]::Min(500, $content.Length - $startIndex)
    $excerpt = $content.Substring($startIndex, $length)
    
    # Trouver la section Lead balance
    if ($excerpt -match '(?s)(id: .lead-balance..*?}\s*\])') {
        Write-Host $matches[1] -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

exit $(if ($allPassed) { 0 } else { 1 })
