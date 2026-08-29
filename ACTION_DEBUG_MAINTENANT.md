# ⚡ ACTION IMMÉDIATE - Debug Restaurations

## 🎯 Problème

Les tables s'actualisent toutes les 4 secondes environ.

## ✅ Ce Qui a Été Fait

1. ✅ Scripts de diagnostic désactivés
2. ✅ Vérification périodique (500ms) désactivée dans `auto-restore-chat-change.js`
3. ✅ Script de debug activé : `debug-restaurations-multiples.js`

---

## 🚀 TEST IMMÉDIAT (2 minutes)

### Étape 1 : Ouvrir l'Application

1. Ouvrir l'application dans le navigateur
2. Ouvrir la console (F12)

### Étape 2 : Lancer le Test

Dans la console, copier-coller cette commande :

```javascript
// Réinitialiser les compteurs
window.debugRestaurations.reset();

// Attendre 30 secondes et afficher le résumé
setTimeout(() => {
  console.log('='.repeat(50));
  console.log('📊 RÉSULTAT DU TEST (30 secondes)');
  console.log('='.repeat(50));
  window.debugRestaurations.showSummary();
  
  const count = window.debugRestaurations.getCount();
  if (count === 1) {
    console.log('✅ SUCCÈS : Une seule restauration !');
  } else if (count === 0) {
    console.log('⚠️ Aucune restauration détectée');
  } else {
    console.log(`❌ PROBLÈME : ${count} restaurations détectées`);
    console.log('📍 Analysez les logs ci-dessus pour identifier la source');
  }
}, 30000);

console.log('⏳ Test en cours... Attendez 30 secondes...');
```

### Étape 3 : Attendre 30 Secondes

Pendant l'attente, observer les logs dans la console :
- `🔄 RESTAURATION #X` - Chaque restauration est loggée
- `📊 MODIFICATION TABLE #X` - Chaque modification de table

### Étape 4 : Analyser le Résultat

**Si "✅ SUCCÈS : Une seule restauration !"** :
- Le problème est résolu !
- Désactiver le script de debug (voir ci-dessous)

**Si "❌ PROBLÈME : X restaurations détectées"** :
- Exécuter cette commande pour voir les détails :

```javascript
// Afficher les logs détaillés
const logs = window.debugRestaurations.getLog();
logs.forEach((log, i) => {
  console.log(`\n📋 Restauration #${i + 1}:`);
  console.log('   Timestamp:', log.timestamp);
  console.log('   Source:', log.detail?.source);
  console.log('   Stack:', log.stack);
});
```

---

## 🔍 Identifier la Source

Dans les stack traces, chercher :

### Exemple 1 : auto-restore-chat-change.js

```
Error
    at restoreCurrentSession (auto-restore-chat-change.js:45)
    at setTimeout (auto-restore-chat-change.js:78)
```

**Solution** : Augmenter le délai dans `auto-restore-chat-change.js`

### Exemple 2 : menuIntegration.ts

```
Error
    at MenuIntegrationService.saveTableFromMenu (menuIntegration.ts:123)
    at HTMLDocument.<anonymous> (menuIntegration.ts:89)
```

**Solution** : Augmenter le debounce dans `menuIntegration.ts`

### Exemple 3 : MutationObserver

```
Error
    at MutationObserver.<anonymous> (auto-restore-chat-change.js:95)
```

**Solution** : Ajouter un flag pour éviter les boucles

---

## 🔧 Solutions Rapides

### Solution 1 : Augmenter le Cooldown

Si les restaurations viennent du gestionnaire de verrouillage :

```javascript
// Dans la console
window.restoreLockManager.reset();

// Puis recharger la page
location.reload();
```

### Solution 2 : Désactiver auto-restore-chat-change

Si les restaurations viennent de ce script :

Dans `index.html`, commenter :
```html
<!-- <script type="module" src="/auto-restore-chat-change.js"></script> -->
```

### Solution 3 : Augmenter MIN_RESTORE_INTERVAL

Dans `public/auto-restore-chat-change.js`, modifier :
```javascript
const MIN_RESTORE_INTERVAL = 10000; // 10 secondes au lieu de 5
```

---

## 📊 Commandes Utiles

### Vérifier en Temps Réel

```javascript
// Afficher le nombre de restaurations toutes les 5 secondes
setInterval(() => {
  const count = window.debugRestaurations.getCount();
  console.log(`📊 Restaurations: ${count}`);
}, 5000);
```

### Réinitialiser et Retester

```javascript
window.debugRestaurations.reset();
console.log('🔄 Compteurs réinitialisés - Observez les prochaines restaurations');
```

### Afficher le Dernier Log

```javascript
const logs = window.debugRestaurations.getLog();
const last = logs[logs.length - 1];
console.log('📋 Dernière restauration:', last);
```

---

## ✅ Une Fois Résolu

### Désactiver le Script de Debug

Dans `index.html`, commenter :
```html
<!-- <script src="/debug-restaurations-multiples.js"></script> -->
```

### Vérifier le Résultat Final

```javascript
// Après avoir désactivé le debug et rechargé
window.restoreLockManager.getState()

// Résultat attendu :
// { hasRestored: true, canRestore: false }
```

---

## 📞 Si le Problème Persiste

### Vérifier les Autres Scripts

1. Chercher tous les `setInterval` dans le projet :
   ```bash
   grep -r "setInterval" public/
   ```

2. Chercher tous les `setTimeout` récursifs :
   ```bash
   grep -r "setTimeout.*function" public/
   ```

3. Vérifier les MutationObserver :
   ```bash
   grep -r "MutationObserver" public/
   ```

### Désactiver Tous les Scripts Non Essentiels

Dans `index.html`, ne garder que :
```html
<script src="/restore-lock-manager.js"></script>
<script src="/single-restore-on-load.js"></script>
<script src="/wrap-tables-auto.js"></script>
<script src="/Flowise.js"></script>
<script src="/menu-persistence-bridge.js"></script>
<script src="/menu.js"></script>
```

Puis tester si le problème persiste.

---

## 🎯 Résumé

1. **Tester** avec le script de debug (30 secondes)
2. **Analyser** les logs et stack traces
3. **Identifier** la source des restaurations
4. **Appliquer** la solution correspondante
5. **Retester** pour confirmer
6. **Désactiver** le debug une fois résolu

---

**COMMENCEZ MAINTENANT** : Ouvrez la console et lancez le test !

---

*Action immédiate créée le 17 novembre 2025*
