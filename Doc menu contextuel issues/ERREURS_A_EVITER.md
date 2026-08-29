# Erreurs à Éviter - Menu Contextuel

## 1. Erreurs d'Intégration

### ❌ Utiliser `strReplace` pour du Code Volumineux

**Problème**: L'outil `strReplace` n'est pas conçu pour insérer de grandes quantités de code (>50 lignes).

**Symptôme**:
```
Replaced text in public/menu.js
```
Mais aucun changement effectif.

**Solution**: Utiliser un script PowerShell.

```powershell
# ✅ CORRECT
.\insert-code.ps1

# ❌ INCORRECT
# Essayer strReplace 10 fois de suite
```

---

### ❌ Oublier le Paramètre `newStr`

**Problème**: `strReplace` nécessite TROIS paramètres: `path`, `oldStr`, ET `newStr`.

```xml
<!-- ❌ INCORRECT -->
<invoke name="strReplace">
<parameter name="oldStr">...</parameter>
<parameter name="path">public/menu.js</parameter>
</invoke>

<!-- ✅ CORRECT -->
<invoke name="strReplace">
<parameter name="oldStr">...</parameter>
<parameter name="newStr">...</parameter>
<parameter name="path">public/menu.js</parameter>
</invoke>
```

---

### ❌ Ne Pas Créer de Backup

**Problème**: En cas d'erreur, impossible de revenir en arrière.

```powershell
# ❌ INCORRECT - Pas de backup
$content = Get-Content "menu.js"
# Modification...
Set-Content "menu.js" $content

# ✅ CORRECT - Backup automatique
Copy-Item "menu.js" "menu.js.backup" -Force
$content = Get-Content "menu.js"
# Modification...
Set-Content "menu.js" $content
```

---

### ❌ Insérer au Mauvais Endroit

**Problème**: Le code inséré n'est pas dans la classe ou est mal positionné.

```javascript
// ❌ INCORRECT - Hors de la classe
class ContextualMenuManager {
  // Méthodes...
}

nouvelleMethode() {  // ← Hors de la classe!
  // ...
}

// ✅ CORRECT - Dans la classe
class ContextualMenuManager {
  // Méthodes existantes...
  
  nouvelleMethode() {  // ← Dans la classe
    // ...
  }
}
```

---

## 2. Erreurs de Code

### ❌ Ne Pas Valider `this.targetTable`

**Problème**: Erreur si aucune table n'est sélectionnée.

```javascript
// ❌ INCORRECT
nouvelleMethode() {
  const rows = this.targetTable.querySelectorAll('tr');  // ← Crash si null!
}

// ✅ CORRECT
nouvelleMethode() {
  if (!this.targetTable) {
    this.showAlert("⚠️ Aucune table sélectionnée.");
    return;
  }
  const rows = this.targetTable.querySelectorAll('tr');
}
```

---

### ❌ Oublier le `this`

**Problème**: Les méthodes de classe nécessitent `this.`.

```javascript
// ❌ INCORRECT
nouvelleMethode() {
  showAlert("Message");  // ← Erreur: showAlert is not defined
}

// ✅ CORRECT
nouvelleMethode() {
  this.showAlert("Message");
}
```

---

### ❌ Ne Pas Gérer les Erreurs

**Problème**: L'application crash en cas d'erreur.

```javascript
// ❌ INCORRECT
nouvelleMethode() {
  const value = parseFloat(cell.textContent);  // ← Peut échouer
  return value * 2;
}

// ✅ CORRECT
nouvelleMethode() {
  try {
    const value = parseFloat(cell.textContent);
    if (isNaN(value)) {
      throw new Error("Valeur invalide");
    }
    return value * 2;
  } catch (error) {
    console.error("Erreur:", error);
    this.showAlert(`❌ Erreur: ${error.message}`);
    return null;
  }
}
```

---

### ❌ Modifier le DOM Sans Notification

**Problème**: Les autres composants ne sont pas informés des changements.

```javascript
// ❌ INCORRECT
nouvelleMethode() {
  this.targetTable.appendChild(newRow);
  // Pas de notification!
}

// ✅ CORRECT
nouvelleMethode() {
  this.targetTable.appendChild(newRow);
  this.notifyTableStructureChange("row_added", { rowIndex: 5 });
  this.syncWithDev();
}
```

---

## 3. Erreurs de Performance

### ❌ Requêtes DOM Répétées

**Problème**: Ralentit l'exécution.

```javascript
// ❌ INCORRECT
for (let i = 0; i < table.querySelectorAll('tr').length; i++) {
  const row = table.querySelectorAll('tr')[i];  // ← Requête à chaque itération!
}

// ✅ CORRECT
const rows = table.querySelectorAll('tr');
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
}
```

---

### ❌ Ne Pas Utiliser le Cache

**Problème**: Recalculs inutiles.

```javascript
// ❌ INCORRECT
getExpensiveData() {
  // Calcul coûteux à chaque appel
  return this.calculateExpensiveOperation();
}

// ✅ CORRECT
getExpensiveData() {
  if (this.tableCache.has(this.targetTable)) {
    return this.tableCache.get(this.targetTable);
  }
  const result = this.calculateExpensiveOperation();
  this.tableCache.set(this.targetTable, result);
  return result;
}
```

---

### ❌ Boucles Imbriquées Inefficaces

**Problème**: Complexité O(n²) ou pire.

```javascript
// ❌ INCORRECT - O(n²)
for (let i = 0; i < rows.length; i++) {
  for (let j = 0; j < rows.length; j++) {
    if (rows[i].id === rows[j].id && i !== j) {
      // Traitement
    }
  }
}

// ✅ CORRECT - O(n) avec Map
const seen = new Map();
for (let i = 0; i < rows.length; i++) {
  if (seen.has(rows[i].id)) {
    // Traitement
  }
  seen.set(rows[i].id, i);
}
```

