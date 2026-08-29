# 🔧 Patch pour Intégrer conso.js avec IndexedDB

## 📝 Instructions

Ce patch contient les modifications à apporter à `conso.js` pour l'intégrer avec le système IndexedDB.

---

## 1️⃣ Ajouter la Méthode getCurrentSessionId

**Emplacement** : Après la méthode `init()` (ligne ~60)

```javascript
/**
 * Obtenir l'ID de session actuel (compatible avec le système IndexedDB)
 */
async getCurrentSessionId() {
  try {
    // Réutiliser la session stable du pont
    const storedSession = sessionStorage.getItem('claraverse_stable_session');
    if (storedSession) {
      debug.log(`📍 Session récupérée: ${storedSession}`);
      return storedSession;
    }
  } catch (error) {
    debug.warn('⚠️ sessionStorage lecture impossible:', error.message);
  }

  // Créer une session stable
  const sessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    sessionStorage.setItem('claraverse_stable_session', sessionId);
    debug.log(`✅ Session stable créée: ${sessionId}`);
  } catch (error) {
    debug.warn('⚠️ Impossible de sauvegarder session:', error.message);
  }

  return sessionId;
}
```

---

## 2️⃣ Remplacer la Méthode saveTableDataNow

**Emplacement** : Ligne ~1533

**AVANT** :
```javascript
saveTableDataNow(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataNow: table est null ou undefined");
    return;
  }

  debug.log("💾 Début de sauvegarde immédiate");

  const tableId = this.generateUniqueTableId(table);
  debug.log("🆔 ID de table pour sauvegarde:", tableId);

  const allData = this.loadAllData();
  // ... reste du code localStorage
}
```

**APRÈS** :
```javascript
async saveTableDataNow(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataNow: table est null ou undefined");
    return;
  }

  debug.log("💾 Début de sauvegarde immédiate via IndexedDB");

  try {
    // Utiliser l'API de synchronisation si disponible
    if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
      await window.claraverseSyncAPI.forceSaveTable(table);
      debug.log("✅ Table sauvegardée via IndexedDB");
      
      // Notifier la modification
      this.notifyTableUpdate(table);
    } else {
      debug.warn("⚠️ API de synchronisation non disponible, fallback localStorage");
      this.saveTableDataLocalStorage(table);
    }
  } catch (error) {
    debug.error("❌ Erreur sauvegarde IndexedDB:", error);
    // Fallback vers localStorage en cas d'erreur
    this.saveTableDataLocalStorage(table);
  }
}
```

---

## 3️⃣ Ajouter la Méthode Fallback localStorage

**Emplacement** : Après `saveTableDataNow()` (ligne ~1650)

```javascript
/**
 * Fallback: Sauvegarder dans localStorage (ancien système)
 */
saveTableDataLocalStorage(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataLocalStorage: table est null");
    return;
  }

  debug.log("💾 Sauvegarde fallback dans localStorage");

  const tableId = this.generateUniqueTableId(table);
  const allData = this.loadAllData();

  // Extraire les données de la table
  const tableData = {
    timestamp: Date.now(),
    cells: [],
    headers: [],
    isModelized: false,
  };

  // Sauvegarder les en-têtes
  const headers = this.getTableHeaders(table);
  tableData.headers = headers.map((h) => h.text);
  tableData.isModelized = this.isModelizedTable(headers);

  // Sauvegarder les cellules
  let rows;
  const tbody = table.querySelector("tbody");
  if (tbody) {
    rows = tbody.querySelectorAll("tr");
  } else {
    rows = Array.from(table.querySelectorAll("tr")).filter(
      (row) => !row.parentElement.tagName.match(/THEAD/i),
    );
  }

  rows.forEach((row, rowIndex) => {
    if (row.querySelector("th") && row.parentElement.tagName.match(/THEAD/i))
      return;

    const cells = row.querySelectorAll("td");
    cells.forEach((cell, colIndex) => {
      const value = cell.textContent.trim();
      const bgColor = cell.style.backgroundColor;
      const innerHTML = cell.innerHTML;

      tableData.cells.push({
        row: rowIndex,
        col: colIndex,
        value: value,
        bgColor: bgColor,
        html: innerHTML !== value ? innerHTML : undefined,
      });
    });
  });

  // Sauvegarder
  allData[tableId] = tableData;
  this.saveAllData(allData);

  debug.log(`✅ Table ${tableId} sauvegardée dans localStorage (fallback)`);
}
```

---

## 4️⃣ Ajouter la Méthode notifyTableUpdate

**Emplacement** : Après `saveTableDataLocalStorage()` (ligne ~1700)

