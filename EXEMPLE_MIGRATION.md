# Exemple de Migration - Changements Clés

Ce document montre les changements principaux à effectuer dans `conso.js` avec des exemples visuels avant/après.

## 📝 Changement 1 : Constructor

### ❌ AVANT (avec localStorage)

```javascript
class ClaraverseTableProcessor {
  constructor() {
    this.processedTables = new WeakSet();
    this.dropdownVisible = false;
    this.currentDropdown = null;
    this.isInitialized = false;
    this.storageKey = "claraverse_tables_data";    // ❌ À SUPPRIMER
    this.autoSaveDelay = 500;
    this.saveTimeout = null;

    this.init();
  }
}
```

### ✅ APRÈS (avec DOM)

```javascript
class ClaraverseTableProcessor {
  constructor() {
    this.processedTables = new WeakSet();
    this.dropdownVisible = false;
    this.currentDropdown = null;
    this.isInitialized = false;
    this.autoSaveDelay = 300;                      // ✅ Optimisé
    this.saveTimeout = null;
    this.domStore = null;                          // ✅ NOUVEAU
    this.shadowStore = null;                       // ✅ NOUVEAU
    this.tableDataCache = new Map();               // ✅ NOUVEAU

    this.init();
  }
}
```

---

## 📝 Changement 2 : Initialisation

### ❌ AVANT (testLocalStorage)

```javascript
init() {
  if (this.isInitialized) return;

  debug.log("Initialisation du processeur de tables");

  this.waitForReact(() => {
    this.testLocalStorage();                       // ❌ À REMPLACER
    this.setupGlobalEventListeners();
    this.startTableMonitoring();
    this.restoreAllTablesData();
    this.isInitialized = true;
  });
}

testLocalStorage() {
  try {
    const testKey = "claraverse_test";
    localStorage.setItem(testKey, "test");         // ❌ localStorage
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (testValue === "test") {
      debug.log("✅ localStorage fonctionne correctement");
    }
  } catch (error) {
    debug.error("❌ Erreur localStorage:", error);
  }
}
```

### ✅ APRÈS (initDOMStore)

```javascript
init() {
  if (this.isInitialized) return;

  debug.log("Initialisation du processeur de tables (DOM Persistance)");

  this.waitForReact(() => {
    this.initDOMStore();                          // ✅ NOUVEAU
    this.setupGlobalEventListeners();
    this.startTableMonitoring();
    this.restoreAllTablesData();
    this.isInitialized = true;
    debug.log("✅ Processeur initialisé avec persistance DOM pure");
  });
}

initDOMStore() {
  // Conteneur principal pour métadonnées
  let store = document.getElementById('claraverse-dom-store');
  if (!store) {
    store = document.createElement('div');
    store.id = 'claraverse-dom-store';
    store.style.cssText = 'display: none !important; visibility: hidden;';
    store.setAttribute('aria-hidden', 'true');
    store.setAttribute('data-claraverse-store', 'true');
    document.body.appendChild(store);
    debug.log('✅ Conteneur DOM créé');
  }
  this.domStore = store;

  // Conteneur shadow pour clones de tables
  let shadowStore = document.getElementById('claraverse-shadow-tables');
  if (!shadowStore) {
    shadowStore = document.createElement('div');
    shadowStore.id = 'claraverse-shadow-tables';
    shadowStore.style.cssText = 'display: none !important; visibility: hidden;';
    shadowStore.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shadowStore);
    debug.log('✅ Conteneur shadow créé');
  }
  this.shadowStore = shadowStore;

  const storedTables = shadowStore.querySelectorAll('[data-shadow-table]');
  debug.log(`📦 ${storedTables.length} table(s) dans le shadow store`);
}
```

---

## 📝 Changement 3 : Sauvegarde

### ❌ AVANT (localStorage)

```javascript
saveTableDataNow(table) {
  if (!table) return;

  const tableId = this.generateUniqueTableId(table);
  const allData = this.loadAllData();              // ❌ localStorage.getItem
  
  const tableData = {
    timestamp: Date.now(),
    cells: [],
    headers: []
  };

  // Extraction des données...
  const cells = table.querySelectorAll('td');
  cells.forEach((cell, index) => {
    tableData.cells.push({
      row: rowIndex,
      col: colIndex,
      value: cell.textContent.trim(),
      bgColor: cell.style.backgroundColor
    });
  });

  allData[tableId] = tableData;
  this.saveAllData(allData);                       // ❌ localStorage.setItem
  
  debug.log(`✅ Table ${tableId} sauvegardée`);
}

saveAllData(data) {
  try {
    localStorage.setItem(this.storageKey, JSON.stringify(data));  // ❌
    debug.log("💾 Données sauvegardées dans localStorage");
  } catch (error) {
    debug.error("❌ Erreur lors de la sauvegarde:", error);
  }
}
```

