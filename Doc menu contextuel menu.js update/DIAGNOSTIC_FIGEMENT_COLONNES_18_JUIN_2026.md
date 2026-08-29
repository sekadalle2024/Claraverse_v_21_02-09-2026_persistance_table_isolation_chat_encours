# 🔍 Diagnostic - Problème Figement de Colonnes

**Date**: 18 juin 2026  
**Problème**: Les colonnes figées ne s'affichent pas correctement  
**Fichier**: `public/menu.js`

## 📋 Résumé du problème

Les actions "Figer colonne" et "Annuler Figer colonne" ont été ajoutées au menu contextuel, mais l'effet visuel attendu (colonnes restant visibles lors du scroll horizontal) ne se produit pas.

## ✅ Ce qui fonctionne

1. ✓ Les actions apparaissent dans le menu section "Colonnes"
2. ✓ Les fonctions `freezeColumns()` et `unfreezeColumns()` sont appelées
3. ✓ La fonction `applyFreezePanes()` existe et s'exécute

## ❌ Problèmes potentiels identifiés

### 1. **Calcul des largeurs au mauvais moment**

```javascript
// Dans applyFreezePanes() - ligne ~975
currentLeft += cell.getBoundingClientRect().width;
```

**Problème**: `getBoundingClientRect()` peut retourner 0 si:
- Le tableau n'est pas encore rendu
- Le tableau est dans un accordéon fermé
- Il y a des transitions CSS en cours

### 2. **Conteneur pas préparé pour le scroll**

```javascript
// Ligne ~935
container.style.overflowX = 'auto';
```

**Problème**: Si le conteneur n'a pas de largeur définie ou si le tableau est plus petit que le viewport, il n'y aura pas de scroll.

### 3. **Z-index insuffisant**

```javascript
cell.style.zIndex = '10';
```

**Problème**: Dans Claraverse, d'autres éléments peuvent avoir un z-index plus élevé (menu: 15000, notifications, etc.)

### 4. **Background non opaque**

```javascript
const computedBg = window.getComputedStyle(cell).backgroundColor;
if (computedBg === 'rgba(0, 0, 0, 0)' || computedBg === 'transparent') {
    cell.style.backgroundColor = defaultBg;
}
```

**Problème**: La détection peut ne pas capturer tous les cas de transparence.

## 🧪 Tests à effectuer

### Test 1: Vérifier le fichier de test
```bash
# Ouvrir test-freeze-columns.html dans le navigateur
# Cliquer sur une cellule de la colonne 3
# Cliquer sur "Figer jusqu'à cette colonne"
# Scroller horizontalement
# Les 3 premières colonnes doivent rester visibles
```

### Test 2: Inspecter dans Claraverse
```javascript
// Dans la console du navigateur
const table = document.querySelector('table');
const firstCell = table.querySelector('td');
console.log('Position:', firstCell.style.position); // devrait être 'sticky'
console.log('Left:', firstCell.style.left); // devrait être '0px' ou une valeur
console.log('ZIndex:', firstCell.style.zIndex); // devrait être '10'
console.log('Width:', firstCell.getBoundingClientRect().width); // ne devrait pas être 0
```

### Test 3: Vérifier le conteneur
```javascript
// Dans la console du navigateur
const table = document.querySelector('table');
const container = table.parentElement;
console.log('Overflow-X:', container.style.overflowX); // devrait être 'auto'
console.log('Container width:', container.getBoundingClientRect().width);
console.log('Table width:', table.getBoundingClientRect().width);
// Table width doit être > Container width pour avoir du scroll
```

## 🔧 Solutions proposées

### Solution 1: Forcer le recalcul des dimensions

```javascript
applyFreezePanes(table, freezeRows, freezeCols) {
    // ... code existant ...
    
    // AJOUT: Forcer le reflow avant calcul
    void table.offsetHeight; // Force reflow
    
    rows.forEach((row, rowIndex) => {
        // AJOUT: Forcer le reflow pour cette ligne
        void row.offsetHeight;
        
        const cells = Array.from(row.querySelectorAll('th, td'));
        let currentLeft = 0;
        
        cells.forEach((cell, colIndex) => {
            // ... reste du code ...
            
            // MODIFICATION: Calculer avec offsetWidth au lieu de getBoundingClientRect
            currentLeft += cell.offsetWidth;
        });
    });
}
```

