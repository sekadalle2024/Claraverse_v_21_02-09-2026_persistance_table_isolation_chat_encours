# Migration vers la Persistance DOM - Guide Complet

## 📋 Vue d'ensemble

Ce document décrit la migration de `conso.js` depuis une persistance localStorage vers une persistance 100% DOM.

## 🎯 Objectifs

- ❌ **RETIRER** toutes les dépendances à localStorage, sessionStorage, IndexedDB
- ✅ **IMPLÉMENTER** un système de persistance basé uniquement sur la manipulation DOM
- ✅ **MAINTENIR** toutes les fonctionnalités existantes
- ✅ **ASSURER** la persistance des données tant que la page n'est pas rechargée

## 🏗️ Architecture de Persistance DOM

### 1. Conteneur de Stockage Caché

```javascript
// Création d'un conteneur DOM caché pour stocker les données
initializeDOMStore() {
  let store = document.getElementById('claraverse-dom-data-store');
  
  if (!store) {
    store = document.createElement('div');
    store.id = 'claraverse-dom-data-store';
    store.style.cssText = 'display: none !important; visibility: hidden !important;';
    store.setAttribute('aria-hidden', 'true');
    store.setAttribute('data-persistence-version', '1.0');
    store.setAttribute('data-created', new Date().toISOString());
    
    document.body.appendChild(store);
  }
  
  this.domStore = store;
}
```

### 2. Stockage des Données en JSON dans le DOM

```javascript
saveAllData(data) {
  if (!this.domStore) {
    this.initializeDOMStore();
  }
  
  // Chercher ou créer le script JSON
  let dataScript = this.domStore.querySelector('script[type="application/json"]');
  
  if (!dataScript) {
    dataScript = document.createElement('script');
    dataScript.type = 'application/json';
    dataScript.id = 'claraverse-data-json';
    this.domStore.appendChild(dataScript);
  }
  
  // Sauvegarder les données en JSON dans le textContent
  dataScript.textContent = JSON.stringify(data);
  
  // Mettre à jour les métadonnées du conteneur
  this.domStore.setAttribute('data-last-update', new Date().toISOString());
  this.domStore.setAttribute('data-table-count', Object.keys(data).length.toString());
}
```

### 3. Chargement des Données depuis le DOM

```javascript
loadAllData() {
  if (!this.domStore) {
    this.initializeDOMStore();
  }
  
  const dataScript = this.domStore.querySelector('script[type="application/json"]');
  
  if (dataScript && dataScript.textContent) {
    return JSON.parse(dataScript.textContent) || {};
  }
  
  return {};
}
```

## 🔧 Modifications Requises

### Étape 1: Retirer localStorage

**SUPPRIMER toutes les lignes contenant:**
- `localStorage.setItem()`
- `localStorage.getItem()`
- `localStorage.removeItem()`
- `localStorage.clear()`
- `this.storageKey`
- `testLocalStorage()`

**Rechercher et remplacer:**
```javascript
// ANCIEN (localStorage)
localStorage.setItem(this.storageKey, JSON.stringify(data));
const data = localStorage.getItem(this.storageKey);
localStorage.removeItem(this.storageKey);

// NOUVEAU (DOM)
this.saveAllData(data);
const data = this.loadAllData();
this.saveAllData({});
```

### Étape 2: Modifier le Constructeur

```javascript
constructor() {
  this.processedTables = new WeakSet();
  this.dropdownVisible = false;
  this.currentDropdown = null;
  this.isInitialized = false;
  // RETIRER: this.storageKey = "claraverse_tables_data";
  this.autoSaveDelay = CONFIG.autoSaveDelay;
  this.saveTimeout = null;
  this.domStore = null; // AJOUTER: Référence au conteneur DOM

  this.init();
}
```

### Étape 3: Modifier init()

