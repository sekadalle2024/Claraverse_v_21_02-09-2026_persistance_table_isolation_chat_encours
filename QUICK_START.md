# Guide de Démarrage Rapide - Persistance DOM

## 🚀 Démarrage en 3 Étapes

### Étape 1: Sauvegarder l'Ancien Fichier

```bash
cp conso.js conso_backup.js
```

### Étape 2: Appliquer la Migration

**Option A - Automatique (Recommandé):**
```bash
node migrate_to_dom.js
```

**Option B - Manuel:**
Suivre les instructions dans `DOM_PERSISTENCE_MIGRATION.md`

### Étape 3: Vérifier

Ouvrir la console du navigateur et exécuter:

```javascript
// Vérifier que le système fonctionne
claraverseCommands.inspectDOMStore();
```

## 📊 Utilisation Immédiate

### Commandes Essentielles

```javascript
// Voir l'aide complète
claraverseCommands.help();

// Voir les informations de stockage
claraverseCommands.getStorageInfo();

// Sauvegarder toutes les tables maintenant
claraverseCommands.saveNow();

// Exporter les données (téléchargement JSON)
claraverseCommands.exportData();

// Restaurer les tables
claraverseCommands.restoreAll();
```

### Vérification Rapide

```javascript
// Test complet en une commande
const store = document.getElementById('claraverse-dom-data-store');
console.log('✅ Store exists:', store !== null);

const info = claraverseCommands.getStorageInfo();
console.log('✅ Storage type:', info.storageType);
console.log('✅ Table count:', info.tableCount);
```

## 🔍 Inspection du DOM Store

### Voir le Conteneur dans DevTools

1. Ouvrir DevTools (F12)
2. Onglet **Elements**
3. Chercher: `<div id="claraverse-dom-data-store">`
4. Inspecter le contenu

### Voir les Données JSON

```javascript
// Afficher les données brutes
claraverseCommands.debug.showStorage();

// Ou directement
const store = document.getElementById('claraverse-dom-data-store');
const script = store.querySelector('script[type="application/json"]');
console.log(JSON.parse(script.textContent));
```

## 💾 Export/Import de Données

### Exporter

```javascript
// Télécharge un fichier JSON
claraverseCommands.exportData();
```

### Importer

```javascript
// 1. Charger le fichier JSON
// 2. Copier son contenu
// 3. Exécuter:
const myData = {
  /* coller le contenu JSON ici */
};
claraverseCommands.importData(myData);
```

## 🧪 Tests Rapides

### Test 1: Vérifier le Conteneur

```javascript
const store = document.getElementById('claraverse-dom-data-store');
console.assert(store !== null, '✅ DOM Store créé');
console.log('Version:', store.getAttribute('data-persistence-version'));
console.log('Créé:', store.getAttribute('data-created'));
```

### Test 2: Sauvegarder et Charger

```javascript
const processor = window.claraverseProcessor;

// Sauvegarder
processor.saveAllData({ test: { value: 'OK' } });

// Charger
const data = processor.loadAllData();
console.assert(data.test.value === 'OK', '✅ Sauvegarde fonctionne');
```

### Test 3: Tables

```javascript
const tables = processor.findAllTables();
console.log(`📊 ${tables.length} table(s) trouvée(s)`);

processor.autoSaveAllTables();
console.log('💾 Sauvegarde lancée');

setTimeout(() => {
  const info = processor.getStorageInfo();
  console.log(`✅ ${info.tableCount} table(s) sauvegardée(s)`);
}, 1000);
```

## ⚠️ Points Importants

### 🔴 Les Données Sont Perdues au Rechargement

Les données sont stockées dans le DOM et **ne survivent pas** au rechargement de la page.

**Solutions:**

1. **Exporter régulièrement:**
   ```javascript
   claraverseCommands.exportData();
   ```

2. **Export automatique avant fermeture:**
   ```javascript
   window.addEventListener('beforeunload', () => {
     claraverseCommands.exportData();
   });
   ```

3. **Rappel périodique:**
   ```javascript
   // Exporter toutes les 5 minutes
   setInterval(() => {
     claraverseCommands.exportData();
   }, 5 * 60 * 1000);
   ```

## 🐛 Résolution de Problèmes

### Problème: "claraverseCommands is not defined"

