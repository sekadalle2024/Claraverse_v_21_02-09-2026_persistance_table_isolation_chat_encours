# 🔍 Diagnostic Changement de Chat

## ⚡ Diagnostic Rapide (Copier-Coller dans la Console)

```javascript
(async function diagnosticChatChange() {
    console.log('\n🔍 ===== DIAGNOSTIC CHANGEMENT DE CHAT =====\n');
    
    // 1. Vérifier le script
    console.log('1️⃣ Script chargé:');
    console.log('  - forceRestoreChatChange:', typeof window.forceRestoreChatChange);
    console.log('  - restoreCurrentChat:', typeof window.restoreCurrentChat);
    console.log('  - forceSmartRestore:', typeof window.forceSmartRestore);
    
    // 2. Vérifier IndexedDB
    console.log('\n2️⃣ IndexedDB:');
    try {
        const db = await new Promise((r, e) => {
            const req = indexedDB.open('FlowiseTableDB', 1);
            req.onsuccess = () => r(req.result);
            req.onerror = () => e(req.error);
        });
        
        const tables = await new Promise((r, e) => {
            const tx = db.transaction(['tables'], 'readonly');
            const req = tx.objectStore('tables').getAll();
            req.onsuccess = () => r(req.result || []);
            req.onerror = () => e(req.error);
        });
        
        console.log(`  ✅ ${tables.length} table(s) sauvegardée(s)`);
        tables.forEach((t, i) => {
            const headers = t.headers?.join(', ').substring(0, 60) || 'N/A';
            const rows = (t.html?.match(/<tr>/g) || []).length - 1;
            console.log(`    ${i + 1}. ${headers}... (${rows} lignes)`);
        });
    } catch (error) {
        console.log('  ❌ Erreur:', error.message);
    }
    
    // 3. Vérifier les tables dans le DOM
    console.log('\n3️⃣ Tables dans le DOM:');
    const allTables = document.querySelectorAll('table');
    const restoredTables = document.querySelectorAll('[data-restored-content="true"]');
    
    console.log(`  - Total: ${allTables.length}`);
    console.log(`  - Restaurées: ${restoredTables.length}`);
    
    if (allTables.length > 0) {
        console.log('\n  📋 Détails des tables:');
        allTables.forEach((t, i) => {
            const headers = Array.from(t.querySelectorAll('th')).map(h => h.textContent?.trim()).join(', ');
            const rows = t.querySelectorAll('tbody tr').length;
            const isRestored = t.closest('[data-restored-content="true"]') ? '✅' : '❌';
            console.log(`    ${i + 1}. ${isRestored} ${headers.substring(0, 50)}... (${rows} lignes)`);
        });
    }
    
    // 4. État actuel
    console.log('\n4️⃣ État actuel:');
    console.log('  - URL:', window.location.href);
    console.log('  - Messages:', document.querySelectorAll('[class*="message"]').length);
    
    // 5. Recommandations
    console.log('\n5️⃣ Recommandations:');
    
    if (typeof window.forceRestoreChatChange === 'undefined') {
        console.log('  ❌ Script non chargé - Rechargez la page (F5)');
    } else if (tables.length === 0) {
        console.log('  ⚠️ Aucune table sauvegardée');
        console.log('     1. Générez une table avec Flowise');
        console.log('     2. Supprimez des lignes');
        console.log('     3. Changez de chat');
    } else if (restoredTables.length === 0 && allTables.length > 0) {
        console.log('  ⚠️ Tables non restaurées - Essayez:');
        console.log('     window.forceRestoreChatChange()');
    } else if (restoredTables.length > 0) {
        console.log('  ✅ Tout fonctionne correctement!');
    }
    
    console.log('\n===== FIN DU DIAGNOSTIC =====\n');
})();
```

## 🎯 Interprétation des Résultats

### ✅ Cas Idéal
```
1️⃣ Script chargé:
  - forceRestoreChatChange: function
  
2️⃣ IndexedDB:
  ✅ 1 table(s) sauvegardée(s)
    1. tâches clés, Point de controle... (24 lignes)
    
3️⃣ Tables dans le DOM:
  - Total: 1
  - Restaurées: 1
  
  📋 Détails des tables:
    1. ✅ tâches clés, Point de controle... (24 lignes)
    
5️⃣ Recommandations:
  ✅ Tout fonctionne correctement!
```

### ⚠️ Script Non Chargé
```
1️⃣ Script chargé:
  - forceRestoreChatChange: undefined
  
5️⃣ Recommandations:
  ❌ Script non chargé - Rechargez la page (F5)
```

**Action** : Rechargez la page (F5)

### ⚠️ Aucune Table Sauvegardée
```
2️⃣ IndexedDB:
  ✅ 0 table(s) sauvegardée(s)
  
5️⃣ Recommandations:
  ⚠️ Aucune table sauvegardée
```

**Action** : 
1. Générez une table avec Flowise
2. Supprimez des lignes
3. Vérifiez que la sauvegarde s'effectue

### ⚠️ Tables Non Restaurées
```
2️⃣ IndexedDB:
  ✅ 1 table(s) sauvegardée(s)
  
3️⃣ Tables dans le DOM:
  - Total: 1
  - Restaurées: 0
  
  📋 Détails des tables:
    1. ❌ tâches clés... (30 lignes)  ← Table initiale
    
5️⃣ Recommandations:
  ⚠️ Tables non restaurées - Essayez:
     window.forceRestoreChatChange()
```

**Action** : Forcez la restauration
```javascript
window.forceRestoreChatChange()
```

## 🔧 Actions Correctives

### Si le script n'est pas chargé
```javascript
// Rechargez la page
location.reload()
```

### Si les tables ne sont pas restaurées
```javascript
// Forcez la restauration
window.forceRestoreChatChange()

// Attendez 3 secondes puis vérifiez
setTimeout(() => {
    const restored = document.querySelectorAll('[data-restored-content="true"]');
    console.log(`✅ Tables restaurées: ${restored.length}`);
}, 3000);
```

### Si IndexedDB est vide
```javascript
// Vérifiez que la sauvegarde fonctionne
// 1. Générez une table
// 2. Supprimez des lignes
// 3. Attendez 2 secondes
// 4. Relancez le diagnostic
```

## 📊 Test Complet

### Scénario de Test
1. **Exécutez le diagnostic** (copier-coller le code ci-dessus)
2. **Notez les résultats**
3. **Changez de chat**
4. **Revenez au chat initial**
5. **Attendez 5 secondes**
6. **Relancez le diagnostic**

### Résultat Attendu
- Avant changement : 0 table restaurée
- Après changement : 1+ table restaurée

---

**Prochaine étape** : Exécutez le diagnostic et partagez les résultats !
