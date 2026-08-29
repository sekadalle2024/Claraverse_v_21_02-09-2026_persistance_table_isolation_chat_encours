# 🗄️ Migration vers IndexedDB pour conso.js

## 📋 Vue d'ensemble

Ce guide explique comment migrer `conso.js` de localStorage vers IndexedDB pour résoudre les problèmes de quota.

## ✅ Avantages d'IndexedDB

- **Capacité**: Plusieurs centaines de MB vs ~5-10 MB pour localStorage
- **Performance**: Opérations asynchrones, pas de blocage UI
- **Robustesse**: Gestion transactionnelle, moins de risques de corruption
- **Fallback**: Bascule automatique sur localStorage si IndexedDB indisponible

## 🚀 Étapes d'intégration

### 1. Charger le module de stockage

Dans `index.html`, ajouter AVANT `conso.js`:

```html
<!-- Gestionnaire de stockage IndexedDB -->
<script src="/conso-storage-indexeddb.js"></script>

<!-- Script principal -->
<script src="/conso.js"></script>
```

### 2. Modifier conso.js

#### A. Dans le constructeur de `ClaraverseTableProcessor`:

```javascript
constructor() {
  this.processedTables = new WeakSet();
  this.dropdownVisible = false;
  this.currentDropdown = null;
  this.isInitialized = false;
  
  // 🆕 Nouveau: Utiliser le gestionnaire de stockage
  this.storage = null;
  this.storageReady = false;
  
  this.autoSaveDelay = 500;
  this.saveTimeout = null;

  this.init();
}
```

#### B. Dans la méthode `init()`:

```javascript
async init() {
  if (this.isInitialized) return;

  debug.log("Initialisation du processeur de tables");

  // 🆕 Initialiser le stockage IndexedDB
  await this.initStorage();

  // Attendre que React soit prêt
  this.waitForReact(() => {
    this.setupGlobalEventListeners();
    this.startTableMonitoring();
    this.restoreAllTablesData();
    this.isInitialized = true;
    debug.log("✅ Processeur initialisé avec succès");
  });
}
```

#### C. Ajouter la méthode `initStorage()`:

```javascript
async initStorage() {
  try {
    if (window.ClaraverseStorageManager) {
      this.storage = new window.ClaraverseStorageManager();
      const success = await this.storage.init();
      
      if (success) {
        debug.log("✅ IndexedDB initialisée");
        
        // Migrer les données existantes de localStorage
        await this.storage.migrateFromLocalStorage();
        
        this.storageReady = true;
      } else {
        debug.warn("⚠️ IndexedDB non disponible, utilisation de localStorage");
        this.storageReady = true; // Le storage manager gère le fallback
      }
    } else {
      debug.error("❌ ClaraverseStorageManager non chargé");
      this.storageReady = false;
    }
  } catch (error) {
    debug.error("❌ Erreur initialisation storage:", error);
    this.storageReady = false;
  }
}
```

#### D. Remplacer `loadAllData()`:

```javascript
async loadAllData() {
  if (!this.storageReady || !this.storage) {
    debug.warn("⚠️ Storage non prêt");
    return {};
  }

  try {
    const data = await this.storage.loadAllTables();
    return data || {};
  } catch (error) {
    debug.error("❌ Erreur chargement données:", error);
    return {};
  }
}
```

#### E. Remplacer `saveAllData()`:

```javascript
async saveAllData(data) {
  if (!this.storageReady || !this.storage) {
    debug.warn("⚠️ Storage non prêt");
    return;
  }

  try {
    // Sauvegarder chaque table individuellement
    const tableIds = Object.keys(data);
    let saved = 0;
    
    for (const tableId of tableIds) {
      const success = await this.storage.saveTable(tableId, data[tableId]);
      if (success) saved++;
    }
    
    debug.log(`💾 ${saved}/${tableIds.length} table(s) sauvegardée(s)`);
  } catch (error) {
    debug.error("❌ Erreur sauvegarde:", error);
  }
}
```

#### F. Modifier `saveTableDataNow()`:

```javascript
async saveTableDataNow(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataNow: table est null ou undefined");
    return;
  }

  if (!this.storageReady || !this.storage) {
    debug.warn("⚠️ Storage non prêt");
    return;
  }

  debug.log("💾 Début de sauvegarde immédiate");

  const tableId = this.generateUniqueTableId(table);
  debug.log("🆔 ID de table pour sauvegarde:", tableId);

  // Vérifier si c'est une table CIA
  const headers = this.getTableHeaders(table);
  const isCIATable = headers.some((header) =>
    this.matchesColumn(header.text, "reponse_user"),
  );

  if (!isCIATable) {
    debug.log(`⏭️ Table ${tableId} ignorée (pas une table CIA)`);
    return;
  }

  // Extraire les données de la table
  const tableData = {
    timestamp: Date.now(),
    cells: [],
    headers: [],
    isModelized: false,
    isCIATable: true,
  };

  // ... (reste du code d'extraction des données)

  // 🆕 Sauvegarder avec le nouveau système
  try {
    const success = await this.storage.saveTable(tableId, tableData);
    if (success) {
      debug.log(`✅ Table ${tableId} sauvegardée avec succès`);
    } else {
      debug.warn(`⚠️ Échec sauvegarde table ${tableId}`);
    }
  } catch (error) {
    debug.error("❌ Erreur sauvegarde table:", error);
  }
}
```

