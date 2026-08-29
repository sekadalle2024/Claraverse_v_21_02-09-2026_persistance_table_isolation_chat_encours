# ✅ FIX: Race Condition - Données Écrasées

## 🎯 Problème Identifié

La table **existe au démarrage** mais les données sont **effacées** pendant la restauration.

## 🔍 Cause: Race Condition

```
1. Page chargée
2. Flowise crée la table (avec données) ✅
3. Restauration se déclenche immédiatement
4. Table vide restaurée depuis IndexedDB
5. ❌ Table avec données écrasée par table vide!
```

## ✅ Solution Appliquée

### 1. Vérification des Données Existantes

Avant de restaurer, vérifier si la table existe déjà **avec des données**:

```javascript
// Vérifier si la table existe déjà
const existingTable = document.querySelector(`[data-table-id="${tableRecord.id}"]`);
if (existingTable) {
    // Vérifier si elle a des données
    const hasData = Array.from(existingTable.querySelectorAll('td')).some(cell => {
        const content = cell.textContent.trim();
        return content !== '' && content !== '⏳ En attente de consolidation...';
    });
    
    if (hasData) {
        console.log('✅ Table a déjà des données, skip restauration');
        return false; // NE PAS ÉCRASER
    }
}
```

### 2. Délai Avant Restauration

Attendre 2 secondes pour laisser Flowise créer les tables:

```javascript
// Attendre que Flowise ait le temps de créer les tables
console.log('⏳ Attente de Flowise (2s)...');
await new Promise(resolve => setTimeout(resolve, 2000));
```

## 📊 Flux Corrigé

```
1. Page chargée
2. Flowise crée la table (avec données) ✅
3. Attente de 2 secondes ⏳
4. Restauration se déclenche
5. Vérification: Table existe avec données?
   - OUI → Skip restauration ✅
   - NON → Restaurer depuis IndexedDB
6. ✅ Données préservées!
```

## 🧪 Test

### Scénario 1: Table Créée par Flowise

1. **Recharger la page**
2. **Flowise crée une table** (automatique)
3. **Console affiche**:
   ```
   ⏳ Attente de Flowise (2s)...
   ⏭️ Table xxx existe déjà
   ✅ Table xxx a déjà des données, skip restauration
   ```
4. ✅ **Table préservée** avec ses données

### Scénario 2: Table à Restaurer

1. **Recharger la page**
2. **Aucune table créée** par Flowise
3. **Console affiche**:
   ```
   ⏳ Attente de Flowise (2s)...
   📂 Ouverture IndexedDB...
   ✅ Table xxx restaurée
   ```
4. ✅ **Table restaurée** depuis IndexedDB

### Scénario 3: Table Vide Existante

1. **Table vide** existe dans le DOM
2. **Restauration se déclenche**
3. **Console affiche**:
   ```
   ⏭️ Table xxx existe déjà
   ⚠️ Table xxx existe mais est vide, remplacement...
   ✅ Table xxx restaurée
   ```
4. ✅ **Table vide remplacée** par version sauvegardée

## 📝 Logs à Surveiller

### ✅ Table Préservée (Cas Normal)
```
⏳ Attente de Flowise (2s)...
⏭️ Table table_xxx existe déjà
✅ Table table_xxx a déjà des données, skip restauration
ℹ️ Aucune table à restaurer
```

### ✅ Table Restaurée (Pas de Flowise)
```
⏳ Attente de Flowise (2s)...
📂 Ouverture IndexedDB...
📊 1 table(s) trouvée(s) dans IndexedDB
✅ Table table_xxx restaurée
✅ 1 TABLE(S) RESTAURÉE(S)
```

### ✅ Table Vide Remplacée
```
⏭️ Table table_xxx existe déjà
⚠️ Table table_xxx existe mais est vide, remplacement...
✅ Table table_xxx restaurée
```

## 🔧 Paramètres Ajustables

### Délai d'Attente

Si 2 secondes ne suffisent pas, augmenter le délai:

```javascript
// Dans restore-tables-on-load-simple.js, ligne ~198
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secondes
```

### Détection de Données

Pour ajuster ce qui est considéré comme "données":

```javascript
// Dans restore-tables-on-load-simple.js
const hasData = Array.from(existingTable.querySelectorAll('td')).some(cell => {
    const content = cell.textContent.trim();
    // Ajouter d'autres conditions ici
    return content !== '' && 
           content !== '⏳ En attente de consolidation...' &&
           content !== 'Loading...';
});
```

## 🎯 Résultat Attendu

Après cette correction:

✅ **Tables créées par Flowise** ne sont jamais écrasées
✅ **Tables vides** sont remplacées par la version sauvegardée
✅ **Délai de 2 secondes** laisse le temps à Flowise
✅ **Logs clairs** pour comprendre ce qui se passe

## 💡 Commandes de Debug

```javascript
// Vérifier les tables dans le DOM
document.querySelectorAll('table[data-table-id]').forEach(table => {
    const cells = table.querySelectorAll('td');
    const hasData = Array.from(cells).some(c => c.textContent.trim() !== '');
    console.log(`Table ${table.dataset.tableId}: ${hasData ? 'avec données' : 'vide'}`);
});

// Forcer la restauration (après avoir supprimé les tables)
document.querySelectorAll('table[data-table-id]').forEach(t => t.remove());
window.simpleRestore.restore()
```

## 📚 Fichiers Modifiés

- ✅ `public/restore-tables-on-load-simple.js`
  - Vérification des données existantes
  - Délai de 2 secondes avant restauration
  - Remplacement des tables vides uniquement

## 🚀 Test Final

1. **Recharger la page** (Ctrl+R)
2. **Vérifier la console**:
   - "⏳ Attente de Flowise (2s)..."
   - "✅ Table xxx a déjà des données, skip restauration"
3. **Vérifier** que la table est visible avec ses données
4. ✅ **Succès!**

## ✅ Critères de Succès

| Scénario | Résultat Attendu |
|----------|------------------|
| Table Flowise avec données | Préservée, pas écrasée |
| Pas de table Flowise | Restaurée depuis IndexedDB |
| Table vide existante | Remplacée par version sauvegardée |

## 🎉 Conclusion

Le problème de race condition est résolu. Les tables créées par Flowise ne seront plus jamais écrasées par la restauration!
