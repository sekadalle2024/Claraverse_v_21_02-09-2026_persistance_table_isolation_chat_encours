# 🧪 TEST IMMÉDIAT - Race Condition

## ⚡ Test Rapide (2 minutes)

### Étape 1 : Vérifier l'état actuel

Ouvrez la console (F12) et collez ce code :

```javascript
setTimeout(() => {
    console.log('\n🔍 VÉRIFICATION ÉTAT ACTUEL:');
    
    const restored = document.querySelectorAll('[data-restored-content="true"]');
    console.log(`Tables restaurées: ${restored.length}`);
    
    if (restored.length > 0) {
        console.log('\n✅ La restauration fonctionne !');
        restored.forEach((container, i) => {
            const table = container.querySelector('table');
            const rows = table?.querySelectorAll('tbody tr').length || 0;
            const headers = Array.from(table?.querySelectorAll('th') || [])
                .map(h => h.textContent?.trim()).join(', ');
            console.log(`Table ${i + 1}: ${headers.substring(0, 50)}... (${rows} lignes)`);
        });
    } else {
        console.log('\n⚠️ Aucune table restaurée');
        console.log('Vérification IndexedDB...');
        
        (async () => {
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('FlowiseTableDB', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            const tables = await new Promise((resolve, reject) => {
                const transaction = db.transaction(['tables'], 'readonly');
                const store = transaction.objectStore('tables');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
            
            console.log(`💾 ${tables.length} table(s) sauvegardée(s) dans IndexedDB`);
            
            if (tables.length > 0) {
                console.log('\n💡 Solution: Forcer la restauration');
                console.log('Exécutez: window.forceSmartRestore()');
            } else {
                console.log('\n⚠️ Aucune table sauvegardée');
                console.log('1. Modifiez une table (supprimez des lignes)');
                console.log('2. Rechargez la page');
            }
        })();
    }
}, 2000);
```

### Étape 2 : Test de rechargement

1. **Si vous avez déjà des tables modifiées** :
   - Rechargez la page (F5)
   - Attendez 10 secondes
   - Exécutez le code de l'Étape 1
   - Vérifiez que les tables sont restaurées

2. **Si vous n'avez pas de tables modifiées** :
   - Demandez à Flowise de générer une table
   - Supprimez quelques lignes de la table
   - Rechargez la page (F5)
   - Attendez 10 secondes
   - Exécutez le code de l'Étape 1

### Étape 3 : Test de fiabilité (5 rechargements)

Exécutez ce code pour tester automatiquement :

```javascript
let testCount = 0;
let successCount = 0;

function testReload() {
    testCount++;
    console.log(`\n🧪 TEST ${testCount}/5`);
    
    setTimeout(() => {
        const restored = document.querySelectorAll('[data-restored-content="true"]');
        if (restored.length > 0) {
            successCount++;
            console.log(`✅ Test ${testCount}: SUCCÈS (${restored.length} table(s) restaurée(s))`);
        } else {
            console.log(`❌ Test ${testCount}: ÉCHEC (aucune table restaurée)`);
        }
        
        if (testCount < 5) {
            console.log('⏳ Rechargement dans 3 secondes...');
            setTimeout(() => location.reload(), 3000);
        } else {
            console.log(`\n📊 RÉSULTAT FINAL: ${successCount}/5 succès (${(successCount/5*100).toFixed(0)}%)`);
            if (successCount === 5) {
                console.log('🎉 PARFAIT ! La restauration fonctionne à 100%');
            } else if (successCount >= 4) {
                console.log('✅ BON ! La restauration est fiable');
            } else {
                console.log('⚠️ PROBLÈME ! La restauration est instable');
                console.log('💡 Consultez GUIDE_RESOLUTION_RACE_CONDITION.md');
            }
        }
    }, 10000);
}

// Sauvegarder le compteur dans sessionStorage
if (sessionStorage.getItem('testInProgress')) {
    testCount = parseInt(sessionStorage.getItem('testCount') || '0');
    successCount = parseInt(sessionStorage.getItem('successCount') || '0');
    sessionStorage.setItem('testCount', testCount);
    sessionStorage.setItem('successCount', successCount);
    testReload();
} else {
    console.log('🚀 Démarrage du test de fiabilité (5 rechargements)');
    console.log('⚠️ Ne fermez pas cette fenêtre pendant le test');
    sessionStorage.setItem('testInProgress', 'true');
    sessionStorage.setItem('testCount', '0');
    sessionStorage.setItem('successCount', '0');
    testReload();
}
```

