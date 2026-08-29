# 🔍 DIAGNOSTIC COMPLET - À EXÉCUTER MAINTENANT

## ⚡ Copiez-Collez ce Code dans la Console (F12)

```javascript
(async function diagnosticComplet() {
    console.log('\n🔍 ===== DIAGNOSTIC COMPLET =====\n');
    
    // 1. Scripts chargés
    console.log('1️⃣ SCRIPTS CHARGÉS:');
    const scripts = {
        'wrapAllTables': typeof window.wrapAllTables,
        'forceSmartRestore': typeof window.forceSmartRestore,
        'restoreCurrentChat': typeof window.restoreCurrentChat,
        'forceRestoreChatChange': typeof window.forceRestoreChatChange,
        'restoreModifiedTables': typeof window.restoreModifiedTables
    };
    
    Object.entries(scripts).forEach(([name, type]) => {
        const icon = type === 'function' ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${type}`);
    });
    
    // 2. IndexedDB
    console.log('\n2️⃣ INDEXEDDB:');
    try {
        const db = await new Promise((r, e) => {
            const req = indexedDB.open('FlowiseTableDB', 1);
            req.onsuccess = () => r(req.result);
            req.onerror = () => e(req.error);
            req.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('tables')) {
                    db.createObjectStore('tables', { keyPath: 'id' });
                }
            };
        });
        
        const tables = await new Promise((r, e) => {
            const tx = db.transaction(['tables'], 'readonly');
            const req = tx.objectStore('tables').getAll();
            req.onsuccess = () => r(req.result || []);
            req.onerror = () => e(req.error);
        });
        
        console.log(`  ✅ Base de données ouverte`);
        console.log(`  📦 ${tables.length} table(s) sauvegardée(s)`);
        
        if (tables.length > 0) {
            console.log('\n  📋 Détails:');
            tables.forEach((t, i) => {
                const headers = t.headers?.join(', ').substring(0, 60) || 'N/A';
                const rows = (t.html?.match(/<tr>/g) || []).length - 1;
                const date = new Date(t.timestamp).toLocaleString();
                console.log(`    ${i + 1}. ${headers}...`);
                console.log(`       - ${rows} lignes`);
                console.log(`       - Sauvegardée: ${date}`);
            });
        }
    } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
    }
    
    // 3. Tables dans le DOM
    console.log('\n3️⃣ TABLES DANS LE DOM:');
    const allTables = document.querySelectorAll('table');
    const restoredTables = document.querySelectorAll('[data-restored-content="true"]');
    const wrappedTables = document.querySelectorAll('[data-table-container]');
    
    console.log(`  - Total: ${allTables.length}`);
    console.log(`  - Wrappées: ${wrappedTables.length}`);
    console.log(`  - Restaurées: ${restoredTables.length}`);
    
    if (allTables.length > 0) {
        console.log('\n  📋 Détails des tables:');
        allTables.forEach((t, i) => {
            const headers = Array.from(t.querySelectorAll('th')).map(h => h.textContent?.trim()).join(', ');
            const rows = t.querySelectorAll('tbody tr').length;
            const isWrapped = t.closest('[data-table-container]') ? '📦' : '❌';
            const isRestored = t.closest('[data-restored-content="true"]') ? '✅' : '❌';
            console.log(`    ${i + 1}. ${isWrapped} ${isRestored} ${headers.substring(0, 40)}... (${rows} lignes)`);
        });
    }
    
    // 4. Logs récents
    console.log('\n4️⃣ VÉRIFICATION:');
    console.log('  Scrollez vers le HAUT dans la console pour voir:');
    console.log('  - Messages de démarrage des scripts');
    console.log('  - Messages de sauvegarde automatique');
    console.log('  - Messages de restauration');
    
    // 5. Recommandations
    console.log('\n5️⃣ RECOMMANDATIONS:');
    
    const hasScripts = scripts.forceSmartRestore === 'function' || scripts.forceRestoreChatChange === 'function';
    const hasTables = tables && tables.length > 0;
    const hasRestoredTables = restoredTables.length > 0;
    
    if (!hasScripts) {
        console.log('  ❌ PROBLÈME: Scripts de restauration non chargés');
        console.log('     → Rechargez la page (F5)');
    } else if (!hasTables) {
        console.log('  ⚠️ Aucune table sauvegardée');
        console.log('     1. Générez une table avec Flowise');
        console.log('     2. Supprimez des lignes');
        console.log('     3. Attendez 2 secondes');
        console.log('     4. Relancez ce diagnostic');
    } else if (allTables.length === 0) {
        console.log('  ⚠️ Aucune table dans le DOM');
        console.log('     → Demandez à Flowise de générer une table');
    } else if (!hasRestoredTables) {
        console.log('  ⚠️ Tables non restaurées - ESSAYEZ:');
        console.log('');
        if (scripts.forceSmartRestore === 'function') {
            console.log('     window.forceSmartRestore()');
        }
        if (scripts.forceRestoreChatChange === 'function') {
            console.log('     window.forceRestoreChatChange()');
        }
        if (scripts.restoreModifiedTables === 'function') {
            console.log('     window.restoreModifiedTables()');
        }
    } else {
        console.log('  ✅ Tout semble fonctionner correctement!');
    }
    
    console.log('\n===== FIN DU DIAGNOSTIC =====\n');
    
    // Retourner un résumé
    return {
        scripts: scripts,
        indexedDB: {
            connected: true,
            tablesCount: tables?.length || 0
        },
        dom: {
            totalTables: allTables.length,
            wrappedTables: wrappedTables.length,
            restoredTables: restoredTables.length
        },
        status: hasRestoredTables ? 'OK' : 'NEEDS_RESTORE'
    };
})();
```

## 📊 Interprétation

### ✅ Cas Idéal
```
1️⃣ SCRIPTS CHARGÉS:
  ✅ forceSmartRestore: function
  ✅ forceRestoreChatChange: function
  
2️⃣ INDEXEDDB:
  ✅ Base de données ouverte
  📦 1 table(s) sauvegardée(s)
  
3️⃣ TABLES DANS LE DOM:
  - Total: 1
  - Restaurées: 1
  
5️⃣ RECOMMANDATIONS:
  ✅ Tout semble fonctionner correctement!
```

### ❌ Problème: Scripts Non Chargés
```
1️⃣ SCRIPTS CHARGÉS:
  ❌ forceSmartRestore: undefined
  ❌ forceRestoreChatChange: undefined
```

**Action**: Rechargez la page (F5)

### ⚠️ Problème: Tables Non Restaurées
```
2️⃣ INDEXEDDB:
  📦 1 table(s) sauvegardée(s)
  
3️⃣ TABLES DANS LE DOM:
  - Total: 1
  - Restaurées: 0
  
5️⃣ RECOMMANDATIONS:
  ⚠️ Tables non restaurées - ESSAYEZ:
     window.forceSmartRestore()
```

**Action**: Exécutez la commande suggérée

---

**EXÉCUTEZ CE DIAGNOSTIC MAINTENANT ET PARTAGEZ LES RÉSULTATS !**
