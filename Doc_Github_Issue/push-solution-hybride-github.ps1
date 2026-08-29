# Script de push GitHub - Solution Hybride Agent RAG N8N validée
# Date: 29 Mars 2026

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PUSH GITHUB - SOLUTION HYBRIDE AGENT RAG N8N VALIDÉE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans un repo git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Pas de repository Git trouvé" -ForegroundColor Red
    Write-Host "Exécutez d'abord: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Étape 1: Vérification du statut Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📦 Étape 2: Ajout des fichiers modifiés..." -ForegroundColor Yellow

# Ajouter tous les fichiers de la solution hybride
git add 00_SOLUTION_FINALE_HYBRIDE_29_MARS_2026.txt
git add 00_SUCCES_SOLUTION_HYBRIDE_VALIDEE_29_MARS_2026.txt
git add n8n_prompt_agent_rag_hybride_final.txt
git add n8n_prompt_agent_rag_variable_unique.txt
git add n8n_node_extract_variables_dynamique.js
git add n8n_node_alea_dynamique.js

# Ajouter la documentation
git add "Doc prompt issues/00_SOLUTION_FINALE_HYBRIDE_29_MARS_2026.md"
git add "Doc prompt issues/00_INDEX_AGENT_RAG_VARIABLES.md"
git add "Doc prompt issues/00_SOLUTION_AGENT_RAG_VARIABLES_DYNAMIQUE.md"
git add "Doc prompt issues/00_SOLUTION_AGENT_RAG_VARIABLES_STATIQUE.md"
git add "Doc prompt issues/README.md"

# Ajouter les autres fichiers de solution
git add 00_SOLUTION_DYNAMIQUE_AUTO_DETECTION_VARIABLES.txt
git add n8n_prompt_agent_rag_4_variables.txt
git add n8n_prompt_agent_rag_7_variables.txt
git add n8n_prompt_agent_rag_dynamique.txt
git add n8n_node_extract_variables_rag_complet.js
git add n8n_node_alea16_remplacement_code.js

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green

Write-Host ""
Write-Host "💾 Étape 3: Création du commit..." -ForegroundColor Yellow

$commitMessage = @"
✅ Solution Hybride Agent RAG N8N - Validée en Production

🎯 PROBLÈME RÉSOLU
- Agent RAG N8N affichait [undefined] pour toutes les variables
- Variables du frontend non transmises correctement

🏆 SOLUTION FINALE VALIDÉE
Architecture HYBRIDE optimale :
- ✅ Nodes DYNAMIQUES (auto-détection de toutes les variables)
- ✅ Prompt HYBRIDE (4 variables essentielles + JSON complet)
- ✅ Testée et validée en production
- ✅ Fonctionne parfaitement

📦 COMPOSANTS
1. n8n_node_extract_variables_dynamique.js - Auto-détection
2. n8n_node_alea_dynamique.js - Spread operator
3. n8n_prompt_agent_rag_hybride_final.txt - Prompt optimisé

✨ AVANTAGES
- Flexibilité maximale (fonctionne avec N variables)
- Clarté optimale (4 variables essentielles explicites)
- Contexte complet (JSON avec toutes les variables)
- Maintenance minimale (aucune modification nécessaire)

📁 FICHIERS CRÉÉS/MODIFIÉS
- 00_SOLUTION_FINALE_HYBRIDE_29_MARS_2026.txt
- 00_SUCCES_SOLUTION_HYBRIDE_VALIDEE_29_MARS_2026.txt
- Doc prompt issues/00_SOLUTION_FINALE_HYBRIDE_29_MARS_2026.md
- Doc prompt issues/README.md (mis à jour)
- n8n_prompt_agent_rag_hybride_final.txt
- n8n_prompt_agent_rag_variable_unique.txt
- n8n_node_extract_variables_dynamique.js
- n8n_node_alea_dynamique.js

🎓 STATUT
✅ TESTÉE ET VALIDÉE EN PRODUCTION
Solution recommandée pour tous les cas d'usage

Date: 29 Mars 2026
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Étape 4: Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Branches disponibles:" -ForegroundColor Cyan
git branch -a

Write-Host ""
$branch = Read-Host "Entrez le nom de la branche (défaut: main)"
if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = "main"
}

Write-Host ""
Write-Host "Push vers la branche: $branch" -ForegroundColor Cyan
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ PUSH RÉUSSI - SOLUTION HYBRIDE SUR GITHUB" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 La solution hybride validée est maintenant sur GitHub !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Résumé:" -ForegroundColor Cyan
    Write-Host "  • Solution hybride testée et validée" -ForegroundColor White
    Write-Host "  • Nodes dynamiques + Prompt optimisé" -ForegroundColor White
    Write-Host "  • Documentation complète mise à jour" -ForegroundColor White
    Write-Host "  • Fonctionne parfaitement en production" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "1. Vérifier la connexion GitHub: git remote -v" -ForegroundColor White
    Write-Host "2. Vérifier les credentials: git config --list" -ForegroundColor White
    Write-Host "3. Pull avant push: git pull origin $branch" -ForegroundColor White
    Write-Host "4. Forcer le push: git push -f origin $branch (attention!)" -ForegroundColor White
    exit 1
}
