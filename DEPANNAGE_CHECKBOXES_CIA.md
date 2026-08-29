# 🔧 Dépannage - Checkboxes CIA N'Apparaissent Pas

## ⚡ Test Rapide (30 secondes)

### Dans la Console du Navigateur (F12)

```javascript
// Copier-coller ce code dans la console
const script = document.createElement('script');
script.src = 'public/test-checkboxes-cia-rapide.js';
document.head.appendChild(script);
```

Ou directement :

```javascript
// Test ultra-rapide
const tables = document.querySelectorAll('table');
let found = 0;
tables.forEach(t => {
  const headers = Array.from(t.querySelectorAll('th, td')).map(h => h.textContent.toLowerCase());
  if (headers.some(h => /reponse[_\s]?user/i.test(h))) {
    found++;
    const checkboxes = t.querySelectorAll('input[type="checkbox"]').length;
    console.log(`Table CIA ${found}: ${checkboxes} checkbox(es)`);
  }
});
console.log(`Total: ${found} table(s) CIA`);
```

---

## 🎯 Problèmes Courants et Solutions

### Problème 1 : "conso.js n'est pas chargé"

**Symptôme** :
```javascript
console.log(window.claraverseProcessor); // undefined
```

**Solutions** :
1. Vérifiez que `conso.js` est dans `index.html` :
   ```html
   <script src="/conso.js"></script>
   ```

2. Vérifiez qu'il n'y a pas d'erreur dans la console (F12)

3. Rechargez la page (F5) et attendez 2-3 secondes

4. Si toujours pas chargé, vérifiez le chemin :
   ```javascript
   fetch('/conso.js').then(r => console.log('✅ Fichier trouvé')).catch(e => console.error('❌ Fichier non trouvé'));
   ```

---

### Problème 2 : "Aucune table CIA trouvée"

**Symptôme** :
```
Tables CIA trouvées: 0
```

**Solutions** :
1. Vérifiez que votre table a une colonne "Reponse_user" :
   ```javascript
   const table = document.querySelector('table'); // Ajustez le sélecteur
   const headers = Array.from(table.querySelectorAll('th, td')).map(h => h.textContent);
   console.log('Headers:', headers);
   ```

2. Le nom de la colonne doit correspondre au pattern :
   - ✅ `Reponse_user`
   - ✅ `reponse_user`
   - ✅ `Reponse user`
   - ✅ `REPONSE_USER`
   - ❌ `Reponse` (trop court)
   - ❌ `User` (trop court)

3. La colonne doit être dans le `<thead>` ou la première ligne `<tr>` :
   ```html
   <table>
     <thead>
       <tr>
         <th>Question</th>
         <th>Reponse_user</th> ← Ici !
       </tr>
     </thead>
   </table>
   ```

---

### Problème 3 : "Tables CIA trouvées MAIS aucune checkbox"

**Symptôme** :
```
Tables CIA trouvées: 5
Tables avec checkboxes: 0
```

**Solutions** :

#### Solution A : Forcer le Traitement
```javascript
// Dans la console
window.claraverseProcessor.processAllTables();
```

Attendez 2 secondes, puis vérifiez :
```javascript
document.querySelectorAll('input[type="checkbox"]').length;
// Devrait être > 0
```

#### Solution B : Vérifier les Logs
```javascript
// Activer le mode debug
CONFIG.debugMode = true;

// Retraiter les tables
window.claraverseProcessor.processAllTables();

// Regardez les logs dans la console
// Vous devriez voir : "Table CIA détectée - Configuration des checkboxes"
```

#### Solution C : Vérifier que la Table a un ID
```javascript
const tables = document.querySelectorAll('table');
tables.forEach((t, i) => {
  console.log(`Table ${i}: ID = ${t.dataset.tableId || '❌ AUCUN ID'}`);
});
```

Si pas d'ID, générez-en un :
```javascript
tables.forEach(t => {
  if (!t.dataset.tableId) {
    window.claraverseProcessor.generateUniqueTableId(t);
  }
});
```

#### Solution D : Recharger la Page
```javascript
location.reload();
```

---

### Problème 4 : "Checkboxes apparaissent puis disparaissent"

**Symptôme** :
Les checkboxes s'affichent brièvement puis disparaissent.

**Cause** :
React ou un autre framework recrée les tables.

**Solutions** :

1. Vérifier que le MutationObserver fonctionne :
   ```javascript
   console.log('Observer:', window.claraverseProcessor.observer);
   ```

2. Forcer la recréation après un délai :
   ```javascript
   setTimeout(() => {
     window.claraverseProcessor.processAllTables();
   }, 3000);
   ```

3. Vérifier les logs pour voir si les tables sont retraitées :
   ```
   "Changement DOM détecté, retraitement des tables"
   ```

---

### Problème 5 : "Checkboxes présentes mais pas cliquables"

**Symptôme** :
Les checkboxes sont visibles mais ne réagissent pas au clic.

**Solutions** :