```javascript
init() {
  if (this.isInitialized) return;

  debug.log("Initialisation du processeur de tables (DOM Persistence)");

  // AJOUTER: Initialiser le conteneur DOM
  this.initializeDOMStore();

  this.waitForReact(() => {
    // RETIRER: this.testLocalStorage();
    this.setupGlobalEventListeners();
    this.startTableMonitoring();
    this.restoreAllTablesData();
    this.isInitialized = true;
    debug.log("✅ Processeur initialisé avec succès (DOM Persistence)");
  });
}
```

### Étape 4: Mettre à jour CONFIG

```javascript
const CONFIG = {
  tableSelector: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg, table.min-w-full",
  alternativeSelector: "div.prose table, .prose table, table",
  checkInterval: 1000,
  processDelay: 500,
  debugMode: true,
  domStoreId: "claraverse-dom-data-store", // AJOUTER
  autoSaveDelay: 500, // AJOUTER
};
```

### Étape 5: Mettre à jour les Messages de Debug

Remplacer tous les messages de log pour refléter la persistance DOM:

```javascript
// AVANT
debug.log("💾 Données sauvegardées dans localStorage");

// APRÈS
debug.log("💾 Données sauvegardées dans le DOM");
```

```javascript
// AVANT
debug.log(`📊 ${tableIds.length} table(s) trouvée(s) dans le stockage`);

// APRÈS
debug.log(`📊 ${tableIds.length} table(s) trouvée(s) dans le stockage DOM`);
```

### Étape 6: Mettre à jour getStorageInfo()

```javascript
getStorageInfo() {
  const allData = this.loadAllData();
  const dataSize = new Blob([JSON.stringify(allData)]).size;
  const tableCount = Object.keys(allData).length;

  return {
    storageType: "DOM", // AJOUTER
    tableCount: tableCount,
    dataSize: dataSize,
    dataSizeKB: (dataSize / 1024).toFixed(2),
    dataSizeMB: (dataSize / 1024 / 1024).toFixed(2),
    lastUpdate: Math.max(...Object.values(allData).map((d) => d.timestamp || 0)),
    domStoreId: CONFIG.domStoreId, // AJOUTER
    tables: Object.keys(allData).map((key) => ({
      id: key,
      timestamp: allData[key].timestamp,
      timestampDate: new Date(allData[key].timestamp).toLocaleString("fr-FR"),
      hasConsolidation: !!allData[key].consolidation,
      cellCount: allData[key].cells ? allData[key].cells.length : 0,
    })),
  };
}
```

### Étape 7: Mettre à jour clearAllData()

```javascript
clearAllData() {
  if (
    confirm(
      "⚠️ Êtes-vous sûr de vouloir effacer toutes les données sauvegardées dans le DOM ?"
    )
  ) {
    this.saveAllData({}); // MODIFIER: au lieu de localStorage.removeItem()
    debug.log("🗑️ Toutes les données ont été effacées du DOM");
    alert("✅ Données effacées avec succès");
  }
}
```

### Étape 8: Mettre à jour exportData()

```javascript
exportData() {
  const allData = this.loadAllData();
  const jsonString = JSON.stringify(allData, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `claraverse_backup_dom_${Date.now()}.json`; // MODIFIER: ajouter _dom
  a.click();
  URL.revokeObjectURL(url);

  debug.log("📥 Données exportées depuis le DOM");
  alert("✅ Données exportées avec succès");
}
```

### Étape 9: Mettre à jour les Commandes Console

