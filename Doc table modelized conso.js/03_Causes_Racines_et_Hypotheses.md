# 03 - Causes Racines et Hypothèses

L'analyse technique a permis d'identifier les causes profondes des dysfonctionnements.

## Causes Racines

### A. Absence d'Identifiants Uniques (UUIDs)
Les tables générées par le chatbot n'ont aucun ID permettant de les relier de manière fiable à leur table de consolidation respective après un re-render React.
*Hypothèse confirmée* : En utilisant un hash basé sur le texte des en-têtes, on obtient une signature stable pour une table donnée.

### B. Concurrence avec le DOM Virtuel de React
React "écrase" souvent les modifications apportées directement via `innerHTML` ou `appendChild` si ces éléments ne font pas partie de son état interne.
*Hypothèse confirmée* : L'utilisation de `MutationObserver` et d'une synchronisation forcée via un événement `custom-event` est nécessaire pour maintenir la cohérence.

### C. Structure DOM Imprévisible du Chatbot
Le chatbot peut encapsuler les tables dans des `div`, des `p`, ou même rendre des en-têtes de table dans des éléments `td` standards pour des raisons de style.
*Hypothèse confirmée* : Les sélecteurs CSS standards (`th`) sont insuffisants ; une recherche par mot-clé textuel (`textContent.includes`) est plus fiable.

### D. Erreurs Silencieuses de Script
Certaines fonctions (ex: `getElementDistance`) étaient appelées sans être définies à cause de refactorisations incomplètes, arrêtant l'exécution du script de mise à jour.
*Hypothèse confirmée* : L'absence de blocs `try-catch` robustes et de logs détaillés masquait ces erreurs.

## Hypothèses de Travail pour la Table RÉSULTAT
1.  **Hypothèse 1** : La table est dans un autre conteneur de message (Message Parent).
2.  **Hypothèse 2** : Le titre "Résultats des tests" n'est pas *dans* la table mais *au-dessus* (élément frère).
3.  **Hypothèse 3** : Le script tente d'injecter les résultats dans la cellule de titre (écrasant le titre et ne montrant rien de cohérent).
