# 🔍 Debug - Restauration Automatique Ne Fonctionne Plus

## 🎯 Problème

La restauration automatique ne fonctionne plus après les modifications.

---

## 🔧 Diagnostic Rapide

### Étape 1 : Vérifier les Scripts Chargés

**Dans la console (F12)** :

```javascript
// Vérifier que les scripts sont chargés
console.log('Lock Manager:', typeof window.restoreLockManager);
console.log('Single Restore:', typeof window.singleRestoreOnLoad);
console.log('Menu Manager:', typeof window.contextualMenuManager);
console.log('Flowise Service:', typeof window.flowiseTableService);
console.log('Flowise Bridge:', typeof window.flowiseTableBridge);
```

**Résultat attendu** : Tous doivent être `"object"` ou `"function"`, pas `"undefined"`

---

### Étape 2 : Vérifier les Événements

**Dans la console** :

```javascript
// Écouter les événements de restauration
document.addEventListener('claraverse:restore:complete', (e) => {
  console.log('✅ RESTAURATION TERMINÉE:', e.detail);
});

document.addEventListener('flowise:table:restored', (e) => {
  console.log('✅ TABLE RESTAURÉE:', e.detail);
});

// Puis recharger la page (F5)
```

**Résultat attendu** : Voir les logs après rechargement

---

### Étape 3 : Vérifier IndexedDB

**Dans la console** :

```javascript
// Vérifier qu'il y a des tables sauvegardées
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('📊 Tables sauvegardées:', getAll.result.length);
    console.log('Détails:', getAll.result);
  };
};
```

**Résultat attendu** : Au moins 1 table sauvegardée

---

### Étape 4 : Forcer une Restauration

**Dans la console** :

```javascript
// Forcer une restauration manuelle
if (window.singleRestoreOnLoad) {
  window.singleRestoreOnLoad.performRestore();
} else if (window.flowiseTableBridge) {
  const sessionId = sessionStorage.getItem('claraverse_stable_session');
  window.flowiseTableBridge.restoreTablesForSession(sessionId);
}
```

**Résultat attendu** : Tables restaurées

---

## 🐛 Causes Possibles

### Cause 1 : generateTableId() Cassé

Le formatage automatique a peut-être cassé la fonction.

**Test** :

```javascript
const table = document.querySelector('table');
if (table && window.contextualMenuManager) {
  const id = window.contextualMenuManager.generateTableId(table);
  console.log('ID généré:', id);
  console.log('Type:', typeof id);
  console.log('Valide:', id && id.length > 0);
}
```

**Si erreur ou ID invalide** : La fonction est cassée.

---

### Cause 2 : Événements Non Déclenchés

Les événements de restauration ne sont plus déclenchés.

**Test** : Voir Étape 2 ci-dessus

---

### Cause 3 : Lock Manager Bloque

Le système de verrouillage empêche la restauration.

**Test** :

```javascript
if (window.restoreLockManager) {
  const state = window.restoreLockManager.getState();
  console.log('État du lock:', state);
  
  // Si bloqué, réinitialiser
  if (!state.canRestore) {
    window.restoreLockManager.reset();
    console.log('Lock réinitialisé');
  }
}
```

---

### Cause 4 : SessionId Manquant

Le sessionId n'est pas créé ou récupéré.

**Test** :

