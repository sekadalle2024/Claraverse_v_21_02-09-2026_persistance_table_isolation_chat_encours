#!/usr/bin/env pwsh
# Script de test complet pour les états de contrôle N et N-1
# Date: 04 Avril 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 TEST COMPLET - ÉTATS DE CONTRÔLE N ET N-1" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'existence du fichier
$fichier = "test_etats_controle_html.html"
$fichierBureau = "$env:USERPROFILE\Desktop\test_etats_controle_html.html"

Write-Host "📁 Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path $fichier) {
    Write-Host "  ✅ Fichier projet trouvé: $fichier" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fichier projet non trouvé: $fichier" -ForegroundColor Red
}

if (Test-Path $fichierBureau) {
    Write-Host "  ✅ Fichier Bureau trouvé: $fichierBureau" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fichier Bureau non trouvé: $fichierBureau" -ForegroundColor Red
}

Write-Host ""

# Vérifier le contenu du fichier
Write-Host "📊 Vérification du contenu..." -ForegroundColor Yellow
Write-Host ""

$contenu = Get-Content $fichier -Raw -Encoding UTF8

# Vérifier les sections N (1-8)
$sectionsN = @(
    "1. Statistiques de Couverture (Exercice N)",
    "2. Équilibre du Bilan (Exercice N)",
    "3. Cohérence Résultat (Exercice N)",
    "4. Comptes Non Intégrés (Exercice N)",
    "5. Comptes avec Sens Inversé (Exercice N)",
    "6. Comptes Créant un Déséquilibre (Exercice N)",
    "7. Hypothèse d'Affectation du Résultat (Exercice N)",
    "8. Comptes avec Sens Anormal par Nature (Exercice N)"
)

Write-Host "  SECTIONS EXERCICE N (1-8):" -ForegroundColor Cyan
foreach ($section in $sectionsN) {
    if ($contenu -match [regex]::Escape($section)) {
        Write-Host "    ✅ $section" -ForegroundColor Green
    } else {
        Write-Host "    ❌ $section - MANQUANTE" -ForegroundColor Red
    }
}

Write-Host ""

# Vérifier les sections N-1 (9-16)
$sectionsN1 = @(
    "9. Statistiques de Couverture (Exercice N-1)",
    "10. Équilibre du Bilan (Exercice N-1)",
    "11. Cohérence Résultat (Exercice N-1)",
    "12. Comptes Non Intégrés (Exercice N-1)",
    "13. Comptes avec Sens Inversé (Exercice N-1)",
    "14. Comptes Créant un Déséquilibre (Exercice N-1)",
    "15. Hypothèse d'Affectation du Résultat (Exercice N-1)",
    "16. Comptes avec Sens Anormal par Nature (Exercice N-1)"
)

Write-Host "  SECTIONS EXERCICE N-1 (9-16):" -ForegroundColor Cyan
foreach ($section in $sectionsN1) {
    if ($contenu -match [regex]::Escape($section)) {
        Write-Host "    ✅ $section" -ForegroundColor Green
    } else {
        Write-Host "    ❌ $section - MANQUANTE" -ForegroundColor Red
    }
}

Write-Host ""

# Vérifier la section 15 spécifiquement
Write-Host "⭐ Vérification spéciale de la section 15..." -ForegroundColor Yellow
Write-Host ""

if ($contenu -match "15\. Hypothèse d'Affectation du Résultat \(Exercice N-1\)") {
    Write-Host "  ✅ Section 15 correctement numérotée" -ForegroundColor Green
    Write-Host "  ✅ Section 15 affiche '(Exercice N-1)'" -ForegroundColor Green
} else {
    Write-Host "  ❌ Section 15 incorrecte" -ForegroundColor Red
    if ($contenu -match "7\. Hypothèse d'Affectation du Résultat \(Exercice N\).*7\. Hypothèse d'Affectation du Résultat \(Exercice N\)") {
        Write-Host "  ⚠️  Section 15 affiche encore '7' - Exécuter corriger_numeros_sections_n1.py" -ForegroundColor Yellow
    }
}

Write-Host ""

# Statistiques
Write-Host "📊 Statistiques du fichier..." -ForegroundColor Yellow
Write-Host ""

$lignes = (Get-Content $fichier).Count
$taille = (Get-Item $fichier).Length / 1KB

Write-Host "  📄 Nombre de lignes: $lignes" -ForegroundColor Cyan
Write-Host "  💾 Taille du fichier: $([math]::Round($taille, 2)) KB" -ForegroundColor Cyan

Write-Host ""

# Vérifier les éléments clés
Write-Host "🔍 Vérification des éléments clés..." -ForegroundColor Yellow
Write-Host ""

$elements = @{
    "Titre principal" = "Test États de Contrôle"
    "Statistiques globales" = "16 États de Contrôle"
    "Bouton Tout Ouvrir" = "Tout Ouvrir"
    "Bouton Tout Fermer" = "Tout Fermer"
    "Bouton Imprimer" = "Imprimer"
    "Synthèse Finale" = "Synthèse Finale des Contrôles"
    "JavaScript" = "function toggleSection"
}

foreach ($element in $elements.GetEnumerator()) {
    if ($contenu -match [regex]::Escape($element.Value)) {
        Write-Host "  ✅ $($element.Key): Présent" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($element.Key): Manquant" -ForegroundColor Red
    }
}

Write-Host ""

# Résultat final
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎯 RÉSULTAT FINAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$sectionsNOk = ($sectionsN | Where-Object { $contenu -match [regex]::Escape($_) }).Count
$sectionsN1Ok = ($sectionsN1 | Where-Object { $contenu -match [regex]::Escape($_) }).Count
$totalSections = $sectionsNOk + $sectionsN1Ok

Write-Host "  📊 Sections N correctes: $sectionsNOk/8" -ForegroundColor Cyan
Write-Host "  📊 Sections N-1 correctes: $sectionsN1Ok/8" -ForegroundColor Cyan
Write-Host "  📊 Total sections correctes: $totalSections/16" -ForegroundColor Cyan
Write-Host ""

if ($totalSections -eq 16) {
    Write-Host "  ✅ PARFAIT - Toutes les sections sont correctes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🚀 Le fichier est prêt pour utilisation !" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  ATTENTION - Certaines sections sont manquantes ou incorrectes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  🔧 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "     1. Exécuter: python corriger_numeros_sections_n1.py" -ForegroundColor White
    Write-Host "     2. Relancer ce test" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Proposer d'ouvrir le fichier
Write-Host "💡 Voulez-vous ouvrir le fichier dans le navigateur ? (O/N)" -ForegroundColor Yellow
$reponse = Read-Host

if ($reponse -eq "O" -or $reponse -eq "o") {
    Write-Host ""
    Write-Host "🌐 Ouverture du fichier dans le navigateur..." -ForegroundColor Green
    Start-Process $fichierBureau
    Write-Host "✅ Fichier ouvert !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ℹ️  Pour ouvrir le fichier manuellement:" -ForegroundColor Cyan
    Write-Host "   Double-cliquer sur: $fichierBureau" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Test terminé !" -ForegroundColor Green
Write-Host ""
