# 🔍 Instructions de Debug - Persistance dev-indexedDB.js

## 🎯 Diagnostic Immédiat

### Étape 1 : Ouvrir la Console

1. Appuyer sur **F12**
2. Aller dans l'onglet **Console**

### Étape 2 : Vérifier les Services

Copier-coller ces commandes **une par une** dans la console :

```javascript
// 1. Vérifier flowiseTableService
console.log("flowiseTableService:", window.flowiseTableService);

// 2. Vérifier flowiseTableBridge
console.log("flowiseTableBridge:", window.flowiseTableBridge);

// 3. Vérifier devIndexedDB
console.log("devIndexedDB:", window.devIndexedDB);

// 4. Vérifier la session
console.log("Session:", sessionStorage.getItem('claraverse_stable_session'));
```

### Étape 3 : Tester la Sauvegarde Manuellement

```javascript
// Test de sauvegarde manuelle
async function testSave() {
    const service = window.flowiseTableService || window.flowiseTableBridge;
    
    if (!service) {
        console.error("❌ Aucun service disponible!");
        return;
    }
    
    console.log("✅ Service trouvé:", service);
    console.log("Méthodes disponibles:", Object.keys(service));
    
    // Vérifier saveGeneratedTable
    if (service.saveGeneratedTable) {
        console.log("✅ saveGeneratedTable existe");
    } else {
        console.error("❌ saveGeneratedTable n'existe pas");
    }
}

testSave();
```

### Étape 4 : Vérifier IndexedDB

```javascript
// Ouvrir IndexedDB et vérifier les données
async function checkIndexedDB() {
    const request = indexedDB.open('clara_db', 12);
    
    request.onsuccess = () => {
        const db = request.result;
        console.log("✅ Base de données ouverte");
        console.log("Stores:", Array.from(db.objectStoreNames));
        
        const tx = db.transaction(['clara_generated_tables'], 'readonly');
        const store = tx.objectStore('clara_generated_tables');
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
            const tables = getAll.result;
            console.log(`📊 ${tables.length} tables sauvegardées`);
            
            // Filtrer les tables dev
            const devTables = tables.filter(t => t.source === 'dev-indexeddb');
            console.log(`✏️ ${devTables.length} tables dev-indexeddb`);
            
            if (devTables.length > 0) {
                console.log("Dernière table dev:", devTables[devTables.length - 1]);
            }
        };
    };
    
    request.onerror = () => {
        console.error("❌ Erreur ouverture IndexedDB:", request.error);
    };
}

checkIndexedDB();
```

---

## 📋 Résultats Attendus

### Si Tout Fonctionne

```
✅ flowiseTableService: Object {...}
✅ Service trouvé: Object {...}
✅ saveGeneratedTable existe
✅ Base de données ouverte
📊 X tables sauvegardées
✏️ Y tables dev-indexeddb
```

### Si Problème

**Cas 1 : Service non disponible**
```
❌ flowiseTableService: undefined
❌ flowiseTableBridge: undefined
❌ Aucun service disponible!
```

**Solution** : Le service n'est pas chargé. Vérifier que `menu-persistence-bridge.js` est chargé avant `dev-indexedDB.js`.

**Cas 2 : saveGeneratedTable n'existe pas**
```
✅ Service trouvé: Object {...}
❌ saveGeneratedTable n'existe pas
```

**Solution** : Le service existe mais n'a pas la bonne méthode. Utiliser une approche alternative.

**Cas 3 : Aucune table dev sauvegardée**
```
✅ Base de données ouverte
📊 X tables sauvegardées
✏️ 0 tables dev-indexeddb
```

**Solution** : La sauvegarde ne fonctionne pas. Vérifier les logs lors de l'édition.

---

## 🔧 Solutions par Cas

### Solution 1 : Service Non Disponible

Le problème est que `dev-indexedDB.js` se charge avant que les services soient disponibles.

**Dans la console, tester** :
```javascript
// Attendre que le service soit disponible
setTimeout(() => {
    console.log("Service après délai:", window.flowiseTableService);
}, 5000);
```

**Si ça fonctionne après 5 secondes**, le problème est le timing. Il faut augmenter le délai d'attente dans `dev-indexedDB.js`.

### Solution 2 : Utiliser l'Événement de Sauvegarde

Au lieu d'appeler directement le service, utiliser les événements :

```javascript
// Dans la console, tester
document.dispatchEvent(new CustomEvent('flowise:table:save:request', {
    detail: {
        table: document.querySelector('table'),
        sessionId: sessionStorage.getItem('claraverse_stable_session'),
        keyword: 'test_dev',
        source: 'dev-indexeddb'
    }
}));
```

**Si ça fonctionne**, modifier `dev-indexedDB.js` pour utiliser les événements au lieu d'appeler directement le service.

### Solution 3 : Sauvegarder Directement dans IndexedDB

Si les services ne fonctionnent pas, sauvegarder directement :

```javascript
// Test de sauvegarde directe
async function saveDirectly() {
    const request = indexedDB.open('clara_db', 12);
    
    request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['clara_generated_tables'], 'readwrite');
        const store = tx.objectStore('clara_generated_tables');
        
        const data = {
            id: `dev_${Date.now()}`,
            sessionId: sessionStorage.getItem('claraverse_stable_session'),
            keyword: 'test_dev_direct',
            html: '<table><tr><td>Test</td></tr></table>',
            source: 'dev-indexeddb',
            timestamp: Date.now()
        };
        
        const add = store.add(data);
        
        add.onsuccess = () => {
            console.log("✅ Sauvegarde directe réussie!");
        };
        
        add.onerror = () => {
            console.error("❌ Erreur sauvegarde:", add.error);
        };
    };
}

saveDirectly();
```

**Si ça fonctionne**, modifier `dev-indexedDB.js` pour sauvegarder directement dans IndexedDB.

---

## 📝 Rapport de Debug

Après avoir exécuté les tests, remplir ce rapport :

```
Date : _______________

Test 1 - Services disponibles :
☐ flowiseTableService : _______________
☐ flowiseTableBridge : _______________
☐ devIndexedDB : _______________

Test 2 - Méthodes disponibles :
☐ saveGeneratedTable : _______________
☐ restoreSessionTables : _______________

Test 3 - IndexedDB :
☐ Base ouverte : _______________
☐ Tables totales : _______________
☐ Tables dev : _______________

Test 4 - Session :
☐ Session ID : _______________

Problème identifié :
_________________________________________________

Solution à appliquer :
_________________________________________________
```

---

## 🚀 Prochaines Étapes

1. **Exécuter les tests** dans la console
2. **Identifier le problème** (service, méthode, timing)
3. **Appliquer la solution** correspondante
4. **Retester** la sauvegarde

---

*Instructions créées le 17 novembre 2025*