## 🎯 Résultats Attendus

### ✅ Succès (100%)
```
Tables restaurées: 1
✅ La restauration fonctionne !
Table 1: tâches clés, Point de controle, Risque... (24 lignes)
```

### ⚠️ Échec Partiel (< 100%)
```
Tables restaurées: 0
⚠️ Aucune table restaurée
💾 1 table(s) sauvegardée(s) dans IndexedDB
💡 Solution: Forcer la restauration
```

**Action** : Exécutez `window.forceSmartRestore()`

### ❌ Échec Total (0%)
```
Tables restaurées: 0
💾 0 table(s) sauvegardée(s) dans IndexedDB
⚠️ Aucune table sauvegardée
```

**Action** : 
1. Vérifiez que les scripts sont chargés : `console.log(typeof window.forceSmartRestore)`
2. Consultez `GUIDE_RESOLUTION_RACE_CONDITION.md`

## 🔧 Commandes Utiles

### Forcer la restauration manuellement
```javascript
window.forceSmartRestore()
```

### Vérifier les scripts chargés
```javascript
console.log('Smart Restore:', typeof window.forceSmartRestore);
console.log('Restore Tables:', typeof window.restoreModifiedTables);
console.log('Wrap Tables:', typeof window.wrapAllTables);
```

### Voir toutes les tables sauvegardées
```javascript
(async () => {
    const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('FlowiseTableDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const tables = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['tables'], 'readonly');
        const store = transaction.objectStore('tables');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
    
    console.log('Tables sauvegardées:', tables);
    tables.forEach((t, i) => {
        console.log(`${i + 1}. ${t.headers?.join(', ')}`);
    });
})();
```

### Nettoyer IndexedDB (réinitialiser)
```javascript
indexedDB.deleteDatabase('FlowiseTableDB');
console.log('✅ Base de données supprimée - Rechargez la page');
```

## 📊 Interprétation des Résultats

| Taux de Succès | Statut | Action |
|----------------|--------|--------|
| 100% (5/5) | 🎉 Parfait | Rien à faire |
| 80-99% (4/5) | ✅ Bon | Acceptable, peut être amélioré |
| 60-79% (3/5) | ⚠️ Moyen | Augmenter STABILITY_DELAY à 5000ms |
| < 60% (< 3/5) | ❌ Problème | Consulter le guide de résolution |

## 🚀 Prochaines Étapes

### Si le test réussit (≥ 80%)
✅ Le système fonctionne correctement !
- Continuez à utiliser l'application normalement
- Les tables modifiées seront automatiquement restaurées

### Si le test échoue (< 80%)
1. Ouvrez `GUIDE_RESOLUTION_RACE_CONDITION.md`
2. Suivez la section "Dépannage"
3. Testez avec `test-race-condition.html`
4. Ajustez le `STABILITY_DELAY` si nécessaire

## 📞 Besoin d'Aide ?

1. Exécutez le diagnostic complet :
   ```javascript
   // Copier-coller le contenu de public/quick-diagnostic.js
   ```

2. Ouvrez la page de test interactive :
   `http://localhost:3000/test-race-condition.html`

3. Consultez les guides :
   - `SOLUTION_RACE_CONDITION.md` : Vue d'ensemble
   - `GUIDE_RESOLUTION_RACE_CONDITION.md` : Dépannage détaillé
