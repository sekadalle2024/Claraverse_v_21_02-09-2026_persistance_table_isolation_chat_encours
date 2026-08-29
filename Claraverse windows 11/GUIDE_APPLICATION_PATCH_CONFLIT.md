# 🚀 Guide d'Application - Patch Conflit Données Auto/Manuel

## 📋 Vue d'Ensemble

Ce guide vous accompagne pas à pas pour appliquer le patch qui résout le conflit entre :
- **Données automatiques** : générées par consolidation (conso.js)
- **Données manuelles** : saisies via "Activer édition des cellules" (menu.js)

**Temps estimé** : 20-30 minutes  
**Difficulté** : Moyenne  
**Fichiers modifiés** : 2 (conso.js, menu.js)

---

## ✅ Prérequis

Avant de commencer, vérifiez que :

- [ ] Vous avez accès aux fichiers `conso.js` et `menu.js`
- [ ] Le système de persistance IndexedDB est fonctionnel
- [ ] `menu-persistence-bridge.js` est chargé dans `index.html`
- [ ] Vous avez lu `SOLUTION_CONFLIT_DONNEES_CONSO_V2.md`

---

## 📝 Étape 1 : Sauvegarde (2 min)

### 1.1 Sauvegarder les fichiers originaux

```bash
# Windows CMD
copy conso.js conso.js.backup
copy public\menu.js public\menu.js.backup

# Windows PowerShell
Copy-Item conso.js conso.js.backup
Copy-Item public\menu.js public\menu.js.backup
```

### 1.2 Vérifier les sauvegardes

```bash
# Vérifier que les fichiers backup existent
dir *.backup
```

---

## 🔧 Étape 2 : Modifications dans conso.js (15 min)

### 2.1 Ajouter `markTableEditType()` et `canOverwriteTable()`

**Emplacement** : Après la méthode `saveTableDataNow()` (ligne ~1630)

**Action** : Copier-coller ce code :

```javascript
/**
 * Marquer une table avec le type et timestamp de dernière modification
 * @param {HTMLElement} table - La table à marquer
 * @param {string} editType - Type de modification ('auto' ou 'manual')
 */
markTableEditType(table, editType) {
    if (!table) return;
    
    const timestamp = Date.now();
    table.dataset.lastEditType = editType;
    table.dataset.lastEditTimestamp = timestamp;
    
    // Ajouter un indicateur visuel
    const indicator = table.querySelector('.edit-type-indicator') || document.createElement('div');
    indicator.className = 'edit-type-indicator';
    indicator.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1000;
        ${editType === 'manual' 
            ? 'background: #ffc107; color: #000;' 
            : 'background: #28a745; color: #fff;'}
    `;
    indicator.textContent = editType === 'manual' ? '✏️ MANUEL' : '🤖 AUTO';
    
    // Positionner la table en relative si nécessaire
    if (getComputedStyle(table).position === 'static') {
        table.style.position = 'relative';
    }
    
    if (!table.querySelector('.edit-type-indicator')) {
        table.appendChild(indicator);
    }
    
    // Faire disparaître l'indicateur après 3 secondes
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 3000);
    
    debug.log(`🏷️ Table marquée: ${editType} à ${new Date(timestamp).toLocaleTimeString()}`);
}

/**
 * Vérifier si une table peut être écrasée par une modification automatique
 * @param {HTMLElement} table - La table à vérifier
 * @returns {boolean} - true si la table peut être écrasée
 */