### Solution 2: Ajouter une min-width au tableau

```javascript
applyFreezePanes(table, freezeRows, freezeCols) {
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    
    // AJOUT: Forcer une largeur minimum
    table.style.minWidth = 'max-content';
    table.style.width = 'auto';
    
    // ... reste du code ...
}
```

### Solution 3: Ajouter des marqueurs visuels

```javascript
cells.forEach((cell, colIndex) => {
    const isColFrozen = colIndex < freezeCols;
    
    if (isColFrozen) {
        cell.style.position = 'sticky';
        cell.style.left = `${currentLeft}px`;
        cell.style.zIndex = '100'; // ⚠️ AUGMENTÉ de 10 à 100
        
        // AJOUT: Bordure visible pour déboguer
        if (colIndex === freezeCols - 1) {
            cell.style.borderRight = '3px solid #380101';
            cell.style.boxShadow = '2px 0 5px rgba(56, 1, 1, 0.2)';
        }
        
        // AJOUT: S'assurer d'un fond opaque
        const cellTag = cell.tagName.toLowerCase();
        if (cellTag === 'th') {
            cell.style.backgroundColor = '#380101';
        } else {
            const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(cell.parentElement);
            cell.style.backgroundColor = rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
        }
    }
    
    currentLeft += cell.offsetWidth; // ⚠️ CHANGÉ de getBoundingClientRect
});
```

### Solution 4: Wrapper scroll dédié

```javascript
freezeColumns() {
    if (!this.validateActiveCell()) return;
    const numColsToFreeze = this.activeCellPosition.col + 1;
    
    // AJOUT: Créer un wrapper scroll si nécessaire
    this.ensureScrollWrapper(this.targetTable);
    
    this.applyFreezePanes(this.targetTable, 0, numColsToFreeze);
    this.showQuickNotification(`❄️ ${numColsToFreeze} colonne(s) figée(s)`);
}

ensureScrollWrapper(table) {
    const parent = table.parentElement;
    
    // Vérifier si un wrapper existe déjà
    if (parent.classList.contains('freeze-scroll-wrapper')) {
        return;
    }
    
    // Créer le wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'freeze-scroll-wrapper';
    wrapper.style.cssText = `
        overflow-x: auto;
        overflow-y: visible;
        max-width: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
    `;
    
    // Insérer le wrapper
    parent.insertBefore(wrapper, table);
    wrapper.appendChild(table);
}
```

## 🎯 Plan d'action recommandé

1. **Tester la page de diagnostic** (`test-freeze-columns.html`)
   - Vérifier que le figement fonctionne dans un environnement isolé
   
2. **Si le test fonctionne**: Le problème vient de l'intégration dans Claraverse
   - Appliquer Solution 3 (marqueurs visuels + z-index)
   - Appliquer Solution 1 (forcer reflow)
   
3. **Si le test ne fonctionne pas**: Le problème vient de l'algorithme
   - Appliquer Solution 2 (min-width)
   - Appliquer Solution 1 (offsetWidth)
   
4. **En dernier recours**: 
   - Appliquer Solution 4 (wrapper dédié)

## 📝 Checklist de vérification

- [ ] La cellule a `position: sticky`
- [ ] La cellule a `left: XXpx` (pas vide, pas 'auto')
- [ ] La cellule a un `backgroundColor` défini
- [ ] La cellule a un `z-index` suffisant
- [ ] Le conteneur a `overflow-x: auto`
- [ ] La largeur du tableau > largeur du conteneur
- [ ] Les largeurs calculées ne sont pas 0
- [ ] Pas de `border-collapse: collapse` sur le tableau

## 🔗 Références

- CSS Sticky: https://developer.mozilla.org/en-US/docs/Web/CSS/position
- getBoundingClientRect: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
- Force Reflow: https://gist.github.com/paulirish/5d52fb081b3570c81e3a

## 📞 Support

Si le problème persiste après ces tests, fournir:
1. Screenshot de la console avec les valeurs calculées
2. HTML simplifié du tableau problématique
3. Styles CSS appliqués au conteneur
