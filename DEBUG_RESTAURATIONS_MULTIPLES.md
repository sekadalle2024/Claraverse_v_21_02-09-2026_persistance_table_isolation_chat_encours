# 🔍 Debug - Restaurations Multiples

## 🎯 Objectif

Identifier la source des restaurations qui s'exécutent toutes les 4 secondes.

---

## ✅ Modifications Effectuées

### 1. Scripts de Diagnostic Désactivés

Les scripts suivants ont été désactivés dans `index.html` :
- ❌ `diagnostic-chat-change.js` - Vérifiait les changements toutes les 100ms
- ❌ `diagnostic-restauration-detaille.js` - Pouvait déclencher des restaurations
- ❌ `test-restore-force.js` - Script de test

### 2. Vérification Périodique Désactivée

Dans `auto-restore-chat-change.js` :
- ❌ `setInterval(checkForChanges, 500)` - Désactivé
- ✅ Utilise uniquement le `MutationObserver`

### 3. Script de Debug Activé

Un nouveau script `debug-restaurations-multiples.js` a été ajouté pour :
- Compter les restaurations
- Logger les sources
- Afficher les stack traces
- Monitorer les modifications de tables

---

## 🧪 Test Immédiat

### Étape 1 : Ouvrir l'Application

1. Ouvrir l'application dans le navigateur
2. Ouvrir la console (F12)
3. Observer les logs

### Étape 2 : Vérifier les Restaurations

Dans la console, exécuter :

```javascript
// Attendre 30 secondes, puis vérifier
setTimeout(() => {
  window.debugRestaurations.showSummary();
}, 30000);
```

**Résultat attendu** :
```
📊 RÉSUMÉ DES RESTAURATIONS
   Total: 1
   Modifications tables: 0
```

**Si Total > 1** : Il y a encore des restaurations multiples

### Étape 3 : Identifier la Source

Si des restaurations multiples sont détectées :

```javascript
// Afficher les logs détaillés
window.debugRestaurations.getLog()

// Chaque log contient :
// - count: numéro de la restauration
// - timestamp: horodatage
// - detail: détails de l'événement
// - stack: stack trace pour identifier la source
```

### Étape 4 : Analyser les Stack Traces

Chercher dans les stack traces :
- Nom du fichier source
- Ligne de code
- Fonction appelante

**Exemple de stack trace** :
```
Error
    at HTMLDocument.<anonymous> (auto-restore-chat-change.js:45)
    at HTMLDocument.dispatch (jquery.js:5430)
```

Cela indique que la restauration vient de `auto-restore-chat-change.js` ligne 45.

---

## 🔧 Commandes de Debug

### Vérifier le Nombre de Restaurations

```javascript
window.debugRestaurations.getCount()
// Retourne le nombre total de restaurations
```

### Afficher le Résumé

```javascript
window.debugRestaurations.showSummary()
// Affiche un résumé complet
```

### Réinitialiser les Compteurs

```javascript
window.debugRestaurations.reset()
// Remet les compteurs à zéro
```

### Obtenir les Logs Détaillés

```javascript
window.debugRestaurations.getLog()
// Retourne un tableau avec tous les logs
```

---

## 🚨 Sources Potentielles

### 1. auto-restore-chat-change.js

**Vérification** :
- Le `setInterval` a été désactivé
- Seul le `MutationObserver` est actif
- Ne devrait se déclencher que lors de changements réels

**Si c'est la source** :
- Vérifier que le `MutationObserver` ne se déclenche pas en boucle
- Augmenter le délai de restauration (actuellement 5 secondes)

### 2. auto-save-tables.js

**Problème potentiel** :
- Ré-observe les tables toutes les 5 secondes
- Peut déclencher des sauvegardes qui déclenchent des restaurations

**Solution** :
```javascript
// Désactiver dans index.html si présent
// OU augmenter l'intervalle dans le script
```

### 3. menuIntegration.ts

**Vérification** :
- Écoute les événements de modification
- Peut déclencher des sauvegardes automatiques

**Si c'est la source** :
- Vérifier le debounce (actuellement 300ms)
- Augmenter le délai si nécessaire

### 4. flowiseTableBridge.ts

**Vérification** :
- Restauration automatique à l'initialisation
- Devrait être bloquée par le gestionnaire de verrouillage

**Si c'est la source** :
- Vérifier que `initializeRestoration()` ne s'exécute qu'une fois
- Vérifier la vérification du verrouillage

---

## 📊 Analyse des Logs

### Log Normal (1 Restauration)

```
🔄 RESTAURATION #1 {
  timestamp: "2025-11-17T10:00:01.000Z",
  sessionId: "stable_session_xxx",
  source: "restore-lock-manager"
}
```

### Log Anormal (Restaurations Multiples)

```
🔄 RESTAURATION #1 { timestamp: "2025-11-17T10:00:01.000Z" }
🔄 RESTAURATION #2 { timestamp: "2025-11-17T10:00:05.000Z" }
🔄 RESTAURATION #3 { timestamp: "2025-11-17T10:00:09.000Z" }
🔄 RESTAURATION #4 { timestamp: "2025-11-17T10:00:13.000Z" }
```

**Intervalle** : 4 secondes entre chaque restauration

**Cela suggère** :
- Un `setInterval` ou `setTimeout` récursif
- Un observer qui se déclenche en boucle
- Un événement qui se propage en boucle

---

## 🔧 Solutions par Source

### Si la source est auto-restore-chat-change.js

```javascript
// Dans auto-restore-chat-change.js
// Augmenter le MIN_RESTORE_INTERVAL
const MIN_RESTORE_INTERVAL = 10000; // 10 secondes au lieu de 5
```

### Si la source est le MutationObserver

```javascript
// Ajouter un flag pour éviter les boucles
let isRestoring = false;

const observer = new MutationObserver((mutations) => {
    if (isRestoring) return; // Ignorer pendant la restauration
    
    // ... reste du code
});

async function restoreCurrentSession() {
    isRestoring = true;
    try {
        // ... restauration
    } finally {
        setTimeout(() => {
            isRestoring = false;
        }, 1000);
    }
}
```

### Si la source est auto-save-tables.js

```javascript
// Désactiver complètement dans index.html
// OU augmenter l'intervalle
setInterval(observeAllTables, 30000); // 30 secondes au lieu de 5
```

---

## ✅ Checklist de Vérification

- [ ] Ouvrir l'application
- [ ] Ouvrir la console
- [ ] Attendre 30 secondes
- [ ] Exécuter `window.debugRestaurations.showSummary()`
- [ ] Vérifier que Total = 1
- [ ] Si Total > 1, analyser les logs
- [ ] Identifier la source dans les stack traces
- [ ] Appliquer la solution correspondante
- [ ] Retester

---

## 📝 Rapport de Debug

Après le test, remplir ce rapport :

```
Date : _______________
Navigateur : _______________

Nombre de restaurations en 30 secondes : _______________
Intervalle entre restaurations : _______________ secondes

Source identifiée : _______________
Fichier : _______________
Ligne : _______________

Stack trace :
_________________________________________________
_________________________________________________

Solution appliquée :
_________________________________________________
_________________________________________________

Résultat après solution :
☐ Résolu (1 seule restauration)
☐ Partiellement résolu (moins de restaurations)
☐ Non résolu (même nombre de restaurations)
```

---

## 🚀 Prochaines Étapes

1. **Tester** avec le script de debug
2. **Identifier** la source des restaurations multiples
3. **Appliquer** la solution correspondante
4. **Retester** pour confirmer
5. **Désactiver** le script de debug une fois résolu

---

*Guide de debug créé le 17 novembre 2025*