canOverwriteTable(table) {
    if (!table) return true;
    
    const lastEditType = table.dataset.lastEditType;
    const lastEditTimestamp = parseInt(table.dataset.lastEditTimestamp || '0');
    const now = Date.now();
    
    // Si pas de marquage, on peut écraser
    if (!lastEditType) {
        debug.log("✅ Pas de marquage, écrasement autorisé");
        return true;
    }
    
    // Si dernière modification manuelle récente (< 30 secondes), on ne peut pas écraser
    if (lastEditType === 'manual') {
        const timeSinceEdit = now - lastEditTimestamp;
        const canOverwrite = timeSinceEdit > 30000; // 30 secondes
        
        if (!canOverwrite) {
            debug.warn(`⚠️ Modification manuelle récente (${Math.round(timeSinceEdit/1000)}s), écrasement bloqué`);
        } else {
            debug.log(`✅ Modification manuelle ancienne (${Math.round(timeSinceEdit/1000)}s), écrasement autorisé`);
        }
        
        return canOverwrite;
    }
    
    // Si dernière modification automatique, on peut toujours écraser
    debug.log("✅ Dernière modification automatique, écrasement autorisé");
    return true;
}
```

### 2.2 Ajouter `findExistingResultatTable()`

**Emplacement** : Après la méthode `findExistingConsoTable()` (ligne ~560)

**Action** : Copier-coller ce code :

```javascript
/**
 * Trouver la table Résultat existante pour une table source
 * @param {HTMLElement} table - La table source
 * @returns {HTMLElement|null} - La table Résultat ou null
 */
findExistingResultatTable(table) {
    if (!table) return null;
    
    // Stratégie 1 : Chercher par data-source-table-id
    const tableId = table.dataset.tableId;
    if (tableId) {
        const resultatById = document.querySelector(`[data-source-table-id="${tableId}"][data-table-type="resultat"]`);
        if (resultatById) {
            debug.log("✓ Table Résultat trouvée par ID");
            return resultatById;
        }
    }
    
    // Stratégie 2 : Chercher dans les siblings
    let sibling = table.nextElementSibling;
    while (sibling) {
        if (sibling.tagName === 'TABLE' && 
            (sibling.classList.contains('claraverse-resultat-table') ||
             sibling.dataset.tableType === 'resultat')) {
            debug.log("✓ Table Résultat trouvée par sibling");
            return sibling;
        }
        sibling = sibling.nextElementSibling;
    }
    
    // Stratégie 3 : Chercher dans le parent
    const parent = table.parentElement;
    if (parent) {
        const resultatInParent = parent.querySelector('.claraverse-resultat-table, [data-table-type="resultat"]');
        if (resultatInParent) {
            debug.log("✓ Table Résultat trouvée dans parent");
            return resultatInParent;
        }
    }
    
    debug.log("✗ Aucune table Résultat trouvée");
    return null;
}
```

### 2.3 Modifier `performConsolidation()`

**Emplacement** : Ligne ~604

**Action** : Chercher la méthode `performConsolidation()` et **REMPLACER** la section après le calcul de `result` par :

```javascript
// ✅ NOUVEAU : Vérifier si on peut écraser les tables générées
const consoTable = this.findExistingConsoTable(table);
const resultatTable = this.findExistingResultatTable(table);

// Vérifier la table de consolidation
if (consoTable && !this.canOverwriteTable(consoTable)) {
    debug.warn("⚠️ Table consolidation modifiée manuellement, conservation des données");
    alert("⚠️ ATTENTION\n\nLa table de consolidation a été modifiée manuellement récemment.\nLes données manuelles sont conservées.");
} else {
    // Mettre à jour la table conso
    this.updateConsolidationDisplay(table, result);
    
    // Marquer comme modification automatique
    if (consoTable) {
        this.markTableEditType(consoTable, 'auto');
        
        // Sauvegarder
        if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
            window.claraverseSyncAPI.forceSaveTable(consoTable)
                .then(() => {
                    debug.log("✅ Table consolidation sauvegardée");
                })
                .catch((error) => {
                    debug.error("❌ Erreur sauvegarde consolidation:", error);
                });
        }
    }
}

