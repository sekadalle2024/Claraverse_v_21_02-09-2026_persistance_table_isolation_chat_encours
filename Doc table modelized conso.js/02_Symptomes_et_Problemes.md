# 02 - Symptômes et Problèmes Rencontrés

Lors du développement et de la maintenance de `conso.js`, plusieurs problèmes critiques ont été identifiés.

## 1. Injection de Tables en Doublons
**Symptôme** : Chaque fois qu'une table était mise à jour ou que React rafraîchissait le composant, une nouvelle "Table de Consolidation" était injectée, créant une pile de tables identiques.
**Impact** : Interface illisible et surcharge du DOM.

## 2. Échec de Mise à Jour de la Table RÉSULTAT
**Symptôme** : Malgré une consolidation réussie dans la table intermédiaire, la table "RÉSULTAT" (située plus haut dans la conversation) restait immobile ou "En attente de consolidation".
**Impact** : L'utilisateur devait copier-coller manuellement les résultats, perdant le bénéfice de l'automatisation.

## 3. Disparition des Données lors de la Navigation
**Symptôme** : Les saisies effectuées dans les cellules éditables étaient perdues si l'utilisateur changeait de vue ou si le script de sauvegarde ne se déclenchait pas correctement.
**Impact** : Perte de travail pour l'utilisateur.

## 4. Sélecteurs Trop Rigides
**Symptôme** : Le script cherchait la table résultat avec des sélecteurs très précis (ex: `table.min-w-full`). Si la structure HTML changeait légèrement (ex: en-tête dans un `td` plutôt qu'un `th`), la table n'était plus trouvée.
**Impact** : Fragilité du script face aux mises à jour de l'UI.