```javascript
window.claraverseCommands = {
  clearAllData: () => processor.clearAllData(),
  clearTable: (tableId) => processor.clearTableData(tableId),
  exportData: () => processor.exportData(),
  importData: (jsonData) => processor.importData(jsonData),
  saveNow: () => processor.autoSaveAllTables(),
  getStorageInfo: () => {
    const info = processor.getStorageInfo();
    console.table(info.tables);
    console.log(
      `📊 Storage: ${info.storageType} | ${info.tableCount} table(s), ${info.dataSizeKB} KB`
    );
    console.log(`📍 DOM Store ID: ${info.domStoreId}`);
    if (info.lastUpdate) {
      console.log(
        `🕐 Dernière mise à jour: ${new Date(info.lastUpdate).toLocaleString("fr-FR")}`
      );
    }
    return info;
  },
  restoreAll: () => processor.restoreAllTablesData(),
  
  // AJOUTER: Nouvelle commande pour inspecter le DOM Store
  inspectDOMStore: () => {
    const store = document.getElementById(CONFIG.domStoreId);
    if (store) {
      console.log("📦 Conteneur DOM Store trouvé:");
      console.log("  - ID:", store.id);
      console.log("  - Created:", store.getAttribute('data-created'));
      console.log("  - Last Update:", store.getAttribute('data-last-update'));
      console.log("  - Table Count:", store.getAttribute('data-table-count'));
      
      const dataScript = store.querySelector('script[type="application/json"]');
      if (dataScript) {
        const data = JSON.parse(dataScript.textContent);
        console.log("  - Data Size:", dataScript.textContent.length, "bytes");
        console.log("  - Tables:", Object.keys(data));
      } else {
        console.log("  - No data script found");
      }
    } else {
      console.log("❌ DOM Store non trouvé");
    }
  },
  
  help: () => {
    console.log(`
🎯 COMMANDES CLARAVERSE DISPONIBLES (DOM PERSISTENCE):

📊 Gestion des données:
  - claraverseCommands.getStorageInfo()       : Afficher les infos de stockage DOM
  - claraverseCommands.restoreAll()           : Restaurer toutes les tables depuis DOM
  - claraverseCommands.saveNow()              : Sauvegarder toutes les tables dans DOM
  - claraverseCommands.clearAllData()         : Effacer toutes les données du DOM
  - claraverseCommands.clearTable(tableId)    : Effacer une table spécifique

💾 Import/Export:
  - claraverseCommands.exportData()           : Exporter les données en JSON
  - claraverseCommands.importData(json)       : Importer des données JSON

🔍 Diagnostic DOM:
  - claraverseCommands.inspectDOMStore()      : Inspecter le conteneur DOM
  - claraverseCommands.debug.showStorage()    : Afficher le contenu JSON

⚠️ IMPORTANT: Les données sont persistées dans le DOM et seront perdues lors du rechargement de la page.
              Utilisez exportData() pour sauvegarder vos données de manière permanente.

💡 Les changements dans les tables sont automatiquement détectés et sauvegardés dans le DOM après 500ms
    `);
  },
};
```

## 📊 Structure des Données dans le DOM

```html
<body>
  <!-- Conteneur caché pour la persistance -->
  <div 
    id="claraverse-dom-data-store" 
    style="display: none !important; visibility: hidden !important;"
    aria-hidden="true"
    data-persistence-version="1.0"
    data-created="2024-01-15T10:30:00.000Z"
    data-last-update="2024-01-15T10:35:45.123Z"
    data-table-count="3"
  >
    <!-- Données JSON stockées dans un script -->
    <script type="application/json" id="claraverse-data-json">
    {
      "table_abc123": {
        "timestamp": 1705318545123,
        "cells": [
          {"row": 0, "col": 0, "value": "Validité", "bgColor": "#e3f2fd"},
          {"row": 0, "col": 1, "value": "Satisfaisant", "bgColor": "#e8f5e8"}
        ],
        "headers": ["Assertion", "Conclusion", "Écart"],
        "isModelized": true,
        "consolidation": {
          "fullContent": "<strong>Validité</strong>: ...",
          "simpleContent": "🔍 <strong>Validité</strong>: ...",
          "timestamp": 1705318545123
        }
      },
      "table_def456": {
        "timestamp": 1705318545456,
        "cells": [...],
        "headers": [...],
        "isModelized": false
      }
    }
    </script>
  </div>
  
  <!-- Reste du contenu de la page -->
  ...
</body>
```

## 🔒 Avantages de la Persistance DOM