### ✅ APRÈS (DOM)

```javascript
saveTableDataNow(table) {
  if (!table) return;

  const tableId = this.generateUniqueTableId(table);
  debug.log('💾 Sauvegarde DOM immédiate:', tableId);

  try {
    // 1. Marquer les cellules avec data-attributes
    const allCells = table.querySelectorAll('td');
    let modifiedCount = 0;

    allCells.forEach((cell, index) => {
      const value = cell.textContent.trim();
      const currentValue = cell.getAttribute('data-persisted-value');

      if (value !== currentValue || cell.hasAttribute('data-modified')) {
        cell.setAttribute('data-persisted-value', value);      // ✅ DOM
        cell.setAttribute('data-persisted-time', Date.now());  // ✅ DOM
        cell.setAttribute('data-cell-index', index);

        if (cell.style.backgroundColor) {
          cell.setAttribute('data-persisted-bgcolor', cell.style.backgroundColor);
        }
        modifiedCount++;
      }
    });

    // 2. Créer snapshot dans le shadow store
    this.createTableSnapshot(table);                           // ✅ NOUVEAU

    // 3. Cache mémoire pour accès rapide
    this.tableDataCache.set(tableId, {                         // ✅ Map
      timestamp: Date.now(),
      cellCount: allCells.length,
      modifiedCount: modifiedCount,
      tableHTML: table.outerHTML
    });

    // 4. Marquer la table comme sauvegardée
    table.setAttribute('data-last-saved', Date.now());
    table.setAttribute('data-saved-dom', 'true');

    debug.log(`✅ Table ${tableId} sauvegardée dans le DOM`);
    debug.log(`   - ${modifiedCount} cellule(s) modifiée(s)`);

  } catch (error) {
    debug.error('❌ Erreur sauvegarde DOM:', error);
  }
}

// ✅ NOUVELLE MÉTHODE
createTableSnapshot(table) {
  const tableId = table.dataset.tableId;
  if (!tableId) return;

  let snapshot = this.shadowStore.querySelector(`[data-shadow-table="${tableId}"]`);
  
  if (snapshot) {
    snapshot.remove();
  }

  snapshot = table.cloneNode(true);                            // ✅ Clone DOM
  snapshot.setAttribute('data-shadow-table', tableId);
  snapshot.setAttribute('data-snapshot-time', Date.now());
  snapshot.style.cssText = 'display: none !important;';
  
  this.shadowStore.appendChild(snapshot);                      // ✅ Ajout au DOM
  
  debug.log(`📸 Snapshot créé pour ${tableId}`);
}
```

---

## 📝 Changement 4 : Restauration

### ❌ AVANT (localStorage)

```javascript
restoreTableData(table) {
  if (!table) return false;

  const tableId = table.dataset.tableId;
  if (!tableId) return false;

  const allData = this.loadAllData();              // ❌ localStorage.getItem
  const tableData = allData[tableId];

  if (!tableData) {
    debug.log(`ℹ️ Aucune donnée pour ${tableId}`);
    return false;
  }

  // Restaurer les cellules depuis JSON
  tableData.cells.forEach((cellData) => {
    const row = rows[cellData.row];
    if (!row) return;

    const cell = row.cells[cellData.col];
    if (cell) {
      cell.textContent = cellData.value;           // ❌ Depuis JSON
      if (cellData.bgColor) {
        cell.style.backgroundColor = cellData.bgColor;
      }
    }
  });

  return true;
}

loadAllData() {
  try {
    const data = localStorage.getItem(this.storageKey);  // ❌ localStorage
    return data ? JSON.parse(data) : {};
  } catch (error) {
    debug.error("Erreur chargement:", error);
    return {};
  }
}
```

### ✅ APRÈS (DOM)