// Vérifier la table résultat
if (resultatTable && !this.canOverwriteTable(resultatTable)) {
    debug.warn("⚠️ Table résultat modifiée manuellement, conservation des données");
    alert("⚠️ ATTENTION\n\nLa table résultat a été modifiée manuellement récemment.\nLes données manuelles sont conservées.");
} else {
    // Mettre à jour la table résultat
    this.updateResultatTable(table, result);
    
    // Marquer comme modification automatique
    if (resultatTable) {
        this.markTableEditType(resultatTable, 'auto');
        
        // Sauvegarder
        if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
            window.claraverseSyncAPI.forceSaveTable(resultatTable)
                .then(() => {
                    debug.log("✅ Table résultat sauvegardée");
                })
                .catch((error) => {
                    debug.error("❌ Erreur sauvegarde résultat:", error);
                });
        }
    }
}
```

### 2.4 Exposer le processor globalement

**Emplacement** : À la fin du fichier conso.js (ligne ~2260)

**Action** : Ajouter cette ligne :

```javascript
// Exposer le processor globalement pour menu.js
window.claraverseProcessor = processor;
debug.log("✅ Processor exposé globalement");
```

---

## 🔧 Étape 3 : Modifications dans menu.js (5 min)

### 3.1 Trouver la fonction d'activation de l'édition

**Action** : Chercher dans `menu.js` la fonction qui active l'édition des cellules.

Indices pour la trouver :
- Cherchez `contenteditable`
- Cherchez `Activer édition` ou `Enable editing`
- Cherchez une fonction qui rend les cellules éditables

### 3.2 Ajouter le marquage manuel

**Action** : Dans la fonction trouvée, **AJOUTER** ce code :

```javascript
// ✅ NOUVEAU : Marquer la table comme modifiée manuellement
if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
    window.claraverseProcessor.markTableEditType(table, 'manual');
    console.log("🏷️ Table marquée comme modification manuelle");
}

// Ajouter un listener sur les modifications de cellules
const cells = table.querySelectorAll('td[contenteditable="true"]');
cells.forEach(cell => {
    cell.addEventListener('input', () => {
        // Marquer à chaque modification
        if (window.claraverseProcessor && window.claraverseProcessor.markTableEditType) {
            window.claraverseProcessor.markTableEditType(table, 'manual');
        }
    });
    
    cell.addEventListener('blur', () => {
        // Sauvegarder après modification
        if (window.claraverseSyncAPI && window.claraverseSyncAPI.forceSaveTable) {
            window.claraverseSyncAPI.forceSaveTable(table);
        }
    });
});
```

---

## 🧪 Étape 4 : Tests (10 min)

### Test 1 : Consolidation Automatique

```javascript
// 1. Ouvrir la console du navigateur (F12)
// 2. Créer une table modelisée avec des conclusions "Non-Satisfaisant"
// 3. Vérifier dans la console :
console.log("Test 1 : Consolidation automatique");

// 4. Vérifier le marquage
const consoTable = document.querySelector('.claraverse-conso-table');
console.log("Type:", consoTable?.dataset.lastEditType); // Devrait être "auto"
console.log("Timestamp:", consoTable?.dataset.lastEditTimestamp);

// 5. Vérifier l'indicateur visuel (badge vert "🤖 AUTO")
```

### Test 2 : Modification Manuelle

```javascript
// 1. Activer "Édition des cellules" sur la table conso
// 2. Modifier une cellule
// 3. Vérifier dans la console :
console.log("Test 2 : Modification manuelle");

const consoTable = document.querySelector('.claraverse-conso-table');
console.log("Type:", consoTable?.dataset.lastEditType); // Devrait être "manual"