1. **Aucune limite de quota** : Pas de QuotaExceededError
2. **Simplicité** : Pas besoin de gérer les permissions localStorage
3. **Performance** : Accès direct au DOM sans sérialisation/désérialisation supplémentaire
4. **Compatibilité** : Fonctionne dans tous les contextes (iframes, extensions, etc.)
5. **Transparence** : Données visibles dans l'inspecteur DOM

## ⚠️ Limitations

1. **Durée de vie** : Les données sont perdues lors du rechargement de la page
2. **Pas de persistance cross-session** : Chaque session démarre avec des données vides
3. **Pas de synchronisation** : Les données ne sont pas synchronisées entre onglets

## 💡 Solutions de Contournement

### Pour la Persistance Permanente

```javascript
// Exporter automatiquement avant déchargement de la page
window.addEventListener('beforeunload', (e) => {
  const data = processor.loadAllData();
  if (Object.keys(data).length > 0) {
    // Option 1: Demander à l'utilisateur de sauvegarder
    e.preventDefault();
    e.returnValue = 'Des données non sauvegardées existent. Voulez-vous exporter ?';
    
    // Option 2: Auto-téléchargement (peut être bloqué par les navigateurs)
    processor.exportData();
  }
});
```

### Pour le Partage Entre Onglets

```javascript
// Utiliser BroadcastChannel API pour synchroniser entre onglets
const channel = new BroadcastChannel('claraverse-sync');

channel.addEventListener('message', (event) => {
  if (event.data.type === 'data-update') {
    processor.saveAllData(event.data.payload);
    processor.restoreAllTablesData();
  }
});

// Envoyer les mises à jour aux autres onglets
function syncData(data) {
  channel.postMessage({
    type: 'data-update',
    payload: data,
    timestamp: Date.now()
  });
}
```

## 🧪 Tests de Validation

```javascript
// Test 1: Vérifier que le conteneur DOM existe
console.assert(
  document.getElementById('claraverse-dom-data-store') !== null,
  'DOM Store doit exister'
);

// Test 2: Sauvegarder et charger des données
processor.saveAllData({ test: { value: 'test' } });
const loaded = processor.loadAllData();
console.assert(loaded.test.value === 'test', 'Données doivent être récupérables');

// Test 3: Vérifier la persistance pendant la session
const tableCount = processor.findAllTables().length;
processor.autoSaveAllTables();
setTimeout(() => {
  const info = processor.getStorageInfo();
  console.log(`✅ ${info.tableCount} tables sauvegardées dans le DOM`);
}, 1000);

// Test 4: Export/Import
processor.exportData(); // Télécharge un fichier JSON
// Puis réimporter le fichier
processor.importData(jsonData);
```

## 📝 Checklist de Migration

- [ ] Supprimer tous les appels à localStorage
- [ ] Ajouter initializeDOMStore()
- [ ] Modifier loadAllData() pour lire depuis le DOM
- [ ] Modifier saveAllData() pour écrire dans le DOM
- [ ] Mettre à jour le constructeur
- [ ] Mettre à jour init()
- [ ] Mettre à jour CONFIG
- [ ] Mettre à jour tous les messages de debug
- [ ] Mettre à jour getStorageInfo()
- [ ] Mettre à jour clearAllData()
- [ ] Mettre à jour exportData()
- [ ] Mettre à jour les commandes console
- [ ] Ajouter inspectDOMStore()
- [ ] Tester la sauvegarde
- [ ] Tester la restauration
- [ ] Tester l'export/import
- [ ] Valider que toutes les fonctionnalités marchent

## 🚀 Déploiement

1. Sauvegarder l'ancienne version : `cp conso.js conso_backup.js`
2. Appliquer toutes les modifications listées ci-dessus
3. Tester dans l'environnement de développement
4. Valider avec `claraverseCommands.testPersistence()`
5. Vérifier avec `claraverseCommands.inspectDOMStore()`
6. Déployer en production

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs console : `CONFIG.debugMode = true`
2. Inspecter le DOM Store : `claraverseCommands.inspectDOMStore()`
3. Vérifier les données : `claraverseCommands.getStorageInfo()`
4. Consulter ce guide de migration