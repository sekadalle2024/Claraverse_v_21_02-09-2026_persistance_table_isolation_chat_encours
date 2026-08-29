# Guide de Migration : Persistance DOM Pure pour conso.js

## 🎯 Objectif

Remplacer complètement le système de persistance basé sur `localStorage` par une approche de **persistance DOM pure** utilisant exclusivement la manipulation DOM native.

## 📋 Vue d'ensemble de l'architecture

### Architecture Actuelle (localStorage)
```
Modifications Cellules → MutationObserver → saveTableData() → localStorage
                                                                    ↓
Restauration ← loadAllData() ← localStorage.getItem()
```

### Nouvelle Architecture (DOM Persistance)
```
Modifications Cellules → MutationObserver → Snapshot DOM Caché
                                                    ↓
                                            data-attributes
                                                    ↓
Restauration ← Clones dans Shadow Container
```

## 🔧 Modifications à Apporter

### 1. Supprimer les Méthodes localStorage

**Méthodes à SUPPRIMER complètement :**
- `testLocalStorage()` (ligne 59-86)
- `loadAllData()` (ligne 1456-1464)
- `saveAllData()` (ligne 1469-1481)
- `saveTableDataNow()` (ligne 1508-1591)
- `saveConsolidationData()` (ligne 1596-1627)
- `restoreTableData()` (ligne 1632-1704)
- `restoreAllTablesData()` (ligne 1709-1786)
- `autoSaveAllTables()` (ligne 1791-1812)
- `clearAllData()` (ligne 1817-1827)
- `exportData()` (ligne 1832-1847)
- `importData()` (ligne 1852-1871)
- `clearTableData()` (ligne 1876-1885)
- `getStorageInfo()` (ligne 1888-1911)

**Dans le constructor(), remplacer :**
```javascript
// ANCIEN
this.storageKey = "claraverse_tables_data";
this.autoSaveDelay = 500;
this.saveTimeout = null;

// NOUVEAU
this.autoSaveDelay = 300;
this.saveTimeout = null;
this.domStore = null;
this.shadowStore = null;
this.tableDataCache = new Map();
```

### 2. Créer le Conteneur DOM de Persistance

**Remplacer `testLocalStorage()` par `initDOMStore()` :**

```javascript
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

  // Compter les tables stockées
  const storedTables = shadowStore.querySelectorAll('[data-shadow-table]');
  debug.log(`📦 ${storedTables.length} table(s) dans le shadow store`);
}
```

**Dans `init()`, remplacer l'appel :**
```javascript
// ANCIEN
this.testLocalStorage();

// NOUVEAU
this.initDOMStore();
```

### 3. Implémenter la Sauvegarde DOM

**Nouvelle méthode `saveTableData()` :**

```javascript
saveTableData(table) {
  if (!table) {
    debug.warn('⚠️ saveTableData: table null');
    return;
  }

  debug.log('⏳ Sauvegarde DOM programmée dans', this.autoSaveDelay, 'ms');

  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }

  this.saveTimeout = setTimeout(() => {
    this.saveTableDataNow(table);
  }, this.autoSaveDelay);
}

saveTableDataNow(table) {
  if (!table) return;

  const tableId = this.generateUniqueTableId(table);
  debug.log('💾 Sauvegarde DOM immédiate:', tableId);

  // 1. Marquer les cellules modifiées avec data-attributes
  const cells = table.querySelectorAll('td[data-modified="true"]');
  cells.forEach(cell => {
    const value = cell.textContent.trim();
    cell.setAttribute('data-persisted-value', value);
    cell.setAttribute('data-persisted-time', Date.now());
    
    // Conserver le style
    if (cell.style.backgroundColor) {
      cell.setAttribute('data-persisted-bgcolor', cell.style.backgroundColor);
    }
  });

  // 2. Créer/Mettre à jour le clone dans le shadow store
  this.createTableSnapshot(table);

  // 3. Mettre en cache en mémoire
  this.tableDataCache.set(tableId, {
    timestamp: Date.now(),
    cellCount: cells.length,
    tableHTML: table.outerHTML
  });

  debug.log(`✅ Table ${tableId} sauvegardée dans le DOM`);
}
```

