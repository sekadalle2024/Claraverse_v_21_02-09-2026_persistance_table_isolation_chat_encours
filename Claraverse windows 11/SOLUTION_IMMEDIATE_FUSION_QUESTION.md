# ⚡ SOLUTION IMMÉDIATE - Fusion des colonnes Question

## 🎯 Problème
Les colonnes Question, Ref_question et Remarques ne sont **PAS fusionnées** malgré le code dans conso.js.

## ⚡ SOLUTION RAPIDE (2 minutes)

### Option 1 : Tester avec le fichier de test

```bash
start public/test-force-fusion.html
```

1. Ouvrir le fichier dans le navigateur
2. Ouvrir la console (F12)
3. Cliquer sur "Forcer la fusion"
4. Vérifier que les colonnes sont fusionnées

### Option 2 : Appliquer sur votre page actuelle

1. **Ouvrir votre page** avec la table problématique
2. **Ouvrir la console** (F12)
3. **Copier-coller ce code** :

```javascript
// Charger le script de correction
const script = document.createElement('script');
script.src = 'force-fusion-question.js';
script.onload = () => {
  console.log('✅ Script chargé, fusion dans 2 secondes...');
};
document.body.appendChild(script);
```

4. **Attendre 2 secondes**
5. **Vérifier** que les colonnes sont fusionnées

### Option 3 : Code direct dans la console

Copiez-collez ce code complet dans la console :

```javascript
(function() {
  console.log('🔧 FUSION FORCÉE - Démarrage');
  
  const tables = document.querySelectorAll('table');
  console.log(`📊 ${tables.length} table(s) trouvée(s)`);
  
  tables.forEach((table, tableIndex) => {
    console.log(`\n🔍 Table ${tableIndex + 1}`);
    
    // Trouver les en-têtes
    let headers = Array.from(table.querySelectorAll('thead th'));
    if (headers.length === 0) {
      headers = Array.from(table.querySelectorAll('tr:first-child th'));
    }
    if (headers.length === 0) {
      headers = Array.from(table.querySelectorAll('tr:first-child td'));
    }
    
    console.log(`  📋 ${headers.length} colonne(s)`);
    
    // Fusionner Question
    const questionIndex = headers.findIndex(h => /question/i.test(h.textContent));
    if (questionIndex !== -1) {
      console.log(`  ✅ Colonne Question trouvée (index ${questionIndex})`);
      mergeColumn(table, questionIndex, 'Question');
    }
    
    // Fusionner Ref_question
    const refIndex = headers.findIndex(h => /ref[_\s]?question/i.test(h.textContent));
    if (refIndex !== -1) {
      console.log(`  ✅ Colonne Ref_question trouvée (index ${refIndex})`);
      mergeColumn(table, refIndex, 'Ref_question');
    }
  });
  
  function mergeColumn(table, colIndex, name) {
    const tbody = table.querySelector('tbody') || table;
    const rows = tbody.querySelectorAll('tr');
    const cells = [];
    
    rows.forEach((row, i) => {
      if (i === 0 && row.querySelector('th')) return;
      const cell = row.querySelectorAll('td')[colIndex];
      if (cell) cells.push(cell);
    });
    
    if (cells.length === 0) return;
    
    // Vérifier si toutes les valeurs sont identiques
    const values = cells.map(c => c.textContent.trim().toLowerCase());
    const unique = [...new Set(values)];
    
    console.log(`    📊 ${cells.length} cellules, ${unique.length} valeur(s) unique(s)`);
    
    if (unique.length !== 1) {
      console.log(`    ⏭️ Pas de fusion (valeurs différentes)`);
      return;
    }
    
    // Fusionner
    const firstCell = cells[0];
    firstCell.setAttribute('rowspan', cells.length);
    firstCell.style.cssText = `
      vertical-align: middle !important;
      text-align: center !important;
      font-weight: 500;
      padding: 12px;
      display: table-cell !important;
    `;
    
    for (let i = 1; i < cells.length; i++) {
      cells[i].style.display = 'none';
      cells[i].setAttribute('data-merged', 'true');
    }
    
    console.log(`    ✅ ${name} fusionnée (${cells.length} cellules)`);
  }
  
  console.log('\n✅ Fusion terminée');
})();
```

## 🔍 Diagnostic

Si la fusion ne fonctionne toujours pas, vérifiez :

### 1. Les valeurs sont-elles identiques ?

```javascript
// Vérifier les valeurs de la colonne Question (adapter l'index)
const cells = document.querySelectorAll('tbody tr td:nth-child(2)'); // 2 = index Question
const values = Array.from(cells).map(c => c.textContent.trim());
console.log('Valeurs:', values);
console.log('Uniques:', [...new Set(values)]);
```

### 2. Les colonnes sont-elles détectées ?

```javascript
// Afficher les en-têtes
document.querySelectorAll('th').forEach((th, i) => {
  console.log(`${i + 1}. "${th.textContent.trim()}"`);
});
```

### 3. Y a-t-il des erreurs ?

Regardez dans la console s'il y a des erreurs JavaScript (texte rouge).

## 🔧 Correctif permanent dans conso.js

Si le script de force fonctionne mais pas conso.js, le problème vient du timing ou de la détection.

### Vérifier que la fonction est appelée

Ouvrez `public/conso.js` et cherchez la ligne 334-336 :

```javascript
// 🆕 V5: Fusionner les cellules Question, Ref_question et Remarques
this.mergeCellsForColumn(table, headers, "question");
this.mergeCellsForColumn(table, headers, "ref_question");
this.mergeCellsForColumn(table, headers, "remarques");
```

### Ajouter des logs de debug

Ajoutez juste avant ces lignes :

```javascript
console.log('🔍 Tentative de fusion des colonnes');
console.log('  Headers:', headers.map(h => h.text));
```

### Forcer l'exécution après un délai

Si le problème est le timing, ajoutez après la ligne 336 :

```javascript
// Réessayer après un délai
setTimeout(() => {
  debug.log('🔄 Réessai de fusion après délai');
  this.mergeCellsForColumn(table, headers, "question");
  this.mergeCellsForColumn(table, headers, "ref_question");
  this.mergeCellsForColumn(table, headers, "remarques");
}, 2000);
```

## 📊 Résultat attendu

Après la fusion :

```
AVANT:
┌──────────┬─────────────────────────────────────────┐
│ Question │ Lequel des éléments suivants...         │
│ Question │ Lequel des éléments suivants...         │
│ Question │ Lequel des éléments suivants...         │
│ Question │ Lequel des éléments suivants...         │
└──────────┴─────────────────────────────────────────┘

APRÈS:
┌──────────┬─────────────────────────────────────────┐
│          │                                          │
│ Question │ Lequel des éléments suivants...         │
│          │         (centré, rowspan=4)              │
│          │                                          │
└──────────┴─────────────────────────────────────────┘
```

## 📞 Si ça ne fonctionne toujours pas

1. **Copier les logs de la console** (tout le texte)
2. **Faire une capture d'écran** de la table
3. **Inspecter une cellule Question** :
   - Clic droit sur la cellule
   - "Inspecter"
   - Copier le HTML de la cellule

Cela me permettra de voir exactement ce qui se passe.

## ✅ Fichiers créés

1. `public/force-fusion-question.js` - Script de correction
2. `public/test-force-fusion.html` - Page de test
3. `SOLUTION_IMMEDIATE_FUSION_QUESTION.md` - Ce guide

---

**Temps estimé** : 2-5 minutes  
**Difficulté** : ⭐ Facile  
**Prérequis** : Console du navigateur
