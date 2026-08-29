# 🔍 Diagnostic - Colonnes Question non fusionnées

## ❌ Problème constaté

Les colonnes **Question** et **Ref_question** ne sont **pas fusionnées** alors qu'elles contiennent des valeurs identiques.

## 🧪 Diagnostic rapide (2 minutes)

### 1️⃣ Ouvrir la console du navigateur
- Appuyez sur **F12**
- Allez dans l'onglet **Console**

### 2️⃣ Exécuter le script de diagnostic

Copiez-collez cette commande dans la console :

```javascript
// Charger le script de diagnostic
const script = document.createElement('script');
script.src = 'diagnostic-fusion-question.js';
document.body.appendChild(script);
```

**OU** ouvrez directement le fichier :
```bash
start public/diagnostic-fusion-question.js
```

### 3️⃣ Analyser les résultats

Le script affichera :
- ✅ Les colonnes détectées
- ✅ Les valeurs dans chaque colonne
- ✅ Si les valeurs sont identiques
- ✅ Si la fusion est active
- ❌ Les problèmes détectés

## 🔍 Vérifications manuelles

### Vérification 1 : Script conso.js chargé ?

```javascript
// Dans la console
console.log(window.ClaraverseTableProcessor);
```

**Résultat attendu** : `undefined` ou un objet

Si `undefined`, le script n'est pas chargé → Vérifier le chemin dans index.html

### Vérification 2 : Colonnes détectées ?

```javascript
// Vérifier les en-têtes
document.querySelectorAll('th').forEach((th, i) => {
  console.log(`${i + 1}. "${th.textContent.trim()}"`);
});
```

**Résultat attendu** : Vous devriez voir "Question", "REF_QUESTION", etc.

### Vérification 3 : Valeurs identiques ?

```javascript
// Vérifier les valeurs de la colonne Question
const questionCells = [];
document.querySelectorAll('tbody tr').forEach(row => {
  const cells = row.querySelectorAll('td');
  // Adapter l'index selon votre table (0, 1, 2, etc.)
  const questionCell = cells[1]; // Index de la colonne Question
  if (questionCell) {
    questionCells.push(questionCell.textContent.trim());
  }
});

console.log('Valeurs de la colonne Question:');
questionCells.forEach((val, i) => {
  console.log(`${i + 1}. "${val}"`);
});

// Vérifier l'unicité
const unique = [...new Set(questionCells)];
console.log(`\nValeurs uniques: ${unique.length}`);
if (unique.length === 1) {
  console.log('✅ Toutes les valeurs sont identiques');
} else {
  console.log('❌ Valeurs différentes détectées');
}
```

### Vérification 4 : Fusion active ?

```javascript
// Vérifier les cellules fusionnées
const merged = document.querySelectorAll('[data-merged="true"]');
const rowspan = document.querySelectorAll('[rowspan]');

console.log(`Cellules fusionnées: ${merged.length}`);
console.log(`Cellules avec rowspan: ${rowspan.length}`);

if (rowspan.length === 0) {
  console.log('❌ Aucune fusion détectée');
} else {
  console.log('✅ Fusion active');
  rowspan.forEach((cell, i) => {
    console.log(`${i + 1}. Rowspan=${cell.getAttribute('rowspan')}: "${cell.textContent.substring(0, 50)}"`);
  });
}
```

## 🐛 Causes possibles

### Cause 1 : Script conso.js non chargé

**Symptôme** : `window.ClaraverseTableProcessor` est `undefined`

**Solution** :
1. Vérifier que `conso.js` est dans le dossier `public/`
2. Vérifier le chemin dans `index.html` :
   ```html
   <script src="conso.js"></script>
   ```
3. Recharger la page (Ctrl+F5)

### Cause 2 : Colonnes non détectées

**Symptôme** : Logs "⏭️ Colonne question non trouvée pour fusion"

**Solution** :
Vérifier le pattern de détection dans `conso.js` ligne 318 :
```javascript
question: /question/i,
```

Si vos en-têtes sont différents (ex: "QUESTION", "Question CIA"), le pattern devrait les détecter.

### Cause 3 : Valeurs non identiques

