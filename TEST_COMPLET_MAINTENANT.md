# 🧪 Test Complet - Édition et Restauration

## 🎯 Objectif

Tester l'édition de cellules ET la restauration automatique pour identifier précisément ce qui ne fonctionne pas.

---

## ✅ Test 1 : Vérifier que menu.js est Chargé

**Dans la console (F12)** :

```javascript
console.log('Menu Manager:', window.contextualMenuManager);
console.log('Méthodes:', Object.keys(window.contextualMenuManager || {}));
```

**Résultat attendu** : Objet avec toutes les méthodes

**Si undefined** : menu.js n'est pas chargé ❌

---

## ✅ Test 2 : Activer l'Édition

**Action** : Appuyer sur **Ctrl+E** (ou clic droit > "✏️ Activer édition")

**Résultat attendu** :
- ✅ Indicateur "✏️ ÉDITION ACTIVE" apparaît
- ✅ Message "✏️ Édition activée (X cellules)"

**Si ça ne fonctionne pas** : Problème d'activation ❌

---

## ✅ Test 3 : Modifier une Cellule

**Action** :
1. Cliquer sur une cellule
2. Taper "TEST PERSISTANCE"
3. Cliquer ailleurs

**Résultat attendu** :
- ✅ Cellule devient bleue au focus
- ✅ Cellule devient verte au blur
- ✅ Log : `💾 Cellule modifiée - Table sauvegardée`

**Si pas de log** : Problème de sauvegarde ❌

---

## ✅ Test 4 : Vérifier l'ID Stable

**Dans la console** :

```javascript
const table = document.querySelector('table');
const id1 = window.contextualMenuManager.generateTableId(table);
console.log('ID avant:', id1);

// Modifier une cellule manuellement

const id2 = window.contextualMenuManager.generateTableId(table);
console.log('ID après:', id2);
console.log('Identiques ?', id1 === id2);
```

**Résultat attendu** : `Identiques ? true`

**Si false** : Problème d'ID ❌

---

## ✅ Test 5 : Vérifier IndexedDB

**Dans la console** :

```javascript
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('📊 Tables sauvegardées:', getAll.result.length);
    const recent = getAll.result.filter(t => Date.now() - t.timestamp < 60000);
    console.log('📊 Tables récentes (< 1 min):', recent.length);
    if (recent.length > 0) {
      console.log('Dernière table:', recent[recent.length - 1]);
    }
  };
};
```

**Résultat attendu** : Au moins 1 table récente avec votre modification

**Si 0 tables récentes** : Problème de sauvegarde ❌

---

## ✅ Test 6 : Attendre et Recharger

**Action** :
1. Attendre **2 secondes** (important !)
2. Appuyer sur **F5**

**Résultat attendu** :
- ✅ "TEST PERSISTANCE" est toujours là

**Si disparu** : Problème de restauration ❌

---

## 📊 Diagnostic selon les Résultats

### Scénario A : Tout fonctionne jusqu'au Test 5

**Symptômes** :
- ✅ Tests 1-5 passent
- ❌ Test 6 échoue (modification disparaît après F5)

**Problème** : Restauration automatique ne fonctionne pas

**Solution** : Vérifier les scripts de restauration

```javascript
// Vérifier les scripts de restauration
console.log('Lock Manager:', typeof window.restoreLockManager);
console.log('Single Restore:', typeof window.singleRestoreOnLoad);
console.log('Flowise Bridge:', typeof window.flowiseTableBridge);
```

**Si undefined** : Scripts de restauration non chargés

---

### Scénario B : Test 4 échoue (IDs différents)

**Symptômes** :
- ✅ Tests 1-3 passent
- ❌ Test 4 échoue (IDs différents)

**Problème** : generateTableId() ne génère pas d'ID stable

**Solution** : Vérifier la fonction generateTableId

```javascript
// Forcer un ID stable
const table = document.querySelector('table');
table.dataset.stableTableId = 'table_0_test_stable';
console.log('ID forcé:', window.contextualMenuManager.generateTableId(table));
```

---

### Scénario C : Test 3 échoue (pas de log)

**Symptômes** :
- ✅ Tests 1-2 passent
- ❌ Test 3 échoue (pas de log de sauvegarde)

**Problème** : saveCellData() ne s'exécute pas

**Solution** : Vérifier les événements

```javascript
// Forcer une sauvegarde manuelle
const table = document.querySelector('table');
const cell = table.querySelector('td');
cell.textContent = 'TEST MANUEL';
window.contextualMenuManager.targetTable = table;
window.contextualMenuManager.saveCellData(cell);
```

---

### Scénario D : Test 2 échoue (pas d'activation)

**Symptômes** :
- ✅ Test 1 passe
- ❌ Test 2 échoue (pas d'indicateur)

**Problème** : enableCellEditing() ne fonctionne pas

**Solution** : Forcer l'activation

```javascript
const table = document.querySelector('table');
window.contextualMenuManager.targetTable = table;
window.contextualMenuManager.enableCellEditing();
```

---

## 🔧 Solutions Rapides

### Solution 1 : Forcer la Restauration

```javascript
// Forcer une restauration manuelle
const sessionId = sessionStorage.getItem('claraverse_stable_session');
if (sessionId && window.flowiseTableBridge) {
  window.flowiseTableBridge.restoreTablesForSession(sessionId);
  console.log('✅ Restauration forcée');
}
```

---

### Solution 2 : Réinitialiser le Lock Manager

```javascript
if (window.restoreLockManager) {
  window.restoreLockManager.reset();
  console.log('✅ Lock Manager réinitialisé');
}
```

---

### Solution 3 : Créer un SessionId

```javascript
let sessionId = sessionStorage.getItem('claraverse_stable_session');
if (!sessionId) {
  sessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('claraverse_stable_session', sessionId);
  console.log('✅ SessionId créé:', sessionId);
}
```

---

## 📝 Rapport de Test

**Copier ce template et remplir les résultats** :

```
=== RAPPORT DE TEST ===

Test 1 (menu.js chargé) : ✅ / ❌
Test 2 (activation édition) : ✅ / ❌
Test 3 (modification cellule) : ✅ / ❌
Test 4 (ID stable) : ✅ / ❌
Test 5 (IndexedDB) : ✅ / ❌
Test 6 (restauration F5) : ✅ / ❌

Scénario identifié : A / B / C / D

Logs importants :
[Copier les logs de la console ici]

=== FIN RAPPORT ===
```

---

## 🚀 Action Immédiate

1. **Ouvrir** la console (F12)
2. **Exécuter** les tests 1 à 6 dans l'ordre
3. **Noter** les résultats
4. **Identifier** le scénario
5. **Appliquer** la solution correspondante

---

**Testez maintenant et partagez les résultats !**

---

*Guide de test créé le 18 novembre 2025*
