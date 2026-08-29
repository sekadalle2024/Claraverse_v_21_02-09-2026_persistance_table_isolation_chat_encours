# 🧪 Guide de Test - Restauration Unique

## 🎯 Objectif

Vérifier que la restauration automatique ne s'exécute **qu'une seule fois** au chargement du chat.

---

## ✅ Test 1 : Vérification du Chargement

### Étapes

1. **Ouvrir l'application** dans le navigateur
2. **Ouvrir la console** (F12)
3. **Observer les logs** au chargement

### Résultats Attendus

Vous devriez voir dans la console :

```
🔒 RESTORE LOCK MANAGER - Initialisation
✅ Restore Lock Manager initialisé
💡 API: window.restoreLockManager

🔄 SINGLE RESTORE ON LOAD - Initialisation
✅ Single Restore On Load initialisé
💡 Test: window.singleRestoreOnLoad.performRestore()

🔄 Exécution restauration pour session: stable_session_xxx
🔒 Verrou acquis pour session: stable_session_xxx
✅ Bridge trouvé, restauration...
🔧 Session forcée dans le bridge
✅ Tables restaurées avec succès
🔓 Verrou libéré - Restauration réussie
✅ RESTAURATION UNIQUE TERMINÉE
```

### Logs à NE PAS Voir (Bloqués)

```
🔒 AUTO-RESTORE: Bloqué par le gestionnaire de verrouillage
🔒 Restauration bloquée par le gestionnaire de verrouillage
🔒 Bridge: Restauration bloquée par le gestionnaire de verrouillage
```

**Si vous voyez ces logs** : ✅ Parfait ! Cela signifie que les autres tentatives de restauration ont été bloquées.

---

## ✅ Test 2 : Vérification de l'État

### Commande

Dans la console, exécuter :

```javascript
window.restoreLockManager.getState()
```

### Résultat Attendu

```javascript
{
  isRestoring: false,        // Pas de restauration en cours
  hasRestored: true,         // Restauration effectuée
  restorePromise: null,      // Pas de promesse en attente
  timestamp: 1763237811596,  // Timestamp de la dernière restauration
  sessionId: "stable_session_xxx", // Session restaurée
  canRestore: false          // Cooldown actif (5 secondes)
}
```

**Après 5 secondes**, `canRestore` devrait passer à `true`.

---

## ✅ Test 3 : Comptage des Restaurations

### Méthode 1 : Logs Console

1. **Ouvrir la console**
2. **Filtrer** les logs avec le mot "restauration"
3. **Compter** le nombre de fois où vous voyez :
   - `✅ RESTAURATION UNIQUE TERMINÉE`
   - `✅ Tables restaurées avec succès`

**Résultat attendu** : **1 seule fois** au chargement

### Méthode 2 : Compteur Personnalisé

Dans la console, exécuter :

```javascript
// Compteur de restaurations
let restoreCount = 0;

document.addEventListener('claraverse:restore:complete', (event) => {
  restoreCount++;
  console.log(`📊 Nombre de restaurations: ${restoreCount}`);
  console.log('Détails:', event.detail);
});

// Recharger la page (F5) et observer
```

**Résultat attendu** : `restoreCount` devrait être égal à **1** après le chargement.

---

## ✅ Test 4 : Modification de Cellule

### Objectif

Vérifier que les modifications de cellules ne sont **pas écrasées** par des restaurations multiples.

### Étapes

1. **Attendre** que la page soit complètement chargée (2-3 secondes)
2. **Modifier une cellule** d'une table (double-clic ou menu contextuel)
3. **Changer la valeur** de la cellule
4. **Attendre 10 secondes** (pour voir si des restaurations tardives écrasent la modification)
5. **Vérifier** que la modification est toujours présente

### Résultat Attendu

✅ La modification de la cellule **reste visible** après 10 secondes

❌ Si la modification disparaît : Il y a encore des restaurations multiples

---

## ✅ Test 5 : Changement de Chat

### Objectif

Vérifier que la restauration se déclenche **une seule fois** lors du changement de chat.

### Étapes

1. **Modifier une table** dans le chat actuel
2. **Changer de chat** (cliquer sur un autre chat)
3. **Observer les logs** dans la console
4. **Attendre 5 secondes** (délai de stabilisation)
5. **Revenir au chat précédent**
6. **Vérifier** que les modifications sont toujours présentes

### Résultats Attendus

**Au changement de chat** :
```
📊 Nombre de tables changé: X → Y
⏰ Restauration planifiée dans 5 secondes
⏰ Timeout écoulé - Lancement
🎯 === RESTAURATION VIA ÉVÉNEMENT ===
📍 Session: stable_session_xxx
✅ Événement de restauration déclenché
```

**Après 5 secondes** :
- ✅ Les tables du nouveau chat sont restaurées
- ✅ Une seule restauration s'est déclenchée