1. Vérifier que les event listeners sont attachés :
   ```javascript
   const checkbox = document.querySelector('input[type="checkbox"]');
   console.log('Checkbox:', checkbox);
   console.log('Parent cell:', checkbox.closest('td'));
   ```

2. Vérifier qu'il n'y a pas de conflit CSS :
   ```javascript
   const checkbox = document.querySelector('input[type="checkbox"]');
   console.log('Styles:', window.getComputedStyle(checkbox));
   // pointer-events devrait être 'auto', pas 'none'
   ```

3. Tester manuellement :
   ```javascript
   const checkbox = document.querySelector('input[type="checkbox"]');
   checkbox.checked = !checkbox.checked;
   checkbox.dispatchEvent(new Event('change'));
   ```

---

### Problème 6 : "Erreur dans la console"

**Symptômes courants** :

#### Erreur : "Cannot read property 'some' of undefined"
```javascript
// Cause : headers est undefined
// Solution : La table n'a pas de headers
```

Vérifiez :
```javascript
const table = document.querySelector('table');
const headers = table.querySelectorAll('th, td');
console.log('Headers count:', headers.length);
```

#### Erreur : "QuotaExceededError"
```javascript
// Cause : localStorage plein
// Solution : Vider le cache
```

```javascript
claraverseCommands.clearAllData();
// Puis rechargez la page
```

#### Erreur : "table.dataset is undefined"
```javascript
// Cause : L'élément n'est pas une vraie table
// Solution : Vérifier le sélecteur
```

```javascript
const element = document.querySelector('table');
console.log('Type:', element.tagName); // Devrait être "TABLE"
```

---

## 🔍 Diagnostic Complet

### Étape 1 : Vérifier l'Environnement
```javascript
console.log('1. conso.js:', window.claraverseProcessor ? '✅' : '❌');
console.log('2. localStorage:', typeof localStorage !== 'undefined' ? '✅' : '❌');
console.log('3. Tables:', document.querySelectorAll('table').length);
```

### Étape 2 : Vérifier les Tables CIA
```javascript
const tables = document.querySelectorAll('table');
let ciaCount = 0;
tables.forEach(t => {
  const headers = Array.from(t.querySelectorAll('th, td')).map(h => h.textContent.toLowerCase());
  if (headers.some(h => /reponse[_\s]?user/i.test(h))) {
    ciaCount++;
    console.log(`CIA ${ciaCount}:`, {
      id: t.dataset.tableId,
      headers: headers,
      checkboxes: t.querySelectorAll('input[type="checkbox"]').length
    });
  }
});
```

### Étape 3 : Forcer le Traitement
```javascript
if (window.claraverseProcessor) {
  window.claraverseProcessor.processAllTables();
  setTimeout(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]').length;
    console.log(`Checkboxes après traitement: ${checkboxes}`);
  }, 1000);
}
```

### Étape 4 : Vérifier la Sauvegarde
```javascript
const data = localStorage.getItem('claraverse_tables_data');
if (data) {
  const parsed = JSON.parse(data);
  console.log('Tables sauvegardées:', Object.keys(parsed).length);
  Object.entries(parsed).forEach(([id, table]) => {
    const checkboxCells = table.cells ? table.cells.filter(c => c.isCheckboxCell) : [];
    console.log(`${id}: ${checkboxCells.length} checkbox(es)`);
  });
} else {
  console.log('Aucune donnée dans localStorage');
}
```

---

## 📞 Si Rien Ne Fonctionne

### Dernière Solution : Reset Complet

```javascript
// 1. Vider tout
localStorage.clear();
sessionStorage.clear();

// 2. Recharger
location.reload();

// 3. Attendre 3 secondes

// 4. Vérifier
setTimeout(() => {
  const script = document.createElement('script');
  script.src = 'public/test-checkboxes-cia-rapide.js';
  document.head.appendChild(script);
}, 3000);
```

### Vérifier la Version de conso.js

```javascript
// Vérifier que les modifications sont présentes
fetch('/conso.js')
  .then(r => r.text())
  .then(code => {
    if (code.includes('Table CIA détectée')) {
      console.log('✅ Version corrigée de conso.js');
    } else {
      console.error('❌ Ancienne version de conso.js');
      console.log('💡 Rechargez la page avec Ctrl+F5 (hard refresh)');
    }
  });
```

---

## ✅ Checklist de Validation

- [ ] `window.claraverseProcessor` existe
- [ ] Au moins 1 table CIA trouvée
- [ ] La table CIA a un `dataset.tableId`
- [ ] Les checkboxes sont créées
- [ ] Les checkboxes sont cliquables
- [ ] L'état est sauvegardé dans localStorage
- [ ] L'état persiste après rechargement

---

**Si vous avez suivi toutes ces étapes et que ça ne fonctionne toujours pas**, partagez :
1. Les logs de la console (F12)
2. La structure HTML d'une table CIA
3. Le résultat du test rapide

---

**Date** : 26 novembre 2025  
**Version** : 1.0
