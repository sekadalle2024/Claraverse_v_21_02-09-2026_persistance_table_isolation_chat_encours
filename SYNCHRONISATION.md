# Documentation Synchronisation ClaraVerse

## Vue d'ensemble

Ce document décrit le système de synchronisation entre `menu.js` et `dev.js` pour garantir la persistance des données modifiées dans les tables HTML du projet ClaraVerse.

## Architecture

### Composants principaux

1. **dev.js** - Gestionnaire central de persistance
2. **menu.js** - Interface de modification avec synchronisation
3. **sync-test.js** - Utilitaire de test complet
4. **sync-check.js** - Vérification rapide d'état

### Flux de synchronisation

```
Menu Action → Modification Table → Synchronisation garantie → Persistance dev.js
     ↓                ↓                      ↓                    ↓
Événement     Marquage table        API claraverseSyncAPI    localStorage
personnalisé   data-modified             ↓                       ↓
     ↓              ↓              Sauvegarde forcée       Backup sécurisé
Notification   Horodatage              ↓                       ↓
   dev.js         ↓              Confirmation succès      Fallback ready
              Vérification
              différée
```

## API de synchronisation

### dev.js - claraverseSyncAPI

```javascript
window.claraverseSyncAPI = {
  version: "3.1",
  
  // Méthodes principales
  forceSaveTable(table)          // Sauvegarde immédiate d'une table
  saveAllTables()                // Sauvegarde toutes les tables
  notifyTableUpdate(id, table, source) // Notification modification
  
  // État et statistiques  
  getSyncState()                 // État de synchronisation
  getStorageStats()              // Statistiques localStorage
  
  // Gestion
  cleanData()                    // Nettoyage données corrompues
  restoreAllData()               // Restauration complète
}
```

### menu.js - Synchronisation garantie

```javascript
// Toutes les opérations de modification utilisent maintenant:
await this.ensureSync(operation, details)

// Opérations supportées:
- 'row_added' / 'row_deleted'
- 'column_added' / 'column_deleted' 
- 'rapprochement'
- 'excel_import' / 'excel_import_test'
- 'table_replacement'
```

## Mécanismes de sauvegarde

### 1. Synchronisation primaire
- **API claraverseSyncAPI** : Sauvegarde via dev.js
- **Événements personnalisés** : Communication inter-scripts
- **Marquage des tables** : Suivi des modifications

### 2. Synchronisation fallback
- **localStorage backup** : Sauvegarde locale automatique
- **Vérification différée** : Contrôle succès après 2s
- **Re-synchronisation** : Nouvelle tentative si échec

### 3. Sauvegarde d'urgence
- **Emergency backup** : Sauvegarde complète outerHTML
- **Données cellules** : Contenu et attributs individuels
- **Horodatage** : Traçabilité des sauvegardes

## Événements de synchronisation

### Événements émis par menu.js

```javascript
'claraverse:table:updated'           // Table modifiée
'claraverse:table:structure:changed' // Structure changée
'claraverse:rapprochement:complete'  // Calculs terminés
'claraverse:sync:guaranteed'         // Sync garantie demandée
'claraverse:fallback:sync'          // Sync fallback activée
```

### Événements traités par dev.js

```javascript
// Gestionnaires automatiques pour:
- handleTableUpdate()          // Sauvegarde prioritaire menu.js
- handleStructureChange()      // Nettoyage cellules supprimées  
- handleRapprochementComplete() // Sauvegarde calculs
- handleFallbackSync()         // Intégration données fallback
```

## Utilisation

### Actions du menu contextuel

Toutes ces actions déclenchent automatiquement la synchronisation :

1. **Insérer ligne en dessous** → `ensureSync('row_added')`
2. **Insérer colonne droite** → `ensureSync('column_added')`
3. **Rapprochement** → `ensureSync('rapprochement')`
4. **Import Excel** → `ensureSync('excel_import')`
5. **Import Excel Test** → `ensureSync('excel_import_test')`
6. **Suppression ligne/colonne** → `ensureSync('row_deleted'|'column_deleted')`

### Vérification manuelle

```javascript
// Dans la console navigateur :

// Vérification rapide
quickSync()

// Vérification complète  
syncCheck()

// Test de sauvegarde
syncTest()

// Statistiques
syncStats()

// Test complet avec rapport
testSync()
```

## Test et débogage

### Tests automatisés

```javascript
// Charger sync-test.js puis :
ClaraVerseSyncTest.runFullTest()

// Tests inclus :
✅ Configuration environnement
✅ API dev.js disponible
✅ Intégration menu.js
✅ Création table test
✅ Modifications et persistance
✅ Communication événements
✅ Mécanisme fallback
✅ Nettoyage automatique
```

### Vérification d'état