### 4. Créer le Snapshot DOM

**Nouvelle méthode `createTableSnapshot()` :**

```javascript
createTableSnapshot(table) {
  const tableId = table.dataset.tableId;
  if (!tableId) return;

  // Chercher un snapshot existant
  let snapshot = this.shadowStore.querySelector(`[data-shadow-table="${tableId}"]`);
  
  if (snapshot) {
    // Mettre à jour le snapshot existant
    debug.log('🔄 Mise à jour snapshot:', tableId);
    snapshot.remove();
  }

  // Créer un nouveau snapshot
  snapshot = table.cloneNode(true);
  snapshot.setAttribute('data-shadow-table', tableId);
  snapshot.setAttribute('data-snapshot-time', Date.now());
  snapshot.style.cssText = 'display: none !important;';
  
  // Ajouter au shadow store
  this.shadowStore.appendChild(snapshot);
  
  debug.log('📸 Snapshot créé pour:', tableId);
}
```

### 5. Implémenter la Restauration DOM

**Nouvelle méthode `restoreTableData()` :**

```javascript
restoreTableData(table) {
  if (!table) return false;

  const tableId = table.dataset.tableId;
  if (!tableId) {
    debug.warn('⚠️ Table sans ID, impossible de restaurer');
    return false;
  }

  debug.log(`🔍 Restauration pour ID: ${tableId}`);

  // 1. Chercher le snapshot dans le shadow store
  const snapshot = this.shadowStore.querySelector(`[data-shadow-table="${tableId}"]`);
  
  if (!snapshot) {
    debug.log(`ℹ️ Aucun snapshot trouvé pour ${tableId}`);
    return false;
  }

  debug.log(`📂 Restauration depuis snapshot ${tableId}`);

  // 2. Restaurer les cellules modifiées
  const shadowCells = snapshot.querySelectorAll('td[data-modified="true"]');
  const tableCells = table.querySelectorAll('td');
  
  shadowCells.forEach(shadowCell => {
    const row = shadowCell.parentElement.rowIndex;
    const col = shadowCell.cellIndex;
    
    // Trouver la cellule correspondante dans la table cible
    const targetRow = table.rows[row];
    if (targetRow) {
      const targetCell = targetRow.cells[col];
      if (targetCell) {
        // Restaurer le contenu
        targetCell.innerHTML = shadowCell.innerHTML;
        
        // Restaurer les attributs
        const attrs = ['data-modified', 'data-value', 'data-persisted-value', 
                       'data-cell-type', 'data-conclusion-type', 'data-ctr-value'];
        attrs.forEach(attr => {
          if (shadowCell.hasAttribute(attr)) {
            targetCell.setAttribute(attr, shadowCell.getAttribute(attr));
          }
        });
        
        // Restaurer le style
        if (shadowCell.getAttribute('data-persisted-bgcolor')) {
          targetCell.style.backgroundColor = shadowCell.getAttribute('data-persisted-bgcolor');
        }
      }
    }
  });

  // 3. Restaurer la consolidation si elle existe
  const consoData = snapshot.getAttribute('data-consolidation');
  if (consoData) {
    try {
      const { fullContent, simpleContent } = JSON.parse(consoData);
      this.updateResultatTable(table, fullContent);
      this.updateConsoTable(table, simpleContent);
      debug.log('✅ Consolidation restaurée');
    } catch (e) {
      debug.warn('⚠️ Erreur restauration consolidation:', e);
    }
  }

  return true;
}
```

**Nouvelle méthode `restoreAllTablesData()` :**

