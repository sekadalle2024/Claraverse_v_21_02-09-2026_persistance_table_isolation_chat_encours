# Points d'Attention et Bonnes Pratiques

Lors des futures évolutions du traitement des réponses n8n dans Claraverse (script `Flowise.js`), voici les points cruciaux à garder en tête :

## 1. La fragilité du formatage LLM (Markdown)
Les modèles de langage (LLM) derrière l'endpoint n8n ne sont pas déterministes à 100%. Bien que promptés pour retourner des tableaux stricts (`| Colonne 1 | Colonne 2 |`), ils peuvent :
- Omettre des colonnes ou les délimiteurs `|` finaux.
- Ajouter des espaces autour des pipes `|`.
- Générer des lignes incomplètes.
- Numéroter des listes d'items en pensant remplir un tableau (générant des `<tr>` à une seule cellule).

**Règle d'or :** Le script `Flowise.js` (V17.2) gère désormais ces cas via :
1. Un **padding automatique** pour compléter les colonnes manquantes.
2. Une suppression des lignes si seule la première colonne est remplie par un numéro.

## 2. Intégrité des données et édition manuelle
Pour que l'utilisateur puisse modifier manuellement des colonnes initialement vides (comme "Commentaire"), les cellules `<td>` **doivent exister physiquement** dans le DOM.
C'est pourquoi le parseur ne doit plus filtrer les cellules vides. Si le HTML ne contient pas le bon nombre de `<td>`, l'interface pourra paraître décalée ou incomplète.
Dans la V17.1, la détection des rapports cherchait le mot-clé ("Synthèse", "Rapport définitif", etc.) **exclusivement** dans une cellule d'en-tête `<th>` intitulée "Description".
- Si le LLM retournait un tableau sans header explicite (uniquement des `<td>`).
- Si n8n encapsulait la donnée différemment.
La détection échouait silencieusement et la fonctionnalité de nettoyage ne s'activait pas.

**La bonne pratique (V17.2) :** Scanner l'intégralité de la réponse brute. Chercher les marqueurs sémantiques dans **toutes les cellules** (via un simple `querySelectorAll('td, th')` sur l'ensemble des tables retournées). 

## 3. Scope de la suppression des lignes
La fonction de nettoyage agressive (`cleanEmptyRowsForReport`) ne doit **pas** être appliquée à la première table de la réponse n8n.
Cette première table est structurellement la table des métadonnées (Rubrique / Description / Méthodologie / etc.). Elle pourrait légitimement contenir des lignes partiellement vides.
Le nettoyage doit cibler exclusivement les tables de liste/données (qui commencent à l'index `1` du tableau des tables extraites).

## 4. Maintenance du Script `Flowise.js`
Le script est massif. Pour tout débuggage futur sur ce point précis :
- Chercher la fonction `detectReportKeywordInFirstTable` (détection du contexte).
- Chercher la fonction `applyReportEmptyRowsCleanup` (application conditionnelle).
- Les mots-clés de déclenchement sont définis par expressions régulières (les Regex permettent de s'affranchir de la casse et des accents éventuels). Pour ajouter un nouveau type de rapport, il suffit de rajouter une regex au tableau `REPORT_KEYWORDS`.
