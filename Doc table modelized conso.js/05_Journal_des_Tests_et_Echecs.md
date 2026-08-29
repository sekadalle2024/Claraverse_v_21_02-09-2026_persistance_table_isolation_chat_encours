# 05 - Journal des Tests et Échecs

Chronologie des tentatives de résolution du problème de la table RÉSULTAT.

## Tentative 1 : Sélecteur CSS Large
- **Approche** : Utiliser `document.querySelectorAll("table")` et filtrer sur les en-têtes `th`.
- **Résultat** : **ÉCHEC**. Certaines tables rendues par le chatbot mettent les titres dans des `td` avec des classes de style, les rendant invisibles pour le sélecteur `th`.

## Tentative 2 : Recherche de Cellule Unifiée (`th, td`)
- **Approche** : Élargir la recherche d'en-têtes à tous les types de cellules.
- **Résultat** : **ÉCHEC PARTIEL**. La table était trouvée dans certains cas, mais les données étaient injectées *dans* la cellule de titre, car elle était la première de la table.

## Tentative 3 : Analyse des Frères (Siblings)
- **Approche** : Chercher uniquement dans le même conteneur de message que la table de pointage.
- **Résultat** : **ÉCHEC**. La table de résultat est souvent générée dans un message précédent, donc elle se trouve dans un conteneur parent différent (une autre "bulle" de chat).

## Tentative 4 : Recherche par Proximité Géométrique
- **Approche** : Calculer la distance entre toutes les tables "résultat" potentielles et la table de pointage active.
- **Résultat** : **SUCCÈS TECHNIQUE** (nécessitait la correction de `getElementDistance`).

## Tentative 5 : Approche "Landmark-First" (État Actuel)
- **Approche** : Puisque la "Table de Consolidation" est créée par nous et est stable, on l'utilise comme point d'ancrage pour trouver la table de résultat située au-dessus.
- **Résultat** : **EN COURS DE VALIDATION**. C'est la stratégie la plus robuste car elle suit l'ordre logique de lecture du rapport.
