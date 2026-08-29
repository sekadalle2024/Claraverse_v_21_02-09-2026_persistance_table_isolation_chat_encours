# Diagnostic Menu Contextuel Lead Balance vs Etat Fin
**Date**: 03 Avril 2026  
**Problème**: Le menu contextuel ne s'ouvre pas automatiquement pour Lead_balance contrairement à Etat fin

## 🔍 Analyse du Problème

### Comportement Actuel

#### ✅ Etat Fin (Fonctionne)
- Lorsque le message "Etat fin" est envoyé dans le chat
- Une table avec entête "Etat_fin" est générée
- **Le menu contextuel s'ouvre AUTOMATIQUEMENT**
- Le fichier peut être sélectionné
- Les états financiers sont générés

#### ❌ Lead Balance (Ne fonctionne pas)
- Lorsque le message "Lead_balance" est envoyé dans le chat
- Une table avec entête "Lead_balance" est générée
- **Le menu contextuel NE s'ouvre PAS automatiquement**
- Le clic dans la cellule n'active pas non plus le menu

### Problème 2: Clic dans la cellule
Les deux features ont le même problème: le clic dans la cellule unique de la table n'active pas le menu contextuel.

## 🔎 Cause Racine Identifiée

### Fichier: `public/LeadBalanceAutoTrigger.js`

**Ligne 348-356** - La fonction `scanAndProcess()` a été modifiée:

```javascript
function scanAndProcess() {
  const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

  allTables.forEach((table) => {
    if (isLeadBalanceTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("🎯 Table Lead_balance détectée - Menu contextuel disponible");
      // ❌ PROBLÈME: Marquer la table comme détectée mais ne pas déclencher automatiquement
      table.setAttribute(CONFIG.PROCESSED_ATTR, 'detected');
      // Ajouter un attribut pour le menu contextuel
      table.setAttribute('data-lead-balance-ready', 'true');
    }
  });
}
```

**Comparaison avec EtatFinAutoTrigger.js** (ligne 348):

```javascript
function scanAndProcess() {
  const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

  allTables.forEach((table) => {
    if (isEtatFinTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("🎯 Table Etat_fin détectée - Déclenchement automatique");
      // ✅ SOLUTION: Déclencher automatiquement le traitement
      processEtatFinTable(table);
    }
  });
}
```

## 💡 Solution

### Solution 1: Activer le déclenchement automatique pour Lead Balance

Modifier `public/LeadBalanceAutoTrigger.js` ligne 348-356:

```javascript
function scanAndProcess() {
  const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

  allTables.forEach((table) => {
    if (isLeadBalanceTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("🎯 Table Lead_balance détectée - Déclenchement automatique");
      // ✅ Déclencher automatiquement le traitement
      processLeadBalanceTable(table);
    }
  });
}
```

### Solution 2: Ajouter un gestionnaire de clic sur la cellule

Pour résoudre le problème du clic dans la cellule, ajouter un event listener:

```javascript
/**
 * Ajoute un gestionnaire de clic sur la cellule de la table
 */
function addCellClickHandler(table) {
  const cell = table.querySelector('td');
  if (cell) {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', function() {
      console.log("🖱️ Clic sur cellule Lead_balance détecté");
      // Réinitialiser l'attribut pour permettre le traitement
      table.removeAttribute(CONFIG.PROCESSED_ATTR);
      processLeadBalanceTable(table);
    });
  }
}
```

Puis appeler cette fonction dans `scanAndProcess()`:

```javascript
function scanAndProcess() {
  const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

  allTables.forEach((table) => {
    if (isLeadBalanceTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("🎯 Table Lead_balance détectée - Déclenchement automatique");
      processLeadBalanceTable(table);
      // Ajouter le gestionnaire de clic pour les prochaines fois
      addCellClickHandler(table);
    }
  });
}
```

## 📋 Fichiers à Modifier

1. **public/LeadBalanceAutoTrigger.js**
   - Modifier la fonction `scanAndProcess()` (ligne 348)
   - Ajouter la fonction `addCellClickHandler()` (nouvelle)

2. **public/EtatFinAutoTrigger.js** (optionnel)
   - Ajouter également le gestionnaire de clic pour la cohérence

## 🧪 Tests à Effectuer

### Test 1: Déclenchement automatique Lead Balance
1. Envoyer "Lead_balance" dans le chat
2. Vérifier que le menu contextuel s'ouvre automatiquement
3. Sélectionner un fichier Excel
4. Vérifier que les leads sont calculés et affichés

### Test 2: Clic dans la cellule Lead Balance
1. Après avoir fermé le menu contextuel
2. Cliquer dans la cellule de la table
3. Vérifier que le menu contextuel se rouvre

### Test 3: Déclenchement automatique Etat Fin
1. Envoyer "Etat fin" dans le chat
2. Vérifier que le menu contextuel s'ouvre automatiquement (déjà fonctionnel)
3. Sélectionner un fichier Excel
4. Vérifier que les états financiers sont générés

### Test 4: Clic dans la cellule Etat Fin
1. Après avoir fermé le menu contextuel
2. Cliquer dans la cellule de la table
3. Vérifier que le menu contextuel se rouvre

## 📊 Résumé

| Feature | Problème 1: Auto-trigger | Problème 2: Clic cellule | Solution |
|---------|-------------------------|-------------------------|----------|
| Lead Balance | ❌ Ne s'ouvre pas | ❌ Ne fonctionne pas | Modifier scanAndProcess() + Ajouter click handler |
| Etat Fin | ✅ Fonctionne | ❌ Ne fonctionne pas | Ajouter click handler uniquement |

## 🎯 Prochaines Étapes

1. Appliquer la Solution 1 pour Lead Balance
2. Appliquer la Solution 2 pour Lead Balance et Etat Fin
3. Tester les 4 scénarios
4. Documenter les résultats
5. Commit et push vers GitHub
