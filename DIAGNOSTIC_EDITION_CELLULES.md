# 🔍 Diagnostic - Édition de Cellules Non Persistante

## 🎯 Problème

Les modifications de cellules ne sont pas persistantes après F5, alors que les autres actions (ajout/suppression de lignes) le sont.

---

## 🔧 Analyse

### Ce qui fonctionne

✅ **Ajout de ligne** : Persistant  
✅ **Suppression de ligne** : Persistant  
✅ **Import Excel** : Persistant

### Ce qui ne fonctionne pas

❌ **Édition de cellule** : Non persistant

---

## 🔍 Vérifications à Faire

### 1. Vérifier que l'événement est déclenché

**Dans la console (F12)** :

```javascript
// Activer l'édition
// Modifier une cellule
// Vérifier les logs

// Vous devriez voir :
// "💾 Cellule modifiée - Table sauvegardée"
// "✅ Table sauvegardée via système existant (structure_change)"
// "💾 Demande de sauvegarde depuis menu"
```

**Si vous ne voyez PAS ces logs** : L'événement n'est pas déclenché correctement.

---

### 2. Vérifier IndexedDB

**Dans les outils de développement** :

1. F12 > Application > IndexedDB > clara_db > clara_generated_tables
2. Chercher une entrée avec :
   - `source: "menu"`
   - `timestamp` récent
   - `html` contenant votre modification

**Si l'entrée n'existe PAS** : La sauvegarde n'a pas fonctionné.

---

### 3. Vérifier le SessionId

**Dans la console** :

```javascript
sessionStorage.getItem('claraverse_stable_session')
```

**Si null ou undefined** : Le sessionId n'est pas créé correctement.

---

## 🐛 Causes Possibles

### Cause 1 : Debounce trop long

Le système attend 300ms avant de sauvegarder. Si vous rechargez trop vite, la sauvegarde n'a pas le temps de se faire.

**Solution** : Attendre 1 seconde après modification avant de recharger.

---

### Cause 2 : Événement non écouté

`menuIntegration.ts` n'est peut-être pas initialisé.

**Test** :

```javascript
// Dans la console
window.flowiseTableService
window.flowiseTableBridge
```

**Si undefined** : Le service n'est pas initialisé.

---

### Cause 3 : TableId différent

Le tableId généré à la sauvegarde est différent de celui à la restauration.

**Test** :

```javascript
// Avant modification
const table = document.querySelector('table');
const id1 = window.contextualMenuManager.generateTableId(table);
console.log('ID avant:', id1);

// Modifier une cellule

// Après modification
const id2 = window.contextualMenuManager.generateTableId(table);
console.log('ID après:', id2);

// Ils doivent être IDENTIQUES
```

**Si différents** : Le tableId change, donc la restauration ne trouve pas la table.

---

### Cause 4 : Restauration avant sauvegarde

La restauration se fait trop vite et écrase la modification avant qu'elle ne soit sauvegardée.

**Test** : Attendre 2 secondes après modification avant de recharger.

---

## 🔧 Solutions

### Solution 1 : Réduire le Debounce

**Fichier** : `src/services/menuIntegration.ts`

```typescript
private readonly DEBOUNCE_DELAY = 100; // Au lieu de 300
```

---

### Solution 2 : Sauvegarder Immédiatement

**Fichier** : `public/menu.js`

Dans `saveCellData()`, forcer la sauvegarde immédiate :

```javascript
// Au lieu de passer par syncWithDev qui a un debounce
// Sauvegarder directement
await this.saveTableViaExistingSystem(table, "cell_edit");

// Puis attendre un peu pour être sûr
await new Promise(resolve => setTimeout(resolve, 500));
```

---

### Solution 3 : Utiliser le même mécanisme que les autres actions

**Problème actuel** : `saveCellData()` appelle `syncWithDev()` qui appelle `saveTableViaExistingSystem()` avec `action: "structure_change"`.

**Solution** : Vérifier que `notifyTableStructureChange()` est bien appelé AVANT `syncWithDev()`.

**Code actuel dans menu.js** :

```javascript
// Notifier le changement de structure (comme les autres actions)
this.notifyTableStructureChange("cell_edited", {
  cellContent: newContent,
  timestamp: Date.now(),
});

// SAUVEGARDER via syncWithDev (comme les autres actions)
this.syncWithDev();
```

**C'est correct !** ✅

---

### Solution 4 : Vérifier que menuIntegration écoute bien

**Fichier** : `src/services/menuIntegration.ts`

Vérifier que l'événement `claraverse:table:structure:changed` est bien écouté :

```typescript
document.addEventListener('claraverse:table:structure:changed', async (event: Event) => {
  const customEvent = event as CustomEvent;
  const { table, action, details } = customEvent.detail;

  console.log(`🔧 Structure modifiée: ${action}`, details);

  // Sauvegarder après modification de structure
  try {
    const sessionId = await this.getCurrentSessionId();
    const keyword = this.extractKeyword(table);
    await this.saveTableFromMenu(table, sessionId, keyword);
  } catch (error) {
    console.error('❌ Erreur sauvegarde structure:', error);
  }
});
```

**C'est correct !** ✅

---

## 🧪 Test de Diagnostic

### Test Complet

```javascript
// 1. Activer l'édition
// Ctrl+E

// 2. Modifier une cellule
// Cliquer sur une cellule, taper "TEST 123", cliquer ailleurs

// 3. Vérifier les logs (devrait apparaître dans les 300ms)
// "💾 Cellule modifiée - Table sauvegardée"
// "✅ Table sauvegardée via système existant (structure_change)"
// "💾 Demande de sauvegarde depuis menu"
// "💾 Sauvegarde table: session=..., keyword=..."

// 4. Attendre 1 seconde

// 5. Vérifier IndexedDB
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    const tables = getAll.result;
    console.log('Tables sauvegardées:', tables.length);
    
    // Chercher la table modifiée
    const modifiedTable = tables.find(t => t.html && t.html.includes('TEST 123'));
    if (modifiedTable) {
      console.log('✅ Table modifiée trouvée:', modifiedTable);
    } else {
      console.log('❌ Table modifiée NON trouvée');
    }
  };
};

// 6. Attendre encore 1 seconde

// 7. F5 (recharger)

// 8. Vérifier si "TEST 123" est toujours là
```

---

## 📊 Résultats Attendus

### Si tout fonctionne

1. ✅ Logs de sauvegarde apparaissent
2. ✅ Entrée dans IndexedDB avec la modification
3. ✅ Après F5, la modification est présente

### Si ça ne fonctionne pas

1. ❌ Pas de logs → Événement non déclenché
2. ❌ Pas d'entrée IndexedDB → Sauvegarde échoue
3. ❌ Modification disparaît après F5 → Restauration ne trouve pas la table

---

## 🚀 Action Immédiate

### Étape 1 : Tester avec le diagnostic complet

Copier-coller le test ci-dessus dans la console et noter les résultats.

### Étape 2 : Identifier le problème

- Logs présents ? → Problème de sauvegarde ou restauration
- Logs absents ? → Problème d'événement

### Étape 3 : Appliquer la solution

Selon le problème identifié, appliquer la solution correspondante.

---

**Diagnostic créé le 18 novembre 2025**

---

*À exécuter maintenant pour identifier le problème*
