# ═══════════════════════════════════════════════════════════════════════════════
# Script de Commit Git - Intégration X-Ref Documentaire
# Date: 12 Avril 2026
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  COMMIT GIT - INTÉGRATION X-REF DOCUMENTAIRE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier le statut Git
Write-Host "📋 Vérification du statut Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Demander confirmation
$confirm = Read-Host "Voulez-vous commiter l'intégration X-Ref documentaire? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "❌ Commit annulé" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow

# Ajouter les fichiers
git add public/menu.js
git add "Doc menu contextuel issues/"
git add "00_INTEGRATION_XREF_COMPLETE_12_AVRIL_2026.txt"
git add "commit-xref-integration.ps1"

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Créer le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow

$commitMessage = @"
feat: Intégration X-Ref documentaire dans menu contextuel

- Ajout de 5 méthodes dans menu.js:
  * importerXRefDocumentaire() - Ouvre formulaire n8n (Ctrl+Shift+X)
  * afficherXRefDocumentaire() - Affiche table dans barre latérale
  * rechercherDocument() - Recherche par index ou nom
  * displayXRefSidebar() - Barre latérale animée 400px
  * searchInXRefData() - Filtre les résultats

- Nouvelle section 'Papier de travail' dans le menu contextuel:
  * 📤 Importer X-Ref documentaire (Ctrl+Shift+X)
  * 📋 Afficher X-Ref documentaire
  * 🔍 Rechercher document

- Workflow n8n complet (17 nodes):
  * Formulaire d'upload avec 6 champs
  * Création automatique de la structure Google Drive
  * Upload avec indexation [Cross Ref]-[Document]
  * Fichier prêt à importer: WORKFLOW_N8N_XREF.json

- Documentation complète (12 fichiers):
  * Guide de démarrage rapide (QUICK_START_XREF.txt)
  * Documentation technique détaillée (INTEGRATION_XREF_DOCUMENTAIRE.md)
  * Page de test HTML interactive (test-xref-documentaire.html)
  * Script de test PowerShell (test-xref-integration.ps1)
  * Workflow n8n prêt à importer (WORKFLOW_N8N_XREF.json)
  * Code source des méthodes (CODE_XREF_MENU_JS.js)
  * Récapitulatif complet (RECAP_FINAL_XREF_12_AVRIL_2026.md)
  * Synthèse visuelle (SYNTHESE_VISUELLE_XREF.txt)
  * Index de documentation (00_INDEX_XREF_DOCUMENTAIRE.md)
  * README (README_XREF.md)
  * Commandes Git (COMMANDES_GIT_XREF.txt)
  * Fichier récapitulatif (00_INTEGRATION_XREF_COMPLETE_12_AVRIL_2026.txt)

Statistiques:
- ~450 lignes de code ajoutées
- 5 méthodes créées
- 12 fichiers de documentation
- 3 tests créés
- Temps d'implémentation: ~2 heures

Fonctionnalités:
- Upload de documents dans Google Drive via formulaire n8n
- Détection automatique des tables X-Ref
- Affichage dans barre latérale droite avec animations
- Recherche full-text dans les documents
- Structure Google Drive automatique par client/exercice/cycle

Format d'indexation: [Cross Ref]-[Document]
Exemple: [I20]-Proces verbal inventaire de caisse.pdf

Prochaines étapes:
- Configuration n8n en production
- Connexion Google Drive
- Tests d'intégration complets
- Implémentation de la prévisualisation

Refs: #xref-documentaire
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la création du commit" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Afficher le commit
Write-Host "📊 Détails du commit:" -ForegroundColor Yellow
git log -1 --stat

Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Demander si on pousse vers GitHub
$push = Read-Host "Voulez-vous pousser vers GitHub? (O/N)"

if ($push -eq "O" -or $push -eq "o") {
    Write-Host ""
    Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
    
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push réussi!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du push" -ForegroundColor Red
        Write-Host "💡 Essayez manuellement: git push origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️ Push annulé" -ForegroundColor Yellow
    Write-Host "💡 Pour pousser plus tard: git push origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ COMMIT TERMINÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Résumé
Write-Host "📊 Résumé:" -ForegroundColor Yellow
Write-Host "  • Fichiers commités: 13" -ForegroundColor White
Write-Host "  • Lignes de code: ~450" -ForegroundColor White
Write-Host "  • Méthodes créées: 5" -ForegroundColor White
Write-Host "  • Documentation: 12 fichiers" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Exécuter: .\test-xref-integration.ps1" -ForegroundColor White
Write-Host "  2. Ouvrir: Doc menu contextuel issues\test-xref-documentaire.html" -ForegroundColor White
Write-Host "  3. Configurer n8n avec WORKFLOW_N8N_XREF.json" -ForegroundColor White
Write-Host ""

Write-Host "✅ Script terminé!" -ForegroundColor Green
Write-Host ""