---

## 4. Erreurs de Sécurité

### ❌ Injection HTML

**Problème**: Permet l'exécution de code malveillant.

```javascript
// ❌ INCORRECT
cell.innerHTML = userInput;  // ← Dangereux!

// ✅ CORRECT
cell.textContent = userInput;  // Échappe automatiquement
```

---

### ❌ Ne Pas Valider les Entrées

**Problème**: Données invalides causent des erreurs.

```javascript
// ❌ INCORRECT
processValue(value) {
  return value.toUpperCase();  // ← Crash si value n'est pas une string
}

// ✅ CORRECT
processValue(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Value doit être une chaîne');
  }
  if (value.length > 1000) {
    throw new Error('Value trop longue');
  }
  return value.toUpperCase();
}
```

---

## 5. Erreurs de Style

### ❌ Indentation Incorrecte

**Problème**: Code illisible et erreurs de parsing.

```javascript
// ❌ INCORRECT
class ContextualMenuManager {
nouvelleMethode() {
return true;
}
}

// ✅ CORRECT
class ContextualMenuManager {
  nouvelleMethode() {
    return true;
  }
}
```

---

### ❌ Noms de Variables Non Descriptifs

**Problème**: Code difficile à maintenir.

```javascript
// ❌ INCORRECT
const x = table.querySelectorAll('tr');
const y = x.length;
for (let i = 0; i < y; i++) {
  const z = x[i];
}

// ✅ CORRECT
const rows = table.querySelectorAll('tr');
const rowCount = rows.length;
for (let i = 0; i < rowCount; i++) {
  const currentRow = rows[i];
}
```

---

### ❌ Commentaires Obsolètes

**Problème**: Confusion et erreurs.

```javascript
// ❌ INCORRECT
// Cette méthode calcule la somme
nouvelleMethode() {
  return this.calculateProduct();  // ← Fait un produit, pas une somme!
}

// ✅ CORRECT
// Cette méthode calcule le produit
nouvelleMethode() {
  return this.calculateProduct();
}
```

---

## 6. Erreurs de Test

### ❌ Ne Pas Tester les Cas Limites

**Problème**: Bugs en production.

```javascript
// ❌ INCORRECT - Teste seulement le cas normal
test("Addition", () => {
  expect(add(2, 3)).toBe(5);
});

// ✅ CORRECT - Teste aussi les cas limites
test("Addition", () => {
  expect(add(2, 3)).toBe(5);
  expect(add(0, 0)).toBe(0);
  expect(add(-1, 1)).toBe(0);
  expect(add(null, 5)).toThrow();
  expect(add("2", "3")).toThrow();
});
```

---

### ❌ Tests Non Isolés

**Problème**: Tests interdépendants et fragiles.

```javascript
// ❌ INCORRECT
let globalTable;

test("Test 1", () => {
  globalTable = createTable();
  expect(globalTable.rows.length).toBe(5);
});

test("Test 2", () => {
  // Dépend de Test 1!
  expect(globalTable.rows.length).toBe(5);
});

// ✅ CORRECT
test("Test 1", () => {
  const table = createTable();
  expect(table.rows.length).toBe(5);
});

test("Test 2", () => {
  const table = createTable();
  expect(table.rows.length).toBe(5);
});
```

---

## 7. Erreurs de Documentation

### ❌ Documentation Manquante

**Problème**: Impossible de comprendre le code.

```javascript
// ❌ INCORRECT
nouvelleMethode(a, b, c) {
  return a * b + c;
}

// ✅ CORRECT
/**
 * Calcule le résultat de l'opération (a * b) + c
 * 
 * @param {number} a - Premier multiplicateur
 * @param {number} b - Second multiplicateur
 * @param {number} c - Valeur à ajouter
 * @returns {number} Résultat du calcul
 * @throws {TypeError} Si les paramètres ne sont pas des nombres
 */
nouvelleMethode(a, b, c) {
  if (typeof a !== 'number' || typeof b !== 'number' || typeof c !== 'number') {
    throw new TypeError('Tous les paramètres doivent être des nombres');
  }
  return a * b + c;
}
```

---

### ❌ Ne Pas Documenter les Changements

**Problème**: Historique perdu.

```javascript
// ❌ INCORRECT - Pas de trace
// Modification du code...

// ✅ CORRECT - Changelog
/**
 * Version 9.4 - 2 Avril 2026
 * - Ajout: nouvelleMethode()
 * - Modification: Optimisation performance
 * - Correction: Bug calcul criticité
 */
```

---

## Règles d'Or

1. **Toujours créer un backup** avant modification
2. **Toujours valider les entrées** avant traitement
3. **Toujours gérer les erreurs** avec try/catch
4. **Toujours notifier les changements** DOM
5. **Toujours tester** avant de committer
6. **Toujours documenter** les changements
7. **Toujours utiliser des scripts** pour les insertions volumineuses
8. **Toujours vérifier** après insertion
9. **Toujours optimiser** les boucles
10. **Toujours suivre** les conventions de nommage

---

## Checklist Anti-Erreurs

Avant de considérer le code comme terminé:

- [ ] Backup créé
- [ ] Validation des entrées
- [ ] Gestion des erreurs
- [ ] Notifications DOM
- [ ] Tests passés
- [ ] Documentation à jour
- [ ] Performance vérifiée
- [ ] Sécurité vérifiée
- [ ] Code review effectuée
- [ ] Pas de console.log oubliés
- [ ] Pas de code commenté inutile
- [ ] Indentation correcte
- [ ] Noms de variables descriptifs
- [ ] Commentaires à jour
