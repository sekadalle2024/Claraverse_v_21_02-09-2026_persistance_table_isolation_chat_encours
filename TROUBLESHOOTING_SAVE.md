# 🔧 Dépannage - Problème de Sauvegarde

## 🚨 Symptôme

La fonction de sauvegarde ne fonctionne pas : les modifications des tables ne sont pas persistées.

---

## 📋 Diagnostic Rapide

### Étape 1 : Ouvrir la Console (F12)

```javascript
// Copier-coller ces commandes dans la console
console.log("Manager:", window.ClaraverseTableDataManager);
console.log("API:", window.ClaraverseTableData);
```

**Résultat attendu :** Les deux doivent afficher des objets (pas `undefined`)

---

### Étape 2 : Charger le Script de Diagnostic

```html
<!-- Ajouter APRÈS table_data.js et conso.js -->
<script src="debug_table_data.js"></script>
```

**OU exécuter directement dans la console :**

```javascript
// 1. Vérifier les tables
document.querySelectorAll('table').length
// Devrait retourner > 0

// 2. Vérifier les cellules éditables
document.querySelectorAll('td[contenteditable="true"]').length
// Devrait retourner > 0

// 3. Vérifier l'état sauvegardé
document.querySelectorAll('td[data-cell-state]').length
// Devrait retourner > 0 après modification
```

---

## 🔧 Solutions Rapides

### Solution 1 : Vérifier l'Ordre de Chargement

**Problème :** `table_data.js` doit être chargé AVANT `conso.js`

```html
<!-- ✅ CORRECT -->
<script src="table_data.js"></script>
<script src="conso.js"></script>

<!-- ❌ INCORRECT -->
<script src="conso.js"></script>
<script src="table_data.js"></script>
```

---

### Solution 2 : Forcer l'Initialisation

**Copier-coller dans la console :**

```javascript
// Charger le script de correction
const script = document.createElement('script');
script.src = 'fix_save_issue.js';
document.body.appendChild(script);
```

**OU télécharger et ajouter au HTML :**

```html
<script src="fix_save_issue.js"></script>
```

---

### Solution 3 : Rendre les Cellules Éditables

**Problème :** Les cellules doivent avoir `contenteditable="true"`

```html
<!-- ✅ CORRECT -->
<td contenteditable="true">Contenu</td>

<!-- ❌ INCORRECT -->
<td>Contenu</td>
```

**Script pour corriger automatiquement :**

```javascript
// Dans la console
document.querySelectorAll('tbody td').forEach(cell => {
  cell.contentEditable = true;
});
```

---

### Solution 4 : Sauvegarder Manuellement

```javascript
// Sauvegarder toutes les tables
document.querySelectorAll('table').forEach(table => {
  window.ClaraverseTableData.saveTable(table);
});

console.log("✅ Tables sauvegardées");
```

---

### Solution 5 : Utiliser les Fonctions de Correction

**Après avoir chargé `fix_save_issue.js` :**

```javascript
// Sauvegarder tout
ForceSave.saveAll();

// Voir l'état
ForceSave.showState();

// Tester la sauvegarde
ForceSave.test();
```

---

## 🧪 Test de Validation

### Test Manuel

1. **Modifier une cellule**
   ```javascript
   const cell = document.querySelector('td[contenteditable="true"]');
   cell.textContent = "TEST";
   cell.blur(); // Perdre le focus
   ```

2. **Vérifier la sauvegarde**
   ```javascript
   console.log(cell.getAttribute('data-cell-state'));
   // Devrait afficher un JSON avec "value":"TEST"
   ```

3. **Succès si :**
   - Vous voyez un objet JSON
   - Il contient `"value":"TEST"`

---

## 🐛 Problèmes Courants

### Problème 1 : "Cannot read property 'saveTable' of undefined"

**Cause :** `table_data.js` n'est pas chargé

**Solution :**
```html
<!-- Vérifier que le script est dans le HTML -->
<script src="table_data.js"></script>

<!-- Vérifier le chemin -->
<script src="./table_data.js"></script>
<script src="/table_data.js"></script>
```

---

### Problème 2 : "Les tables ne sont pas détectées"

**Cause :** Les tables n'ont pas les bons sélecteurs CSS

**Solution :**
```javascript
// Forcer la détection
window.ClaraverseTableDataManager.discoverAllTables();

// Vérifier
console.log(window.ClaraverseTableDataManager.tables.size);
```

---

### Problème 3 : "Les cellules ne se sauvegardent pas automatiquement"

**Cause :** Pas de `contenteditable="true"` OU event listeners non attachés

**Solution :**
```javascript
// 1. Rendre éditables
document.querySelectorAll('tbody td').forEach(td => {
  td.contentEditable = true;
});

// 2. Charger fix_save_issue.js
const script = document.createElement('script');
script.src = 'fix_save_issue.js';
document.body.appendChild(script);
```

---

### Problème 4 : "data-cell-state est vide ou null"

**Cause :** Les cellules n'ont pas été indexées

**Solution :**
```javascript
// Forcer l'indexation
document.querySelectorAll('table').forEach(table => {
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, colIndex) => {
      cell.dataset.rowIndex = rowIndex;
      cell.dataset.cellIndex = colIndex;
      
      const state = {
        value: cell.textContent.trim(),
        html: cell.innerHTML,
        bgColor: cell.style.backgroundColor || '',
        timestamp: Date.now()
      };
      
      cell.dataset.cellState = JSON.stringify(state);
    });
  });
});

console.log("✅ Cellules indexées");
```

