# 🧪 TESTEZ MAINTENANT - Fix Checkboxes CIA

## ⚡ Test rapide (2 minutes)

### 1. Ouvrir le fichier de test

```
public/test-examen-cia-checkbox.html
```

### 2. Ouvrir la console (F12)

Vous devriez voir:
```
🔍 DIAGNOSTIC CHECKBOXES CIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ claraverseCommands disponible

📊 TABLES DÉTECTÉES:
...
```

### 3. Lancer le test complet

Dans la console, tapez:
```javascript
diagnosticCheckboxesCIA.testComplete()
```

Vous devriez voir:
```
🧪 TEST COMPLET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Attribution des IDs...
2. Sauvegarde...
3. Vérification...
✅ Test terminé
💡 Rechargez la page pour tester la restauration
```

### 4. Cocher des checkboxes

- Cliquez sur quelques checkboxes dans différentes tables
- Vérifiez qu'une seule checkbox est cochée par table
- Attendez 1 seconde (sauvegarde automatique)

### 5. Vérifier la sauvegarde

Dans la console:
```javascript
diagnosticCheckboxesCIA.verifyAfterSave()
```

Vous devriez voir:
```
🔍 VÉRIFICATION APRÈS SAUVEGARDE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Table 1 (table_xxx):
  Checkboxes cochées dans DOM: 1
  Checkboxes cochées dans storage: 1
  Match: ✅
```

### 6. Recharger la page (F5)

### 7. Vérifier la restauration

Les checkboxes doivent être **restaurées** avec leur état !

Dans la console:
```javascript
diagnosticCheckboxesCIA.verifyAfterSave()
```

Vérifiez que les checkboxes cochées correspondent.

## ✅ Résultat attendu

### Avant le rechargement

```
Table 1: Checkbox ligne 2 cochée ✅
Table 2: Checkbox ligne 1 cochée ✅
Table 3: Checkbox ligne 3 cochée ✅
```

### Après le rechargement

```
Table 1: Checkbox ligne 2 cochée ✅  ← Restaurée !
Table 2: Checkbox ligne 1 cochée ✅  ← Restaurée !
Table 3: Checkbox ligne 3 cochée ✅  ← Restaurée !
```

## 🔍 Vérification des IDs

Dans la console:
```javascript
// Voir les IDs des tables
document.querySelectorAll('table').forEach((table, i) => {
  console.log(`Table ${i + 1}:`, {
    'ID': table.dataset.tableId,
    'Stable ID': table.getAttribute('data-stable-table-id')
  });
});
```

Vous devriez voir:
```
Table 1: { ID: "table_abc123", Stable ID: "table_abc123" }
Table 2: { ID: "table_def456", Stable ID: "table_def456" }
Table 3: { ID: "table_ghi789", Stable ID: "table_ghi789" }
```

**Important**: Les IDs doivent être **identiques** avant et après rechargement !

## 🐛 Si ça ne fonctionne pas

### Problème 1: Les checkboxes ne s'affichent pas

**Solution**:
```javascript
claraverseCommands.testPersistence()
```

Vérifiez que les tables sont détectées comme "modelisées".

### Problème 2: Les IDs changent après rechargement

**Solution**:
```javascript
// Avant rechargement
const ids1 = Array.from(document.querySelectorAll('table')).map(t => t.dataset.tableId);
console.log('IDs avant:', ids1);

// Recharger la page (F5)

// Après rechargement
const ids2 = Array.from(document.querySelectorAll('table')).map(t => t.dataset.tableId);
console.log('IDs après:', ids2);

// Comparer
console.log('Identiques:', JSON.stringify(ids1) === JSON.stringify(ids2));
```

Si les IDs sont différents, il y a un problème avec `generateUniqueTableId()`.

### Problème 3: La sauvegarde ne fonctionne pas

**Solution**:
```javascript
// Forcer la sauvegarde
diagnosticCheckboxesCIA.forceSave()

// Vérifier le localStorage
const data = JSON.parse(localStorage.getItem('claraverse_tables_data'));
console.log('Données sauvegardées:', data);
```

### Problème 4: La restauration échoue

**Solution**:
```javascript
// Vérifier que les IDs correspondent
const tables = document.querySelectorAll('table');
const data = JSON.parse(localStorage.getItem('claraverse_tables_data'));
const savedIds = Object.keys(data);

tables.forEach((table, i) => {
  const id = table.dataset.tableId;
  const inStorage = savedIds.includes(id);
  console.log(`Table ${i + 1}: ${id} → ${inStorage ? '✅' : '❌'}`);
});
```

## 📊 Commandes utiles

```javascript
// Aide
diagnosticCheckboxesCIA.help()

// Test complet
diagnosticCheckboxesCIA.testComplete()

// Vérifier après sauvegarde
diagnosticCheckboxesCIA.verifyAfterSave()

// Forcer attribution des IDs
diagnosticCheckboxesCIA.forceIds()

// Forcer sauvegarde
diagnosticCheckboxesCIA.forceSave()

// Commandes claraverse
claraverseCommands.help()
claraverseCommands.testPersistence()
claraverseCommands.getStorageInfo()
```

## 🎯 Scénario de test complet

### Étape 1: Préparation

1. Ouvrir `public/test-examen-cia-checkbox.html`
2. Console: `diagnosticCheckboxesCIA.testComplete()`
3. Attendre la fin du test

### Étape 2: Sélection

1. Table 1: Cocher la checkbox de la ligne 2 (Option B)
2. Table 2: Cocher la checkbox de la ligne 1 (Option A)
3. Table 3: Cocher la checkbox de la ligne 4 (Option D)

### Étape 3: Vérification avant rechargement

Console:
```javascript
diagnosticCheckboxesCIA.verifyAfterSave()
```

Résultat attendu:
```
Table 1: Match ✅
Table 2: Match ✅
Table 3: Match ✅
```

### Étape 4: Rechargement

Appuyer sur F5

### Étape 5: Vérification après rechargement

1. Vérifier visuellement que les checkboxes sont cochées
2. Console: `diagnosticCheckboxesCIA.verifyAfterSave()`
3. Vérifier que les IDs sont identiques

### Étape 6: Confirmation

Si tout fonctionne:
- ✅ Les checkboxes sont restaurées
- ✅ Les IDs sont identiques
- ✅ Pas d'erreurs dans la console

**Succès !** 🎉

## 💡 Conseils

1. **Toujours vérifier les IDs**: Ils doivent être identiques avant et après rechargement
2. **Utiliser le diagnostic**: `diagnosticCheckboxesCIA.testComplete()` fait tout automatiquement
3. **Vérifier le localStorage**: Les données doivent être présentes
4. **Attendre la sauvegarde**: 500ms de debounce après chaque modification

## 🚀 Prochaine étape

Si tout fonctionne, vous pouvez:
1. Créer vos propres tables d'examen CIA
2. Utiliser le système en production
3. Consulter la documentation complète

**Bon test !** 🧪✨

---

**Fichiers liés**:
- `FIX_PERSISTANCE_CHECKBOXES_CIA_STABLE_ID.md` - Explication du fix
- `public/diagnostic-checkboxes-cia.js` - Script de diagnostic
- `public/test-examen-cia-checkbox.html` - Page de test