```javascript
restoreTableData(table) {
  if (!table) return false;

  const tableId = table.dataset.tableId;
  if (!tableId) return false;

  debug.log(`🔍 Restauration DOM pour ${tableId}`);

  try {
    // 1. Chercher le snapshot dans le shadow store
    const snapshot = this.shadowStore.querySelector(
      `[data-shadow-table="${tableId}"]`              // ✅ DOM query
    );

    if (!snapshot) {
      debug.log(`ℹ️ Aucun snapshot pour ${tableId}`);
      return false;
    }

    const snapshotTime = snapshot.getAttribute('data-snapshot-time');
    debug.log(`📂 Restauration depuis snapshot du ${new Date(parseInt(snapshotTime)).toLocaleString()}`);

    // 2. Restaurer depuis le clone DOM
    const shadowCells = snapshot.querySelectorAll(
      'td[data-modified="true"], td[data-persisted-value]'
    );
    const tableRows = table.querySelectorAll('tr');

    let restoredCount = 0;

    shadowCells.forEach(shadowCell => {
      const shadowRow = shadowCell.parentElement;
      const rowIndex = Array.from(shadowRow.parentElement.children).indexOf(shadowRow);
      const cellIndex = Array.from(shadowRow.children).indexOf(shadowCell);

      if (tableRows[rowIndex]) {
        const targetCell = tableRows[rowIndex].children[cellIndex];

        if (targetCell && targetCell.tagName === 'TD') {
          // Restaurer depuis le clone DOM
          targetCell.innerHTML = shadowCell.innerHTML;          // ✅ DOM
          targetCell.textContent = shadowCell.textContent;

          // Restaurer les data-attributes
          Array.from(shadowCell.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              targetCell.setAttribute(attr.name, attr.value);   // ✅ DOM
            }
          });

          // Restaurer le style
          if (shadowCell.style.cssText) {
            targetCell.style.cssText = shadowCell.style.cssText;
          }

          restoredCount++;
        }
      }
    });

    debug.log(`✅ ${restoredCount} cellule(s) restaurée(s)`);

    // 3. Restaurer la consolidation si présente
    const consoData = snapshot.getAttribute('data-consolidation');  // ✅ DOM
    if (consoData) {
      const { fullContent, simpleContent } = JSON.parse(consoData);
      this.updateResultatTable(table, fullContent);
      this.updateConsoTable(table, simpleContent);
      debug.log('✅ Consolidation restaurée');
    }

    table.setAttribute('data-restored', 'true');
    table.setAttribute('data-restored-time', Date.now());

    return true;

  } catch (error) {
    debug.error('❌ Erreur restauration:', error);
    return false;
  }
}
```

---

## 📝 Changement 5 : Marquage des Cellules

### ❌ AVANT

```javascript
setupAssertionCell(cell) {
  cell.style.cursor = "pointer";
  cell.title = "Cliquez pour sélectionner";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(cell, [...], (value) => {
      cell.textContent = value;                    // ❌ Pas de marquage
      cell.style.backgroundColor = "#e8f5e8";
      
      const parentTable = this.findParentTable(cell);
      if (parentTable) {
        this.saveTableData(parentTable);
      }
    });
  });
}
```

### ✅ APRÈS

```javascript
setupAssertionCell(cell) {
  cell.style.cursor = "pointer";
  cell.title = "Cliquez pour sélectionner";
  cell.setAttribute("data-cell-type", "assertion");    // ✅ NOUVEAU

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(cell, [...], (value) => {
      const oldValue = cell.textContent;               // ✅ Capturer ancien
      cell.textContent = value;
      cell.style.backgroundColor = "#e8f5e8";
      
      // ✅ NOUVEAU : Marquer avec data-attributes
      cell.setAttribute("data-modified", "true");
      cell.setAttribute("data-value", value);
      cell.setAttribute("data-original-value", oldValue);
      cell.setAttribute("data-timestamp", Date.now());
      
      const parentTable = this.findParentTable(cell);
      if (parentTable) {
        this.saveTableData(parentTable);
      }
    });
  });
}
```

---

## 📝 Changement 6 : Filtrage des Tables

### ❌ AVANT

```javascript
findAllTables() {
  const selectors = [
    CONFIG.tableSelector,
    CONFIG.alternativeSelector,
    "table"
  ];

  let allTables = [];
  for (const selector of selectors) {
    const tables = document.querySelectorAll(selector);
    allTables = [...allTables, ...Array.from(tables)];
  }

  const uniqueTables = [...new Set(allTables)];    // ❌ Pas de filtre
  return uniqueTables;
}
```

