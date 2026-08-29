# Le Script de Simulation Local (Markdown vers HTML)

Dans le but d'isoler le bug très spécifique lié au parsage Markdown des tableaux n8n, un script de test indépendant a été créé et conservé dans ce dossier : `test_flowise_simulateur_markdown.cjs`.

## À quoi sert-il ?
Il s'agit d'un script auto-porteur exécutable via NodeJS (`node test_flowise_simulateur_markdown.cjs`).
Il utilise la librairie `jsdom` (qui simule un navigateur) pour exécuter les fonctions clés de `Flowise.js` hors de React et hors de Claraverse.

Il sert de **bac à sable sécurisé** pour :
1. Tester la regex de détection de mot-clé (`detectReportKeywordInFirstTable`).
2. Tester la transformation d'une chaîne de texte Markdown brut en éléments HTML DOM (`createTableFromMarkdown`).
3. Tester la mécanique de nettoyage des lignes (`cleanEmptyRowsForReport`).

## Pourquoi c'était nécessaire pour le correctif V17.2 ?
Sur l'interface de Claraverse, les tables HTML générées par le chat ne permettent pas de voir facilement la structure "source" générée par le markdown. 

Ce script a permis d'isoler mathématiquement la faille :
Le Markdown fautif de type `| 2 |` (ligne avec chiffre seul, sans colonnes suivantes) :
- Étape 1 : Divise par le pipe `|`.
- Étape 2 : Crée un seul `<td>2</td>`.
- Résultat : une ligne `<tr>` avec **une seule cellule** (`cells.length === 1`).

Grâce à ce script local, on a pu valider que le code original échouait car il imposait que `cells.length >= 2` pour faire son nettoyage.

## Mode d'emploi
Si de nouveaux problèmes de tableaux fantômes ou mal parsés apparaissent à l'avenir avec n8n :
1. Copier la chaîne Markdown brute renvoyée par le webhook dans la variable `markdownResponse` du script.
2. Ajouter le correctif envisagé dans les fonctions locales du fichier.
3. Exécuter `node test_flowise_simulateur_markdown.cjs` dans un terminal.
4. Valider le résultat (le script affichera la table AVANT nettoyage, et la table APRÈS).
5. Si le résultat est concluant, le répliquer dans le fichier principal `public/Flowise.js`.
