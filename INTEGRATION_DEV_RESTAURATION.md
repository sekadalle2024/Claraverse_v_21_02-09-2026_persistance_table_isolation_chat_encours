# 🔗 Intégration dev.js avec Restauration Unique

## 🎯 Objectif

Garantir que le script `dev.js` (modification des cellules) fonctionne correctement avec le nouveau système de restauration unique.

---

## ✅ Avantages pour dev.js

### Avant (Restaurations Multiples)

```
0s  : Chargement page
1s  : dev.js modifie une cellule
2s  : Restauration 1 → Modification écrasée ❌
3s  : dev.js modifie à nouveau
4s  : Restauration 2 → Modification écrasée ❌
8s  : Restauration 3 → Modification écrasée ❌
15s : Restauration 4 → Modification écrasée ❌
```

**Résultat** : Les modifications de `dev.js` sont écrasées 4 fois !

### Après (Restauration Unique)

```
0s  : Chargement page
1s  : Restauration unique ✅
2s  : dev.js modifie une cellule ✅
3s+ : Aucune restauration → Modification préservée ✅
```

**Résultat** : Les modifications de `dev.js` sont préservées !

---

## 🔧 Intégration de dev.js

### Option 1 : Attendre la Restauration (Recommandé)

Modifier `dev.js` pour attendre que la restauration soit terminée :

```javascript
// Au début de dev.js
(async function() {
  console.log('🔧 DEV.JS - Attente de la restauration...');

  // Attendre que la restauration soit terminée
  if (window.restoreLockManager) {
    const state = window.restoreLockManager.getState();
    
    if (state.isRestoring) {
      // Attendre l'événement de fin de restauration
      await new Promise(resolve => {
        document.addEventListener('claraverse:restore:complete', resolve, { once: true });
      });
      console.log('✅ DEV.JS - Restauration terminée, démarrage...');
    } else if (!state.hasRestored) {
      // Attendre un peu pour laisser la restauration se lancer
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ DEV.JS - Délai écoulé, démarrage...');
    } else {
      console.log('✅ DEV.JS - Restauration déjà effectuée, démarrage...');
    }
  } else {
    // Fallback si le gestionnaire n'est pas disponible
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ DEV.JS - Démarrage (fallback)...');
  }

  // Votre code dev.js ici
  console.log('🔧 DEV.JS - Modification des cellules...');
  
  // ... votre code ...
  
})();
```

### Option 2 : Vérifier Avant Chaque Modification

Si `dev.js` modifie les cellules de manière continue :

```javascript
// Fonction de modification avec vérification
async function modifierCellule(cellule, nouvelleValeur) {
  // Vérifier qu'aucune restauration n'est en cours
  if (window.restoreLockManager) {
    const state = window.restoreLockManager.getState();
    
    if (state.isRestoring) {
      console.log('⏳ DEV.JS - Restauration en cours, attente...');
      await new Promise(resolve => {
        document.addEventListener('claraverse:restore:complete', resolve, { once: true });
      });
    }
  }

  // Modifier la cellule
  cellule.textContent = nouvelleValeur;
  console.log('✅ DEV.JS - Cellule modifiée:', nouvelleValeur);
  
  // Déclencher la sauvegarde
  const table = cellule.closest('table');
  if (table) {
    const event = new CustomEvent('claraverse:table:structure:changed', {
      detail: {
        table,
        action: 'cell-modified',
        details: { cellule, nouvelleValeur }
      }
    });
    document.dispatchEvent(event);
  }
}
```

### Option 3 : Ordre de Chargement

Charger `dev.js` **après** la restauration dans `index.html` :

```html
<!-- 1. Gestionnaire de verrouillage -->
<script src="/restore-lock-manager.js"></script>

<!-- 2. Restauration unique -->
<script src="/single-restore-on-load.js"></script>

<!-- 3. Scripts principaux -->
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>

<!-- 4. DEV.JS - Après la restauration -->
<script src="/dev.js"></script>
```

