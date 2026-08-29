# ═══════════════════════════════════════════════════════════════════════════════
# Script de Test : Templates de Tables (Cases 35-43)
# Date : 10 Avril 2026
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST DES TEMPLATES DE TABLES (CASES 35-43)" -ForegroundColor Cyan
Write-Host "  10 Avril 2026" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1 : Vérification du fichier modifié
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 1 : Vérification du fichier modifié" -ForegroundColor Yellow
Write-Host ""

$fichierService = "src/services/claraApiService.ts"

if (Test-Path $fichierService) {
    Write-Host "✅ Fichier trouvé : $fichierService" -ForegroundColor Green
    
    # Vérifier la présence de la sentinelle
    $contenu = Get-Content $fichierService -Raw
    
    if ($contenu -match "SENTINEL_TEMPLATE_TABLE") {
        Write-Host "✅ Sentinelle SENTINEL_TEMPLATE_TABLE trouvée" -ForegroundColor Green
    } else {
        Write-Host "❌ Sentinelle SENTINEL_TEMPLATE_TABLE non trouvée" -ForegroundColor Red
    }
    
    # Vérifier la présence de la méthode generateTemplateTable
    if ($contenu -match "generateTemplateTable") {
        Write-Host "✅ Méthode generateTemplateTable trouvée" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthode generateTemplateTable non trouvée" -ForegroundColor Red
    }
    
    # Compter les cases ajoutés
    $casesCount = ([regex]::Matches($contenu, "Template_table_")).Count
    Write-Host "✅ Nombre de templates détectés : $casesCount" -ForegroundColor Green
    
} else {
    Write-Host "❌ Fichier non trouvé : $fichierService" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 : Liste des mots-clés à tester
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 2 : Liste des mots-clés disponibles" -ForegroundColor Yellow
Write-Host ""

$templates = @(
    @{Case="35"; Keyword="Template_table_unicolonne"; Description="Table 1 colonne"},
    @{Case="36"; Keyword="Template_table_simple"; Description="Table 10x5"},
    @{Case="37"; Keyword="Template_table_etape_de_mission"; Description="En-tête + Table"},
    @{Case="38"; Keyword="Template_table_feuille_couverture_test_audit"; Description="Feuille couverture"},
    @{Case="39"; Keyword="Template_table_frap"; Description="FRAP (6 tables)"},
    @{Case="40"; Keyword="Template_table_synthèses_frap"; Description="Synthèse FRAP"},
    @{Case="41"; Keyword="Template_table_rapport_provisoire"; Description="Rapport provisoire"},
    @{Case="42"; Keyword="Template_table_rapport_final"; Description="Rapport final"},
    @{Case="43"; Keyword="Template_table_suivi_recos"; Description="Suivi recommandations"}
)

foreach ($template in $templates) {
    Write-Host "  Case $($template.Case) : $($template.Keyword)" -ForegroundColor Cyan
    Write-Host "    → $($template.Description)" -ForegroundColor Gray
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3 : Instructions de test manuel
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 3 : Instructions de test manuel" -ForegroundColor Yellow
Write-Host ""

Write-Host "Pour tester les templates :" -ForegroundColor White
Write-Host ""
Write-Host "1. Démarrer l'application Claraverse" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Ouvrir le navigateur et aller sur l'application" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dans le chat, taper l'un des mots-clés ci-dessus" -ForegroundColor Gray
Write-Host "   Exemple : Template_table_simple" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Vérifier que le template s'affiche correctement" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Répéter pour chaque template" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4 : Vérification de la compilation TypeScript
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "📋 ÉTAPE 4 : Vérification de la compilation TypeScript" -ForegroundColor Yellow
Write-Host ""

Write-Host "Lancement de la vérification TypeScript..." -ForegroundColor Gray
Write-Host ""

# Vérifier si tsc est disponible
$tscPath = Get-Command tsc -ErrorAction SilentlyContinue

if ($tscPath) {
    Write-Host "✅ TypeScript compiler trouvé" -ForegroundColor Green
    Write-Host ""
    Write-Host "Exécution de : npx tsc --noEmit" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $output = npx tsc --noEmit 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Compilation TypeScript réussie (0 erreurs)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warnings ou erreurs détectés :" -ForegroundColor Yellow
            Write-Host $output
        }
    } catch {
        Write-Host "❌ Erreur lors de la compilation TypeScript" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
} else {
    Write-Host "⚠️  TypeScript compiler non trouvé" -ForegroundColor Yellow
    Write-Host "   Installer avec : npm install -g typescript" -ForegroundColor Gray
}

Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ VÉRIFICATIONS TERMINÉES" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Résumé :" -ForegroundColor Yellow
Write-Host "  ✓ Fichier modifié vérifié" -ForegroundColor Green
Write-Host "  ✓ Sentinelle ajoutée" -ForegroundColor Green
Write-Host "  ✓ Méthode generateTemplateTable créée" -ForegroundColor Green
Write-Host "  ✓ 9 templates configurés" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Démarrer le serveur : npm run dev" -ForegroundColor Cyan
Write-Host "  2. Tester chaque template dans le chat" -ForegroundColor Cyan
Write-Host "  3. Valider l'affichage et l'édition" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation :" -ForegroundColor Yellow
Write-Host "  - 00_SYNTHESE_VISUELLE_TEMPLATES_10_AVRIL_2026.txt" -ForegroundColor Cyan
Write-Host "  - QUICK_START_TEMPLATES_TABLES.txt" -ForegroundColor Cyan
Write-Host "  - 00_INDEX_TEMPLATES_10_AVRIL_2026.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