**Au retour au chat précédent** :
- ✅ Les modifications sont toujours présentes

---

## ✅ Test 6 : Rechargement de Page (F5)

### Objectif

Vérifier que les tables sont restaurées après un rechargement de page.

### Étapes

1. **Modifier une table** dans le chat actuel
2. **Recharger la page** (F5)
3. **Observer les logs** dans la console
4. **Vérifier** que les modifications sont restaurées

### Résultats Attendus

**Après rechargement** :
```
🔒 RESTORE LOCK MANAGER - Initialisation
🔄 SINGLE RESTORE ON LOAD - Initialisation
🔄 Exécution restauration pour session: stable_session_xxx
✅ RESTAURATION UNIQUE TERMINÉE
```

- ✅ Une seule restauration s'est déclenchée
- ✅ Les modifications sont restaurées

---

## ✅ Test 7 : Forcer une Restauration Manuelle

### Objectif

Vérifier que le système empêche les restaurations multiples même en cas de déclenchement manuel.

### Étapes

1. **Attendre** que la page soit chargée
2. **Dans la console**, exécuter :
   ```javascript
   window.singleRestoreOnLoad.performRestore()
   ```
3. **Observer** le résultat

### Résultat Attendu

```
🔒 Restauration bloquée par le gestionnaire de verrouillage
```

ou

```
⏭️ Restauration déjà effectuée ou en cours
```

**Si vous voulez forcer une nouvelle restauration** :
```javascript
window.restoreLockManager.reset()
window.singleRestoreOnLoad.performRestore()
```

---

## 🔧 Commandes de Débogage

### Vérifier l'État du Gestionnaire

```javascript
window.restoreLockManager.getState()
```

### Réinitialiser le Gestionnaire

```javascript
window.restoreLockManager.reset()
```

### Forcer une Restauration

```javascript
window.restoreLockManager.reset()
window.singleRestoreOnLoad.performRestore()
```

### Vérifier la Session Stable

```javascript
sessionStorage.getItem('claraverse_stable_session')
```

### Vérifier les Tables Sauvegardées

```javascript
const req = indexedDB.open('clara_db', 12);
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    console.log('Tables sauvegardées:', getAll.result);
  };
};
```

### Compter les Tables Restaurées

```javascript
document.querySelectorAll('[data-restored-content="true"]').length
```

---

## 📊 Checklist de Validation

Cocher chaque test réussi :

- [ ] **Test 1** : Logs de chargement corrects
- [ ] **Test 2** : État du gestionnaire correct
- [ ] **Test 3** : Une seule restauration comptée
- [ ] **Test 4** : Modifications de cellules non écrasées
- [ ] **Test 5** : Changement de chat fonctionne
- [ ] **Test 6** : Rechargement (F5) fonctionne
- [ ] **Test 7** : Restaurations manuelles bloquées

**Si tous les tests sont validés** : ✅ Le système fonctionne correctement !

---

## 🚨 Problèmes Courants

### Problème 1 : Plusieurs Restaurations au Chargement

**Symptôme** : Vous voyez plusieurs fois `✅ RESTAURATION UNIQUE TERMINÉE`

**Cause** : Le gestionnaire de verrouillage n'est pas chargé en premier

**Solution** :
1. Vérifier l'ordre dans `index.html`
2. `restore-lock-manager.js` doit être le premier script chargé

### Problème 2 : Aucune Restauration

**Symptôme** : Aucun log de restauration dans la console

**Cause** : Pas de session stable ou erreur de chargement

**Solution** :
1. Vérifier : `sessionStorage.getItem('claraverse_stable_session')`
2. Si null, créer une session : Modifier une table pour déclencher la création
3. Recharger la page

### Problème 3 : Modifications Écrasées

**Symptôme** : Les modifications de cellules disparaissent après quelques secondes

**Cause** : Des restaurations tardives s'exécutent encore

**Solution** :
1. Vérifier les logs pour identifier la source
2. S'assurer que tous les scripts vérifient `restoreLockManager.canRestore()`
3. Augmenter le cooldown si nécessaire

---

## 📝 Rapport de Test

Après avoir effectué tous les tests, remplir ce rapport :

```
Date du test : _______________
Navigateur : _______________
Version : _______________

Test 1 - Chargement : ☐ Réussi ☐ Échoué
Test 2 - État : ☐ Réussi ☐ Échoué
Test 3 - Comptage : ☐ Réussi ☐ Échoué
Test 4 - Modifications : ☐ Réussi ☐ Échoué
Test 5 - Changement chat : ☐ Réussi ☐ Échoué
Test 6 - Rechargement : ☐ Réussi ☐ Échoué
Test 7 - Manuel : ☐ Réussi ☐ Échoué

Nombre de restaurations au chargement : _______________
Temps de restauration : _______________ ms

Commentaires :
_________________________________________________
_________________________________________________
_________________________________________________
```

---

*Guide de test créé le 17 novembre 2025*