---

## 🔄 Flux d'Exécution Recommandé

```
1. Page se charge
   ↓
2. restore-lock-manager.js s'initialise
   ↓
3. single-restore-on-load.js attend 1 seconde
   ↓
4. Restauration des tables (500ms)
   ↓
5. Événement claraverse:restore:complete émis
   ↓
6. dev.js démarre et modifie les cellules
   ↓
7. Modifications sauvegardées automatiquement
   ↓
8. Aucune restauration ultérieure → Modifications préservées ✅
```

---

## 🧪 Test d'Intégration

### Test 1 : Modification Après Restauration

```javascript
// Dans dev.js
document.addEventListener('claraverse:restore:complete', () => {
  console.log('🔧 DEV.JS - Restauration terminée, modification...');
  
  // Attendre un peu pour s'assurer que le DOM est stable
  setTimeout(() => {
    const cellule = document.querySelector('table td');
    if (cellule) {
      cellule.textContent = 'Modifié par dev.js';
      console.log('✅ DEV.JS - Cellule modifiée');
    }
  }, 500);
});
```

### Test 2 : Vérification de Préservation

```javascript
// Modifier une cellule
const cellule = document.querySelector('table td');
const valeurOriginale = cellule.textContent;
cellule.textContent = 'TEST DEV.JS';

// Attendre 10 secondes
setTimeout(() => {
  if (cellule.textContent === 'TEST DEV.JS') {
    console.log('✅ Modification préservée !');
  } else {
    console.error('❌ Modification écrasée !');
  }
}, 10000);
```

---

## 📊 Événements Disponibles

### Écouter la Restauration

```javascript
// Début de restauration
document.addEventListener('claraverse:restore:start', (event) => {
  console.log('🔄 Restauration démarrée:', event.detail);
});

// Fin de restauration
document.addEventListener('claraverse:restore:complete', (event) => {
  console.log('✅ Restauration terminée:', event.detail);
  // Démarrer dev.js ici
});

// Erreur de restauration
document.addEventListener('claraverse:restore:error', (event) => {
  console.error('❌ Erreur restauration:', event.detail);
});
```

### Déclencher une Sauvegarde

```javascript
// Après modification d'une cellule
const table = cellule.closest('table');
const event = new CustomEvent('claraverse:table:structure:changed', {
  detail: {
    table,
    action: 'cell-modified',
    details: { cellule, nouvelleValeur }
  }
});
document.dispatchEvent(event);
```

---

## 🔧 API Utile pour dev.js

### Vérifier l'État de Restauration

```javascript
// Vérifier si une restauration est en cours
function isRestoring() {
  if (!window.restoreLockManager) return false;
  return window.restoreLockManager.getState().isRestoring;
}

// Vérifier si la restauration est terminée
function hasRestored() {
  if (!window.restoreLockManager) return false;
  return window.restoreLockManager.getState().hasRestored;
}

// Attendre la fin de la restauration
async function waitForRestore() {
  if (!window.restoreLockManager) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return;
  }

  const state = window.restoreLockManager.getState();
  
  if (state.hasRestored) {
    return; // Déjà restauré
  }

  if (state.isRestoring) {
    // Attendre l'événement
    await new Promise(resolve => {
      document.addEventListener('claraverse:restore:complete', resolve, { once: true });
    });
  } else {
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

### Utilisation dans dev.js

```javascript
(async function() {
  console.log('🔧 DEV.JS - Initialisation...');

  // Attendre la restauration
  await waitForRestore();
  console.log('✅ DEV.JS - Restauration terminée');

  // Votre code de modification
  modifierCellules();
  
})();
```

---

## 🚨 Problèmes Courants

### Problème 1 : Modifications Écrasées

**Symptôme** : Les modifications de `dev.js` disparaissent

**Cause** : `dev.js` s'exécute avant la restauration

**Solution** :
```javascript
// Attendre la restauration
await waitForRestore();
```

### Problème 2 : dev.js Ne Démarre Pas

**Symptôme** : Aucune modification visible

**Cause** : `dev.js` attend indéfiniment

**Solution** :
```javascript
// Ajouter un timeout
const timeout = new Promise(resolve => setTimeout(resolve, 5000));
const restore = waitForRestore();
await Promise.race([restore, timeout]);
console.log('✅ DEV.JS - Démarrage (timeout ou restauration)');
```

### Problème 3 : Sauvegarde Non Déclenchée

**Symptôme** : Modifications non sauvegardées

**Cause** : Événement de sauvegarde non émis

**Solution** :
```javascript
// Après chaque modification
const event = new CustomEvent('claraverse:table:structure:changed', {
  detail: { table, action: 'cell-modified' }
});
document.dispatchEvent(event);
```

---

## 📝 Exemple Complet dev.js

```javascript
/**
 * dev.js - Script de modification des cellules
 * Intégré avec le système de restauration unique
 */