**Solution:**
```javascript
// Attendre que le script soit chargé
setTimeout(() => {
  claraverseCommands.help();
}, 2000);
```

### Problème: Aucune donnée sauvegardée

**Solution:**
```javascript
// Forcer la sauvegarde
claraverseCommands.saveNow();

// Vérifier
claraverseCommands.getStorageInfo();
```

### Problème: Tables non détectées

**Solution:**
```javascript
// Lister les tables
claraverseCommands.debug.listTables();

// Attendre que React charge
setTimeout(() => {
  processor.processAllTables();
}, 3000);
```

### Problème: Le conteneur DOM n'existe pas

**Solution:**
```javascript
// Réinitialiser
const processor = window.claraverseProcessor;
processor.initializeDOMStore();
claraverseCommands.inspectDOMStore();
```

## 📋 Workflow Recommandé

### Début de Session

```javascript
// 1. Vérifier le système
claraverseCommands.getStorageInfo();

// 2. Importer des données précédentes (optionnel)
// claraverseCommands.importData(previousData);
```

### Pendant la Session

```javascript
// Les données sont automatiquement sauvegardées
// Vérifier de temps en temps:
claraverseCommands.getStorageInfo();
```

### Fin de Session

```javascript
// TOUJOURS exporter avant de quitter
claraverseCommands.exportData();
```

## 🎯 Commandes par Cas d'Usage

### Développeur: Debug

```javascript
// Mode verbose
claraverseCommands.debug.enableVerbose();

// Lister toutes les tables
claraverseCommands.debug.listTables();

// Voir le stockage
claraverseCommands.debug.showStorage();

// Inspecter le DOM Store
claraverseCommands.inspectDOMStore();
```

### Utilisateur: Utilisation Normale

```javascript
// Voir l'état
claraverseCommands.getStorageInfo();

// Sauvegarder
claraverseCommands.saveNow();

// Exporter
claraverseCommands.exportData();
```

### Admin: Maintenance

```javascript
// Nettoyer toutes les données
claraverseCommands.clearAllData();

// Réimporter des données
claraverseCommands.importData(backupData);

// Vérifier l'intégrité
claraverseCommands.getStorageInfo();
```

## 📊 Indicateurs de Santé

### Système OK si:

```javascript
const info = claraverseCommands.getStorageInfo();

// ✅ Vérifications
console.assert(info.storageType === "DOM", "Type correct");
console.assert(info.domStoreId === "claraverse-dom-data-store", "ID correct");
console.assert(info.tableCount >= 0, "Tables comptées");
console.assert(info.dataSize > 0, "Données présentes");
```

### Système KO si:

- `claraverseCommands` est undefined
- `getStorageInfo()` retourne storageType !== "DOM"
- Le conteneur DOM n'existe pas
- Erreurs dans la console

## 🔗 Ressources Complètes

- **IMPLEMENTATION_SUMMARY.md** - Résumé exécutif et architecture
- **DOM_PERSISTENCE_MIGRATION.md** - Guide détaillé de migration
- **migrate_to_dom.js** - Script automatisé de migration

## ✅ Checklist de Validation

Après migration, vérifier:

- [ ] `claraverseCommands.help()` fonctionne
- [ ] `claraverseCommands.getStorageInfo()` retourne `storageType: "DOM"`
- [ ] `claraverseCommands.inspectDOMStore()` affiche les données
- [ ] Les tables sont détectées: `processor.findAllTables().length > 0`
- [ ] La sauvegarde fonctionne: `claraverseCommands.saveNow()`
- [ ] L'export fonctionne: `claraverseCommands.exportData()`
- [ ] Pas d'erreur dans la console
- [ ] Aucune référence à `localStorage` dans le code

## 🎉 Tout Fonctionne!

Si toutes les vérifications passent:

```javascript
console.log(`
🎉 SYSTÈME OPÉRATIONNEL

✅ Persistance DOM active
✅ ${processor.findAllTables().length} table(s) détectée(s)
✅ Sauvegarde automatique activée
✅ Export/Import disponibles

💡 N'oubliez pas d'exporter avant de quitter:
   claraverseCommands.exportData();
`);
```

---

**Version:** 1.0.0  
**Support:** Consulter DOM_PERSISTENCE_MIGRATION.md pour plus de détails