```javascript
const sessionId = sessionStorage.getItem('claraverse_stable_session');
console.log('SessionId:', sessionId);

if (!sessionId) {
  console.error('❌ SessionId manquant !');
  
  // Créer un sessionId
  const newSessionId = `stable_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('claraverse_stable_session', newSessionId);
  console.log('✅ SessionId créé:', newSessionId);
}
```

---

## 🔧 Solutions

### Solution 1 : Réinitialiser le Lock Manager

```javascript
if (window.restoreLockManager) {
  window.restoreLockManager.reset();
  console.log('✅ Lock Manager réinitialisé');
}
```

---

### Solution 2 : Forcer la Restauration

```javascript
// Attendre que tout soit chargé
setTimeout(() => {
  const sessionId = sessionStorage.getItem('claraverse_stable_session');
  if (sessionId && window.flowiseTableBridge) {
    window.flowiseTableBridge.restoreTablesForSession(sessionId);
    console.log('✅ Restauration forcée');
  }
}, 2000);
```

---

### Solution 3 : Vérifier menu.js

Le formatage automatique a peut-être cassé quelque chose.

**Action** : Relire le fichier menu.js et vérifier :
- Pas d'erreur de syntaxe
- Toutes les fonctions sont complètes
- Pas de code manquant

```javascript
// Vérifier que menu.js est bien chargé
console.log('Menu Manager:', window.contextualMenuManager);
console.log('Méthodes:', Object.keys(window.contextualMenuManager || {}));
```

---

### Solution 4 : Effacer le Cache

1. F12 > Application > Clear storage
2. Cliquer sur "Clear site data"
3. Recharger la page
4. Réessayer

---

## 🧪 Test Complet

```javascript
// Script de diagnostic complet
(async function() {
  console.log('=== DIAGNOSTIC RESTAURATION AUTO ===');
  
  // 1. Scripts chargés
  console.log('1. Scripts:');
  console.log('  - Lock Manager:', typeof window.restoreLockManager);
  console.log('  - Single Restore:', typeof window.singleRestoreOnLoad);
  console.log('  - Menu Manager:', typeof window.contextualMenuManager);
  console.log('  - Flowise Service:', typeof window.flowiseTableService);
  console.log('  - Flowise Bridge:', typeof window.flowiseTableBridge);
  
  // 2. SessionId
  console.log('2. SessionId:');
  const sessionId = sessionStorage.getItem('claraverse_stable_session');
  console.log('  -', sessionId || 'MANQUANT ❌');
  
  // 3. Lock Manager
  console.log('3. Lock Manager:');
  if (window.restoreLockManager) {
    const state = window.restoreLockManager.getState();
    console.log('  - État:', state);
  } else {
    console.log('  - NON CHARGÉ ❌');
  }
  
  // 4. IndexedDB
  console.log('4. IndexedDB:');
  const req = indexedDB.open('clara_db', 12);
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction(['clara_generated_tables'], 'readonly');
    const store = tx.objectStore('clara_generated_tables');
    const getAll = store.getAll();
    getAll.onsuccess = () => {
      console.log('  - Tables:', getAll.result.length);
      if (getAll.result.length > 0) {
        console.log('  - Dernière table:', getAll.result[getAll.result.length - 1]);
      }
    };
  };
  
  // 5. Test generateTableId
  console.log('5. generateTableId:');
  const table = document.querySelector('table');
  if (table && window.contextualMenuManager) {
    try {
      const id = window.contextualMenuManager.generateTableId(table);
      console.log('  - ID:', id);
      console.log('  - Valide:', id && id.length > 0 ? '✅' : '❌');
    } catch (error) {
      console.log('  - ERREUR ❌:', error.message);
    }
  } else {
    console.log('  - Table ou Menu Manager manquant ❌');
  }
  
  console.log('=== FIN DIAGNOSTIC ===');
})();
```

**Copier-coller ce script dans la console et noter les résultats.**

---

## 📊 Interprétation des Résultats

### Si tous les scripts sont "undefined"

❌ **Problème** : Les scripts ne sont pas chargés

**Solution** : Vérifier index.html et recharger la page

---

### Si sessionId est manquant

❌ **Problème** : Pas de sessionId

**Solution** : Exécuter Solution 4 (créer un sessionId)

---

### Si Lock Manager bloque (canRestore = false)

❌ **Problème** : Lock Manager empêche la restauration

**Solution** : Exécuter Solution 1 (réinitialiser)

---

### Si IndexedDB est vide

❌ **Problème** : Aucune table sauvegardée

**Solution** : Sauvegarder d'abord une table, puis tester la restauration

---

### Si generateTableId échoue

❌ **Problème** : Fonction cassée par le formatage

**Solution** : Vérifier le code de la fonction dans menu.js

---

## 🚀 Action Immédiate

1. **Copier-coller** le script de diagnostic complet dans la console
2. **Noter** les résultats
3. **Identifier** le problème
4. **Appliquer** la solution correspondante

---

**Diagnostic créé le 18 novembre 2025**

---

*À exécuter maintenant pour identifier le problème*
