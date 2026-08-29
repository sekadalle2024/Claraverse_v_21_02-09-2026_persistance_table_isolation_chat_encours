# 🚀 Quick Start - Migration DOM Pure

## Étapes Rapides

### 1. Sauvegarde
```bash
cp conso.js conso.js.backup
```

### 2. Modifications Constructor (ligne ~30)
```javascript
// SUPPRIMER
this.storageKey = "claraverse_tables_data";

// AJOUTER
this.domStore = null;
this.shadowStore = null;
this.tableDataCache = new Map();
```

### 3. Remplacer init() (ligne ~42)
```javascript
// REMPLACER
this.testLocalStorage();

// PAR
this.initDOMStore();
```

### 4. Supprimer ces méthodes
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

### 5. Ajouter nouvelles méthodes
Copier depuis `conso_persistance_methods.js` :
- `initDOMStore()`
- `createTableSnapshot()`
- `saveTableData()`
- `saveTableDataNow()`
- `restoreTableData()`
- `restoreAllTablesData()`
- `saveConsolidationData()`
- `autoSaveAllTables()`
- `clearAllData()`
- `exportData()`
- `importData()`
- `getStorageInfo()`
- `showNotification()`

### 6. Modifier findAllTables()
```javascript
// AJOUTER à la fin
const uniqueTables = [...new Set(allTables)].filter(
  table => !this.shadowStore?.contains(table) && 
           !this.domStore?.contains(table)
);
```

### 7. Marquer cellules modifiées
Dans `setupAssertionCell()`, `setupConclusionCell()`, `setupCtrCell()` :
```javascript
// AJOUTER après chaque modification
cell.setAttribute('data-modified', 'true');
cell.setAttribute('data-value', value);
cell.setAttribute('data-original-value', oldValue);
cell.setAttribute('data-timestamp', Date.now());
```

### 8. Mettre à jour commandes console
Remplacer tout `window.claraverseCommands` par le code de `console_commands_dom.js`

### 9. Test
```javascript
// Dans la console navigateur
claraverseCommands.test.fullTest()
```

## ✅ Checklist

- [ ] Sauvegarde créée
- [ ] Constructor modifié
- [ ] `initDOMStore()` ajoutée
- [ ] Méthodes localStorage supprimées
- [ ] Nouvelles méthodes DOM ajoutées
- [ ] `findAllTables()` modifiée
- [ ] Cellules marquées avec data-attributes
- [ ] Commandes console mises à jour
- [ ] Test complet réussi

## 🆘 En cas d'erreur

```javascript
// Vérifier conteneurs
document.getElementById('claraverse-dom-store')
document.getElementById('claraverse-shadow-tables')

// Test complet
claraverseCommands.test.fullTest()

// Activer debug
claraverseCommands.utils.toggleDebug()
```

## 📚 Fichiers de Référence

1. **README_MIGRATION_DOM.md** - Vue d'ensemble complète
2. **INSTRUCTIONS_MIGRATION_DOM.md** - Guide détaillé étape par étape
3. **conso_persistance_methods.js** - Code complet de toutes les méthodes
4. **console_commands_dom.js** - Toutes les commandes console
5. **EXEMPLE_MIGRATION.md** - Exemples visuels avant/après

## 🎯 Résultat Attendu

Après migration :
- ✅ Pas de localStorage
- ✅ Deux conteneurs DOM cachés créés
- ✅ Tables clonées dans shadow store
- ✅ Cellules marquées avec data-attributes
- ✅ Restauration depuis snapshots DOM
- ✅ Commandes console fonctionnelles
- ✅ Export/Import en HTML

## 📞 Commandes Utiles

```javascript
// Aide
claraverseCommands.help()

// Infos
claraverseCommands.getStorageInfo()

// Test
claraverseCommands.test.fullTest()

// Sauvegarder
claraverseCommands.saveNow()

// Restaurer
claraverseCommands.restoreAll()

// Raccourcis
cv.help()
cv.info()
cv.test()
```

---

**Temps estimé :** 1-2 heures  
**Difficulté :** Moyenne  
**Impact :** Migration complète localStorage → DOM Pure