```javascript
// Charger sync-check.js puis :
syncCheck()

// Vérifie :
- dev.js API (claraverseSyncAPI)
- menu.js Manager (contextualMenuManager)  
- localStorage fonctionnel
- Communication événements
- État de synchronisation
```

## Marquage des tables

### Attributs automatiques

```html
<!-- Tables modifiées par le menu -->
<table data-modified-by="menu" 
       data-modified-time="1699123456789"
       data-last-operation="row_added"
       data-last-sync="1699123457000">
```

### Cellules calculées

```html  
<!-- Cellules avec calculs rapprochement -->
<td data-calculated="true"
    data-calculated-at="1699123456789"
    data-calculated-by="menu">
```

## Persistance des données

### Structure localStorage

```javascript
// Données cellules
"claraverse_cell_{tableId}_{cellId}" : {
  content: "valeur",
  timestamp: 1699123456789,
  tableId: "table_1_abc123"
}

// Sauvegarde fallback
"claraverse_table_backup_{tableId}" : {
  tableId: "table_1_abc123", 
  data: [...],
  timestamp: 1699123456789,
  outerHTML: "<table>...</table>"
}

// Sauvegarde d'urgence
"claraverse_emergency_{tableId}_{timestamp}" : {
  tableId: "table_1_abc123",
  outerHTML: "<table>...</table>",
  cellData: [...],
  timestamp: 1699123456789
}
```

## Dépannage

### Problèmes courants

#### dev.js non détecté
```javascript
// Vérifier :
console.log(window.claraverseSyncAPI); // Doit exister

// Solutions :
- Recharger dev.js
- Vérifier console pour erreurs
- Attendre initialisation complète
```

#### menu.js non synchronisé
```javascript
// Vérifier :
console.log(window.contextualMenuManager); // Doit exister

// Diagnostic :
window.contextualMenuManager.checkSyncStatus()

// Solutions :
- Vérifier API dev.js disponible
- Forcer re-synchronisation
```

#### Données non persistées
```javascript
// Vérifier localStorage :
syncStats()

// Forcer sauvegarde :
window.claraverseSyncAPI.saveAllTables()

// Vérifier backup :
Object.keys(localStorage).filter(k => k.includes('claraverse'))
```

### Messages de débogage

```javascript
// Activer logs détaillés dans dev.js :
CONFIG.DEBUG = true;

// Messages typiques :
"📊 Table mise à jour: table_1_abc123 par menu"
"💾 Sauvegarde immédiate réussie: 15 cellules"  
"🛡️ Synchronisation fallback reçue"
"✅ Synchronisation confirmée pour table table_1_abc123"
```

## Performance

### Optimisations

- **Sauvegarde différée** : Attente 2s avant vérification
- **Batch processing** : Sauvegarde groupée des cellules
- **Event debouncing** : Évite multiples sauvegardes
- **Cleanup automatique** : Suppression données obsolètes

### Métriques

```javascript
// Statistiques disponibles :
{
  localStorage: {
    total: 156,           // Total clés localStorage
    claraverse: 45,       // Clés ClaraVerse
    size: 1024000        // Taille données (bytes)
  },
  tables: 8,             // Tables détectées
  modifiedTables: 3      // Tables modifiées
}
```

## Extensibilité

### Ajouter nouvelle action

1. **menu.js** : Implémenter la méthode d'action
2. **Appeler** : `await this.ensureSync('mon_action', details)`
3. **dev.js** : Optionnel - ajouter gestionnaire spécifique
4. **Tester** : Utiliser sync-test.js

### Personnaliser sauvegarde

```javascript
// Étendre claraverseSyncAPI dans dev.js
window.claraverseSyncAPI.customSave = (table, options) => {
  // Logique personnalisée
};

// Utiliser depuis menu.js  
if (window.claraverseSyncAPI.customSave) {
  await window.claraverseSyncAPI.customSave(this.targetTable, {...});
}
```

## Maintenance

### Nettoyage périodique

```javascript
// Automatique dans dev.js :
storageManager.cleanCorruptedData()

// Manuel si nécessaire :
syncClean()
```

### Vérification santé

```javascript
// Exécuter périodiquement :
const health = quickSync();
if (!health.devOK || !health.menuOK) {
  console.warn("⚠️ Problème de synchronisation détecté");
  // Actions correctives...
}
```

---

## Support

Pour plus d'informations ou en cas de problème :

1. Consulter les logs de la console navigateur
2. Exécuter les tests de diagnostic fournis
3. Vérifier la documentation des composants individuels
4. Examiner les événements personnalisés dans DevTools

**Version** : 3.1  
**Dernière mise à jour** : 2024  
**Compatibilité** : ClaraVerse Firebase, Navigateurs modernes