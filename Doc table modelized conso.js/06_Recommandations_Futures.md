# 06 - Recommandations Futures

Pour éviter la résurgence de ces problèmes lors des futures mises à jour de Claraverse.

## 1. Standardisation des Classes CSS
Il serait idéal que chaque type de table (Pointage, Résultat, Synthèse) possède une classe spécifique injectée par le backend (ex: `clara-type-resultat`). Cela éliminerait le besoin de recherche par mot-clé textuel.

## 2. API de Sauvegarde Centralisée
Actuellement, chaque script (`conso.js`, `dev.js`, `Flowise.js`) possède sa propre logique de sauvegarde. Une API globale `window.claraverse.save(element)` simplifierait la maintenance et garantirait que React ne perd aucune donnée.

## 3. Logs de Production
Maintenir le `CONFIG.debugMode = true` pendant les phases de beta-test pour permettre de diagnostiquer les échecs de découverte de table via la console navigateur.

## 4. Test sur Structures Complexes
Lors de l'ajout de nouveaux modules (ex: E-controle), vérifier si la structure des messages change (ex: utilisation de Shadow DOM ou d'Iframes), ce qui casserait les sélecteurs actuels de `conso.js`.
