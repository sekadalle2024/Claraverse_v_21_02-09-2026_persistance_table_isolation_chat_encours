# ✅ Mise à Jour Modelisation_template_v2.js - Critère "Template"

## 📋 Résumé des Modifications

Le fichier `Modelisation_template_v2.js` a été mis à jour pour :

1. **Changement du critère de détection** : Passage de "Flowise" à "Template"
2. **Ajout du Case 8** : Support des documents Google Drive (n8n_doc)
3. **Amélioration du Case 4** : Intégration complète du workflow n8n pour PARTIE 4

---

## 🔄 Changements Principaux

### 1. Nouveau Critère de Détection

**AVANT** (colonnes Flowise) :
```javascript
keywords: {
    flowise: ['Flowise', 'FLOWISE', 'flowise'],
    // ...
}
```

**APRÈS** (colonnes Template) :
```javascript
keywords: {
    template: ['Template', 'TEMPLATE', 'template'],
    partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
    partie2: ['PARTIE 2', 'partie 2', 'Partie 2'],
    partie3: ['PARTIE 3', 'partie 3', 'Partie 3'],
    partie4: ['PARTIE 4', 'partie 4', 'Partie 4'],
    partie5: ['PARTIE 5', 'partie 5', 'Partie 5'],
    n8n_doc: ['n8n_doc', 'n8n doc']
}
```

### 2. Fonction de Détection Renommée

```javascript
// AVANT
function detectAllFlowiseTables() {
    // Cherchait "Flowise" dans les tables
}

// APRÈS
function detectAllTemplateTables() {
    // Cherche "Template" dans les en-têtes de colonnes
}
```

### 3. Nouveau Case 8 - Google Drive

```javascript
async function handleCase8(table) {
    // Charge et affiche un document Google Drive
    // URL: https://docs.google.com/document/d/1qaymPK-_nfCYxDO8KVylijXvi11oSpr5zsEEhwTzz5I/edit
    // Utilise l'API d'export HTML de Google Drive
}
```

**Fonctionnalités du Case 8** :
- ☁️ Chargement automatique depuis Google Drive
- 📄 Conversion HTML en temps réel
- 🔗 Liens vers le document original
- ⬇️ Option de téléchargement
- ❌ Gestion d'erreur si le document n'est pas accessible

### 4. Case 4 Amélioré - Workflow n8n

**Endpoint** : `https://0ngdph0y.rpcld.co/webhook/template`

```javascript
async function handleCase4(table) {
    // Appel au workflow n8n
    // Traitement des données "Etape mission - Programme"
    // Génération de tableaux HTML formatés
}
```

---

## 📊 Switch Case Complet

| Case | Critère Table | Source de Données | Template | Description |
|------|---------------|-------------------|----------|-------------|
| **Case 1** | PARTIE 1 | Document Word (PARTIE1.docx) | Template Alpha | Document statique avec Mammoth.js |
| **Case 2** | PARTIE 2 | JSON statique (DATA_COLLECTION) | Template Beta | Données JSON en accordéon |
| **Case 3** | PARTIE 3 | JSON dynamique (n8n endpoint) | Template Beta | Fetch vers n8n webhook |
| **Case 4** | PARTIE 4 | Workflow n8n (programme travail) | Template Beta | Données n8n formatées |
| **Case 5** | PARTIE 5 | PDF (PARTIE5.pdf) | Viewer PDF | Viewer PDF optimisé |
| **Case 8** | n8n_doc | Google Drive | Template Beta | Document cloud |

---

## 🎯 Logique de Détection

### Étape 1 : Recherche de "Template"
Le script cherche d'abord les tables contenant le mot "Template" (ou ses variations) dans leurs en-têtes de colonnes.

### Étape 2 : Identification du Type
Pour chaque table "Template" trouvée, le script identifie le type de contenu :
- Recherche de "PARTIE 1", "PARTIE 2", etc.
- Recherche de "n8n_doc" ou "n8n doc"

### Étape 3 : Génération du Document
Selon le type détecté, le case correspondant est exécuté pour générer le document approprié.

---

## 🔧 Configuration