```javascript
restoreAllTablesData() {
  debug.log('📂 Restauration de toutes les tables...');

  const snapshots = this.shadowStore.querySelectorAll('[data-shadow-table]');
  debug.log(`📊 ${snapshots.length} snapshot(s) trouvé(s)`);

  if (snapshots.length === 0) {
    debug.log('ℹ️ Aucune donnée à restaurer');
    return;
  }

  setTimeout(() => {
    const allTables = this.findAllTables();
    debug.log(`🔍 ${allTables.length} table(s) dans le DOM`);

    let restoredCount = 0;

    allTables.forEach((table) => {
      if (!table.dataset.tableId) {
        this.generateUniqueTableId(table);
      }

      if (this.restoreTableData(table)) {
        restoredCount++;
      }
    });

    debug.log(`✅ ${restoredCount} table(s) restaurée(s)`);

    if (restoredCount > 0) {
      this.showNotification(`✅ ${restoredCount} table(s) restaurée(s)`);
    }
  }, 1500);
}
```

### 6. Sauvegarder la Consolidation dans le DOM

**Nouvelle méthode `saveConsolidationData()` :**

```javascript
saveConsolidationData(table, fullContent, simpleContent) {
  if (!table) return;

  const tableId = table.dataset.tableId;
  if (!tableId) return;

  debug.log('💾 Sauvegarde consolidation DOM');

  // 1. Sauvegarder dans les data-attributes du snapshot
  const snapshot = this.shadowStore.querySelector(`[data-shadow-table="${tableId}"]`);
  
  if (snapshot) {
    const consoData = JSON.stringify({
      fullContent,
      simpleContent,
      timestamp: Date.now()
    });
    snapshot.setAttribute('data-consolidation', consoData);
    debug.log('✅ Consolidation sauvegardée dans snapshot');
  }

  // 2. Marquer les tables conso et résultat avec les données
  const consoCell = document.querySelector(`#conso-content-${tableId}`);
  if (consoCell) {
    consoCell.setAttribute('data-conso-content', simpleContent);
    consoCell.setAttribute('data-conso-time', Date.now());
  }

  // 3. Chercher et marquer la table résultat
  const parent = table.parentElement;
  if (parent) {
    const allSiblings = Array.from(parent.children);
    const tableIndex = allSiblings.indexOf(table);
    
    for (let i = tableIndex - 1; i >= 0; i--) {
      const sibling = allSiblings[i];
      if (sibling.tagName === 'TABLE') {
        const headers = sibling.querySelectorAll('th');
        for (const header of headers) {
          const headerText = header.textContent.trim().toLowerCase();
          if (headerText.includes('resultat') || headerText.includes('résultat')) {
            const contentCell = sibling.querySelector('tbody td');
            if (contentCell) {
              contentCell.setAttribute('data-resultat-content', fullContent);
              contentCell.setAttribute('data-resultat-time', Date.now());
              debug.log('✅ Table résultat marquée avec données');
              break;
            }
          }
        }
        break;
      }
    }
  }
}
```

### 7. Améliorer les Cellules Modifiables

**Dans `setupAssertionCell()`, `setupConclusionCell()`, `setupCtrCell()`, ajouter :**

```javascript
// Après chaque modification de cellule, ajouter :
cell.setAttribute('data-modified', 'true');
cell.setAttribute('data-value', value);
cell.setAttribute('data-original-value', oldValue);
cell.setAttribute('data-timestamp', Date.now());
```

### 8. Auto-sauvegarde Périodique

**Nouvelle méthode `autoSaveAllTables()` :**

```javascript
autoSaveAllTables() {
  const allTables = this.findAllTables();
  let savedCount = 0;

  allTables.forEach((table) => {
    const hasModified = table.querySelectorAll('[data-modified="true"]').length > 0;
    const hasData = table.querySelectorAll('td').length > 0;

    if (hasData && (hasModified || !table.dataset.snapshotCreated)) {
      this.saveTableDataNow(table);
      table.dataset.snapshotCreated = 'true';
      savedCount++;
    }
  });

  if (savedCount > 0) {
    debug.log(`💾 Auto-sauvegarde DOM: ${savedCount} table(s)`);
  }
}
```

### 9. Utilitaires de Notification

**Ajouter une méthode pour afficher les notifications :**

```javascript
showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = 'opacity 0.5s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
```

### 10. Filtrer les Tables du Shadow Store

**Dans `findAllTables()`, ajouter le filtre :**

```javascript
findAllTables() {
  // ... code existant ...
  
  // Filtrer les tables du shadow store et du dom store
  const uniqueTables = [...new Set(allTables)].filter(
    table => !this.shadowStore?.contains(table) && 
             !this.domStore?.contains(table)
  );

  return uniqueTables;
}
```

### 11. Mise à Jour de la Consolidation

**Dans `updateConsolidationDisplay()`, après mise à jour :**

```javascript
updateConsolidationDisplay(table, content) {
  try {
    debug.log('🔍 Début de updateConsolidationDisplay');
    
    const simpleContent = this.generateSimpleConsoContent(content);
    
    const resultatUpdated = this.updateResultatTable(table, content);
    const consoUpdated = this.updateConsoTable(table, simpleContent);
    
    // AJOUTER ICI : Sauvegarder dans le DOM
    this.saveConsolidationData(table, content, simpleContent);
    
    if (consoUpdated || resultatUpdated) {
      debug.log('✅ Mise à jour réussie');
      this.showNotification('✅ Consolidation mise à jour');
    } else {
      debug.warn('⚠️ Aucune table mise à jour');
      this.createConsolidationTable(table);
      setTimeout(() => {
        this.updateConsolidationDisplay(table, content);
      }, 1000);
    }
  } catch (error) {
    debug.error('❌ Erreur dans updateConsolidationDisplay:', error);
    this.showNotification('❌ Erreur de mise à jour', 'error');
  }
}
```

### 12. Nettoyage dans `destroy()`

**Ajouter le nettoyage des conteneurs DOM :**

```javascript
destroy() {
  debug.log('🧹 Nettoyage du processeur');

  // Code existant...

  // AJOUTER : Nettoyer les conteneurs DOM (optionnel)
  // Note : On peut les laisser pour conserver les données entre rechargements
  /*
  if (this.shadowStore) {
    this.shadowStore.innerHTML = '';
  }
  if (this.domStore) {
    this.domStore.innerHTML = '';
  }
  */

  // Nettoyer le cache mémoire
  if (this.tableDataCache) {
    this.tableDataCache.clear();
  }

  this.isInitialized = false;
}
```

## 📊 Nouvelles Commandes Console

**Remplacer les anciennes commandes par :**

```javascript
window.claraverseCommands = {
  getStorageInfo: () => {
    const snapshots = processor.shadowStore.querySelectorAll('[data-shadow-table]');
    const cacheSize = processor.tableDataCache.size;
    
    console.log(`📊 Stockage DOM:`);
    console.log(`  - Snapshots: ${snapshots.length}`);
    console.log(`  - Cache mémoire: ${cacheSize}`);
    
    snapshots.forEach((snap, i) => {
      console.log(`  Table ${i + 1}: ${snap.getAttribute('data-shadow-table')}`);
      console.log(`    - Timestamp: ${new Date(parseInt(snap.getAttribute('data-snapshot-time'))).toLocaleString()}`);
      console.log(`    - Cellules modifiées: ${snap.querySelectorAll('[data-modified="true"]').length}`);
    });
  },
  
  clearAllData: () => {
    if (confirm('⚠️ Effacer toutes les données DOM ?')) {
      processor.shadowStore.innerHTML = '';
      processor.domStore.innerHTML = '';
      processor.tableDataCache.clear();
      console.log('✅ Données DOM effacées');
    }
  },
  
  saveNow: () => {
    processor.autoSaveAllTables();
    console.log('✅ Sauvegarde DOM effectuée');
  },
  
  restoreAll: () => {
    processor.restoreAllTablesData();
    console.log('✅ Restauration DOM lancée');
  },
  
  exportData: () => {
    const snapshots = processor.shadowStore.innerHTML;
    const blob = new Blob([snapshots], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claraverse_dom_backup_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Export DOM effectué');
  },
  
  importData: (htmlContent) => {
    if (confirm('⚠️ Importer les données remplacera les données actuelles ?')) {
      processor.shadowStore.innerHTML = htmlContent;
      processor.restoreAllTablesData();
      console.log('✅ Import DOM effectué');
    }
  },
  
  help: () => {
    console.log(`
🎯 COMMANDES CLARAVERSE (DOM PERSISTANCE):

📊 Gestion des données DOM:
  - claraverseCommands.getStorageInfo()  : Infos stockage DOM
  - claraverseCommands.restoreAll()      : Restaurer depuis DOM
  - claraverseCommands.saveNow()         : Sauvegarder dans DOM
  - claraverseCommands.clearAllData()    : Effacer le DOM store

💾 Import/Export DOM:
  - claraverseCommands.exportData()      : Exporter snapshots HTML
  - claraverseCommands.importData(html)  : Importer snapshots HTML

💡 Les données sont persistées dans des éléments DOM cachés
    et survivent tant que la page n'est pas rechargée.
    `);
  }
};
```

## ✅ Avantages de la Persistance DOM

1. **Pas de limite de quota** : Pas de limitation localStorage (5-10MB)
2. **Synchronisation instantanée** : Les modifications sont directement dans le DOM
3. **Simplicité** : Pas de sérialisation JSON complexe
4. **Performance** : Clonage natif du DOM très rapide
5. **Debuggable** : Visible dans l'inspecteur DOM
6. **Compatibilité** : Fonctionne même si localStorage est désactivé

## ⚠️ Limitations

1. **Durée de vie** : Les données sont perdues au rechargement de la page
2. **Pas de persistance cross-session** : Contrairement au localStorage
3. **Mémoire** : Les snapshots consomment de la mémoire RAM

## 🧪 Tests Recommandés

1. **Test modification** : Modifier une cellule et vérifier le snapshot
2. **Test restauration** : Recharger les tables et vérifier la restauration
3. **Test consolidation** : Vérifier que la consolidation est sauvegardée
4. **Test auto-save** : Vérifier la sauvegarde automatique toutes les 30s
5. **Test export/import** : Exporter puis importer les données

## 📝 Checklist de Migration

- [ ] Supprimer toutes les références à `localStorage`
- [ ] Créer `initDOMStore()`
- [ ] Implémenter `createTableSnapshot()`
- [ ] Réécrire `saveTableDataNow()`
- [ ] Réécrire `restoreTableData()`
- [ ] Réécrire `restoreAllTablesData()`
- [ ] Réécrire `saveConsolidationData()`
- [ ] Ajouter data-attributes sur cellules modifiées
- [ ] Filtrer tables du shadow store dans `findAllTables()`
- [ ] Mettre à jour les commandes console
- [ ] Tester tous les scénarios
- [ ] Vérifier que les alertes fonctionnent
- [ ] Valider la restauration après modification

## 🚀 Ordre d'Implémentation Recommandé

1. Créer les conteneurs DOM (initDOMStore)
2. Implémenter createTableSnapshot
3. Réécrire saveTableDataNow
4. Réécrire restoreTableData
5. Réécrire restoreAllTablesData
6. Mettre à jour saveConsolidationData
7. Ajouter les data-attributes
8. Tester chaque étape
9. Mettre à jour les commandes
10. Tests finaux complets

---

**Note importante** : Cette migration conserve toute la logique métier (consolidation, dropdowns, etc.) et ne modifie QUE la couche de persistance.