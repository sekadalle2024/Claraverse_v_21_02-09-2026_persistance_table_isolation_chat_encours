# 🔧 Guide de Résolution - Race Condition Flowise vs Restauration

## 🎯 Problème Identifié

**Symptôme** : Parfois la restauration fonctionne, parfois la table initiale réapparaît.

**Cause** : Race condition entre :
- ⚡ La restauration qui remplace le contenu de la table
- 🔄 Flowise qui régénère la table initiale APRÈS la restauration

## 📊 Diagnostic

### Étape 1 : Activer les diagnostics

Les scripts de diagnostic sont maintenant chargés dans `index.html` :
- `diagnostic-timing-race.js` : Trace tous les événements
- `smart-restore-after-flowise.js` : Solution intelligente

### Étape 2 : Tester avec la page de diagnostic

Ouvrez : `http://localhost:3000/test-race-condition.html`

Cette page permet de :
- ✅ Simuler des scénarios de race condition
- 📊 Voir les statistiques en temps réel
- 📅 Visualiser la timeline des événements
- 🔍 Vérifier l'état actuel d'IndexedDB

### Étape 3 : Observer les logs dans la console

Après un rechargement de page, attendez 30 secondes et cherchez dans la console :

```
📊 ===== RAPPORT DE TIMING =====
Tentatives de restauration: X
Régénérations Flowise: Y

📅 Chronologie des événements:
[+0.00s] 📥 Début restauration #1
[+0.50s] ✅ Fin restauration #1
[+2.30s] 🔄 Flowise ajoute 1 table(s) - Régénération #1  ⚠️ PROBLÈME!
```

Si Flowise régénère APRÈS la restauration → Race condition confirmée

## 🛠️ Solutions Implémentées

### Solution 1 : Smart Restore (Recommandée)

Le script `smart-restore-after-flowise.js` :

1. **Observe l'activité de Flowise** via MutationObserver
2. **Attend la stabilité** (3 secondes sans activité)
3. **Restaure ensuite** les tables modifiées

**Avantages** :
- ✅ Évite les race conditions
- ✅ S'adapte automatiquement au timing de Flowise
- ✅ Nettoie les duplicatas

### Solution 2 : Délais multiples (Backup)

Le script `force-restore-on-load.js` tente la restauration à plusieurs moments :
- 2s, 3s, 4s, 8s, 15s après le chargement

**Avantages** :
- ✅ Augmente les chances de succès
- ⚠️ Peut créer des duplicatas temporaires

## 🧪 Tests à Effectuer

### Test 1 : Rechargement simple

1. Modifiez une table (supprimez des lignes)
2. Rechargez la page (F5)
3. Attendez 10 secondes
4. Vérifiez que la table modifiée est restaurée

**Console à vérifier** :
```javascript
// Après 20 secondes, exécutez :
const restored = document.querySelectorAll('[data-restored-content="true"]');
console.log(`Tables restaurées: ${restored.length}`);
restored.forEach(t => {
    const rows = t.querySelector('table')?.querySelectorAll('tbody tr').length;
    console.log(`  - ${rows} lignes`);
});
```

### Test 2 : Rechargements multiples

1. Rechargez 5 fois de suite (F5 x5)
2. Vérifiez que la restauration fonctionne à chaque fois
3. Notez le taux de succès

### Test 3 : Vérification IndexedDB

```javascript
// Dans la console :
const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('FlowiseTableDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const tables = await new Promise((resolve, reject) => {
    const transaction = db.transaction(['tables'], 'readonly');
    const store = transaction.objectStore('tables');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
});

console.log('Tables sauvegardées:', tables);
```

## 🔍 Debugging

### Si la restauration ne fonctionne jamais :

1. **Vérifier IndexedDB** :
   - Ouvrir DevTools → Application → IndexedDB → FlowiseTableDB
   - Vérifier que les tables sont bien sauvegardées

2. **Vérifier les scripts chargés** :
   ```javascript
   console.log('Smart Restore:', typeof window.forceSmartRestore);
   console.log('Restore Tables:', typeof window.restoreModifiedTables);
   ```

3. **Forcer manuellement** :
   ```javascript
   window.forceSmartRestore();
   ```

### Si la restauration fonctionne parfois :

1. **Analyser le timing** :
   - Regarder le rapport de timing dans la console (après 30s)
   - Identifier les race conditions

2. **Augmenter le délai de stabilité** :
   Dans `smart-restore-after-flowise.js`, ligne 7 :
   ```javascript
   const STABILITY_DELAY = 5000; // Passer de 3000 à 5000ms
   ```

3. **Désactiver les autres restaurations** :
   Commenter temporairement dans `index.html` :
   ```html
   <!-- <script src="/force-restore-on-load.js"></script> -->
   <!-- <script src="/restore-direct.js"></script> -->
   ```

## 📈 Métriques de Succès

**Objectif** : 100% de restauration réussie

**Mesure** :
- Effectuer 10 rechargements consécutifs
- Compter les succès
- Taux de succès = (Succès / 10) × 100%

**Acceptable** : ≥ 90%
**Bon** : ≥ 95%
**Excellent** : 100%

## 🚀 Prochaines Étapes

Si le problème persiste après ces solutions :

1. **Désactiver la régénération Flowise** (si possible)
2. **Implémenter un système de verrouillage** (mutex)
3. **Utiliser des événements personnalisés** pour coordonner Flowise et la restauration

## 📞 Support

Pour obtenir de l'aide :
1. Ouvrir `test-race-condition.html`
2. Cliquer sur "Démarrer le test"
3. Copier les logs et statistiques
4. Partager les résultats pour analyse
