# 📖 LISEZ-MOI : Restauration Unique

## 🎯 Problème Résolu

Le système de restauration automatique s'exécutait **8 fois** au lancement du chat, ce qui empêchait les scripts de modification des cellules de fonctionner correctement.

## ✅ Solution Implémentée

Un **système de verrouillage global** garantit qu'**une seule restauration** s'exécute au chargement.

---

## 📁 Nouveaux Fichiers

### 1. `public/restore-lock-manager.js`
Gestionnaire de verrouillage qui empêche les restaurations multiples.

### 2. `public/single-restore-on-load.js`
Script de restauration unique au chargement de la page.

### 3. Documentation
- `SOLUTION_RESTAURATION_UNIQUE.md` - Documentation complète
- `TEST_RESTAURATION_UNIQUE.md` - Guide de test
- `LISEZ_MOI_RESTAURATION_UNIQUE.md` - Ce fichier

---

## 🔧 Fichiers Modifiés

- ✅ `index.html` - Ordre de chargement des scripts
- ✅ `src/services/autoRestore.ts` - Réduction à 1 tentative
- ✅ `public/force-restore-on-load.js` - Ajout vérification verrouillage
- ✅ `public/auto-restore-chat-change.js` - Ajout vérification verrouillage
- ✅ `src/services/flowiseTableBridge.ts` - Ajout vérification verrouillage

---

## 🚀 Utilisation

### Démarrage Normal

Aucune action requise ! Le système fonctionne automatiquement :

1. Ouvrir l'application
2. La restauration s'exécute **une seule fois** après 1 seconde
3. Les modifications de cellules fonctionnent correctement

### Vérification

Dans la console du navigateur :

```javascript
// Vérifier l'état
window.restoreLockManager.getState()

// Résultat attendu :
{
  isRestoring: false,
  hasRestored: true,
  canRestore: false  // Cooldown actif
}
```

### Forcer une Restauration (Debug)

```javascript
// Réinitialiser
window.restoreLockManager.reset()

// Forcer
window.singleRestoreOnLoad.performRestore()
```

---

## 📊 Résultats

### Avant
- **8 restaurations** au chargement (0-15 secondes)
- Modifications de cellules écrasées
- Performances dégradées

### Après
- **1 restauration** au chargement (1 seconde)
- Modifications de cellules préservées
- Performances améliorées de 87.5%

---

## 🧪 Tests

Suivre le guide : `TEST_RESTAURATION_UNIQUE.md`

**Tests essentiels** :
1. ✅ Une seule restauration au chargement
2. ✅ Modifications de cellules non écrasées
3. ✅ Changement de chat fonctionne
4. ✅ Rechargement (F5) fonctionne

---

## 🔧 Configuration

### Délais (Modifiables)

**`public/restore-lock-manager.js`** :
```javascript
const LOCK_TIMEOUT = 30000;      // 30s max pour une restauration
const COOLDOWN_PERIOD = 5000;    // 5s entre deux restaurations
```

**`public/single-restore-on-load.js`** :
```javascript
setTimeout(performRestore, 1000); // Délai avant restauration
```

---

## 🚨 Dépannage

### Aucune Restauration

```javascript
// Vérifier la session
sessionStorage.getItem('claraverse_stable_session')

// Si null, forcer une restauration
window.restoreLockManager.reset()
window.singleRestoreOnLoad.performRestore()
```

### Restaurations Multiples

```javascript
// Vérifier l'état
window.restoreLockManager.getState()

// Si hasRestored = false, vérifier l'ordre de chargement dans index.html
```

### Modifications Écrasées

```javascript
// Vérifier le cooldown
window.restoreLockManager.getState().canRestore

// Si true trop tôt, augmenter COOLDOWN_PERIOD
```

---

## 📚 Documentation Complète

- **`SOLUTION_RESTAURATION_UNIQUE.md`** - Architecture et implémentation
- **`TEST_RESTAURATION_UNIQUE.md`** - Guide de test détaillé
- **`DOCUMENTATION_COMPLETE_SOLUTION.md`** - Système de persistance complet

---

## ✅ Checklist de Validation

Après installation, vérifier :

- [ ] `restore-lock-manager.js` chargé en premier dans `index.html`
- [ ] `single-restore-on-load.js` chargé en second
- [ ] Console affiche "✅ RESTAURATION UNIQUE TERMINÉE"
- [ ] Une seule restauration au chargement
- [ ] Modifications de cellules préservées
- [ ] Changement de chat fonctionne
- [ ] Rechargement (F5) fonctionne

---

## 🎉 Résumé

**Objectif atteint** : Une seule restauration au chargement au lieu de 8 !

**Bénéfices** :
- ✅ Performances améliorées
- ✅ Scripts de modification compatibles
- ✅ Débogage facilité
- ✅ Système stable et prévisible

**API de test** :
```javascript
window.restoreLockManager.getState()
window.singleRestoreOnLoad.performRestore()
```

---

*Créé le 17 novembre 2025*
