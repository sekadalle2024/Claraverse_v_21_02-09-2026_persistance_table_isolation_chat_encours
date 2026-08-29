# 🔍 UTILISER LE DIAGNOSTIC COMPLET

## 🎯 Objectif

Identifier EXACTEMENT pourquoi :
1. La restauration auto ne s'active plus
2. Les modifications de cellules ne sont pas persistantes

## 📋 Instructions

### 1. Rechargez la page
```
Ctrl + F5 (ou Cmd + Shift + R sur Mac)
```

### 2. Ouvrez la console
```
F12 (ou Cmd + Option + I sur Mac)
```

### 3. Lisez le diagnostic automatique

Vous devriez voir un rapport complet avec 10 sections :

```
🔍 ========================================
🔍 DIAGNOSTIC COMPLET - DÉMARRAGE
🔍 ========================================

📦 1. SCRIPTS CHARGÉS:
💾 2. LOCALSTORAGE:
🗄️ 3. INDEXEDDB:
📊 4. TABLES DANS LE DOM:
✏️ 5. TEST ÉDITION:
🔑 6. SESSION:
💾 7. TEST SAUVEGARDE:
🔄 8. TEST RESTAURATION:
👂 9. ÉCOUTE DES ÉVÉNEMENTS:
📋 10. RÉSUMÉ:
```

### 4. Copiez TOUT le rapport

Sélectionnez tout le texte dans la console et copiez-le.

### 5. Test manuel (optionnel)

Dans la console, tapez :
```javascript
window.testDevSystem()
```

Cette fonction va :
1. Trouver une table
2. Modifier une cellule
3. Sauvegarder
4. Restaurer
5. Vérifier si la modification persiste

## 🔍 Que Chercher

### Problème 1 : Scripts non chargés

Si vous voyez :
```
- claraverseSyncAPI: undefined
```

**Cause** : `dev.js` ne se charge pas correctement

**Solution** : Vérifier le chemin du fichier

### Problème 2 : localStorage vide

Si vous voyez :
```
⚠️ Aucune donnée dev dans localStorage
```

**Cause** : Les sauvegardes ne fonctionnent pas

**Solution** : Vérifier que `dev.js` sauvegarde correctement

### Problème 3 : Pas de tables

Si vous voyez :
```
- Total tables: 0
```

**Cause** : Aucune table dans le DOM

**Solution** : Générer une table via Flowise d'abord

### Problème 4 : Pas de listeners

Si vous voyez :
```
- Double-click listener: Non
```

**Cause** : `dev.js` n'a pas attaché les événements

**Solution** : Vérifier l'initialisation de `dev.js`

### Problème 5 : Pas de session

Si vous voyez :
```
- Session ID: N/A
```

**Cause** : Pas de session définie

**Solution** : `dev.js` devrait créer une session automatiquement

## 📊 Résumé Attendu

Si tout fonctionne, vous devriez voir :

```
📋 10. RÉSUMÉ:
┌─────────────────┬────────┐
│ scriptsChargés  │ true   │
│ localStorageOk  │ true   │
│ tablesPresentes │ true   │
│ sessionDefinie  │ true   │
│ apiDisponible   │ true   │
└─────────────────┴────────┘

✅ Tout semble OK - Le problème est ailleurs
```

Si vous voyez des `false`, c'est là qu'est le problème !

## 🚨 Actions Selon les Résultats

### Cas 1 : scriptsChargés = false

**Problème** : `dev.js` ne se charge pas

**Actions** :
1. Vérifier que `dev.js` existe à la racine
2. Vérifier le chemin dans `index.html`
3. Vérifier les erreurs dans la console

### Cas 2 : localStorageOk = false

**Problème** : Aucune sauvegarde

**Actions** :
1. Tester manuellement : `window.testDevSystem()`
2. Vérifier que `dev.js` sauvegarde
3. Vérifier les permissions localStorage

### Cas 3 : tablesPresentes = false

**Problème** : Pas de tables dans le DOM

**Actions** :
1. Générer une table via Flowise
2. Attendre que la table apparaisse
3. Relancer le diagnostic

### Cas 4 : sessionDefinie = false

**Problème** : Pas de session

**Actions** :
1. `dev.js` devrait créer une session automatiquement
2. Vérifier l'initialisation de `dev.js`

### Cas 5 : apiDisponible = false

**Problème** : API non exposée

**Actions** :
1. Vérifier que `dev.js` expose `window.claraverseSyncAPI`
2. Vérifier les erreurs JavaScript

## 💡 Test Complet

Pour un test complet de bout en bout :

```javascript
// 1. Vérifier l'API
console.log('API:', window.claraverseSyncAPI);

// 2. Trouver une table
const table = document.querySelector('table');
console.log('Table:', table);

// 3. Trouver une cellule
const cell = table?.querySelector('td');
console.log('Cellule:', cell);

// 4. Modifier
if (cell) {
  cell.textContent = 'TEST_' + Date.now();
  console.log('Modifié:', cell.textContent);
}

// 5. Sauvegarder
if (table && window.claraverseSyncAPI) {
  window.claraverseSyncAPI.saveTable(table);
  console.log('Sauvegardé');
}

// 6. Vérifier localStorage
const keys = Object.keys(localStorage).filter(k => k.startsWith('claraverse_dev_'));
console.log('Clés localStorage:', keys);

// 7. Recharger la page (F5)
// 8. Vérifier si la modification est restaurée
```

## 📝 Rapport à Partager

Après avoir exécuté le diagnostic, partagez :

1. **Le résumé** (section 10)
2. **Les scripts chargés** (section 1)
3. **Le localStorage** (section 2)
4. **Les tables** (section 4)
5. **Le résultat du test manuel** (`window.testDevSystem()`)

Avec ces informations, je pourrai identifier le problème exact.

---

**Rechargez maintenant et partagez le rapport complet !**