```javascript
const CONFIG = {
    selectors: {
        baseTables: 'table'
    },
    keywords: {
        template: ['Template', 'TEMPLATE', 'template'],
        partie1: ['PARTIE 1', 'partie 1', 'Partie 1'],
        partie2: ['PARTIE 2', 'partie 2', 'Partie 2'],
        partie3: ['PARTIE 3', 'partie 3', 'Partie 3'],
        partie4: ['PARTIE 4', 'partie 4', 'Partie 4'],
        partie5: ['PARTIE 5', 'partie 5', 'Partie 5'],
        n8n_doc: ['n8n_doc', 'n8n doc']
    },
    n8nEndpoint: 'https://barow52161.app.n8n.cloud/webhook/cia_cours_gemini',
    n8nEndpointProgramme: 'https://0ngdph0y.rpcld.co/webhook/template',
    googleDrive: {
        clientId: '[VOTRE_GOOGLE_CLIENT_ID]',
        clientSecret: '[VOTRE_GOOGLE_CLIENT_SECRET]Contenu'
    },
    debug: true
};
```

---

## 📁 Structure des Fichiers

```
public/
├── Modelisation_template_v2.js  ✅ ACTIVÉ
├── mammoth-loader-fix.js        (requis pour Case 1)
└── ressource/
    ├── PARTIE1.docx              (Case 1)
    ├── PARTIE5.pdf               (Case 5)
    └── Template                  (Case 8 - optionnel)
```

---

## 🚀 Activation dans index.html

```html
<!-- Version 2: Génère un document séparé pour chaque table Template (ACTIVÉ) -->
<script src="/Modelisation_template_v2.js"></script>
```

---

## 🧪 Test Manuel

### Console du Navigateur

```javascript
// Exécuter manuellement
window.ModelisationTemplateV2.execute();

// Vérifier la configuration
console.log(window.ModelisationTemplateV2.config);
```

### Créer une Table de Test

```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PARTIE 1</td>
      <td>Test document Word</td>
    </tr>
  </tbody>
</table>
```

---

## 📝 Exemple de Table Valide

Pour déclencher le Case 8 (Google Drive) :

```html
<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>n8n_doc</td>
      <td>Document partagé</td>
    </tr>
  </tbody>
</table>
```

---

## ⚠️ Points d'Attention

### Case 8 - Google Drive
- Le document doit être **accessible publiquement** ou avec le lien
- L'URL d'export utilise : `/export?format=html`
- Si le document n'est pas accessible, un message d'erreur s'affiche

### Case 4 - Workflow n8n
- L'endpoint doit retourner une structure spécifique
- Format attendu : `{ data: { "Etape mission - Programme": [...] } }`

### Case 1 - Document Word
- Nécessite `mammoth-loader-fix.js` chargé avant
- Le fichier doit être dans `public/ressource/PARTIE1.docx`

---

## 🎨 Templates Utilisés

### Template Alpha
- Design PDF avec pages
- Couverture stylisée
- Sections avec cartes colorées

### Template Beta (Accordéon)
- Navigation par sections
- Contenu pliable/dépliable
- Page de couverture optionnelle
- Style moderne avec animations

### Viewer PDF
- Contrôles de navigation
- Boutons signets
- Plein écran
- Téléchargement

---

## 🔍 Debugging

```javascript
// Activer les logs détaillés
window.ModelisationTemplateV2.config.debug = true;

// Réexécuter
window.ModelisationTemplateV2.execute();
```

**Messages de log** :
- `🚀 Modelisation_template_v2.js - Génération séparée (Critère: Template)`
- `📊 X document(s) à générer`
- `✅ PARTIE1 détectée` / `✅ N8N_DOC détectée`
- `✅ Template X injecté`

---

## ✅ Checklist de Vérification

- [x] Critère de détection changé de "Flowise" à "Template"
- [x] Case 8 (n8n_doc) ajouté et fonctionnel
- [x] Case 4 amélioré avec endpoint n8n programme
- [x] Fonction `detectAllTemplateTables()` renommée
- [x] Configuration mise à jour avec nouveaux keywords
- [x] Script activé dans `index.html`
- [x] Documentation créée

---

## 📞 Support

En cas de problème :
1. Vérifier la console du navigateur (F12)
2. Activer `debug: true` dans CONFIG
3. Tester manuellement : `window.ModelisationTemplateV2.execute()`
4. Vérifier que les tables contiennent bien "Template" dans les en-têtes

---

**Date de mise à jour** : 13 décembre 2025  
**Version** : 2.1 (Critère Template + Case 8)  
**Statut** : ✅ ACTIVÉ et TESTÉ
