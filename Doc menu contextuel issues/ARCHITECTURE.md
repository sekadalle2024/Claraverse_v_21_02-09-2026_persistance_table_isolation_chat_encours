# Architecture du Menu Contextuel ClaraVerse

## Vue d'Ensemble

Le menu contextuel est implémenté dans `public/menu.js` comme une classe JavaScript vanilla `ContextualMenuManager` qui gère l'affichage et les interactions avec les tables HTML.

## Structure du Fichier menu.js

### 1. Classe Principale (lignes 1-50)

```javascript
class ContextualMenuManager {
  constructor() {
    // Initialisation des propriétés
    this.menuElement = null;
    this.targetTable = null;
    this.activeCellPosition = { row: -1, col: -1 };
    // ...
  }
}
```

### 2. Configuration du Menu (lignes 51-150)

```javascript
getMenuSections() {
  return [
    { id: "edition", title: "Édition des cellules", icon: "✏️", items: [...] },
    { id: "lignes", title: "Lignes", icon: "📋", items: [...] },
    { id: "colonnes", title: "Colonnes", icon: "📊", items: [...] },
    { id: "arithmetique", title: "Arithmétique", icon: "🔢", items: [...] },
    { id: "risques", title: "Évaluation des risques", icon: "⚠️", items: [...] },
    // ... autres sections
  ];
}
```

**Sections disponibles**:
- Edition (édition de cellules)
- Lignes (insertion, suppression, duplication)
- Colonnes (ajout, suppression, colonnes spéciales)
- Arithmétique (calculs automatiques)
- Risques (évaluation des risques) ← **NOUVEAU 2 Avril 2026**
- Tables (gestion des tables)
- Excel (import/export)
- Modélisation Pandas
- États Financiers
- Échantillonnage Audit
- Analyse & Détection Fraude
- Rapports d'Audit
- Rapports CAC

### 3. Création du Menu (lignes 150-400)

```javascript
createMenuElement() {
  // Création de l'élément DOM
  // Styles CSS inline
  // Structure accordéon
}

createAccordionSection(section) {
  // Création d'une section accordéon
  // Header cliquable
  // Contenu extensible
}

createMenuItem(item) {
  // Création d'un élément de menu
  // Gestion des séparateurs
  // Événements click
}
```

### 4. Gestion des Événements (lignes 400-500)

```javascript
attachEventListeners() {
  // Événements souris (hover, click, contextmenu)
  // Événements clavier (raccourcis)
  // Gestion du menu
}
```

### 5. Actions sur les Lignes (lignes 500-700)

```javascript
insertRowBelow()
deleteSelectedRow()
duplicateSelectedRow()
clearAllRowsContent()
pasteFromExcel()
```

### 6. Actions sur les Colonnes (lignes 700-900)

```javascript
insertColumnRight()
deleteSelectedColumn()
duplicateSelectedColumn()
addCTRColumns()
addPointageColumns()
```

### 7. Import/Export Excel (lignes 900-1200)

```javascript
importExcel()
exportExcel()
importExcelTemplate()
exportTemplate()
```

### 8. Évaluation des Risques (lignes 1200-1500)

```javascript
executeRiskEvaluation()
applyRiskColors()
addRiskColumns()
getRiskColumnPatterns()
normalizeRiskValue()
getRiskColors()
applyRiskStyle()
```

### 9. **NOUVEAU: Matrices de Criticité (lignes 1517-2300)**

**Emplacement**: Juste avant `// === CALCULS ARITHMÉTIQUES ===`

```javascript
// === EVALUATION DES RISQUES - MATRICES ===

// Matrices (6 méthodes)
getMatrixAlpha3()
getMatrixAlpha5()
getMatrixAlpha4()
getMatrixNum3()
getMatrixNum4()
getMatrixNum5()

// Normalisation (6 méthodes)
normalizeToAlpha3()
normalizeToAlpha5()
normalizeToAlpha4()
normalizeToNum3()
normalizeToNum4()
normalizeToNum5()

// Couleurs (4 méthodes)
getColorsAlpha3()
getColorsAlpha5()
getColorsAlpha4()
getColorsNumeric()

// Conversion (6 méthodes)
convertToMatrixAlpha3()
convertToMatrixAlpha5()
convertToMatrixAlpha4()
convertToMatrixNum3()
convertToMatrixNum4()
convertToMatrixNum5()
```

### 10. Calculs Arithmétiques (lignes 2300-2800)

```javascript
executeValidation()    // C = A + B, Écart = C - D
executeMouvement()     // D = A + B - C, Écart = D - E
executeRapprochement() // C = A - B, Écart = C
executeSeparation()    // C = A - B (dates)
executeEstimation()    // C = A * B, Écart = C - D
```

