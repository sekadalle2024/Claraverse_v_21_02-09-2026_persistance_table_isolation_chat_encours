# 🎯 Solution : Restauration Unique au Chargement

## 📋 Problème Identifié

Le système de restauration automatique s'exécutait **plusieurs fois** au lancement du chat :

1. **`autoRestore.ts`** : 5 tentatives (2s, 3s, 4s, 8s, 15s)
2. **`force-restore-on-load.js`** : 1 tentative au chargement
3. **`flowiseTableBridge.ts`** : 1 tentative à l'initialisation
4. **`auto-restore-chat-change.js`** : Vérification toutes les 500ms

**Conséquence** : Les restaurations multiples empêchaient les scripts de modification des cellules de fonctionner correctement car les données étaient écrasées plusieurs fois.

---

## ✅ Solution Implémentée

### 1. Gestionnaire de Verrouillage Global

**Fichier** : `public/restore-lock-manager.js`

**Rôle** : Garantit qu'une seule restauration s'exécute à la fois

**Fonctionnalités** :
- ✅ Verrouillage global pour empêcher les restaurations simultanées
- ✅ Période de cooldown de 5 secondes entre deux restaurations
- ✅ Timeout de sécurité de 30 secondes
- ✅ Événements de succès/erreur
- ✅ API pour vérifier l'état et réinitialiser

**API Exposée** :
```javascript
window.restoreLockManager = {
  canRestore(),        // Vérifie si une restauration peut être lancée
  acquireLock(sessionId), // Acquiert le verrou
  releaseLock(success),   // Libère le verrou
  reset(),             // Réinitialise l'état
  executeRestore(sessionId, restoreFunction), // Exécute avec verrouillage
  getState()           // Obtient l'état actuel
}
```

### 2. Script de Restauration Unique

**Fichier** : `public/single-restore-on-load.js`

**Rôle** : Effectue une seule restauration au chargement de la page

**Fonctionnement** :
1. Attend que le gestionnaire de verrouillage soit disponible
2. Vérifie si une restauration peut être lancée
3. Récupère la session stable depuis `sessionStorage`
4. Exécute la restauration via `restoreLockManager.executeRestore()`
5. Émet un événement `claraverse:restore:complete` en cas de succès

**Timing** : 1 seconde après le chargement du DOM

### 3. Modifications des Scripts Existants

#### A. `autoRestore.ts`

**Avant** : 5 tentatives de restauration (2s, 3s, 4s, 8s, 15s)

**Après** : 1 seule tentative à 1.5s + vérification du verrouillage

```typescript
// Vérifier le gestionnaire de verrouillage
if ((window as any).restoreLockManager && !(window as any).restoreLockManager.canRestore()) {
  console.log('🔒 AUTO-RESTORE: Bloqué par le gestionnaire de verrouillage');
  return;
}
```

#### B. `force-restore-on-load.js`

**Modification** : Ajout de la vérification du verrouillage

```javascript
// Vérifier le gestionnaire de verrouillage
if (window.restoreLockManager && !window.restoreLockManager.canRestore()) {
  console.log('🔒 Restauration bloquée par le gestionnaire de verrouillage');
  return false;
}
```

#### C. `auto-restore-chat-change.js`

**Modification** : Ajout de la vérification du verrouillage

```javascript
// Vérifier le gestionnaire de verrouillage
if (window.restoreLockManager && !window.restoreLockManager.canRestore()) {
  console.log('🔒 Restauration bloquée par le gestionnaire de verrouillage');
  return;
}
```

#### D. `flowiseTableBridge.ts`

**Modification** : Ajout de la vérification du verrouillage dans `initializeRestoration()`

```typescript
// Vérifier le gestionnaire de verrouillage
if ((window as any).restoreLockManager && !(window as any).restoreLockManager.canRestore()) {
  console.log('🔒 Bridge: Restauration bloquée par le gestionnaire de verrouillage');
  return;
}
```