```javascript
/**
 * Notifier une mise à jour de table
 */
notifyTableUpdate(table) {
  try {
    if (!table) return;

    const tableId = this.generateUniqueTableId(table);

    // Émettre un événement personnalisé
    const event = new CustomEvent('flowise:table:updated', {
      detail: {
        tableId: tableId,
        table: table,
        source: 'conso',
        timestamp: Date.now()
      }
    });

    document.dispatchEvent(event);
    debug.log(`🔔 Notification mise à jour table ${tableId} envoyée`);
  } catch (error) {
    debug.error("❌ Erreur notification:", error);
  }
}
```

---

## 5️⃣ Ajouter la Méthode notifyTableStructureChange

**Emplacement** : Après `notifyTableUpdate()` (ligne ~1720)

```javascript
/**
 * Notifier un changement de structure de table
 */
notifyTableStructureChange(action, details = {}) {
  try {
    if (!this.targetTable) return;

    const tableId = this.generateUniqueTableId(this.targetTable);

    const event = new CustomEvent('flowise:table:structure:changed', {
      detail: {
        tableId: tableId,
        table: this.targetTable,
        action: action,
        details: details,
        source: 'conso',
        timestamp: Date.now()
      }
    });

    document.dispatchEvent(event);
    debug.log(`🔄 Notification structure ${action} envoyée`);
  } catch (error) {
    debug.error("❌ Erreur notification structure:", error);
  }
}
```

---

## 6️⃣ Modifier la Méthode restoreAllTablesData

**Emplacement** : Ligne ~1650 (chercher `restoreAllTablesData`)

**AVANT** :
```javascript
restoreAllTablesData() {
  const allData = this.loadAllData();
  
  if (Object.keys(allData).length === 0) {
    debug.log("📭 Aucune donnée à restaurer");
    return;
  }
  
  // ... reste du code localStorage
}
```

**APRÈS** :
```javascript
async restoreAllTablesData() {
  debug.log("🔄 Début de la restauration des tables");

  try {
    // Obtenir la session actuelle
    const sessionId = await this.getCurrentSessionId();
    debug.log(`📍 Session pour restauration: ${sessionId}`);

    // Déclencher la restauration via événement (système IndexedDB)
    const event = new CustomEvent('flowise:table:restore:request', {
      detail: {
        sessionId: sessionId,
        source: 'conso',
        timestamp: Date.now()
      }
    });

    document.dispatchEvent(event);
    debug.log("✅ Restauration demandée via événement IndexedDB");

    // Attendre un peu pour que la restauration se fasse
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fallback: essayer aussi avec localStorage
    this.restoreFromLocalStorage();
  } catch (error) {
    debug.error("❌ Erreur restauration:", error);
    // Fallback vers localStorage
    this.restoreFromLocalStorage();
  }
}
```

---

## 7️⃣ Ajouter la Méthode Fallback restoreFromLocalStorage

**Emplacement** : Après `restoreAllTablesData()` (ligne ~1680)

```javascript
/**
 * Fallback: Restaurer depuis localStorage (ancien système)
 */
restoreFromLocalStorage() {
  debug.log("🔄 Restauration fallback depuis localStorage");

  const allData = this.loadAllData();

  if (Object.keys(allData).length === 0) {
    debug.log("📭 Aucune donnée localStorage à restaurer");
    return;
  }

  debug.log(`📦 ${Object.keys(allData).length} table(s) trouvée(s) dans localStorage`);

  const tables = this.findAllTables();

  tables.forEach((table) => {
    const tableId = this.generateUniqueTableId(table);

    if (allData[tableId]) {
      debug.log(`🔄 Restauration table ${tableId} depuis localStorage`);
      this.restoreTableData(table, allData[tableId]);
    }
  });

  debug.log("✅ Restauration localStorage terminée");
}
```

---

## 8️⃣ Modifier la Méthode performConsolidation

**Emplacement** : Ligne ~900 (chercher `performConsolidation`)

**Ajouter après la consolidation** :

```javascript
performConsolidation(table) {
  try {
    debug.log("Début de la consolidation");

    // ... code existant de consolidation ...

    this.updateConsolidationDisplay(table, result);
    debug.log("Consolidation terminée");

    // AJOUTER ICI : Sauvegarder après consolidation
    this.saveTableData(table);
    debug.log("💾 Sauvegarde après consolidation");

  } catch (error) {
    debug.error("Erreur pendant la consolidation:", error);
    this.updateConsolidationDisplay(
      table,
      "❌ Erreur pendant la consolidation",
    );
  }
}
```

---

## 9️⃣ Ajouter la Migration localStorage → IndexedDB

**Emplacement** : Dans la méthode `init()`, après `this.testLocalStorage()` (ligne ~55)