### ✅ APRÈS

```javascript
findAllTables() {
  const selectors = [
    CONFIG.tableSelector,
    CONFIG.alternativeSelector,
    "table"
  ];

  let allTables = [];
  for (const selector of selectors) {
    const tables = document.querySelectorAll(selector);
    allTables = [...allTables, ...Array.from(tables)];
  }

  // ✅ NOUVEAU : Filtrer les tables du shadow store
  const uniqueTables = [...new Set(allTables)].filter(
    table => !this.shadowStore?.contains(table) && 
             !this.domStore?.contains(table)
  );

  return uniqueTables;
}
```

---

## 📝 Changement 7 : Commandes Console

### ❌ AVANT

```javascript
window.claraverseCommands = {
  getStorageInfo: () => {
    const allData = processor.loadAllData();       // ❌ localStorage
    const tableCount = Object.keys(allData).length;
    
    console.log(`📊 Total: ${tableCount} table(s)`);
    return allData;
  },
  
  clearAllData: () => {
    if (confirm('Effacer ?')) {
      localStorage.removeItem(processor.storageKey);  // ❌ localStorage
      console.log('✅ Données effacées');
    }
  },
  
  exportData: () => {
    const allData = processor.loadAllData();       // ❌ localStorage
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    // ... download
  }
};
```

### ✅ APRÈS

```javascript
window.claraverseCommands = {
  getStorageInfo: () => {
    const snapshots = processor.shadowStore.querySelectorAll('[data-shadow-table]');  // ✅ DOM
    const cacheSize = processor.tableDataCache.size;                                  // ✅ Map
    
    const tables = Array.from(snapshots).map(snap => ({
      id: snap.getAttribute('data-shadow-table'),
      timestamp: parseInt(snap.getAttribute('data-snapshot-time')),
      modifiedCells: snap.querySelectorAll('[data-modified="true"]').length
    }));
    
    console.log(`📊 Snapshots: ${snapshots.length}`);
    console.log(`💾 Cache: ${cacheSize} entrée(s)`);
    console.table(tables);
    
    return { snapshots: snapshots.length, cache: cacheSize, tables };
  },
  
  clearAllData: () => {
    if (confirm('Effacer toutes les données DOM ?')) {
      processor.shadowStore.innerHTML = '';                     // ✅ DOM
      processor.domStore.innerHTML = '';                        // ✅ DOM
      processor.tableDataCache.clear();                         // ✅ Map
      console.log('✅ Données DOM effacées');
    }
  },
  
  exportData: () => {
    const shadowContent = processor.shadowStore.innerHTML;      // ✅ DOM
    const exportHTML = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="claraverse-shadow-tables" style="display: none;">
            ${shadowContent}
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([exportHTML], { type: 'text/html' });
    // ... download
  }
};
```

---

## 📊 Résumé des Changements

| Aspect | Avant (localStorage) | Après (DOM) |
|--------|---------------------|-------------|
| **Stockage** | `localStorage.setItem()` | Conteneurs DOM cachés |
| **Format** | JSON sérialisé | Clones DOM natifs |
| **Lecture** | `JSON.parse()` | `querySelector()` |
| **Écriture** | `JSON.stringify()` | `cloneNode()` |
| **Marquage** | Objets JavaScript | Data-attributes |
| **Cache** | Aucun | `Map()` |
| **Persistance** | Cross-session | Session uniquement |
| **Export** | JSON file | HTML file |
| **Quota** | 5-10 MB | Aucune limite |
| **Performance** | Sérialisation coûteuse | Natif et rapide |

---

## ✅ Points Clés à Retenir

1. **Supprimer** toutes les références à `localStorage`
2. **Créer** deux conteneurs DOM cachés (`domStore` et `shadowStore`)
3. **Utiliser** `cloneNode()` au lieu de JSON
4. **Marquer** les cellules avec `data-attributes`
5. **Filtrer** les tables du shadow store
6. **Mettre à jour** toutes les commandes console
7. **Tester** avec `claraverseCommands.test.fullTest()`

---

**Fichiers de référence complets :**
- `INSTRUCTIONS_MIGRATION_DOM.md` - Guide détaillé
- `conso_persistance_methods.js` - Code complet des méthodes
- `console_commands_dom.js` - Toutes les commandes