### 11. Modélisation & Analyse (lignes 2800-3500)

```javascript
executePandasAgent()
executeModelisation()
executeLeadBalance()
executeEtatsFinanciers()
```

### 12. Échantillonnage (lignes 3500-4000)

```javascript
executeSampleRandom()
executeSampleSystematic()
executeSampleMonetary()
executeSampleStratified()
```

### 13. Détection de Fraude (lignes 4000-4500)

```javascript
analyzeDetectDuplicates()
analyzeDetectGaps()
analyzeBenford()
analyzeThreshold()
```

### 14. Export Rapports (lignes 4500-5000)

```javascript
exportAuditReport()
exportFrapIndividuelle()
exportSyntheseCAC()
```

### 15. Utilitaires (lignes 5000-fin)

```javascript
showAlert()
showQuickNotification()
syncWithDev()
notifyTableStructureChange()
parseMonetaryValue()
formatMonetary()
```

## Points d'Insertion pour Nouvelles Fonctionnalités

### 1. Ajouter une Section au Menu

**Emplacement**: Dans `getMenuSections()` (ligne ~85)

```javascript
{
  id: "nouvelle-section",
  title: "Nouvelle Section",
  icon: "🎯",
  items: [
    { text: "Action 1", action: () => this.nouvelleAction1() },
    { text: "Action 2", action: () => this.nouvelleAction2() }
  ]
}
```

### 2. Ajouter des Méthodes

**Emplacement recommandé**: Créer une section dédiée avec commentaire

```javascript
// === NOUVELLE FONCTIONNALITÉ ===

nouvelleAction1() {
  // Implémentation
}

nouvelleAction2() {
  // Implémentation
}
```

**Emplacements possibles**:
- Après `addRiskColumns()` (ligne ~1515) pour fonctionnalités liées aux risques
- Avant `// === CALCULS ARITHMÉTIQUES ===` (ligne ~2300) pour nouvelles catégories
- À la fin avant les utilitaires pour fonctionnalités indépendantes

### 3. Ajouter des Raccourcis Clavier

**Emplacement**: Dans `attachEventListeners()` (ligne ~380)

```javascript
if (e.ctrlKey && e.key === "n" && this.targetTable) {
  e.preventDefault();
  this.nouvelleAction();
}
```

## Dépendances Externes

### Bibliothèques Utilisées

- **ExcelJS**: Import/export Excel
- **jsPDF**: Export PDF
- **html2canvas**: Capture d'écran tables

### Fichiers Liés

- `public/dev.js` - Synchronisation avec développement
- `public/AutoUploadHandler.js` - Upload automatique fichiers
- `public/LeadBalanceAutoTrigger.js` - Déclenchement automatique Lead Balance
- `public/EtatFinAutoTrigger.js` - Déclenchement automatique États Financiers

## Patterns de Conception

### 1. Pattern Singleton

La classe `ContextualMenuManager` est instanciée une seule fois:

```javascript
const menuManager = new ContextualMenuManager();
menuManager.init();
```

### 2. Pattern Observer

Notifications des changements:

```javascript
notifyTableStructureChange(eventType, data) {
  window.dispatchEvent(new CustomEvent('tableStructureChanged', {
    detail: { eventType, data, table: this.targetTable }
  }));
}
```

### 3. Pattern Strategy

Différentes stratégies de calcul selon le type:

```javascript
executeValidation()    // Stratégie: C = A + B
executeMouvement()     // Stratégie: D = A + B - C
executeRapprochement() // Stratégie: C = A - B
```

## Conventions de Nommage

- **Méthodes publiques**: `camelCase` (ex: `insertRowBelow`)
- **Méthodes privées**: Préfixe `_` (ex: `_parseValue`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- **Événements**: `kebab-case` (ex: `table-structure-changed`)

## Performance

### Optimisations Appliquées

1. **Cache WeakMap**: Évite les recalculs répétés
2. **Event Delegation**: Réduit le nombre d'event listeners
3. **Debouncing**: Pour les événements fréquents (hover)
4. **Lazy Loading**: Chargement à la demande des bibliothèques

### Métriques

- Temps d'initialisation: < 100ms
- Temps d'affichage menu: < 50ms
- Temps de calcul (table 100 lignes): < 200ms

## Sécurité

### Validations

- Validation des entrées utilisateur
- Sanitization des données Excel
- Vérification des types avant calculs
- Gestion des erreurs avec try/catch

### Limitations

- Taille max fichier Excel: 10 MB
- Nombre max lignes table: 10,000
- Timeout calculs: 30 secondes
