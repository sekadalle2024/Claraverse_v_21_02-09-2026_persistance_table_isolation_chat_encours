# 🧪 Tests de Validation - Solution Conso/Résultat

## 📋 Plan de Tests

### Test 1 : Vérification de l'API ✅
### Test 2 : Sauvegarde Table Consolidation ✅
### Test 3 : Restauration après F5 ✅
### Test 4 : Changement de Chat ✅
### Test 5 : Performance ✅

---

## Test 1 : Vérification de l'API

### Objectif
Vérifier que `claraverseSyncAPI` est disponible et fonctionnelle

### Procédure

```javascript
// Dans la console du navigateur (F12)

// 1. Vérifier la présence de l'API
console.log('=== TEST 1 : Vérification API ===');
console.log('API disponible:', !!window.claraverseSyncAPI);
console.log('forceSaveTable:', typeof window.claraverseSyncAPI?.forceSaveTable);
console.log('restoreSessionTables:', typeof window.claraverseSyncAPI?.restoreSessionTables);
console.log('notifyTableUpdate:', typeof window.claraverseSyncAPI?.notifyTableUpdate);
console.log('getDiagnostics:', typeof window.claraverseSyncAPI?.getDiagnostics);
```

### Résultat Attendu

```
=== TEST 1 : Vérification API ===
API disponible: true
forceSaveTable: function
restoreSessionTables: function
notifyTableUpdate: function
getDiagnostics: function
```

### Statut
- [ ] ✅ PASS
- [ ] ❌ FAIL

---

## Test 2 : Sauvegarde Table Consolidation

### Objectif
Vérifier que les tables de consolidation sont sauvegardées dans IndexedDB

### Procédure

**Étape 1 : Créer une table modelisée**

1. Dans le chat, créer une table avec les colonnes :
   - Compte
   - Assertion
   - Conclusion
   - Écart

2. Remplir quelques lignes avec :
   - Assertion : "Validité"
   - Conclusion : "Non-Satisfaisant"
   - Écart : "1000"

**Étape 2 : Vérifier la consolidation**

La table de consolidation devrait apparaître automatiquement au-dessus de la table.

**Étape 3 : Vérifier la sauvegarde**

```javascript
console.log('=== TEST 2 : Sauvegarde Consolidation ===');

// Attendre 2 secondes pour la sauvegarde
setTimeout(() => {
    const req = indexedDB.open('clara_db', 12);
    req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(['clara_generated_tables'], 'readonly');
        const store = tx.objectStore('clara_generated_tables');
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
            const allTables = getAll.result;
            console.log('📊 Total tables dans IndexedDB:', allTables.length);
            
            const consoTables = allTables.filter(t => 
                t.keyword && (
                    t.keyword.includes('Consolidation') || 
                    t.keyword.includes('consolidation') ||
                    t.tableType === 'generated'
                )
            );
            
            console.log('✅ Tables consolidation:', consoTables.length);
            
            if (consoTables.length > 0) {
                console.log('📋 Détails première table conso:');
                console.log('  - ID:', consoTables[0].id);
                console.log('  - Keyword:', consoTables[0].keyword);
                console.log('  - TableType:', consoTables[0].tableType);
                console.log('  - Timestamp:', new Date(consoTables[0].timestamp));
                console.log('  - HTML (100 premiers chars):', consoTables[0].html?.substring(0, 100));
            }
        };
    };
}, 2000);
```

### Résultat Attendu

```
=== TEST 2 : Sauvegarde Consolidation ===
📊 Total tables dans IndexedDB: 2 (ou plus)
✅ Tables consolidation: 1 (ou plus)
📋 Détails première table conso:
  - ID: uuid-xxx
  - Keyword: 📊 Table de Consolidation
  - TableType: generated
  - Timestamp: [date actuelle]
  - HTML (100 premiers chars): <table class="claraverse-conso-table"...
```

### Statut
- [ ] ✅ PASS
- [ ] ❌ FAIL

---

## Test 3 : Restauration après F5

### Objectif
Vérifier que les tables de consolidation sont restaurées après rechargement

### Procédure

**Étape 1 : Créer une consolidation**

Suivre les étapes du Test 2 pour créer une table de consolidation.

