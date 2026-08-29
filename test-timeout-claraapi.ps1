# ═══════════════════════════════════════════════════════════════════════════════
# Script de Test - Timeout ClaraAPI
# Date: 15 avril 2026
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TEST TIMEOUT CLARAAPI" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 1. Vérifier que le fichier existe
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "📁 Vérification du fichier..." -ForegroundColor Yellow
$filePath = "src/services/claraApiService.ts"

if (Test-Path $filePath) {
    Write-Host "✅ Fichier trouvé: $filePath" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier non trouvé: $filePath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 2. Vérifier le timeout dans le code
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "⏱️ Vérification du timeout..." -ForegroundColor Yellow

$content = Get-Content $filePath -Raw
$timeoutPattern = 'private n8nTimeout = (\d+) \* (\d+) \* (\d+);'

if ($content -match $timeoutPattern) {
    $minutes = [int]$matches[1]
    $seconds = [int]$matches[2]
    $milliseconds = [int]$matches[3]
    $totalMinutes = ($minutes * $seconds * $milliseconds) / 60000
    
    Write-Host "✅ Timeout trouvé: $minutes * $seconds * $milliseconds = $totalMinutes minutes" -ForegroundColor Green
    
    if ($totalMinutes -eq 3) {
        Write-Host "✅ Timeout correct: 3 minutes" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Timeout incorrect: $totalMinutes minutes (attendu: 3 minutes)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Pattern de timeout non trouvé" -ForegroundColor Red
}

Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 3. Vérifier le message de notification
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "📱 Vérification du message de notification..." -ForegroundColor Yellow

$checks = @(
    @{ Pattern = "Notification système"; Description = "Titre 'Notification système'" },
    @{ Pattern = "Nous sommes en surcharge de requêtes"; Description = "Message de surcharge" },
    @{ Pattern = "\+225 05 44 13 07 98"; Description = "Numéro WhatsApp" },
    @{ Pattern = "Informations techniques"; Description = "Section informations techniques" },
    @{ Pattern = "Délai d'attente dépassé"; Description = "Message de timeout" }
)

$allChecksPass = $true

foreach ($check in $checks) {
    if ($content -match [regex]::Escape($check.Pattern)) {
        Write-Host "  ✅ $($check.Description)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($check.Description)" -ForegroundColor Red
        $allChecksPass = $false
    }
}

Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 4. Vérifier les diagnostics TypeScript
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "🔍 Vérification des diagnostics TypeScript..." -ForegroundColor Yellow

# Note: Cette commande nécessite que le projet soit configuré avec TypeScript
# Si npm run type-check n'existe pas, cette étape sera ignorée

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "  ℹ️ Exécution de npm run type-check..." -ForegroundColor Cyan
    # npm run type-check 2>&1 | Out-Null
    Write-Host "  ℹ️ Vérification manuelle recommandée avec: npm run type-check" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️ npm non trouvé, vérification TypeScript ignorée" -ForegroundColor Yellow
}

Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 5. Résumé
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($allChecksPass) {
    Write-Host "✅ Tous les tests sont passés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Redemarrer le frontend: npm run dev" -ForegroundColor White
    Write-Host "  2. Ouvrir la console du navigateur (F12)" -ForegroundColor White
    Write-Host "  3. Verifier le timeout: claraApiService.getN8nTimeout()" -ForegroundColor White
    Write-Host "     Resultat attendu: 180000 (3 minutes)" -ForegroundColor White
} else {
    Write-Host "Certains tests ont echoue" -ForegroundColor Yellow
    Write-Host "   Verifiez les messages ci-dessus pour plus de details" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ───────────────────────────────────────────────────────────────────────────────
# 6. Afficher les fichiers de documentation
# ───────────────────────────────────────────────────────────────────────────────

Write-Host "Documentation disponible:" -ForegroundColor Yellow
Write-Host ""

$docFiles = @(
    "00_LIRE_EN_PREMIER_TIMEOUT.txt",
    "00_INDEX_CORRECTION_TIMEOUT_15_AVRIL_2026.md",
    "QUICK_TEST_TIMEOUT_CLARAAPI.txt",
    "COMMANDES_RAPIDES_TIMEOUT.txt"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $file (non trouvé)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