**Symptôme** : Logs "⏭️ Valeurs multiples détectées pour question"

**Solution** :
Les valeurs contiennent peut-être des espaces ou caractères invisibles.

Vérifier avec :
```javascript
const cells = document.querySelectorAll('tbody tr td:nth-child(2)'); // Adapter l'index
cells.forEach((cell, i) => {
  const text = cell.textContent;
  console.log(`${i + 1}. Longueur: ${text.length}, Texte: "${text}"`);
  console.log(`   Bytes: ${Array.from(text).map(c => c.charCodeAt(0)).join(',')}`);
});
```

### Cause 4 : Fonction non appelée

**Symptôme** : Aucun log de fusion dans la console

**Solution** :
Vérifier que la fonction est appelée dans `setupTableInteractions` (ligne 334-336) :
```javascript
this.mergeCellsForColumn(table, headers, "question");
this.mergeCellsForColumn(table, headers, "ref_question");
this.mergeCellsForColumn(table, headers, "remarques");
```

### Cause 5 : Table non détectée comme CIA

**Symptôme** : La table n'est pas traitée du tout

**Solution** :
Vérifier que la table contient une colonne `Reponse_user` ou est détectée comme "modelisée".

```javascript
// Vérifier si la table est traitée
document.querySelectorAll('table').forEach((table, i) => {
  console.log(`Table ${i + 1}:`);
  console.log(`  - ID: ${table.dataset.tableId}`);
  console.log(`  - Observer installé: ${table.dataset.observerInstalled}`);
});
```

## 🔧 Solutions rapides

### Solution 1 : Forcer le retraitement

```javascript
// Supprimer les marqueurs de traitement
document.querySelectorAll('table').forEach(table => {
  delete table.dataset.observerInstalled;
  delete table.dataset.tableId;
});

// Recharger la page
location.reload();
```

### Solution 2 : Forcer la fusion manuellement

```javascript
// Fusionner manuellement la colonne Question (index 1)
const table = document.querySelector('table');
const tbody = table.querySelector('tbody');
const rows = tbody.querySelectorAll('tr');

let firstCell = null;
rows.forEach((row, i) => {
  const cells = row.querySelectorAll('td');
  const cell = cells[1]; // Index de la colonne Question
  
  if (cell) {
    if (!firstCell) {
      firstCell = cell;
      firstCell.setAttribute('rowspan', rows.length);
      firstCell.style.cssText = `
        vertical-align: middle !important;
        text-align: center !important;
        font-weight: 500;
        padding: 12px;
      `;
    } else {
      cell.style.display = 'none';
      cell.setAttribute('data-merged', 'true');
    }
  }
});

console.log('✅ Fusion manuelle appliquée');
```

### Solution 3 : Vider le cache et recharger

```bash
# Dans la console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 📊 Checklist de diagnostic

- [ ] Script conso.js chargé (`window.ClaraverseTableProcessor`)
- [ ] Colonnes détectées (logs "🔗 Fusion des cellules pour question")
- [ ] Valeurs identiques (vérification manuelle)
- [ ] Fonction appelée (logs dans la console)
- [ ] Table détectée (dataset.tableId présent)
- [ ] Pas d'erreur JavaScript dans la console

## 📞 Si le problème persiste

1. **Copier les logs de la console** (Ctrl+A dans la console, Ctrl+C)
2. **Faire une capture d'écran** de la table
3. **Inspecter une cellule Question** (Clic droit → Inspecter)
4. **Vérifier le HTML** de la cellule :
   ```html
   <!-- Attendu si fusionné -->
   <td rowspan="4" style="vertical-align: middle !important; text-align: center !important;">
     Lequel des éléments suivants...
   </td>
   
   <!-- Attendu si masqué -->
   <td data-merged="true" style="display: none;">
     Lequel des éléments suivants...
   </td>
   ```

## 🎯 Prochaines étapes

Une fois le diagnostic effectué, nous pourrons :
1. Identifier la cause exacte
2. Appliquer le correctif approprié
3. Tester la solution
4. Documenter le fix

---

**Temps estimé** : 5-10 minutes  
**Difficulté** : ⭐⭐ Moyen  
**Prérequis** : Console du navigateur (F12)