**Étape 2 : Noter le contenu**

```javascript
const consoTable = document.querySelector('.claraverse-conso-table');
const content = consoTable.querySelector('td').textContent;
console.log('📝 Contenu avant F5:', content.substring(0, 200));
```

**Étape 3 : Recharger la page**

Appuyer sur F5

**Étape 4 : Vérifier la restauration**

```javascript
console.log('=== TEST 3 : Restauration après F5 ===');

// Attendre 5 secondes pour la restauration
setTimeout(() => {
    const consoTables = document.querySelectorAll('.claraverse-conso-table');
    console.log('📊 Tables consolidation restaurées:', consoTables.length);
    
    if (consoTables.length > 0) {
        consoTables.forEach((table, index) => {
            const content = table.querySelector('td').textContent;
            console.log(`Table ${index + 1}:`, content.substring(0, 200));
            
            // Vérifier les attributs
            console.log(`  - data-table-id:`, table.dataset.tableId);
            console.log(`  - data-table-type:`, table.dataset.tableType);
            console.log(`  - data-restored-content:`, table.dataset.restoredContent);
        });
    } else {
        console.error('❌ Aucune table consolidation restaurée !');
    }
}, 5000);
```

### Résultat Attendu

```
=== TEST 3 : Restauration après F5 ===
📊 Tables consolidation restaurées: 1 (ou plus)
Table 1: 🔍 Validité : les transactions relatives aux comptes...
  - data-table-id: conso-xxx
  - data-table-type: generated
  - data-restored-content: true
```

### Statut
- [ ] ✅ PASS
- [ ] ❌ FAIL

---

## Test 4 : Changement de Chat

### Objectif
Vérifier que les tables sont restaurées lors du changement de chat

### Procédure

**Étape 1 : Créer une consolidation dans Chat A**

1. Créer une table avec consolidation
2. Noter le sessionId :
```javascript
const sessionA = sessionStorage.getItem('claraverse_stable_session');
console.log('📍 Session A:', sessionA);
```

**Étape 2 : Changer vers Chat B**

1. Cliquer sur un autre chat
2. Attendre 5 secondes

**Étape 3 : Revenir à Chat A**

1. Cliquer sur le Chat A
2. Attendre 5 secondes

**Étape 4 : Vérifier la restauration**

```javascript
console.log('=== TEST 4 : Changement de Chat ===');

const sessionCurrent = sessionStorage.getItem('claraverse_stable_session');
console.log('📍 Session actuelle:', sessionCurrent);

const consoTables = document.querySelectorAll('.claraverse-conso-table');
console.log('📊 Tables consolidation:', consoTables.length);

if (consoTables.length > 0) {
    console.log('✅ Tables restaurées après changement de chat');
    consoTables.forEach((table, index) => {
        const content = table.querySelector('td').textContent;
        console.log(`Table ${index + 1}:`, content.substring(0, 100));
    });
} else {
    console.error('❌ Tables non restaurées après changement de chat');
}
```

### Résultat Attendu

```
=== TEST 4 : Changement de Chat ===
📍 Session actuelle: stable_session_xxx
📊 Tables consolidation: 1 (ou plus)
✅ Tables restaurées après changement de chat
Table 1: 🔍 Validité : les transactions relatives aux comptes...
```

### Statut
- [ ] ✅ PASS
- [ ] ❌ FAIL

---

## Test 5 : Performance

### Objectif
Vérifier que le système n'impacte pas les performances

### Procédure

