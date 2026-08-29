# 🚀 Démarrage Rapide - Migration IndexedDB

## ⚡ En 3 étapes

### 1️⃣ Tester le système de stockage

Ouvrez dans votre navigateur:
```
http://localhost:3000/test-indexeddb-storage.html
```

Cliquez sur les boutons dans l'ordre:
1. **Initialiser le stockage** ✅
2. **Sauvegarder une table** 💾
3. **Charger une table** 📂
4. **Afficher les statistiques** 📊

### 2️⃣ Intégrer dans index.html

Ajoutez cette ligne AVANT le chargement de `conso.js`:

```html
<!-- Dans index.html, section des scripts -->
<script src="/conso-storage-indexeddb.js"></script>
<script src="/conso.js"></script>
```

### 3️⃣ Modifier conso.js

Suivez le guide détaillé: `MIGRATION_INDEXEDDB_CONSO.md`

Ou appliquez ce patch rapide:

```javascript
// Dans le constructeur
constructor() {
  // ... code existant ...
  this.storage = null;
  this.storageReady = false;
}

// Ajouter cette méthode
async initStorage() {
  if (window.ClaraverseStorageManager) {
    this.storage = new window.ClaraverseStorageManager();
    await this.storage.init();
    await this.storage.migrateFromLocalStorage();
    this.storageReady = true;
  }
}

// Dans init(), ajouter:
async init() {
  await this.initStorage();
  // ... reste du code ...
}

// Remplacer loadAllData()
async loadAllData() {
  if (this.storage) {
    return await this.storage.loadAllTables();
  }
  return {};
}

// Remplacer saveAllData()
async saveAllData(data) {
  if (this.storage) {
    for (const [tableId, tableData] of Object.entries(data)) {
      await this.storage.saveTable(tableId, tableData);
    }
  }
}
```

## ✅ Vérification

Dans la console du navigateur:

```javascript
// Vérifier l'initialisation
claraverseProcessor.storageReady
// → true

// Vérifier le type de stockage
claraverseProcessor.storage.isIndexedDBAvailable
// → true (IndexedDB) ou false (localStorage)

// Voir les stats
await claraverseCommands.getStorageInfo()
```

## 🎯 Résultat

- ✅ Plus de problème de quota
- ✅ Capacité x50 minimum
- ✅ Migration automatique des données
- ✅ Fallback localStorage si besoin

## 📚 Documentation complète

- `MIGRATION_INDEXEDDB_CONSO.md` - Guide détaillé
- `public/conso-storage-indexeddb.js` - Code source
- `public/test-indexeddb-storage.html` - Page de test

## 🆘 Besoin d'aide ?

Testez d'abord avec la page de test pour vérifier que tout fonctionne !
