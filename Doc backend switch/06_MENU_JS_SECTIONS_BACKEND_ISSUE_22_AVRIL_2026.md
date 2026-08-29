# Problème des appels Backend dans les sections du Menu.js

**Date** : 22 Avril 2026

## 1. Description du problème initial

Lors du déploiement de l'environnement de production combinant le Frontend sur **Netlify** (`https://prclaravi.netlify.app`) et le Backend sur **Zeabur** (`https://pybackend.zeabur.app`), plusieurs actions majeures invoquées depuis le menu contextuel (clic droit) du Frontend dysfonctionnaient ou retournaient un *Timeout*.

Les fonctionnalités affectées étaient les suivantes :
* **Rapports d'Audit** : Export Synthèse FRAP, Rapport Provisoire, Rapport Final.
* **Modélisation Pandas** : Calcul des écarts, Modélisation tables.
* **États Financiers SYSCOHADA** : Calculs des états, exports.
* **Analyse & Détection Fraude** : Vérification des doublons, loi de Benford, etc.
* **Échantillonnage Audit** : Modèles d'échantillonnages statistiques.

**Symptômes** :
- Erreurs `Timeout: docx non accessible` côté client.
- Aucune trace d'appel `HTTP GET/POST` enregistrée dans les logs du serveur Zeabur lors du déclenchement des actions.

## 2. Analyse Technique (Root Cause)

Lors du passage du développement local à la production via Cloud, le code a dû abandonner l'adressage statique pour les appels API. Si le blocage a été levé sur la quasi-totalité de l'application via des scripts comme `EditeurAutoTrigger.js`, certains scripts internes incluaient encore des restes d'instances de tests :

**A/ Code ciblant directement `localhost` :**
Certaines actions (en particulier les actions de documentation Word : `export-frap`, `export-rapport`, `export-synthese-cac-final`) utilisaient toujours le domaine codé en dur :
```javascript
const response = await fetch('http://localhost:5000/api/word/export-frap', {...});
```

**B/ Code dissimulant la boucle locale via `127.0.0.1` :**
La principale particularité de ce blocage concernait les appels orientés **données (Pandas)** ainsi que **statistiques** (États financiers, Échantillonnages) :
```javascript
const response = await fetch('http://127.0.0.1:5000/echantillonnage/sample', {...});
```
*Le format avec `127.0.0.1` a masqué temporairement la nature locale de la requête lors des contrôles globaux de chaînes `http://localhost:5000`.*

Au niveau du script `Modelisation_template_v2.js`, la configuration incluait également :
```javascript
pandasEndpoint: 'http://localhost:5000/pandas/analysis/complete',
```

## 3. Solution Implémentée

La solution architecturale en place dans `backendConfig.js` injecte l'URL dynamique appropriée via la variable `window.CLARA_BACKEND_URL`. Il a donc fallu traquer et substituer chaque occurrence identifiée.

Remplacement systématique vers la mécanique de *fallback* :
```javascript
// Au lieu de l'URL fixe :
const response = await fetch('http://127.0.0.1:5000/echantillonnage/sample', {...});

// On utilise dorénavant l'URL injectée de production ou le local le cas échéant :
const response = await fetch((window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/echantillonnage/sample', {...});
```

### Chemins intégralement patchés :
Dans **`public/menu.js`** :
1. `/api/word/export`
2. `/api/word/export-rapport`
3. `/api/word/export-frap`
4. `/api/word/export-synthese-cac` et `/export-synthese-cac-final`
5. `/pandas-agent/process-json`
6. `/lead-balance/process-excel`
7. `/etats-financiers/calculate` et `/etats-financiers/calculate-excel`
8. `/echantillonnage/sample`, `/echantillonnage/calculate-size`, `/echantillonnage/analyze`

Dans **`public/Modelisation_template_v2.js`** :
1. Injection dynamique via configuration (`pandasEndpoint`) ciblée sur `/pandas/analysis/complete`.

## 4. Préconisations

1. **Audit de fin de projet** : S'assurer systématiquement qu'aucune nouvelle fonction n'introduise localement une URL sans passer par l'objet global `window.CLARA_BACKEND_URL`.
2. **Extensions N8N** : Bien que des plateformes backend no-code soient en jeu (N8N par ex.), la règle du *Fallback Environnemental* doit être respectée si elles communiquent avec un module Python tierce. 