```javascript
console.log('=== TEST 5 : Performance ===');

// Test 1 : Temps de sauvegarde
const table = document.querySelector('.claraverse-conso-table');
const startSave = performance.now();

window.claraverseSyncAPI.forceSaveTable(table).then(() => {
    const endSave = performance.now();
    console.log('⏱️ Temps de sauvegarde:', (endSave - startSave).toFixed(2), 'ms');
});

// Test 2 : Taille IndexedDB
setTimeout(() => {
    const req = indexedDB.open('clara_db', 12);
    req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(['clara_generated_tables'], 'readonly');
        const store = tx.objectStore('clara_generated_tables');
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
            const allTables = getAll.result;
            const totalSize = JSON.stringify(allTables).length;
            console.log('💾 Taille totale IndexedDB:', (totalSize / 1024).toFixed(2), 'KB');
            console.log('📊 Nombre de tables:', allTables.length);
        };
    };
}, 1000);

// Test 3 : Nombre de restaurations
let restoreCount = 0;
document.addEventListener('claraverse:restore:complete', () => {
    restoreCount++;
    console.log('🔄 Restaurations effectuées:', restoreCount);
});

setTimeout(() => {
    console.log('📊 Total restaurations en 30 secondes:', restoreCount);
    if (restoreCount <= 1) {
        console.log('✅ Performance OK (pas de boucle infinie)');
    } else {
        console.warn('⚠️ Trop de restaurations détectées');
    }
}, 30000);
```

### Résultat Attendu

```
=== TEST 5 : Performance ===
⏱️ Temps de sauvegarde: < 100 ms
💾 Taille totale IndexedDB: < 500 KB
📊 Nombre de tables: 2-10
📊 Total restaurations en 30 secondes: 0-1
✅ Performance OK (pas de boucle infinie)
```

### Statut
- [ ] ✅ PASS
- [ ] ❌ FAIL

---

## 📊 Résumé des Tests

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Vérification API | ⏳ |
| 2 | Sauvegarde Consolidation | ⏳ |
| 3 | Restauration après F5 | ⏳ |
| 4 | Changement de Chat | ⏳ |
| 5 | Performance | ⏳ |

**Statut Global** : ⏳ En attente

---

## 🐛 Dépannage

### Si Test 1 échoue

**Problème** : API non disponible

**Solutions** :
1. Vérifier que `menu-persistence-bridge.js` est chargé
2. Vérifier l'ordre des scripts dans `index.html`
3. Recharger la page (F5)

### Si Test 2 échoue

**Problème** : Tables non sauvegardées

**Solutions** :
1. Vérifier les logs console pour erreurs
2. Vérifier que `saveTableDataNow()` utilise `claraverseSyncAPI`
3. Attendre 2-3 secondes avant de vérifier IndexedDB

### Si Test 3 échoue

**Problème** : Tables non restaurées après F5

**Solutions** :
1. Vérifier que `auto-restore-chat-change.js` est actif
2. Vérifier les logs : `🔄 AUTO RESTORE CHAT CHANGE`
3. Attendre 5-10 secondes après F5

### Si Test 4 échoue

**Problème** : Tables non restaurées après changement de chat

**Solutions** :
1. Vérifier le sessionId : `sessionStorage.getItem('claraverse_stable_session')`
2. Vérifier que les tables ont `data-table-id`
3. Forcer une restauration : `window.restoreCurrentSession()`

### Si Test 5 échoue

**Problème** : Performance dégradée

**Solutions** :
1. Vérifier qu'il n'y a pas de boucle infinie de restaurations
2. Nettoyer IndexedDB si trop de tables
3. Vérifier les logs pour erreurs répétées

---

## ✅ Validation Finale

Tous les tests doivent passer pour valider la solution :

- [ ] Test 1 : ✅ PASS
- [ ] Test 2 : ✅ PASS
- [ ] Test 3 : ✅ PASS
- [ ] Test 4 : ✅ PASS
- [ ] Test 5 : ✅ PASS

**Solution validée** : ⏳ En attente

---

## 📞 Support

### Commandes Utiles

```javascript
// Forcer une sauvegarde
const table = document.querySelector('.claraverse-conso-table');
window.claraverseSyncAPI.forceSaveTable(table);

// Forcer une restauration
window.restoreCurrentSession();

// Vider IndexedDB (ATTENTION : perte de données)
indexedDB.deleteDatabase('clara_db');

// Diagnostics complets
window.claraverseSyncAPI.getDiagnostics().then(console.log);
```

### Logs à Surveiller

```
✅ Pont de persistance initialisé
💾 Sauvegarde via IndexedDB (claraverseSyncAPI)
✅ Table sauvegardée dans IndexedDB
📢 Notification changement table consolidation
🔄 Restauration déléguée au système IndexedDB
```

---

**Bons tests !** 🧪

*Tests créés le 21 novembre 2025*