### 3. Mettre à jour les commandes console

```javascript
window.claraverseCommands = {
  // Commandes existantes...
  
  // 🆕 Nouvelles commandes IndexedDB
  getStorageInfo: async () => {
    if (processor.storage) {
      const info = await processor.storage.getStorageInfo();
      console.log("📊 Informations de stockage:");
      console.log("IndexedDB:", info.indexedDB);
      console.log("localStorage:", info.localStorage);
      console.log("Total:", info.total.tableCount, "table(s)");
      return info;
    }
  },
  
  cleanupOld: async (days = 7) => {
    if (processor.storage) {
      const cleaned = await processor.storage.cleanupOldData(days);
      console.log(`✅ ${cleaned} table(s) supprimée(s)`);
      await window.claraverseCommands.getStorageInfo();
    }
  },
  
  migrateToIndexedDB: async () => {
    if (processor.storage) {
      console.log("🔄 Migration vers IndexedDB...");
      const success = await processor.storage.migrateFromLocalStorage();
      if (success) {
        console.log("✅ Migration réussie");
        await window.claraverseCommands.getStorageInfo();
      }
    }
  },
  
  clearAllStorage: async () => {
    if (confirm("⚠️ Supprimer TOUTES les données sauvegardées ?")) {
      if (processor.storage) {
        await processor.storage.clearAll();
        console.log("✅ Toutes les données supprimées");
      }
    }
  }
};
```

## 🧪 Tests

### Test 1: Vérifier l'initialisation

```javascript
// Dans la console
console.log("Storage prêt:", claraverseProcessor.storageReady);
console.log("Type:", claraverseProcessor.storage.isIndexedDBAvailable ? "IndexedDB" : "localStorage");
```

### Test 2: Vérifier la sauvegarde

```javascript
// Modifier une checkbox dans une table CIA
// Puis vérifier:
await claraverseCommands.getStorageInfo();
```

### Test 3: Vérifier la restauration

```javascript
// Actualiser la page (F5)
// Les checkboxes doivent être restaurées
```

### Test 4: Migration

```javascript
// Migrer les données existantes
await claraverseCommands.migrateToIndexedDB();
```

## 📊 Commandes utiles

```javascript
// Voir les stats
await claraverseCommands.getStorageInfo();

// Nettoyer les anciennes données (> 7 jours)
await claraverseCommands.cleanupOld(7);

// Migrer vers IndexedDB
await claraverseCommands.migrateToIndexedDB();

// Tout supprimer
await claraverseCommands.clearAllStorage();
```

## ⚠️ Points d'attention

1. **Async/Await**: Toutes les méthodes de stockage sont maintenant asynchrones
2. **Compatibilité**: Le fallback localStorage est automatique
3. **Migration**: Les données existantes sont migrées automatiquement au premier chargement
4. **Performance**: IndexedDB est plus rapide pour les grandes quantités de données

## 🔧 Dépannage

### Problème: IndexedDB non disponible

**Solution**: Le système bascule automatiquement sur localStorage

### Problème: Données non migrées

**Solution**: 
```javascript
await claraverseCommands.migrateToIndexedDB();
```

### Problème: Quota toujours dépassé

**Solution**:
```javascript
// Nettoyer les anciennes données
await claraverseCommands.cleanupOld(3); // Garder seulement 3 jours

// Ou vider complètement
await claraverseCommands.clearAllStorage();
```

## 📝 Résumé des changements

✅ **Ajouté**: `conso-storage-indexeddb.js` - Gestionnaire de stockage
✅ **Modifié**: `conso.js` - Utilisation du nouveau gestionnaire
✅ **Ajouté**: Commandes console pour gérer le stockage
✅ **Ajouté**: Migration automatique localStorage → IndexedDB
✅ **Ajouté**: Fallback automatique si IndexedDB indisponible

## 🎯 Résultat attendu

- ✅ Plus de problèmes de quota localStorage
- ✅ Capacité de stockage multipliée par 50-100x
- ✅ Meilleures performances
- ✅ Compatibilité maintenue avec localStorage
- ✅ Migration transparente des données existantes