### 4. Ordre de Chargement dans `index.html`

```html
<!-- 1. Gestionnaire de verrouillage - EN PREMIER -->
<script src="/restore-lock-manager.js"></script>

<!-- 2. Restauration unique au chargement -->
<script src="/single-restore-on-load.js"></script>

<!-- 3. Scripts principaux -->
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>

<!-- 4. Restauration au changement de chat -->
<script type="module" src="/auto-restore-chat-change.js"></script>
```

---

## 🔄 Flux de Restauration

### Au Chargement de la Page

```
1. Page se charge
   ↓
2. restore-lock-manager.js s'initialise
   ↓
3. single-restore-on-load.js attend 1 seconde
   ↓
4. Vérification : restoreLockManager.canRestore() → true
   ↓
5. Acquisition du verrou
   ↓
6. Restauration des tables via flowiseTableBridge
   ↓
7. Libération du verrou + événement claraverse:restore:complete
   ↓
8. Autres scripts vérifient le verrouillage → bloqués (cooldown 5s)
```

### Au Changement de Chat

```
1. Utilisateur change de chat
   ↓
2. auto-restore-chat-change.js détecte le changement
   ↓
3. Attend 5 secondes (stabilisation)
   ↓
4. Vérification : restoreLockManager.canRestore() → true (après cooldown)
   ↓
5. Déclenche événement flowise:table:restore:request
   ↓
6. menuIntegration.ts restaure les tables
```

---

## 🎯 Avantages de la Solution

### 1. Une Seule Restauration au Chargement
- ✅ Évite les restaurations multiples
- ✅ Réduit la charge sur IndexedDB
- ✅ Améliore les performances

### 2. Protection contre les Conflits
- ✅ Verrouillage global empêche les restaurations simultanées
- ✅ Cooldown de 5 secondes entre restaurations
- ✅ Timeout de sécurité pour éviter les blocages

### 3. Compatibilité avec les Scripts de Modification
- ✅ Les scripts de modification des cellules peuvent s'exécuter sans être écrasés
- ✅ Les modifications sont sauvegardées correctement
- ✅ Pas de conflit entre restauration et édition

### 4. Débogage Facilité
- ✅ API globale pour vérifier l'état : `window.restoreLockManager.getState()`
- ✅ Logs clairs dans la console
- ✅ Événements pour suivre le processus

---

## 🧪 Tests et Vérification

### Test 1 : Vérifier le Verrouillage

```javascript
// Dans la console du navigateur
window.restoreLockManager.getState()

// Résultat attendu :
{
  isRestoring: false,
  hasRestored: true,
  restorePromise: null,
  timestamp: 1763237811596,
  sessionId: "stable_session_xxx",
  canRestore: false  // false si cooldown actif
}
```

### Test 2 : Forcer une Restauration

```javascript
// Réinitialiser l'état
window.restoreLockManager.reset()

// Forcer une restauration
window.singleRestoreOnLoad.performRestore()
```

### Test 3 : Vérifier les Logs

Ouvrir la console et chercher :
- `🔒 RESTORE LOCK MANAGER - Initialisation`
- `🔄 SINGLE RESTORE ON LOAD - Initialisation`
- `🔒 Verrou acquis pour session: xxx`
- `✅ RESTAURATION UNIQUE TERMINÉE`
- `🔒 Restauration bloquée par le gestionnaire de verrouillage` (pour les tentatives suivantes)

### Test 4 : Changement de Chat

1. Modifier une table dans le chat actuel
2. Changer de chat
3. Vérifier que la restauration se déclenche après 5 secondes
4. Revenir au chat précédent
5. Vérifier que les modifications sont toujours présentes

---

## 📊 Comparaison Avant/Après

### Avant

| Moment | Nombre de Restaurations |
|--------|------------------------|
| Chargement (0-2s) | 2 restaurations |
| Chargement (2-5s) | 3 restaurations |
| Chargement (5-10s) | 2 restaurations |
| Chargement (10-15s) | 1 restauration |
| **TOTAL** | **8 restaurations** |