// 4. Vérifier l'indicateur visuel (badge jaune "✏️ MANUEL")
```

### Test 3 : Protection des Données Manuelles

```javascript
// 1. Après avoir modifié manuellement (Test 2)
// 2. Modifier immédiatement la table modelisée source
// 3. Vérifier qu'une alerte apparaît :
//    "⚠️ ATTENTION - La table de consolidation a été modifiée manuellement..."
// 4. Vérifier que les données manuelles sont conservées
console.log("Test 3 : Protection données manuelles - OK");
```

### Test 4 : Écrasement après Délai

```javascript
// 1. Modifier manuellement la table conso
// 2. Attendre 30 secondes
// 3. Modifier la table modelisée source
// 4. Vérifier qu'aucune alerte n'apparaît
// 5. Vérifier que les données sont écrasées (nouvelles données auto)
console.log("Test 4 : Écrasement après délai - OK");
```

### Test 5 : Persistance après F5

```javascript
// 1. Créer une consolidation automatique
// 2. Modifier manuellement
// 3. Recharger la page (F5)
// 4. Vérifier dans la console :
const consoTable = document.querySelector('.claraverse-conso-table');
console.log("Type après F5:", consoTable?.dataset.lastEditType);
console.log("Timestamp après F5:", consoTable?.dataset.lastEditTimestamp);
// Les marquages devraient être restaurés
```

---

## ✅ Validation Finale

### Checklist de Validation

- [ ] **Modification 1** : `markTableEditType()` et `canOverwriteTable()` ajoutées
- [ ] **Modification 2** : `findExistingResultatTable()` ajoutée
- [ ] **Modification 3** : `performConsolidation()` modifiée
- [ ] **Modification 4** : `window.claraverseProcessor` exposé
- [ ] **Modification 5** : Marquage manuel ajouté dans menu.js
- [ ] **Test 1** : Consolidation automatique fonctionne
- [ ] **Test 2** : Modification manuelle fonctionne
- [ ] **Test 3** : Protection données manuelles fonctionne
- [ ] **Test 4** : Écrasement après délai fonctionne
- [ ] **Test 5** : Persistance après F5 fonctionne

### Logs Console Attendus

```
🚀 Claraverse Table Script - Démarrage
✅ Processor exposé globalement
🏷️ Table marquée: auto à 14:30:45
✅ Pas de marquage, écrasement autorisé
🏷️ Table marquée: manual à 14:31:20
⚠️ Modification manuelle récente (5s), écrasement bloqué
✅ Modification manuelle ancienne (45s), écrasement autorisé
```

---

## 🐛 Dépannage

### Problème 1 : `claraverseProcessor is not defined`

**Cause** : Le processor n'est pas exposé globalement

**Solution** :
```javascript
// Vérifier à la fin de conso.js :
window.claraverseProcessor = processor;
```

### Problème 2 : Indicateur visuel n'apparaît pas

**Cause** : La table n'a pas `position: relative`

**Solution** : Le code ajoute automatiquement `position: relative`, mais vérifiez :
```javascript
const table = document.querySelector('.claraverse-conso-table');
console.log(getComputedStyle(table).position); // Devrait être "relative"
```

### Problème 3 : Données manuelles toujours écrasées

**Cause** : Le marquage manuel n'est pas appelé dans menu.js

**Solution** : Vérifier que le code a été ajouté dans la bonne fonction d'édition

### Problème 4 : Alerte n'apparaît pas

**Cause** : `canOverwriteTable()` retourne toujours `true`

**Solution** : Vérifier les logs console pour voir le délai écoulé

---

## 📊 Résultat Attendu

### Avant le Patch

```
❌ Données automatiques écrasent données manuelles
❌ Données manuelles écrasent données automatiques
❌ Pas de protection
❌ Perte de données utilisateur
```

### Après le Patch

```
✅ Données manuelles protégées pendant 30 secondes
✅ Données automatiques mises à jour si pas de conflit
✅ Indicateurs visuels clairs (MANUEL / AUTO)
✅ Alertes informatives
✅ Persistance des marquages
```

---

## 📞 Support

### Fichiers de Référence

- `SOLUTION_CONFLIT_DONNEES_CONSO_V2.md` - Documentation complète
- `PATCH_CONFLIT_DONNEES_CONSO_MANUEL_AUTO.js` - Code du patch
- `DOCUMENTATION_COMPLETE_SOLUTION.md` - Architecture IndexedDB

### Commandes Utiles

```javascript
// Vérifier le processor
console.log(window.claraverseProcessor);

// Vérifier les marquages
document.querySelectorAll('[data-last-edit-type]').forEach(t => {
    console.log(t.dataset.tableId, t.dataset.lastEditType);
});

// Forcer un marquage manuel
window.claraverseProcessor.markTableEditType(table, 'manual');

// Tester la protection
window.claraverseProcessor.canOverwriteTable(table);
```

---

## 🎉 Conclusion

Vous avez maintenant un système qui :

1. **Distingue** les modifications automatiques et manuelles
2. **Protège** les données manuelles pendant 30 secondes
3. **Affiche** des indicateurs visuels clairs
4. **Alerte** l'utilisateur en cas de conflit
5. **Persiste** les marquages dans IndexedDB

**Temps total** : 20-30 minutes  
**Impact** : Résolution complète du conflit de données

---

*Guide créé le 21 novembre 2025*
