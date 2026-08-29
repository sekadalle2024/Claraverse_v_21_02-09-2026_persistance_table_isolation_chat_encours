# ⚡ TEST: Fix Race Condition

## 🎯 Test en 2 Minutes

### Étape 1: Recharger et Observer

1. **Ctrl+R** (recharger la page)
2. **F12** (ouvrir la console)
3. **Observer les logs**:

```
⏳ Attente du chargement complet...
⏳ Attente de Flowise (2s)...
⏳ Attente du gestionnaire de verrouillage...
🔒 Verrou acquis, restauration...
```

4. **Attendre 2-3 secondes**

### Étape 2: Vérifier le Résultat

#### ✅ Cas A: Table Préservée (Flowise a créé la table)

**Console affiche**:
```
⏭️ Table table_xxx existe déjà
✅ Table table_xxx a déjà des données, skip restauration
ℹ️ Aucune table à restaurer
```

**Résultat**: La table est visible avec ses données ✅

#### ✅ Cas B: Table Restaurée (Pas de table Flowise)

**Console affiche**:
```
📂 Ouverture IndexedDB...
📊 1 table(s) trouvée(s) dans IndexedDB
✅ Table table_xxx restaurée
✅ 1 TABLE(S) RESTAURÉE(S)
```

**Résultat**: La table est restaurée depuis IndexedDB ✅

## 🧪 Test Complet

### Test 1: Vérifier que les Données ne sont PAS Écrasées

1. **Recharger la page** (Ctrl+R)
2. **Attendre 3 secondes**
3. **Vérifier dans la console**:
   ```javascript
   // Compter les tables avec données
   const tablesWithData = Array.from(document.querySelectorAll('table[data-table-id]')).filter(table => {
       const cells = table.querySelectorAll('td');
       return Array.from(cells).some(c => c.textContent.trim() !== '');
   });
   console.log(`Tables avec données: ${tablesWithData.length}`);
   ```
4. ✅ **Si > 0**: Les données sont préservées!

### Test 2: Vérifier la Restauration depuis IndexedDB

1. **Supprimer toutes les tables**:
   ```javascript
   document.querySelectorAll('table[data-table-id]').forEach(t => {
       const wrapper = t.closest('.table-wrapper, div');
       if (wrapper) wrapper.remove();
   });
   ```
2. **Forcer la restauration**:
   ```javascript
   window.restoreLockManager.reset();
   window.simpleRestore.restore();
   ```
3. **Attendre 2 secondes**
4. ✅ **Vérifier**: Les tables réapparaissent

### Test 3: Vérifier le Délai de 2 Secondes

1. **Recharger la page** (Ctrl+R)
2. **Chronométrer** le temps avant "🔒 Verrou acquis"
3. ✅ **Devrait être ~2 secondes** après le chargement

## 📊 Logs Attendus

### Séquence Normale (Table Préservée)

```
[00:00] 🚀 RESTAURATION SIMPLE - Démarrage
[00:00] ⏳ Attente du chargement complet...
[00:01] ⏳ Attente de Flowise (2s)...
[00:03] ⏳ Attente du gestionnaire de verrouillage...
[00:03] 🔒 Verrou acquis, restauration...
[00:03] 📂 Ouverture IndexedDB...
[00:03] ✅ IndexedDB ouvert
[00:03] 📊 1 table(s) trouvée(s) dans IndexedDB
[00:03] ⏭️ Table table_xxx existe déjà
[00:03] ✅ Table table_xxx a déjà des données, skip restauration
[00:03] ℹ️ Aucune table à restaurer
```

### Séquence Restauration (Pas de Table Flowise)

```
[00:00] 🚀 RESTAURATION SIMPLE - Démarrage
[00:00] ⏳ Attente du chargement complet...
[00:01] ⏳ Attente de Flowise (2s)...
[00:03] ⏳ Attente du gestionnaire de verrouillage...
[00:03] 🔒 Verrou acquis, restauration...
[00:03] 📂 Ouverture IndexedDB...
[00:03] ✅ IndexedDB ouvert
[00:03] 📊 1 table(s) trouvée(s) dans IndexedDB
[00:03] ✅ Table table_xxx restaurée
[00:03] ✅ 1 TABLE(S) RESTAURÉE(S)
```

## ✅ Critères de Succès

| Test | Résultat Attendu |
|------|------------------|
| Recharger avec table Flowise | Table préservée, pas écrasée |
| Recharger sans table Flowise | Table restaurée depuis IndexedDB |
| Délai avant restauration | ~2 secondes |
| Logs dans console | Séquence complète visible |

## 🆘 Si Ça Ne Fonctionne Pas

### Problème: Table Toujours Écrasée

**Solution**: Augmenter le délai
```javascript
// Dans restore-tables-on-load-simple.js, ligne ~198
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secondes
```

### Problème: Pas de Log "Attente de Flowise"

**Solution**: Le script n'est pas chargé
```javascript
// Vérifier
window.simpleRestore // Doit exister
```

### Problème: Table Vide Restaurée

**Solution**: La table sauvegardée est vide
```javascript
// Forcer la sauvegarde d'une table avec données
const table = document.querySelector('table[data-table-id]');
if (table) {
    window.directTableSaver.saveTable(table, 'manual', null);
}
```

## 💡 Commandes Utiles

```javascript
// État du système
window.simpleRestore              // Restauration
window.directTableSaver           // Sauvegarde
window.restoreLockManager         // Verrouillage

// Vérifier les tables
document.querySelectorAll('table[data-table-id]').forEach(table => {
    const cells = table.querySelectorAll('td');
    const hasData = Array.from(cells).some(c => c.textContent.trim() !== '');
    console.log(`${table.dataset.tableId}: ${hasData ? 'AVEC DONNÉES' : 'VIDE'}`);
});

// Forcer restauration
window.restoreLockManager.reset();
window.simpleRestore.restore();

// Forcer sauvegarde
window.directTableSaver.scanAndSave();
```

## 🎉 Succès!

Si vous voyez "✅ Table xxx a déjà des données, skip restauration", le fix fonctionne!

Les tables créées par Flowise ne seront plus jamais écrasées.