(async function() {
  'use strict';

  console.log('🔧 DEV.JS - Initialisation...');

  // ========================================
  // 1. ATTENDRE LA RESTAURATION
  // ========================================

  async function waitForRestore() {
    if (!window.restoreLockManager) {
      console.log('⚠️ DEV.JS - Gestionnaire non disponible, attente 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }

    const state = window.restoreLockManager.getState();
    
    if (state.hasRestored) {
      console.log('✅ DEV.JS - Restauration déjà effectuée');
      return;
    }

    if (state.isRestoring) {
      console.log('⏳ DEV.JS - Restauration en cours, attente...');
      await new Promise(resolve => {
        document.addEventListener('claraverse:restore:complete', resolve, { once: true });
      });
      console.log('✅ DEV.JS - Restauration terminée');
    } else {
      console.log('⏳ DEV.JS - Attente restauration (2s)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Attendre la restauration
  await waitForRestore();

  // ========================================
  // 2. MODIFIER LES CELLULES
  // ========================================

  function modifierCellules() {
    console.log('🔧 DEV.JS - Modification des cellules...');

    const cellules = document.querySelectorAll('table td');
    
    cellules.forEach((cellule, index) => {
      // Exemple : Ajouter un préfixe
      const valeurOriginale = cellule.textContent;
      cellule.textContent = `[DEV] ${valeurOriginale}`;
      
      console.log(`✅ Cellule ${index} modifiée`);
    });

    // Déclencher la sauvegarde
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const event = new CustomEvent('claraverse:table:structure:changed', {
        detail: {
          table,
          action: 'cells-modified',
          details: { source: 'dev.js' }
        }
      });
      document.dispatchEvent(event);
    });

    console.log('✅ DEV.JS - Modifications terminées et sauvegardées');
  }

  // Exécuter les modifications
  modifierCellules();

  // ========================================
  // 3. OBSERVER LES NOUVELLES TABLES
  // ========================================

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.tagName === 'TABLE') {
          console.log('🔧 DEV.JS - Nouvelle table détectée');
          setTimeout(() => modifierCellules(), 500);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ DEV.JS - Initialisé et actif');

})();
```

---

## ✅ Checklist d'Intégration

- [ ] `dev.js` attend la restauration avant de modifier
- [ ] Modifications déclenchent la sauvegarde
- [ ] Ordre de chargement correct dans `index.html`
- [ ] Test : Modifications préservées après 10 secondes
- [ ] Test : Rechargement (F5) restaure les modifications
- [ ] Test : Changement de chat fonctionne

---

## 📚 Ressources

- **`SOLUTION_RESTAURATION_UNIQUE.md`** - Architecture complète
- **`TEST_RESTAURATION_UNIQUE.md`** - Guide de test
- **`DOCUMENTATION_COMPLETE_SOLUTION.md`** - Système de persistance

---

*Guide d'intégration créé le 17 novembre 2025*