```javascript
init() {
  if (this.isInitialized) return;

  debug.log("Initialisation du processeur de tables");

  // Attendre que React soit prêt
  this.waitForReact(() => {
    // Test de localStorage au démarrage
    this.testLocalStorage();
    
    // AJOUTER ICI : Migration localStorage → IndexedDB
    this.migrateFromLocalStorage();
    
    this.setupGlobalEventListeners();
    this.startTableMonitoring();
    this.restoreAllTablesData();
    this.isInitialized = true;
    debug.log("✅ Processeur initialisé avec succès");
  });
}
```

**Ajouter la méthode de migration** (après `testLocalStorage()`, ligne ~90) :

```javascript
/**
 * Migrer les données de localStorage vers IndexedDB
 */
async migrateFromLocalStorage() {
  try {
    const oldData = localStorage.getItem(this.storageKey);
    if (!oldData) {
      debug.log("📭 Aucune donnée localStorage à migrer");
      return;
    }

    debug.log("🔄 Migration localStorage → IndexedDB en cours...");

    const parsed = JSON.parse(oldData);
    const tableIds = Object.keys(parsed);

    if (tableIds.length === 0) {
      debug.log("📭 Aucune table à migrer");
      return;
    }

    debug.log(`📦 ${tableIds.length} table(s) à migrer`);

    // Attendre que l'API soit disponible
    let retries = 0;
    while (!window.claraverseSyncAPI && retries < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.claraverseSyncAPI) {
      debug.warn("⚠️ API non disponible, migration annulée");
      return;
    }

    // Migrer chaque table
    let migratedCount = 0;
    for (const tableId of tableIds) {
      const table = document.querySelector(`[data-table-id="${tableId}"]`);
      if (table) {
        try {
          await window.claraverseSyncAPI.forceSaveTable(table);
          migratedCount++;
          debug.log(`✅ Table ${tableId} migrée`);
        } catch (error) {
          debug.error(`❌ Erreur migration table ${tableId}:`, error);
        }
      }
    }

    if (migratedCount > 0) {
      // Supprimer les anciennes données après migration réussie
      localStorage.removeItem(this.storageKey);
      debug.log(`✅ Migration terminée: ${migratedCount}/${tableIds.length} tables migrées`);
      debug.log("🗑️ Anciennes données localStorage supprimées");
    }
  } catch (error) {
    debug.error("❌ Erreur migration:", error);
  }
}
```

---

## 🔟 Modifier index.html

**Emplacement** : `index.html`, section des scripts

**AVANT** :
```html
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script src="/menu.js"></script>
<script src="/conso.js"></script>
<script src="/menu-persistence-bridge.js"></script>
```

**APRÈS** :
```html
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<!-- IMPORTANT: Charger le pont AVANT menu.js et conso.js -->
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>
<script src="/conso.js"></script>
```

---

## ✅ Checklist d'Application

### Modifications dans conso.js

- [ ] 1. Ajouter `getCurrentSessionId()` après `init()`
- [ ] 2. Remplacer `saveTableDataNow()` avec version IndexedDB
- [ ] 3. Ajouter `saveTableDataLocalStorage()` (fallback)
- [ ] 4. Ajouter `notifyTableUpdate()`
- [ ] 5. Ajouter `notifyTableStructureChange()`
- [ ] 6. Remplacer `restoreAllTablesData()` avec version IndexedDB
- [ ] 7. Ajouter `restoreFromLocalStorage()` (fallback)
- [ ] 8. Modifier `performConsolidation()` pour sauvegarder
- [ ] 9. Ajouter `migrateFromLocalStorage()` dans `init()`

### Modifications dans index.html

- [ ] 10. Réorganiser l'ordre de chargement des scripts

### Tests

- [ ] Test de sauvegarde des modifications
- [ ] Test de restauration après F5
- [ ] Test de changement de chat
- [ ] Test de consolidation
- [ ] Test de migration localStorage

---

## 📊 Résultat Attendu

### Console Logs

Après application du patch, vous devriez voir dans la console :

```
🚀 Claraverse Table Script - Démarrage
📋 [Claraverse] Initialisation du processeur de tables
✅ [Claraverse] localStorage fonctionne correctement
🔄 [Claraverse] Migration localStorage → IndexedDB en cours...
✅ [Claraverse] Migration terminée: X/X tables migrées
🔄 [Claraverse] Début de la restauration des tables
📍 [Claraverse] Session pour restauration: stable_session_xxx
✅ [Claraverse] Restauration demandée via événement IndexedDB
✅ [Claraverse] Processeur initialisé avec succès
```

### Lors d'une Modification

```
📝 [Claraverse] Changement détecté dans table table_xxx
⏳ [Claraverse] Sauvegarde programmée dans 500 ms
💾 [Claraverse] Début de sauvegarde immédiate via IndexedDB
✅ [Claraverse] Table sauvegardée via IndexedDB
🔔 [Claraverse] Notification mise à jour table table_xxx envoyée
```

---

*Patch créé le 18 novembre 2025*
