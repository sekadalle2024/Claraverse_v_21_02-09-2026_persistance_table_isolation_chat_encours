# 🔄 Guide Rapide - Synchronisation ClaraVerse

## 🚀 Installation en 2 minutes

### 1. Vérifier les fichiers
✅ `dev.js` - Version avec système de synchronisation  
✅ `conso.js` - Version avec notifications  
✅ `test_sync.js` - Tests (optionnel)  
✅ `test_sync.html` - Interface de test (optionnel)  

### 2. Intégration HTML
```html
<!-- IMPORTANT : Respecter cet ordre -->
<script type="module" src="/dev.js"></script>
<script type="module" src="/conso.js"></script>
```

### 3. Test rapide
Ouvrir `test_sync.html` dans le navigateur et cliquer sur "🚀 Lancer Tous les Tests"

---

## 🎯 Utilisation

### Workflow automatique
1. **Modifiez** une cellule dans une table de pointage
2. **Consolidez** avec conso.js (les boutons habituels)
3. **Actualisez** la page
4. **Vérifiez** : les données sont persistées ✅

### Vérification rapide
```javascript
// Dans la console du navigateur
cp.status()                    // État de dev.js
claraverseSyncAPI.saveAllTables() // Force la sauvegarde
```

---

## 🔍 Validation

### ✅ Tout fonctionne si :
- Console affiche : `✅ Système initialisé avec synchronisation`
- Les tables ont l'indicateur `💾`
- Les modifications de consolidation persistent après F5

### ❌ Problème si :
- Message d'erreur "API de synchronisation non disponible"
- Les consolidations disparaissent au rechargement
- Pas d'indicateur `💾` sur les tables

---

## 🩺 Dépannage Express

### Problème : API non disponible
```javascript
// Vérifier dans la console
console.log(!!window.cp)                // Dev.js OK ?
console.log(!!window.claraverseSyncAPI)  // Sync OK ?
console.log(!!window.claraverseProcessor) // Conso.js OK ?
```

### Problème : Données perdues
```javascript
// Forcer la sauvegarde
claraverseSyncAPI.saveAllTables()
// Vérifier le localStorage
cp.status()
```

### Problème : Tables non détectées
```javascript
// Re-scanner
cp.scan()
// Diagnostic complet
testSync.diagnose()
```

---

## 🎓 Points Clés

### Tables concernées
- **Pointage** : colonnes Assertion, Ecart, CTR1, CTR2, CTR3, Conclusion
- **Consolidation** : class `claraverse-conso-table`
- **Résultat** : entête contenant "Resultat"

### Événements synchronisés
- Modification de cellule → sauvegarde auto
- Consolidation terminée → sauvegarde forcée
- Nouvelle table créée → détection auto

### Commandes utiles
```javascript
cp.help()              // Aide dev.js
testSync.info()        // Aide tests
cp.clear()             // Vider cache
cp.export()            // Exporter données
```

---

## ⚡ Raccourcis

### Test complet en 30 secondes
1. Ouvrir `test_sync.html`
2. Cliquer "🚀 Lancer Tous les Tests"
3. Vérifier que tous sont ✅

### Test manuel en 1 minute
1. Modifier une cellule de table
2. Déclencher consolidation
3. F5 (actualiser)
4. Vérifier persistance

### Diagnostic en 10 secondes
```javascript
testSync.diagnose()
```

---

**🎯 Si tout est ✅, la synchronisation fonctionne parfaitement !**
**❌ Si problème, voir README_SYNCHRONISATION.md pour plus de détails**