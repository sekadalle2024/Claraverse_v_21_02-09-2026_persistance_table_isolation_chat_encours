# Analyse et Résolution du Problème des Rapports d'Audit

## 1. Contexte et Problème
L'utilisateur a signalé que certaines fonctionnalités (Lead Balance, Editeur) fonctionnaient correctement en production (frontend sur Netlify, backend sur Zeabur), tandis que les fonctionnalités liées à l'export des "**Rapports d'Audit**" (Export Synthèse FRAP, Export Rapport Provisoire, Export Rapport Final, Export FRAP Individuelle) échouaient avec des erreurs telles que `❌ Erreur: Timeout: docx non accessible` ou qu'elles ne semblaient faire aucun appel au serveur backend Zeabur.

## 2. Analyse des Hypothèses
Parmi les hypothèses levées, **l'Hypothèse 1** s'est avérée être la cause racine directe du problème :
> *"dans menu.js, les scripts lies a Rapports d'Audit n'ont peut etre pas encore ete patche afin de pouvoir s executer comme les Features fonctionnelles"*

En analysant le code source de `public/menu.js`, nous avons constaté que l'ancienne logique d'appels API persistait, avec des chemins codés en dur pointant spécifiquement vers le backend local.

Exemple (lignes 4114, 4234, 4666, 8861, 9350) de `menu.js` :
```javascript
const response = await fetch('http://localhost:5000/api/word/export-frap', {...});
```

Il est impossible pour le frontend hébergé sur Netlify (`https://prclaravi.netlify.app/`) de dialoguer via `http://localhost:5000` chez l'utilisateur final. Le navigateur va le bloquer (CORS ou simple échec de résolution réseau depuis l'extérieur), ce qui explique le timeout ou que Zeabur ne reçoive aucune trace de la requête.

De plus, une vérification rapide du backend (Hypothèse 4) a permis de confirmer que les routeurs pour ces exports (`word_export`, `export_synthese_cac`, etc.) sont **correctement inclus** et exposés sur le backend de production Zeabur dans `py_backend/main.py`.

## 3. Plan de Résolution
Nous utilisons une approche similaire à celle adoptée pour `EditeurAutoTrigger.js` ou `LeadBalanceAutoTrigger.js` :
Le fichier de configuration frontend `backendConfig.js` injecte l'URL dynamique appropriée via `window.CLARA_BACKEND_URL`.

**Actions prévues :**
1. Remplacer `fetch('http://localhost:5000/api/word/export'` par `fetch((window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/api/word/export'`
2. Appliquer ce remplacement pour les 5 actions liées aux exports de rapports dans le fichier `public/menu.js`.

Cela assurera le pointage intelligent (`http://localhost:5000` en local et `https://pybackend.zeabur.app` en prod) au moment de l'exécution (Runtime) sur Netlify.
