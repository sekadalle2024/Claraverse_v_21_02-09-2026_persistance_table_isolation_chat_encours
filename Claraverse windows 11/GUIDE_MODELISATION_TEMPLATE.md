# Guide Modelisation_template.js

## 📋 Vue d'ensemble

Le script `Modelisation_template.js` permet d'injecter dynamiquement des templates de documents (PDF, DOCX, JSON) dans les pages de chat Claraverse en fonction de critères spécifiques détectés dans les tables.

## 🎯 Objectif

Simuler l'affichage de documents professionnels (rapports d'audit, guides, etc.) directement dans le chat en fonction du contenu des tables générées par Flowise.

## 🔍 Fonctionnement

### Détection des tables cibles

Le script recherche les tables avec :
- **Sélecteur CSS de base** : `table.min-w-full.border.border-gray-200.dark:border-gray-700.rounded-lg`
- **Mot-clé obligatoire** : "Flowise", "FLOWISE" ou "flowise" dans une colonne
- **Critère spécifique** : "PARTIE 1", "PARTIE 2", "PARTIE 3", "PARTIE 4" ou "PARTIE 5"

### Switch Case - 5 scénarios

#### Case 1: PARTIE 1 - Document DOCX statique
- **Source** : Fichier DOCX dans `/ressource/PARTIE 1`
- **Template** : Alpha (format PDF avec pages)
- **Données** : Statiques, intégrées dans le script

#### Case 2: PARTIE 2 - JSON statique
- **Source** : Données JSON statiques (DATA_COLLECTION)
- **Template** : Beta (format accordéon)
- **Données** : Structure JSON prédéfinie

#### Case 3: PARTIE 3 - JSON dynamique via n8n
- **Source** : Endpoint n8n `https://0ngdph0y.rpcld.co/webhook/template`
- **Template** : Beta (format accordéon)
- **Données** : Récupérées dynamiquement via fetch

#### Case 4: PARTIE 4 - Document Word via n8n
- **Source** : Endpoint n8n avec données de workflow
- **Template** : Beta (format accordéon avec tables)
- **Données** : Structure complexe avec tables de contrôle

#### Case 5: PARTIE 5 - Document PDF statique
- **Source** : Fichier PDF dans `/ressource/PARTIE 5`
- **Template** : Beta (format accordéon)
- **Données** : Statiques, simulant un PDF

## 🚀 Intégration dans index.html

Ajoutez le script dans votre `index.html` :

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Claraverse</title>
</head>
<body>
    <div id="root"></div>
    
    <!-- Votre application React -->
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Script de modélisation -->
    <script src="/Modelisation_template.js"></script>
</body>
</html>
```

## 📊 Templates disponibles

### Template Alpha - Format PDF
- Pages avec défilement vertical
- Design professionnel avec dégradés
- Idéal pour documents formels

### Template Beta - Format Accordéon
- Sections pliables/dépliables
- Navigation intuitive
- Idéal pour contenu structuré

## 🔧 Configuration

Modifiez les constantes dans le script :

```javascript
const CONFIG = {
    selectors: {
        baseTables: 'votre-selecteur',
        chatContainer: 'votre-conteneur'
    },
    keywords: {
        flowise: ['Flowise', 'FLOWISE'],
        partie1: ['PARTIE 1', 'partie 1']
    },
    n8nEndpoint: 'https://votre-endpoint.com/webhook'
};
```

## 🧪 Test

Ouvrez `public/test-modelisation-template.html` dans votre navigateur pour tester chaque cas individuellement.

## 📝 Exemple d'utilisation

### Dans Flowise, créez une table comme :

| Flowise | Type |
|---------|------|
| PARTIE 2 | Guide d'audit |

Le script détectera automatiquement "PARTIE 2" et injectera le template Beta avec les données JSON correspondantes.

## 🎨 Personnalisation des templates

Modifiez les fonctions dans `TEMPLATES` :

```javascript
const TEMPLATES = {
    alpha: function(data) {
        // Votre HTML personnalisé
        return `<div>...</div>`;
    },
    beta: function(data) {
        // Votre HTML personnalisé
        return `<div>...</div>`;
    }
};
```

## 🔄 Observateur de mutations

Le script surveille automatiquement les changements du DOM et réagit aux nouvelles tables ajoutées dynamiquement.

## 📞 API exposée

```javascript
// Exécuter manuellement
window.ModelisationTemplate.execute();

// Détecter le type de contenu
window.ModelisationTemplate.detectContentType(tables);

// Injecter un template
window.ModelisationTemplate.injectTemplate(div, html);
```

## ⚠️ Notes importantes

1. Le script s'exécute automatiquement au chargement de la page
2. Il observe les mutations du DOM pour détecter les nouvelles tables
3. L'injection se fait dans la dernière div contenant des tables
4. Les données n8n nécessitent une connexion réseau

## 🐛 Débogage

Ouvrez la console du navigateur pour voir les logs :
- 🚀 Démarrage
- 📊 Tables détectées
- 🎯 Type détecté
- ✅ Template injecté

## 📦 Fichiers du système

- `public/Modelisation_template.js` - Script principal
- `public/test-modelisation-template.html` - Page de test
- `GUIDE_MODELISATION_TEMPLATE.md` - Cette documentation