---

## 🔍 Diagnostic Complet

### Exécuter le Diagnostic Automatique

```javascript
// Dans la console ou charger le script
const script = document.createElement('script');
script.src = 'debug_table_data.js';
document.body.appendChild(script);
```

**Le diagnostic vérifie :**
- ✅ Chargement de `table_data.js`
- ✅ API disponible
- ✅ Tables détectées
- ✅ Cellules éditables
- ✅ Attributs data-*
- ✅ Event listeners
- ✅ Test de sauvegarde

**Résultats dans :** `window.DIAGNOSTIC_RESULTS`

---

## 📞 Support Avancé

### Vérifier la Configuration Complète

```javascript
// Exécuter dans la console
const diagnostic = {
  managerLoaded: !!window.ClaraverseTableDataManager,
  apiLoaded: !!window.ClaraverseTableData,
  tablesCount: document.querySelectorAll('table').length,
  editableCells: document.querySelectorAll('td[contenteditable="true"]').length,
  savedCells: document.querySelectorAll('td[data-cell-state]').length,
  managedTables: window.ClaraverseTableDataManager?.tables?.size || 0
};

console.table(diagnostic);

// Devrait afficher :
// managerLoaded: true
// apiLoaded: true
// tablesCount: > 0
// editableCells: > 0
// savedCells: > 0 (après modification)
// managedTables: > 0
```

---

## ✅ Checklist de Résolution

- [ ] `table_data.js` est chargé AVANT `conso.js`
- [ ] Console ne montre pas d'erreurs JavaScript
- [ ] `window.ClaraverseTableDataManager` existe
- [ ] `window.ClaraverseTableData` existe
- [ ] Les tables ont `<td contenteditable="true">`
- [ ] Les cellules ont `data-row-index` et `data-cell-index`
- [ ] Au moins une cellule a `data-cell-state`
- [ ] Le test manuel fonctionne

---

## 🚀 Solution Complète en 1 Minute

**Si rien ne fonctionne, exécutez ceci :**

```html
<!-- 1. Ajouter dans votre HTML -->
<script src="table_data.js"></script>
<script src="conso.js"></script>
<script src="fix_save_issue.js"></script>

<!-- 2. Ou exécuter dans la console -->
<script>
// Charger les scripts de correction
['table_data.js', 'fix_save_issue.js'].forEach(src => {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
});

// Après 2 secondes, forcer la sauvegarde
setTimeout(() => {
  if (window.ForceSave) {
    ForceSave.saveAll();
    console.log("✅ Sauvegarde forcée");
  }
}, 2000);
</script>
```

---

## 📁 Fichiers Nécessaires

| Fichier | Description | Requis |
|---------|-------------|--------|
| `table_data.js` | Script principal | ✅ Oui |
| `debug_table_data.js` | Diagnostic | 🔧 Pour déboguer |
| `fix_save_issue.js` | Correction automatique | 🔧 Si problème |
| `test_table_data.html` | Interface de test | 🧪 Pour tester |

---

## 💡 Astuces

### Astuce 1 : Activer les Logs Détaillés

Dans `table_data.js`, ligne ~45 :
```javascript
const CONFIG = {
  debugMode: true, // ⬅️ Mettre à true
  // ...
};
```

### Astuce 2 : Tester avec l'Interface de Test

```bash
# Ouvrir test_table_data.html
open test_table_data.html
```

Cette interface a **tout** configuré correctement et montre comment ça doit fonctionner.

### Astuce 3 : Comparer avec l'Exemple

Si ça marche dans `test_table_data.html` mais pas dans votre page :
1. Comparer l'ordre des scripts
2. Comparer les attributs des `<td>`
3. Comparer la structure HTML

---

## 🆘 Dernier Recours

**Si RIEN ne fonctionne :**

1. **Utiliser localStorage en attendant**
   ```javascript
   // Sauvegarde manuelle dans localStorage
   function saveToLocalStorage() {
     const tables = [];
     document.querySelectorAll('table').forEach(table => {
       const data = {
         id: table.dataset.tableId,
         html: table.outerHTML
       };
       tables.push(data);
     });
     localStorage.setItem('tables_backup', JSON.stringify(tables));
   }
   
   // Appeler avant de quitter
   window.addEventListener('beforeunload', saveToLocalStorage);
   ```

2. **Contacter le Support**
   - Envoyer les résultats de `debug_table_data.js`
   - Envoyer la console (F12)
   - Envoyer un screenshot

---

## ✅ Validation Finale

**Tout fonctionne si :**

```javascript
// Test complet
const test = () => {
  const cell = document.querySelector('td[contenteditable="true"]');
  if (!cell) return false;
  
  cell.textContent = "TEST_" + Date.now();
  cell.blur();
  
  setTimeout(() => {
    const state = cell.getAttribute('data-cell-state');
    if (state && state.includes(cell.textContent)) {
      console.log("✅ SAUVEGARDE FONCTIONNE !");
      return true;
    } else {
      console.error("❌ SAUVEGARDE NE FONCTIONNE PAS");
      return false;
    }
  }, 500);
};

test();
```

---

**Version:** 1.0.0  
**Dernière mise à jour:** Janvier 2025  
**Support:** Voir `README_TABLE_DATA.md` section Troubleshooting