### Après

| Moment | Nombre de Restaurations |
|--------|------------------------|
| Chargement (1s) | 1 restauration |
| Changement de chat | 1 restauration (si cooldown écoulé) |
| **TOTAL** | **1 restauration au chargement** |

**Réduction** : 87.5% de restaurations en moins ! 🎉

---

## 🔧 Configuration

### Délais Configurables

Dans `public/restore-lock-manager.js` :
```javascript
const LOCK_TIMEOUT = 30000;      // 30 secondes max pour une restauration
const COOLDOWN_PERIOD = 5000;    // 5 secondes entre deux restaurations
```

Dans `public/single-restore-on-load.js` :
```javascript
setTimeout(performRestore, 1000); // Délai avant restauration (1 seconde)
```

Dans `public/auto-restore-chat-change.js` :
```javascript
const MIN_RESTORE_INTERVAL = 5000; // Intervalle minimum entre restaurations
```

---

## 🚨 Dépannage

### Problème : Aucune Restauration ne se Déclenche

**Vérifications** :
1. Vérifier que `restore-lock-manager.js` est chargé :
   ```javascript
   window.restoreLockManager
   ```

2. Vérifier l'état :
   ```javascript
   window.restoreLockManager.getState()
   ```

3. Réinitialiser si nécessaire :
   ```javascript
   window.restoreLockManager.reset()
   window.singleRestoreOnLoad.performRestore()
   ```

### Problème : Restauration Bloquée

**Solution** : Réinitialiser le gestionnaire
```javascript
window.restoreLockManager.reset()
```

### Problème : Tables Non Restaurées

**Vérifications** :
1. Vérifier la session stable :
   ```javascript
   sessionStorage.getItem('claraverse_stable_session')
   ```

2. Vérifier IndexedDB :
   - Outils de développement > Application > IndexedDB > clara_db > clara_generated_tables

3. Forcer manuellement :
   ```javascript
   window.singleRestoreOnLoad.performRestore()
   ```

---

## 📝 Fichiers Modifiés

### Nouveaux Fichiers
- ✅ `public/restore-lock-manager.js` - Gestionnaire de verrouillage
- ✅ `public/single-restore-on-load.js` - Restauration unique
- ✅ `SOLUTION_RESTAURATION_UNIQUE.md` - Cette documentation

### Fichiers Modifiés
- ✅ `index.html` - Ordre de chargement des scripts
- ✅ `src/services/autoRestore.ts` - Réduction à 1 tentative + verrouillage
- ✅ `public/force-restore-on-load.js` - Ajout vérification verrouillage
- ✅ `public/auto-restore-chat-change.js` - Ajout vérification verrouillage
- ✅ `src/services/flowiseTableBridge.ts` - Ajout vérification verrouillage

### Fichiers Non Modifiés (Compatibles)
- ✅ `public/Flowise.js`
- ✅ `public/menu.js`
- ✅ `public/menu-persistence-bridge.js`
- ✅ `src/services/flowiseTableService.ts`
- ✅ `src/services/menuIntegration.ts`

---

## ✅ Résumé

La solution implémente un **système de verrouillage global** qui garantit qu'**une seule restauration** s'exécute au chargement de la page.

**Bénéfices** :
- ✅ Une seule restauration au lieu de 8
- ✅ Pas de conflit avec les scripts de modification
- ✅ Performances améliorées
- ✅ Débogage facilité
- ✅ Compatible avec tous les scripts existants

**Fichiers clés** :
- `public/restore-lock-manager.js` - Gestionnaire de verrouillage
- `public/single-restore-on-load.js` - Restauration unique

**API de test** :
```javascript
window.restoreLockManager.getState()
window.singleRestoreOnLoad.performRestore()
```

---

*Solution créée le 17 novembre 2025*
